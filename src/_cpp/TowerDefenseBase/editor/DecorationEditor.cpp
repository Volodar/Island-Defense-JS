//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#if EDITOR==1
#include "DecorationEditor.h"
#include "MenuItemTextBG.h"
#include "support.h"
#include "ml/pugixml/pugixml.hpp"
#include "gameboard.h"
#include "GameGS.h"
#include "consts.h"
#include "EditorDeclarations.h"
#include "ImageManager.h"
#include "resources.h"
#include "MenuItemTextBG.h"
#include "ml/loadxml/xmlLoader.h"

NS_CC_BEGIN;

DecorationEditor * DecorationEditor::create()
{
	DecorationEditor * ptr = new DecorationEditor;
	if( ptr && ptr->init() )
	{
		ptr->autorelease();
		return ptr;
	}
	CC_SAFE_DELETE( ptr );
	return nullptr;
}


bool DecorationEditor::init()
{
	ImageManager::shared().load_plist( "images/gamescene.plist", "gamescene" );
	ImageManager::shared().load_plist( "images/maps/animations/animations.plist", "maps.animations" );
	ImageManager::shared().load_plist( "images/maps/animations/animations2.plist", "maps.animations2" );
	ImageManager::shared().load_plist( "images/maps/animations/animations3.plist", "maps.animations3" );
	if( !Layer::init() )
	{
		return false;
	}
	DropFileProtocol::setInstance( this );
	m_touchedDecoration.clear();

	//Size visibleSize = Director::getInstance()->getVisibleSize();

	m_menuMaps = Menu::create();
	addChild( m_menuMaps, 99 );
	m_menuMaps->setPosition( Point::ZERO );

	createDecorationMenu();

	m_levelIndex = 0;
	loadLevel();
	setEnabled( false );
	return true;
}

void DecorationEditor::setEnabled( bool var )
{
	if( var )
		attachWithIME();
	else
		detachWithIME();

	m_menuMaps->setVisible( var );
	m_enabled = var;
	setTouchMode( Touch::DispatchMode::ONE_BY_ONE );
	setTouchEnabled( var );
}

void DecorationEditor::createDecorationMenu()
{
	Vector<MenuItem*> items;

	items.pushBack( MenuItemTextBG::create( "Remove selected", Color4F( 0.7f, 0.7f, 0.7f, 1 ), Color3B( 0, 0, 0 ), CC_CALLBACK_0( DecorationEditor::remove, this ) ) );

	Point position( kEditorLayersMenuPosX(), kEditorLayersMenuPosY_add );

	for( int i = 0; i < items.size(); ++i )
	{
		MenuItemTextBG * item = (MenuItemTextBG*)items.at( i );
		m_menuMaps->addChild( item );
		item->setPosition( position );
		position.y -= 30;
	}
}

bool DecorationEditor::onTouchBegan( Touch *touch, Event *event )
{
	Point location = touch->getLocation();
	if( m_touchedDecoration.empty() == false &&
		(location.x > m_selectedZone.origin.x && location.x < m_selectedZone.origin.x + m_selectedZone.size.width) &&
		(location.y > m_selectedZone.origin.y && location.y < m_selectedZone.origin.y + m_selectedZone.size.height) )
	{
		//click by selected zone;
		return true;
	}

	m_touchedDecoration.clear();
	m_pull = false;
	m_pullInProcess = false;
	auto selected = m_decorations.end();
	for( int i = m_decorations.size() - 1; i >= 0; --i )
	{
		auto iter = m_decorations.begin() + i;
		bool innode = checkPointInNode( iter->body, location );
		if( innode )
		{
			selected = iter;
			break;
		}
	}
	if( selected != m_decorations.end() )
	{
		m_touchedDecoration.push_back( selected );
	}
	else
	{
		m_pull = true;
		m_pullInProcess = true;
		m_selectedZone.origin = location;
	}
	markTouchedDecoration();
	return true;
}

void DecorationEditor::onTouchMoved( Touch *touch, Event *event )
{
	if( m_touchedDecoration.empty() )
	{

	}

	for( auto i : m_touchedDecoration )
	{
		Point pos = i->body->getPosition() + touch->getDelta();
		i->body->setPosition( pos );
		i->body->setStartPosition( pos );
		i->body->setLocalZOrder( -pos.y );
	}
	if( m_pullInProcess == false )
	{
		m_selectedZone.origin = m_selectedZone.origin + touch->getDelta();
	}
	else
	{
		Point a = touch->getLocation();
		Point b = m_selectedZone.origin;
		m_selectedZone.origin.x = std::min( a.x, b.x );
		m_selectedZone.origin.y = std::min( a.y, b.y );
		m_selectedZone.size.width = std::fabs( a.x - b.x );
		m_selectedZone.size.height = std::fabs( a.y - b.y );
	}
	markTouchedDecoration();
}

void DecorationEditor::onTouchEnded( Touch *touch, Event *event )
{
	if( m_pull && m_pullInProcess )
	{
		m_pullInProcess = false;
		Point a = touch->getLocation();
		Point b = m_selectedZone.origin;
		m_selectedZone.origin.x = std::min( a.x, b.x );
		m_selectedZone.origin.y = std::min( a.y, b.y );
		m_selectedZone.size.width = std::fabs( a.x - b.x );
		m_selectedZone.size.height = std::fabs( a.y - b.y );

		for( auto i = m_decorations.begin(); i != m_decorations.end(); ++i )
		{
			Point p = i->body->getPosition();
			if( m_selectedZone.containsPoint( p ) )
				m_touchedDecoration.push_back( i );
		}
	}
	markTouchedDecoration();
}
/*
void DecorationEditor::visit()
{
Layer::visit();
if ( m_pull && m_enabled)
{
DrawPrimitives::drawRect(m_selectedZone.origin, Point(m_selectedZone.origin.x + m_selectedZone.size.width, m_selectedZone.origin.y + m_selectedZone.size.height) );
}
}
*/

void DecorationEditor::onDropBegin( const cocos2d::Point & locationInView )
{

}

void DecorationEditor::onDropEnded( const cocos2d::Point & locationInView, const std::list<std::string> & files )
{
	if( files.empty() ) return;
	std::string path = files.front();
	int k = path.find( "Resources" );
	if( k == std::string::npos )return;
	path = path.substr( k + std::string( "Resources" ).size() + 1 );

	std::string name = path;
	k = name.find_last_of( "." );
	name = name.substr( 0, k );
	k = name.find_last_of( "\\/" );
	name = name.substr( k + 1 );

	pugi::xml_document doc;
	doc.load_file( path.c_str() );
	auto root = doc.root().first_child();
	auto decoration = Decoration::create();
	xmlLoader::load( decoration, root );
	if( decoration )
	{
		decoration->setName( name );
		decoration->setPosition( locationInView );
		decoration->setStartPosition( locationInView );
		addChild( decoration, 1 );
		m_decorations.push_back( decor( decoration, name ) );
		m_touchedDecoration.clear();
	}
}

void DecorationEditor::onDropMoved( const cocos2d::Point & locationInView )
{}

void DecorationEditor::onDropCanceled()
{}

void DecorationEditor::markTouchedDecoration()
{
	for( auto decor : m_decorations )
	{
		decor.body->setColor( Color3B::WHITE );
	}
	for( auto decor : m_touchedDecoration )
	{
		decor->body->setColor( Color3B::RED );
	}
}

void DecorationEditor::selectLevel( int level )
{
	m_levelIndex = level;
	loadLevel();
}

void DecorationEditor::insertText( const char * text, int len )
{
	if( len && text[0] == 'e' )
		remove();
}

void DecorationEditor::deleteBackward()
{
	remove();
}

void DecorationEditor::remove()
{
	std::vector<Node*>nodes;
	for( auto i : m_touchedDecoration )nodes.push_back( i->body );
	for( auto node : nodes )
	{
		for( auto i = m_decorations.begin(); i != m_decorations.end(); ++i )
		{
			if( node == i->body )
			{
				removeChild( i->body );
				m_decorations.erase( i );
				break;
			}
		}
	}
}

void DecorationEditor::loadLevel()
{
	for( auto i : m_decorations ) removeChild( i.body );
	m_decorations.clear();

	std::string pathToFile = kDirectoryToMaps + intToStr( m_levelIndex ) + ".xml";
	pugi::xml_document doc;
	doc.load_file( pathToFile.c_str() );
	pugi::xml_node root = doc.root().first_child();

	pugi::xml_node decorations = root.child( "decorations" );
	for( auto child = decorations.first_child(); child; child = child.next_sibling() )
	{
		Decoration::Pointer object( nullptr );
		GameGS::createDecorFromXmlNode( child, object );
		if( object )
		{
			m_decorations.push_back( decor( object, object->getName() ) );
			addChild( object, object->getLocalZOrder() );
		}
	}
}

void DecorationEditor::saveLevel()
{
	std::string pathToFile = kDirectoryToMaps + intToStr( m_levelIndex ) + ".xml";
	pathToFile = FileUtils::getInstance()->fullPathForFilename( pathToFile.c_str() );
	pugi::xml_document doc;
	doc.load_file( pathToFile.c_str() );
	pugi::xml_node root = doc.root();
	pugi::xml_node mapNode = root.child( "map" );
	pugi::xml_node placesNode = mapNode.child( "decorations" );
	if( placesNode )
	{
		mapNode.remove_child( placesNode );
	}
	placesNode = mapNode.append_child( "decorations" );
	for( auto& i : m_decorations )
	{
		pugi::xml_node node = placesNode.append_child( i.name.c_str() );
		Point pos = i.body->getStartPosition();
		node.append_attribute( "x" ).set_value( intToStr( pos.x ).c_str( ) );
		node.append_attribute( "y" ).set_value( intToStr( pos.y ).c_str( ) );
		float z = i.body->getLocalZOrder();
		node.append_attribute( "z" ).set_value( z );
		node.append_attribute( "action" ).set_value( i.body->getActionDescription().c_str() );
	}
	doc.save_file( pathToFile.c_str() );
}

NS_CC_END;
#endif