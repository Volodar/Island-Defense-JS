//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#if EDITOR==1
#include "Editor.h"
#include "EditorPath.h"
#include "TowerPlacesEditor.h"
#include "DecorationEditor.h"
#include "support.h"
#include "MenuItemTextBG.h"
#include "EditorDeclarations.h"
#include "ml/ImageManager.h"
NS_CC_BEGIN;

EditorScene * EditorScene::s_instance(nullptr);

EditorScene::EditorScene()
{
	ImageManager::shared().load_plist( "images/gamescene.plist", "gamescene" );

	s_instance = this;

	Point center( Director::getInstance()->getWinSize().width / 2, Director::getInstance()->getWinSize().height / 2 );

	m_bg = Sprite::create();
	m_decorations = DecorationEditor::create();
	m_paths = PathEditor::create();
	m_places = TowerPlacesEditor::create();
	addChild( m_bg, -1 );
	addChild( m_decorations, 999 );
	addChild( m_paths, 999 );
	addChild( m_places, 999 );

	selectLevel( 0 );
	enableTouches0( );

	m_menu = Menu::create();
	addChild(m_menu, 9999);
	m_menu->setPosition(Point::ZERO);
	float X = kEditorLevelsMenuPosX();
	float Y = kEditorLevelsMenuPosY;
	for ( unsigned i=0; i<27; ++i )
	{
		MenuItemLabel * item = MenuItemTextBG::create("Lvl# " + intToStr(i+1), Color4F(0.7f, 0.7f, 0.7f, 1), Color3B(0,0,0), CC_CALLBACK_0(EditorScene::selectLevel, this, i));
		item->setTag(i);
		item->setPosition(Point(X, Y));
		m_menu->addChild(item);
		
		Y -= 25;
		if( (i+1) % 9 == 0 )
			Y-= 20;
	}


	MenuItemLabel * layer0 = MenuItemTextBG::create("Paths", Color4F(0.7f, 0.7f, 0.7f, 1), Color3B(0,0,0), CC_CALLBACK_0(EditorScene::enableTouches0, this));
	MenuItemLabel * layer1 = MenuItemTextBG::create("Places", Color4F(0.7f, 0.7f, 0.7f, 1), Color3B(0,0,0), CC_CALLBACK_0(EditorScene::enableTouches1, this));
	MenuItemLabel * layer2 = MenuItemTextBG::create("Decor", Color4F(0.7f, 0.7f, 0.7f, 1), Color3B(0,0,0), CC_CALLBACK_0(EditorScene::enableTouches2, this));
	MenuItemLabel * layer4 = MenuItemTextBG::create("Save", Color4F(0.7f, 0.7f, 0.7f, 1), Color3B(0,0,0), CC_CALLBACK_0(EditorScene::save, this ));
	
	layer0->setPosition(Point(kEditorLayersMenuPosX(), kEditorLayersMenuPosY - 0 * 19 ));
	layer1->setPosition(Point(kEditorLayersMenuPosX(), kEditorLayersMenuPosY - 1 * 19 ));
	layer2->setPosition(Point(kEditorLayersMenuPosX(), kEditorLayersMenuPosY - 2 * 19 ));
	layer4->setPosition(Point(kEditorLayersMenuPosX(), kEditorLayersMenuPosY - 5 * 19 ));
	m_menu->addChild(layer0);
	m_menu->addChild(layer1);
	m_menu->addChild(layer2);
	m_menu->addChild(layer4);

	/*
	Menu * menu = Menu::create();
	addChild(menu, 99);
	menu->setPosition(Point::ZERO);
	MenuItemTextBG * item = MenuItemTextBG::create("+  ", Color4F(0.7f, 0.7f, 0.7f, 1), Color3B(0,0,0),CC_CALLBACK_1( EditorScene::hideGUI, this));
	item->setPosition  (Point(0, 758));
	item->getBG()->setScale( 20, 20 );
	//item->getBG()->setAnchorPoint( Point(0, 1) );
	menu->addChild(item);
 */
}


EditorScene::~EditorScene()
{
	s_instance = nullptr;
}

EditorScene& EditorScene::shared()
{
	assert( s_instance );
	return *s_instance;
}

EditorScene* EditorScene::create()
{
	assert( s_instance == nullptr );
	EditorScene * scene = new EditorScene;
	if( scene )
		scene->autorelease();
	return scene;
}

void EditorScene::selectLevel(int tag)
{
	m_currentLevelIndex = tag;
	//int tag = ((Node*)level)->getTag();
	changeBackground( tag );
	m_decorations->selectLevel( tag );
	m_paths->selectLevel( tag );
	m_places->selectLevel( tag );
}

void EditorScene::changeBackground( int level )
{
	std::string nameBG = "images/maps/map" + intToStr(level + 1) + ".jpg";
	m_bg->setTexture( nameBG );
	m_bg->setPosition( Point( m_bg->getContentSize() / 2 ) );
}

void EditorScene::hideGUI(Ref * sender)
{
	static bool visible(true);
	visible = !visible;

	static bool layer0 = m_decorations->getIsEnabled();
	static bool layer1 = m_paths->getIsEnabled();
	static bool layer2 = m_places->getIsEnabled();
	if( visible == false )
	{
		layer0 = m_decorations->getIsEnabled();
		layer1 = m_paths->getIsEnabled();
		layer2 = m_places->getIsEnabled();
	}
	Director::getInstance()->setDisplayStats( visible );

	if( layer0 ) m_decorations->setEnabled( visible );
	if( layer1 ) m_paths->setEnabled( visible );
	if( layer2 ) m_places->setEnabled( visible );

	m_menu->setVisible( visible );
	MenuItemTextBG * item = dynamic_cast<MenuItemTextBG*>( sender );
	item->getLabel()->setOpacity( visible? 255 : 1 );
	item->getBG()->setOpacity( visible? 255 : 1 );
	 
}

void EditorScene::disableTouches()
{
	m_decorations->setEnabled( false );
	m_paths->setEnabled( false );
	m_places->setEnabled( false );
}

void EditorScene::enableTouches0( )
{
	disableTouches();
	m_paths->setEnabled( true );
}

void EditorScene::enableTouches1( )
{
	disableTouches();
	m_places->setEnabled( true );
}

void EditorScene::enableTouches2( )
{
	disableTouches();
	m_decorations->setEnabled( true );
}

void EditorScene::save( )
{
	m_paths->menuSave(nullptr);
	m_decorations->saveLevel();
	m_places->saveLevel();
}


NS_CC_END;
#endif