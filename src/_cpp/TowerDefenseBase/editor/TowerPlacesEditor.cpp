#if EDITOR==1
//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "TowerPlacesEditor.h"
#include "MenuItemTextBG.h"
#include "support.h"
#include "ml/pugixml/pugixml.hpp"
#include "gameboard.h"
#include "GameGS.h"
#include "consts.h"
#include "EditorDeclarations.h"
#include "ImageManager.h"
NS_CC_BEGIN;

float radiusPlace( 50 );

TowerPlacesEditor * TowerPlacesEditor::create()
{
	TowerPlacesEditor * ptr = new TowerPlacesEditor;
	if( ptr && ptr->init() )
	{
		ptr->autorelease();
		return ptr;
	}
	CC_SAFE_DELETE( ptr );
	return nullptr;
}


bool TowerPlacesEditor::init()
{
	if( !Layer::init() )
	{
		return false;
	}
	m_touchedPlace = m_places.end();

	//Size visibleSize = Director::getInstance()->getVisibleSize();

	m_menuMaps = Menu::create();
	addChild( m_menuMaps );
	m_menuMaps->setPosition( Point::ZERO );

	Point position( kEditorLayersMenuPosX(), kEditorLayersMenuPosY_add );

	auto item = MenuItemTextBG::create( "Add place", Color4F( 0.7f, 0.7f, 0.7f, 1 ), Color3B( 0, 0, 0 ), CC_CALLBACK_0( TowerPlacesEditor::createPlace, this, true ) );
	item->setPosition( position ); position.y -= 30;
	m_menuMaps->addChild( item );

	item = MenuItemTextBG::create( "Add non active place", Color4F( 0.7f, 0.7f, 0.7f, 1 ), Color3B( 0, 0, 0 ), CC_CALLBACK_0( TowerPlacesEditor::createPlace, this, false ) );
	item->setPosition( position ); position.y -= 30;
	m_menuMaps->addChild( item );

	item = MenuItemTextBG::create( "Remove place", Color4F( 0.7f, 0.7f, 0.7f, 1 ), Color3B( 0, 0, 0 ), CC_CALLBACK_0( TowerPlacesEditor::removePlace, this ) );
	item->setPosition( position ); position.y -= 30;
	m_menuMaps->addChild( item );

	m_levelIndex = 0;
	loadLevel();
	setEnabled( false );
	return true;
}

void TowerPlacesEditor::setEnabled( bool var )
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


void TowerPlacesEditor::insertText( const char * text, int len )
{
	if( len && text[0] == 'e' )
		removePlace();
}

void TowerPlacesEditor::deleteBackward()
{
	removePlace();
}

bool TowerPlacesEditor::onTouchBegan( Touch *touch, Event *event )
{
	m_touchedPlace = m_places.end();
	float minDist( 9999 );
	for( auto i = m_places.begin(); i != m_places.end(); ++i )
	{
		float distance = touch->getLocation().getDistance( (*i)->getPosition() );
		if( distance < minDist && distance < radiusPlace )
		{
			m_touchedPlace = i;
		}
	}
	return true;
}

void TowerPlacesEditor::onTouchMoved( Touch *touch, Event *event )
{
	if( m_touchedPlace != m_places.end() )
	{
		Point pos = (*m_touchedPlace)->getPosition() + touch->getDelta();
		(*m_touchedPlace)->setPosition( pos );
	}
}

void TowerPlacesEditor::onTouchEnded( Touch *touch, Event *event )
{
	if( m_touchedPlace != m_places.end() )
	{
		Point pos = (*m_touchedPlace)->getPosition();
		pos.x = int( pos.x );
		pos.y = int( pos.y );
		(*m_touchedPlace)->setPosition( pos );
	}
}

/*
void TowerPlacesEditor::visit()
{
Layer::visit();
if ( m_enabled && m_touchedPlace != m_places.end() )
{
DrawPrimitives::setDrawColor4F(0,1,0,0.3f);
DrawPrimitives::drawSolidCircle((*m_touchedPlace)->getPosition(), radiusPlace, 0, 16);
DrawPrimitives::setDrawColor4F(1,1,1,1);
}
}
*/

void TowerPlacesEditor::selectLevel( int level )
{
	m_levelIndex = level;
	loadLevel();
}

void TowerPlacesEditor::newPlace( const Point & position, bool active )
{
	std::string texture = active ?
		k::resourceGameSceneFolder + "active_slot.png" :
		k::resourceGameSceneFolder + "unactive_slot.png";
	m_places.push_back( ImageManager::sprite( texture ) );
	m_placesActive.push_back( active );

	addChild( m_places.back() );
	m_places.back()->setPosition( position );
	m_touchedPlace = m_places.end();
}

void TowerPlacesEditor::removePlace()
{
	if( m_touchedPlace != m_places.end() )
	{
		unsigned index = m_touchedPlace - m_places.begin();
		assert( index < m_placesActive.size() );
		m_placesActive.erase( m_placesActive.begin() + index );
		removeChild( *m_touchedPlace );
		m_touchedPlace = m_places.erase( m_touchedPlace );
	}
}

void TowerPlacesEditor::loadLevel()
{
	for( auto i : m_places )
		removeChild( i );
	m_places.clear();
	m_placesActive.clear();

	std::string pathToFile = kDirectoryToMaps + intToStr( m_levelIndex ) + ".xml";
	pugi::xml_document doc;
	doc.load_file( pathToFile.c_str() );

	std::vector<TowerPlaseDef> places;
	GameBoard::loadTowerPlaces( places, doc.root().first_child().child( "towerplaces" ) );
	for( auto i : places )
	{
		newPlace( i.position, i.isActive );
	}
	m_touchedPlace = m_places.end();

	std::string nameBG = "images/maps/map" + intToStr( m_levelIndex ) + ".jpg";
}

void TowerPlacesEditor::saveLevel()
{
	std::string pathToFile = kDirectoryToMaps + intToStr( m_levelIndex ) + ".xml";
	pathToFile = FileUtils::getInstance()->fullPathForFilename( pathToFile.c_str() );
	pugi::xml_document doc;
	doc.load_file( pathToFile.c_str() );
	pugi::xml_node root = doc.root();
	pugi::xml_node mapNode = root.child( "map" );
	pugi::xml_node placesNode = mapNode.child( "towerplaces" );
	if( placesNode )
	{
		mapNode.remove_child( placesNode );
	}
	placesNode = mapNode.append_child( "towerplaces" );

	int index( 0 );
	for( auto i : m_places )
	{
		pugi::xml_node node = placesNode.append_child( "place" );
		node.append_attribute( "x" ).set_value( floatToStr( i->getPosition().x ).c_str() );
		node.append_attribute( "y" ).set_value( floatToStr( i->getPosition().y ).c_str() );
		node.append_attribute( "active" ).set_value( m_placesActive[index] ? "yes" : "no" );
		++index;
	}
	doc.save_file( pathToFile.c_str() );
}

NS_CC_END;
#endif