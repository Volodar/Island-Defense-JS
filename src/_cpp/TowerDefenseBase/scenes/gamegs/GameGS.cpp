//
//  IslandDefense
//
//  Created by Vladimir Tolmachev‚ on 27.09.14.
//
//
#include "ml/Animation.h"
#include "ml/ScrollMenu.h"
#include "ml/Audio/AudioEngine.h"
#include "ml/ImageManager.h"
#include "ml/Language.h"

#include "GameGS.h"
#include "support.h"
#include "tower.h"
#include "ScoreCounter.h"
#include "consts.h"
#include "MenuItemTextBG.h"
#include "GamePauseScene.h"
#include "Log.h"
#include "UserData.h"
#include "Achievements.h"
#include "admob/AdMob.h"
#include "MenuCreateTower.h"
#include "ShootsEffects.h"
#include "VictoryMenu.h"
#include "ShopLayer.h"
#include "plugins/AdsPlugin.h"
#include "game/Airbomb.h"
#include "configuration.h"
#include "Tutorial.h"
#include "UnitInfo.h"
#include "RateMeLayer.h"

//#include "Animations.h"

NS_CC_BEGIN;

static int zOrderOfArriavalCounter( 0 );
static int zOrderInterfaceMenu(99);
static int zOrderInterfaceWaveIcon(100);

static GameGS * gameGSInstance( nullptr );

const std::string kExt_png( ".png" );
const std::string kSuffixUn( "_un" );

void GameGS::restartLevel()
{
	auto game = getInstance();
	assert( game );
	auto levelindex = game->getGameBoard().getCurrentLevelIndex();
	auto gamemode = game->getGameBoard().getGameMode();
	game->clear();

	auto scene = dynamic_cast<SmartScene*>(game->getScene());
	scene->resetMainLayer( nullptr );
	assert( instanceIsCreate() == false );

	auto dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
	GameGS *layer = new GameGS;
	layer->m_scoresNode = ScoresNode::create();
	layer->m_scoresNode->setPosition( 0, dessize.height );
	bool result = layer->init();
	assert( result );
	scene->resetMainLayer( layer );
	scene->addChild( layer->m_scoresNode, 9 );
	GameGS::getInstance()->getGameBoard().loadLevel( levelindex, gamemode );
	
	if( k::configuration::useBoughtLevelScoresOnlyRestartLevel )
	{
		int boughtScores = game->_boughtScoresForSession;
		GameGS::getInstance()->_boughtScoresForSession = boughtScores;
		ScoreCounter::shared().addMoney( kScoreLevel, boughtScores, false );
	}

	layer->release();
};

GameGS::GameGS()
: m_board()
, m_bg( nullptr )
, m_objects( nullptr )
, m_interface( nullptr )
, m_selectedPlace( nullptr )
, m_enabled( true )
, m_scoresNode( nullptr )
, m_dalayWaveIcon( 0 )
, _scoresForStartWave( 0 )
, _boughtScoresForSession( 0 )
, _runFlyCamera( true )
, _skillModeActived(false)
{
	__push_auto_check( "GameGS::GameGS" );
	m_interfaceMenu.menu = nullptr;
	assert( !gameGSInstance );
	
	Size desSize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
	Size winSize = Director::getInstance()->getWinSize();
	Size sizeMap = k::configuration::LevelMapSize;

	m_mainlayer = Node::create();
	m_mainlayer->setName( "mainlayer" );
	addChild( m_mainlayer );
	float sx = winSize.width / sizeMap.width;
	float sy = winSize.height / sizeMap.height;
	float scale = std::max( sx, sy );
	m_mainlayer->setScale( scale );

	m_objects = Node::create();
	m_objects->setName( "objects" );
	m_mainlayer->addChild( m_objects, 1 );

	assert( m_bg == nullptr );

	m_mainlayer->setContentSize( sizeMap );
	m_mainlayer->setAnchorPoint( Point::ZERO );

	gameGSInstance = this;

	setName( "gamelayer" );
}

GameGS::~GameGS()
{
	MouseHoverScroll::shared().setNode( nullptr );
	MouseHoverScroll::shared().setScroller( nullptr );
	__push_auto_check( "GameGS::~GameGS" );
	gameGSInstance = nullptr;
	m_board.clear();
	ShootsEffectsClear();

	Director::getInstance()->getScheduler()->setTimeScale( 1 );
	ScoreCounter::shared().observer( kScoreLevel ).remove( _ID );
	
	if( m_scoresNode )
		m_scoresNode->removeFromParent();
}

SmartScene::Pointer GameGS::createScene()
{
	__push_auto( "GameGS::createScene" );
	assert( gameGSInstance == nullptr );
	GameGS *layer = new GameGS;
	bool result = layer->init();
	assert(result);
	auto scene = SmartScene::create( layer );
	scene->setName( "gameScene" );

	auto dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
	layer->m_scoresNode = ScoresNode::create();
	layer->m_scoresNode->setPosition( 0, dessize.height );
	scene->addChild( layer->m_scoresNode, 9 );

	layer->release();
	return scene;
}

bool GameGS::instanceIsCreate()
{
	return gameGSInstance != nullptr;
}

GameGS* GameGS::getInstance()
{
	if( gameGSInstance == nullptr ) __log_line( "gameGSInstance == nullptr" );
	return gameGSInstance;
}

GameBoard& GameGS::getGameBoard()
{
	return m_board;
}

bool GameGS::init()
{
	__push_auto_check( "GameGS::init" );
	if( !Layer::init() )
	{
		return false;
	}

	auto touchListenerN = EventListenerTouchAllAtOnce::create();
	touchListenerN->onTouchesBegan = std::bind( &GameGS::onTouchesBegan, this, std::placeholders::_1, std::placeholders::_2 );
	touchListenerN->onTouchesMoved = std::bind( &GameGS::onTouchesMoved, this, std::placeholders::_1, std::placeholders::_2 );
	touchListenerN->onTouchesEnded = std::bind( &GameGS::onTouchesEnded, this, std::placeholders::_1, std::placeholders::_2 );
	touchListenerN->onTouchesCancelled = std::bind( &GameGS::onTouchesCancelled, this, std::placeholders::_1, std::placeholders::_2 );
	
	auto touchListenerSD = EventListenerTouchOneByOne::create();
	touchListenerSD->onTouchBegan = std::bind( &GameGS::onTouchSkillBegan, this, std::placeholders::_1, std::placeholders::_2 );
	touchListenerSD->onTouchEnded = std::bind( &GameGS::onTouchSkillEnded, this, std::placeholders::_1, std::placeholders::_2, Skill::desant );
	touchListenerSD->onTouchCancelled = std::bind( &GameGS::onTouchSkillCanceled, this, std::placeholders::_1, std::placeholders::_2 );
	touchListenerSD->setSwallowTouches( true );
	
	auto touchListenerSB = EventListenerTouchOneByOne::create();
	touchListenerSB->onTouchBegan = std::bind( &GameGS::onTouchSkillBegan, this, std::placeholders::_1, std::placeholders::_2 );
	touchListenerSB->onTouchEnded = std::bind( &GameGS::onTouchSkillEnded, this, std::placeholders::_1, std::placeholders::_2, Skill::bomb );
	touchListenerSB->onTouchCancelled = std::bind( &GameGS::onTouchSkillCanceled, this, std::placeholders::_1, std::placeholders::_2 );
	touchListenerSB->setSwallowTouches( true );

	auto touchListenerSH = EventListenerTouchOneByOne::create();
	touchListenerSH->onTouchBegan = std::bind( &GameGS::onTouchSkillBegan, this, std::placeholders::_1, std::placeholders::_2 );
	touchListenerSH->onTouchEnded = std::bind( &GameGS::onTouchSkillEnded, this, std::placeholders::_1, std::placeholders::_2, Skill::heroskill );
	touchListenerSH->onTouchCancelled = std::bind( &GameGS::onTouchSkillCanceled, this, std::placeholders::_1, std::placeholders::_2 );
	touchListenerSH->setSwallowTouches( true );

	auto touchListenerH = EventListenerTouchOneByOne::create();
	touchListenerH->onTouchBegan = std::bind( &GameGS::onTouchHeroBegan, this, std::placeholders::_1, std::placeholders::_2 );
	touchListenerH->onTouchMoved = std::bind( &GameGS::onTouchHeroMoved, this, std::placeholders::_1, std::placeholders::_2 );
	touchListenerH->onTouchEnded = std::bind( &GameGS::onTouchHeroEnded, this, std::placeholders::_1, std::placeholders::_2 );
	touchListenerH->onTouchCancelled = std::bind( &GameGS::onTouchHeroCanceled, this, std::placeholders::_1, std::placeholders::_2 );
	
	_touchListenerNormal.reset( touchListenerN );
	_touchListenerDesant.reset( touchListenerSD );
	_touchListenerBomb.reset( touchListenerSB );
	_touchListenerHeroSkill.reset( touchListenerSH );
	_touchListenerHero.reset( touchListenerH );

	_scrollInfo = make_intrusive<ScrollTouchInfo>();

	createInterface();

	Achievements::shared().setCallbackOnAchievementObtained( std::bind( &GameGS::achievementsObtained, this, std::placeholders::_1 ) );

	load( "ini/gamescene", "scene.xml" );
    
    if(k::configuration::useInapps == false ) {
        //hide "shop" button
        m_interfaceMenu.shop->setPositionY(-9999.f);
    }

    
	runEvent( "oncreate" );
    	
	//if( k::configuration::interstitialBanerByTime )
	//{
	//	auto callfunc = CallFunc::create( std::bind( [](){
	//		AdsPlugin::shared().showInterstitial();
	//	}));
	//	auto delay = DelayTime::create(k::configuration::interstitialBanerByTimeDelay);
	//	auto action1 = Sequence::create(callfunc, DelayTime::create(2), nullptr);
	//	auto action2 = RepeatForever::create(Sequence::create(delay, callfunc, nullptr));
	//	runAction(action1);
	//	runAction(action2);
	//}

	UserData::shared().write( k::user::LastGameResult, k::user::GameResultValueNone );

	return true;
}

void GameGS::createInterface()
{
	__push_auto_check( "GameGS::createInterface" );
	Size desSize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();

	m_interface = Node::create();
	m_interface->setName( "interface" );
	addChild( m_interface, 9 );


	auto cb0 = std::bind( &GameGS::menuShop, this, std::placeholders::_1, true );
	auto cb1 = std::bind( &GameGS::menuPause, this, std::placeholders::_1 );
	auto cb2 = std::bind( &GameGS::menuSkill, this, std::placeholders::_1, Skill::desant ); //высодка десанта
	auto cb3 = std::bind( &GameGS::menuSkill, this, std::placeholders::_1, Skill::bomb );   //выброс бомбы
	auto cb5 = std::bind( &GameGS::menuHero, this, std::placeholders::_1 );

	const std::string kPathButtonShop( k::resourceGameSceneFolder + "button_shop.png" );
	const std::string kPathButtonPauseNormal( k::resourceGameSceneFolder + "icon_pause.png" );
	const std::string kPathButtonDesantBack( k::resourceGameSceneFolder + "button_desant_2_1.png" );
	const std::string kPathButtonDesantForward( k::resourceGameSceneFolder + "button_desant_2.png" );
	const std::string kPathButtonDesantCancel( k::resourceGameSceneFolder + "button_desant_2_3.png" );
	const std::string kPathButtonBombBack( k::resourceGameSceneFolder + "button_desant_1_1.png" );
	const std::string kPathButtonBombForward( k::resourceGameSceneFolder + "button_desant_1.png" );
	const std::string kPathButtonBombCancel( k::resourceGameSceneFolder + "button_desant_1_3.png" );

	std::string cancel( k::resourceGameSceneFolder + "icon_x_10.png" );
	float cdd = m_board.getSkillParams( ).cooldownDesant;
	float cda = m_board.getSkillParams( ).cooldownAirplane;
	m_interfaceMenu.shop = MenuItemImageWithText::create( kPathButtonShop, cb0 );
	m_interfaceMenu.pause = MenuItemImageWithText::create( kPathButtonPauseNormal, cb1 );
	m_interfaceMenu.desant = MenuItemCooldown::create(kPathButtonDesantBack, kPathButtonDesantForward, cdd, cb2, kPathButtonDesantCancel);
	m_interfaceMenu.bomb = MenuItemCooldown::create(kPathButtonBombBack, kPathButtonBombForward, cda, cb3, kPathButtonBombCancel);
	m_interfaceMenu.heroSkill = MenuItemCooldown::create( "", "", 0, nullptr, cancel );
	m_interfaceMenu.hero = HeroIcon::create( "hero" + intToStr(UserData::shared().hero_getCurrent() + 1), cb5 );
	m_interfaceMenu.hero->setEnabled( true );

	m_interfaceMenu.desant->setAnimationOnFull( "airstike_animation1" );
	m_interfaceMenu.bomb->setAnimationOnFull( "airstike_animation2" );

	m_interfaceMenu.shop->setName( "shop" );
	m_interfaceMenu.pause->setName( "pause" );
	m_interfaceMenu.desant->setName( "desant" );
	m_interfaceMenu.bomb->setName( "bomb" );
	m_interfaceMenu.heroSkill->setName( "heroskill" );
	m_interfaceMenu.hero->setName( "hero" );

	m_interfaceMenu.desant->setSound( "##sound_button##" );
	m_interfaceMenu.bomb->setSound( "##sound_button##" );
	m_interfaceMenu.heroSkill->setSound( "##sound_button##" );

	m_interfaceMenu.menu = Menu::create();
	m_interfaceMenu.menu->setName( "menu" );
	m_interfaceMenu.menu->addChild( m_interfaceMenu.shop );
	m_interfaceMenu.menu->addChild( m_interfaceMenu.pause );
	m_interfaceMenu.menu->addChild( m_interfaceMenu.desant );
	m_interfaceMenu.menu->addChild( m_interfaceMenu.bomb );
	m_interfaceMenu.menu->addChild( m_interfaceMenu.heroSkill );
	m_interfaceMenu.menu->addChild( m_interfaceMenu.hero );
	m_interfaceMenu.menu->setEnabled( false );

	m_interfaceMenu.hero->setVisible( false );

	m_interfaceMenu.menu->setPosition( Point::ZERO );
	m_interface->addChild( m_interfaceMenu.menu, zOrderInterfaceMenu );

	m_menuCreateTower = MenuCreateTower::create();
	m_menuTower = MenuTower::create();
	m_menuDig = MenuDig::create();

	m_interface->addChild( m_menuCreateTower, 999999 );
	m_interface->addChild( m_menuTower, 999999 );
	m_interface->addChild( m_menuDig, 999999 );
	m_menuCreateTower->setGlobalZOrder( 99999 );
	m_menuTower->setGlobalZOrder( 99999 );
	m_menuDig->setGlobalZOrder( 99999 );

	m_menuCreateTower->setPosition( Point( 0, 0 ) );
	m_menuCreateTower->disappearance();
	m_menuTower->disappearance();
	m_menuDig->disappearance();

	//m_interfaceMenu.menu->setEnabled( false );

	m_box = BoxMenu::create( "ini/gamescene/boxmenu.xml" );
	addChild( m_box );


	createDevMenu();
}

void GameGS::createHeroMenu()
{
	auto hero = m_board.getHero();
	if( hero )
	{
		std::string skill = hero->getSkill();
		m_interfaceMenu.hero->setVisible( true );
		m_interfaceMenu.hero->setHero( hero );

		std::string back( k::resourceGameSceneFolder + "button_" + skill + "_2.png" );
		std::string forward( k::resourceGameSceneFolder + "button_" + skill + "_1.png" );
		std::string cancel(k::resourceGameSceneFolder + "button_" + skill + "_3.png");

		std::vector<unsigned> skills;
		HeroExp::shared().skills( m_board.getHero()->getName(), skills );
		unsigned level = skills[4];

		float duration( 0 );
		if( skill == "landmine" )
		{
			duration = m_board.getSkillParams().cooldownLandmine;
			duration *= m_board.getSkillParams().landmineLevels[level].rateCooldown;
		}
		else if( skill == "swat" )
		{
			duration = m_board.getSkillParams().cooldownSwat;
			duration *= m_board.getSkillParams().swatLevels[level].rateCooldown;
		}
		else if( skill == "hero3_bot" )
		{
			duration = m_board.getSkillParams().cooldownHero3Bot;
			duration *= m_board.getSkillParams().hero3BotLevels[level].rateCooldown;
		}
		else
			assert( 0 );

		auto callback = std::bind( &GameGS::menuSkill, this, std::placeholders::_1, Skill::heroskill );
		m_interfaceMenu.heroSkill->init( back, forward, duration, callback, cancel );
		m_interfaceMenu.heroSkill->setAnimationOnFull( skill );
	}
}

void GameGS::createDevMenu()
{
	if( isTestDevice() && isTestModeActive() )
	{
		auto item = [this]( Menu * menu, std::string text, EventKeyboard::KeyCode key, Point pos )
		{
			auto sendKey = [this]( Ref* sender, EventKeyboard::KeyCode key )mutable
			{
				this->onKeyReleased( key, nullptr );
			};

			auto i = MenuItemTextBG::create( text, Color4F::GRAY, Color3B::BLACK, std::bind( sendKey, std::placeholders::_1, key ) );
			menu->addChild( i );
			i->setPosition( pos );
			i->setScale( 1.5f );
		};

		auto menu = Menu::create();
		menu->setPosition( 0, 0 );
		addChild( menu );
		Point pos( 25, 100 );
		float Y( 45 );
		item( menu, "R 1", EventKeyboard::KeyCode::KEY_1, pos ); pos.y += Y;
		item( menu, "R 2", EventKeyboard::KeyCode::KEY_2, pos ); pos.y += Y;
		item( menu, "R 3", EventKeyboard::KeyCode::KEY_3, pos ); pos.y += Y;
		item( menu, "R 4", EventKeyboard::KeyCode::KEY_4, pos ); pos.y += Y;
		item( menu, "R 5", EventKeyboard::KeyCode::KEY_5, pos ); pos.y += Y;
		item( menu, "R 6", EventKeyboard::KeyCode::KEY_6, pos ); pos.y += Y;
		item( menu, "R 7", EventKeyboard::KeyCode::KEY_7, pos ); pos.y += Y;
		item( menu, "R 8", EventKeyboard::KeyCode::KEY_8, pos ); pos.y += Y;
		item( menu, "R 9", EventKeyboard::KeyCode::KEY_9, pos ); pos.y += Y;
		item( menu, "R 0", EventKeyboard::KeyCode::KEY_0, pos ); pos.y += Y;
		item( menu, "R 99", EventKeyboard::KeyCode::KEY_F9, pos ); pos.y += Y;
		item( menu, "WIN", EventKeyboard::KeyCode::KEY_F1, pos ); pos.y += Y;
	}
}

void GameGS::clear()
{
	__push_auto_check( "GameGS::clear" );
	Achievements::shared().setCallbackOnAchievementObtained( nullptr );
	ShootsEffectsClear();
	
	if( m_bg )
		m_bg->removeFromParent();
	m_bg = nullptr;
	m_objects->removeAllChildren();
	m_objects = nullptr;
	for( auto i : m_towerPlaces ) removeChild( i ); m_towerPlaces.clear();

	m_fragments.clear();

	m_menuTower->setUnit( nullptr );
	m_menuTower->disappearance();

	menuFastModeEnabled( false );
	unschedule( schedule_selector( GameGS::update ) );

	zOrderOfArriavalCounter = 0;

	//Node * tapLabel = m_interface->getChildByTag( kTagTapToContinueLabel );
	//if( tapLabel ) tapLabel->removeFromParent();

	removeAllChildrenWithCleanup( true );
}

void GameGS::startGame()
{
	__push_auto_check( "GameGS::startGame" );
	AudioEngine::shared().playEffect( kSoundGameStart );
	setEnabled( true );
	
	schedule( schedule_selector( GameGS::update ) );
}

void GameGS::createPredelayLabel()
{
	//__push_auto_check( "GameGS::createPredelayLabel" );
	//auto label = Label::create( WORD( kTextIdTapToContinue ), kFontArialBig );
	//auto action = RepeatForever::create( Sequence::create( ScaleTo::create( 0.5f, 1.2f ), ScaleTo::create( 0.5f, 1.0f ), nullptr ) );
	//
	//m_interface->addChild( label, 1, kTagTapToContinueLabel );
	//label->runAction( action );
	//label->setPosition( 512, 384 );
}

void GameGS::loadLevel( int index, const pugi::xml_node & root )
{
	__push_auto_check( "GameGS::loadLevel" );

	auto desSize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();

	m_bg = ImageManager::sprite( ("images/maps/map" + intToStr( index + 1 ) + ".jpg").c_str() );
	m_bg->setAnchorPoint( Point( 0, 0 ) );
	m_mainlayer->addChild( m_bg, -1 );
	m_bg->setGlobalZOrder( -2 );

	GameMode mode = m_board.getGameMode();
	auto decorations = root.child( "decorations" );
	auto xmlparams = root.child( mode == GameMode::normal ? k::xmlTag::LevelParams : k::xmlTag::LevelParamsHard );
	if( !xmlparams )
		xmlparams = root;

	for( auto child = decorations.first_child(); child; child = child.next_sibling() )
	{
		Decoration::Pointer object( nullptr );
		GameGS::createDecorFromXmlNode( child, object );
		if( object )
		{
			int z = object->getLocalZOrder();
			addObject( object, object->getLocalZOrder() );
			if( z != 0 )
			{
				object->setLocalZOrder( z );
			}
		}
	}

	m_dalayWaveIcon = xmlparams.attribute( "wave_cooldown" ).as_float( 20 );

	updateWaveCounter();

	{
		pugi::xml_document doc;
		doc.load_file( "ini/gameparams.xml" );
		auto root = doc.root().first_child();
		for( const auto& xml : root )
		{
			std::string name = xml.attribute( "name" ).as_string();
			auto value = xml.attribute( "value" );
			if( name == "max_score_for_start_wave" )
				_scoresForStartWave = value.as_int();
		}
	}

	m_board.startGame();

#if PC == 1
	MouseHoverScroll::shared().setScroller(_scrollInfo);
	MouseHoverScroll::shared().setNode( m_mainlayer );
#endif
}

void GameGS::excludeTower( const std::string & towername )
{
	m_menuCreateTower->addExludedTower( towername );
}

void GameGS::onEnter()
{
	Layer::onEnter();
	setKeyboardEnabled( true );
#if PC == 1
	MouseHoverScroll::shared().enable();
#endif

	//Director::getInstance()->getTextureCache()->removeUnusedTextures();
	AdMob::hide();

	std::string music = m_board.isGameStarted() ? kMusicGameBattle : kMusicGamePeace;
	AudioEngine::shared().playMusic( music );
	AudioEngine::shared( ).resumeAllEffects( );

	for( auto i : m_objects->getChildren( ) )
	{
		auto unit = dynamic_cast<Unit*> (i);
		if( unit )
		{
			auto fire = unit->getChildByName( "fire" );
			if( fire ) fire->setVisible( true );
		}
	}
}

void GameGS::onExit()
{
	Layer::onExit();
	setKeyboardEnabled( false );
#if PC == 1
	MouseHoverScroll::shared().disable();
#endif
	AdMob::show();
	if( m_objects )
	{
		for( auto i : m_objects->getChildren( ) )
		{
			auto unit = dynamic_cast<Unit*> (i);
			if( unit )
			{
				auto fire = unit->getChildByName( "fire" );
				if( fire ) fire->setVisible( false );
			}
		}
	}
};

bool GameGS::setProperty( const std::string & stringproperty, const std::string & value )
{
	if( stringproperty == "shake" )
		shake( strToFloat(value) );
	else
		return NodeExt::setProperty( stringproperty, value );
	return true;
}

TowerPlace::Pointer GameGS::addTowerPlace( const TowerPlaseDef  & def )
{
	if( getTowerPlaceInLocation( def.position ) )
		return nullptr;
	TowerPlace::Pointer place = TowerPlace::create( def );
	m_towerPlaces.push_back( place );
	addObject( place, zorder::earth + 1 );
	return place;
}

TowerPlace::Pointer GameGS::getTowerPlaceInLocation( const Point & location )
{
	auto index = getTowerPlaceIndex( location );
	if( index != -1 )
	{
		return m_towerPlaces[index];
	}
	return nullptr;
}

unsigned GameGS::getTowerPlaceIndex( const Point & location )
{
	unsigned result( -1 ), index( 0 );
	float mind( 999999 );
	float distance( 0 );
	for( auto p : m_towerPlaces )
	{
		bool c = p->checkClick( location, distance );
		if( c && distance < mind )
		{
			result = index;
			mind = distance;
		}
		++index;
	}
	return result;
}

void GameGS::eraseTowerPlace( TowerPlace::Pointer place )
{
	auto iplace = std::find( m_towerPlaces.begin(), m_towerPlaces.end(), place );
	if( iplace != m_towerPlaces.end() )
	{
		removeObject( place );
		m_towerPlaces.erase( iplace );
		m_selectedPlace = nullptr;
	}

	markTowerPlaceOnLocation( Point( -9999, -9999 ) );
}

void GameGS::setSelectedTowerPlaces( TowerPlace::Pointer place )
{
	m_selectedPlace = place;
}

TowerPlace::Pointer GameGS::getSelectedTowerPlaces()
{
	return m_selectedPlace;
}

const std::vector<TowerPlace::Pointer>& GameGS::getTowerPlaces()const
{
	return m_towerPlaces;
}

void GameGS::resetSelectedPlace()
{
	m_selectedPlace.reset( nullptr );
}

std::vector<Decoration*> GameGS::getDecorations( const std::string & name )
{
	std::vector<Decoration*> result;
	for( auto object : m_objects->getChildren() )
	{
		if( object->getName() == name )
		{
			auto decor = dynamic_cast<Decoration*>(object);
			if( decor )
				result.push_back( decor );
		}
	}
	return result;
}

void GameGS::createDecorFromXmlNode( const pugi::xml_node & xmlnode, Decoration::Pointer & outNode )
{
	std::string name = xmlnode.name();
	std::string actiondesc = xmlnode.attribute( "action" ).as_string();
	float x = xmlnode.attribute( "x" ).as_float();
	float y = xmlnode.attribute( "y" ).as_float();
	//float z = xmlnode.attribute( "z" ).as_float();

	std::string pathToXml = "ini/maps/animations/" + name + ".xml";
	pugi::xml_document doc;
	doc.load_file( pathToXml.c_str() );
	auto root = doc.root().first_child();

	auto decoration = Decoration::create();
	if( decoration )
	{
		xmlLoader::load( decoration, root );
		decoration->setName( xmlnode.name() );
		decoration->setPosition( x, y );
		decoration->setStartPosition( Point( x, y ) );
		//decoration->setLocalZOrder( z == 0 ? -y : z );
		decoration->setActionDescription( actiondesc );

		if( actiondesc.size() > 0 )
		{
			auto action = xmlLoader::load_action( actiondesc );
			decoration->setAction( action );
		}
	}
	outNode.reset( decoration );
}

Node* GameGS::createTree( int index )
{
	////std::string texture = "images/objects/tree" + intToStr(index) +".png";
	//
	//Node * tree( nullptr );
	//tree = Node::create();
	//tree->setPosition( 200, 200 );
	//
	//int count = rand() % 2 + 3;
	//for( int i = 0; i < count; ++i )
	//{
	//	Sprite * s = ImageManager::sprite( kPlistCreep + "tree" + intToStr( index ) + ".png" );
	//	float x = (rand() % 41 - 20);
	//	float y = (rand() % 41 - 20);
	//	s->setPosition( Point( x, y ) );
	//	tree->addChild( s );
	//
	//	float amplitude = 7;
	//	float duration = CCRANDOM_MINUS1_1() * (amplitude / 2) + amplitude;
	//	x = rand() % int( amplitude ) - amplitude / 2;
	//	y = rand() % int( amplitude ) - amplitude / 2;
	//	FiniteTimeAction * m0 = MoveBy::create( duration, Point( x, y ) );
	//	FiniteTimeAction * m1 = MoveBy::create( duration, Point( -x, -y ) );
	//	s->runAction( RepeatForever::create( Sequence::create( m0, m1, nullptr ) ) );
	//}
	//
	//return tree;
	assert( 0 );
	return nullptr;

}

void GameGS::onTouchesBegan( const std::vector<Touch*>& touches, Event *event )
{
	if( !m_enabled )
		return;

	for( auto i : touches )
	{
		Touch * touch = dynamic_cast<Touch*>(i);

		auto location = touch->getLocation();
		location = m_mainlayer->convertToNodeSpace( location );

		Node * node = getObjectInLocation( location );
		if( node == nullptr )
		{
			int index = getTowerPlaceIndex( location );
			node = (index != -1) ? m_towerPlaces[index] : TowerPlace::Pointer( nullptr );
		}

		if( node )
		{
			touchInfo ti( node, touch );
			m_touches[touch->getID()] = ti;
		}
		//else
		{
			_scrollInfo->node = m_mainlayer;
			_scrollInfo->nodeposBegan = m_mainlayer->getPosition();
			_scrollInfo->touchBegan = touch->getLocation();
			_scrollInfo->touchID = touch->getID();
		}
	}
}

void GameGS::onTouchesMoved( const std::vector<Touch*>& touches, Event *event )
{
	if( !m_enabled )
		return;

#if PC != 1
	for( auto i : touches )
	{
		if( _scrollInfo->touchID == i->getID() )
		{
			//assert( _scrollInfo->node );
			if( _scrollInfo->node )
			{
				Point location = i->getLocation();
				Point shift = location - _scrollInfo->touchBegan;
				Point pos = _scrollInfo->nodeposBegan + shift;

				pos = _scrollInfo->fitPosition( pos, Director::getInstance()->getWinSize() );

				_scrollInfo->lastShift = pos - _scrollInfo->node->getPosition();
				_scrollInfo->node->setPosition( pos );
			}
		}
	}
#endif
}

void GameGS::onTouchesEnded( const std::vector<Touch*>& touches, Event *event )
{
	_isIntteruptHeroMoving = false;
	if( !m_enabled )
		return;
	for( auto i : touches )
	{
		if( _scrollInfo->touchID == i->getID() )
		{
			if( _scrollInfo->node )
			{
				_scrollInfo->node.reset( nullptr );
				_scrollInfo->touchID = -1;
			}
		}

		Touch * touchEnd = i;
		touchInfo & touchBegin = m_touches[touchEnd->getID()];
		Point location = m_mainlayer->convertToNodeSpace( touchEnd->getLocation() );
		Point startLocation = m_mainlayer->convertToNodeSpace( touchEnd->getStartLocation() );

		Unit * node = getObjectInLocation( location );
		if( location.getDistance( startLocation ) < 50 )
		{
			unsigned indexTowerPlace = getTowerPlaceIndex( location );
			if( indexTowerPlace != -1 && touchBegin.nodeBegin.ptr() == m_towerPlaces[indexTowerPlace] )
			{
				_isIntteruptHeroMoving = true;
				onClickByTowerPlace( m_towerPlaces[indexTowerPlace] );
			}
			else if( node && node == touchBegin.nodeBegin )
			{
				_isIntteruptHeroMoving = true;
				onClickByObject( node );
			}
			else
			{
				m_menuTower->disappearance();
				onEmptyTouch( touchEnd->getLocation() );
			}
			m_menuDig->disappearance();
			markTowerPlaceOnLocation( location );
		}
		if( node == nullptr )
		{
			_selectedUnit.reset( nullptr );
		}
		m_touches.erase( m_touches.find( touchEnd->getID() ) );

	}
}

void GameGS::onTouchesCancelled( const std::vector<Touch*>&touches, Event *event )
{
	onTouchesEnded( touches, event );
}

bool GameGS::onTouchSkillBegan( Touch* touch, Event *event )
{
	return true;
}

void GameGS::onTouchSkillEnded( Touch* touch, Event *event, Skill skill )
{
	
	auto location = touch->getLocation();
	location = m_mainlayer->convertToNodeSpace( location );
	bool dispatched( false );

	switch( skill )
	{
		case Skill::desant:
		{
			if( m_board.createDesant( "desant", location, m_board.getSkillParams().lifetimeDesant ) )
			{
				m_interfaceMenu.desant->run();
				dispatched = true;
				TutorialManager::shared().dispatch( "usedesant" );
			}
			break;
		}
		case Skill::bomb:
		{
			auto bomb = m_board.createBomb( location );
			if( bomb )
			{
				m_interfaceMenu.bomb->run();
				dispatched = true;
				TutorialManager::shared().dispatch( "useairbomb" );
			}
			break;
		}
		case Skill::heroskill:
		{
			std::vector<unsigned> skills;
			HeroExp::shared().skills( m_board.getHero()->getName(), skills );
			unsigned level = skills[4];

			std::string skill = m_board.getHero() ? m_board.getHero()->getSkill() : "";
			if( skill == "landmine" )
			{
				float count = m_board.getSkillParams().landmineLevels[level].count;
				auto landmine = m_board.createLandMine( location, count );
				if( landmine )
				{
					dispatched = true;
					TutorialManager::shared().dispatch( "uselandmine" );
				}
			}
			else if( skill == "swat" || skill== "hero3_bot" )
			{
				int count( 1 );
				float lifetime( 0 );
				std::string unitName;
				if( skill == "swat" )
				{
					count = m_board.getSkillParams().swatCount;
					lifetime = m_board.getSkillParams().swatLifetime;
					lifetime *= m_board.getSkillParams().swatLevels[level].rateLifetime;
					unitName = skill;
				}
				else
				{
					count = m_board.getSkillParams().hero3BotCount;
					lifetime = m_board.getSkillParams().hero3BotLifetime;
					lifetime *= m_board.getSkillParams().hero3BotLevels[level].rateLifetime;
					unitName = skill;
				}

				std::vector<cocos2d::Point> points;
				computePointsByRadius( points, 15, count );
				for( auto point : points )
				{
					auto unit = m_board.createDesant( unitName, location + point, lifetime );
					if ( !unit )
						m_board.createDesant( unitName, location, lifetime );
					if( unit )
					{
						dispatched = true;
					}
				}
				if( dispatched )
					TutorialManager::shared().dispatch( "use" + skill );
			}

			if( dispatched )
				m_interfaceMenu.heroSkill->run();
			break;
		}
	}

	if( dispatched )
	{
		_selectedSkill.reset( nullptr );
		setTouchNormal();
	}
	else
	{
		onForbiddenTouch( touch->getLocation( ) );
	}
}

void GameGS::onTouchSkillCanceled( Touch* touch, Event *event )
{
	setTouchNormal();
}

bool GameGS::onTouchHeroBegan( Touch* touch, Event *event )
{

	std::vector<Touch*> touches;
	touches.push_back( touch );
	onTouchesBegan( touches, event );
	return true;
}

void GameGS::onTouchHeroMoved( Touch* touch, Event *event )
{
	std::vector<Touch*> touches;
	touches.push_back( touch );
	onTouchesMoved( touches, event );
}

void GameGS::onTouchHeroEnded( Touch* touch, Event *event )
{
	

	std::vector<Touch*> touches;
	touches.push_back( touch );
	onTouchesEnded( touches, event );
	
	//check click on tower or tower place
	if (_isIntteruptHeroMoving)
		return;


	auto location = touch->getLocation();
	if( location.getDistance( touch->getStartLocation() ) > 100 )
		return;

	location = m_mainlayer->convertToNodeSpace( location );

	if( m_board.getHero()->moveTo( location ) )
	{		
		//m_interfaceMenu.hero->showCancel( false );
		//setTouchNormal();
	}
}

void GameGS::onTouchHeroCanceled( Touch* touch, Event *event )
{
	setTouchNormal();
}


void GameGS::onKeyReleased( EventKeyboard::KeyCode keyCode, Event* event )
{
	if( keyCode == EventKeyboard::KeyCode::KEY_BACK )
		menuPause( nullptr );
	if( isTestDevice() && isTestModeActive() )
	{
		if( keyCode == EventKeyboard::KeyCode::KEY_0 )  Director::getInstance()->setTimeRate( 0 );
		if( keyCode == EventKeyboard::KeyCode::KEY_1 )  Director::getInstance()->setTimeRate( 1 );
		if( keyCode == EventKeyboard::KeyCode::KEY_2 )  Director::getInstance()->setTimeRate( 2 );
		if( keyCode == EventKeyboard::KeyCode::KEY_3 )  Director::getInstance()->setTimeRate( 3 );
		if( keyCode == EventKeyboard::KeyCode::KEY_4 )  Director::getInstance()->setTimeRate( 4 );
		if( keyCode == EventKeyboard::KeyCode::KEY_5 )  Director::getInstance()->setTimeRate( 5 );
		if( keyCode == EventKeyboard::KeyCode::KEY_6 )  Director::getInstance()->setTimeRate( 6 );
		if( keyCode == EventKeyboard::KeyCode::KEY_7 )  Director::getInstance()->setTimeRate( 7 );
		if( keyCode == EventKeyboard::KeyCode::KEY_8 )  Director::getInstance()->setTimeRate( 8 );
		if( keyCode == EventKeyboard::KeyCode::KEY_9 )  Director::getInstance()->setTimeRate( 9 );
		if( keyCode == EventKeyboard::KeyCode::KEY_F9 ) Director::getInstance()->setTimeRate( 99 );
		if( keyCode == EventKeyboard::KeyCode::KEY_F1 ) m_board.onFinishGame();
	}
}

void GameGS::onClickByObject( Unit::Pointer unit )
{
	if( unit->getType() == UnitType::tower )
	{
		bool showMenu = strToBool( unit->getParamCollection().get( "showmenu", "yes" ) );

		if( showMenu && unit != _selectedUnit )
		{
			m_menuTower->setUnit( unit );

			Point point = unit->getPosition();
			m_menuTower->setPosition( point );
			m_menuTower->appearance();
			_selectedUnit.reset( unit );
		}
		else
		{
			if( _selectedUnit )
			{
				_selectedUnit->runEvent( "ondeselect" );
			}
			m_menuTower->disappearance();
			_selectedUnit.reset( nullptr );
		}

		if( _touchListenerHero->isEnabled() )
			setTouchNormal();
	}
	else if( unit->getType() == UnitType::hero )
	{
		if( unit->current_state().get_name() != Unit::State::state_death )
			setTouchHero();
	}
}

void GameGS::onClickByTowerPlace( TowerPlace::Pointer place )
{
	//m_interfaceMenu.hero->setEnabled(false);

	AudioEngine::shared().playEffect( kSoundGameTowerPlaceSelect );

	std::string event = "level" + intToStr( m_board.getCurrentLevelIndex() ) + "_selectplace";
	TutorialManager::shared().dispatch( event );
	
	if( _touchListenerHero->isEnabled() )
		setTouchNormal();
}

void GameGS::markTowerPlaceOnLocation( const Point& position )
{
	auto hist = m_selectedPlace;
	m_selectedPlace = nullptr;

	auto index = getTowerPlaceIndex( position );
	if( index != -1 )
	{
		m_selectedPlace = m_towerPlaces[index];
	}

	if( (!m_selectedPlace && hist != m_selectedPlace) || (hist == m_selectedPlace) )
	{
		m_menuCreateTower->disappearance();
		m_selectedPlace = nullptr;
	}

	if( hist )
		hist->unselected();
	if( m_selectedPlace )
		m_selectedPlace->selected();

	if( m_selectedPlace /*&& hist != m_selectedPlace*/ )
	{
		m_menuTower->disappearance();
		m_menuDig->disappearance();
		if( m_selectedPlace )
		{
			if( m_selectedPlace->getActive() )
			{
				if( !m_box->isItemSelected() )
				{
					m_menuCreateTower->appearance();
					m_menuCreateTower->setClickPoint( m_selectedPlace->getPosition() );
				}
			}
			else
			{
				m_menuDig->appearance();
				m_menuDig->setClickPoint( m_selectedPlace->getPosition() );
				//m_selectedPlace = nullptr;
			}
		}
	}

	//	m_menuCreateTower->setActived( m_selectedPlace != nullptr );
}

void GameGS::onEmptyTouch( const Point & touchlocation )
{
	auto sprite = ImageManager::sprite( k::resourceGameSceneFolder + "empty_touch.png" );
	if( sprite )
	{
		addChild( sprite, 9 );
		sprite->setPosition( touchlocation );
		sprite->setScale( 0 );
		static float duration( 0.5f );
		sprite->runAction( Sequence::createWithTwoActions(
			ScaleTo::create( duration, 1 ),
			CallFunc::create( std::bind( &Node::removeFromParent, sprite ) )
			) );
		sprite->runAction( FadeTo::create( duration, 128 ) );
	}
}

void GameGS::onForbiddenTouch( const Point & touchlocation )
{
	auto sprite = ImageManager::sprite( k::resourceGameSceneFolder + "icon_x.png" );
	if( sprite )
	{
		addChild( sprite, 9 );
		sprite->setPosition( touchlocation );
		sprite->setScale( 0 );
		static float duration( 0.5f );
		sprite->runAction( Sequence::createWithTwoActions(
			EaseBounceOut::create( ScaleTo::create( duration, 1 ) ),
			CallFunc::create( std::bind( &Node::removeFromParent, sprite ) )
			) );
		sprite->runAction( FadeTo::create( duration, 128 ) );
	}
}

void GameGS::onCreateUnit( Unit*unit )
{
	UnitType type = unit->getType();
	switch( type )
	{
		case UnitType::tower:
		{
			std::string event = "level" + intToStr( m_board.getCurrentLevelIndex() ) + "_buildtower";
			TutorialManager::shared().dispatch( event );
			break;
		}
		case UnitType::creep:
		{
			bool isExist = FileUtils::getInstance()->isFileExist( "ini/tutorial/units/" + unit->getName() + ".xml" );
			if( isExist )
			{
				std::string key = "showunitinfo_" + unit->getName();
				bool showed = UserData::shared().get_bool( key );
				if( !showed )
				{
					auto info = UnitInfo::create( unit->getName() );
					if( info )
					{
						UserData::shared().write( key, true );
						m_interface->addChild( info );
					}
				}
			}
			break;
		}
		case UnitType::hero:
		{
			createHeroMenu();
			break;
		}

		default:
			break;
	}
}

void GameGS::onDeathUnit( Unit*unit )
{
	UnitType type = unit->getType();
	switch( type )
	{
		case UnitType::tower:
			break;
		case UnitType::creep:
			break;
		case UnitType::hero:
			m_interfaceMenu.heroSkill->stop();
			m_interfaceMenu.hero->showCancel( false );
			if( _touchListenerHero->isEnabled() )
				setTouchNormal();
			break;
		default:
			break;
	}
}

void GameGS::onDeathCanceled( Unit*unit )
{
	UnitType type = unit->getType();
	switch( type )
	{
		case UnitType::tower:
			break;
		case UnitType::creep:
			break;
		case UnitType::hero:
			m_interfaceMenu.heroSkill->run();
			break;
		default:
			break;
	}
}

void GameGS::onStartWave( const WaveInfo & wave )
{
	std::string event = "level" + intToStr(m_board.getCurrentLevelIndex()) + "_startwave" + intToStr(wave.index);
	TutorialManager::shared().dispatch( event );
}

void GameGS::markPriorityTarget()
{
	//	Node * target = m_board.getPriorityTarget();
	//	if ( target )
	//	{
	//		Sprite * marker = ImageManager::sprite( kPlistCreep + "target.png" );
	//		if ( marker )
	//		{
	//			marker->setTag(kTagTargetMarker);
	//			target->addChild(marker);
	//			Vector<FiniteTimeAction*> arr;
	//			arr.pushBack( ScaleTo::create(0.2f, 0.7f) );
	//			arr.pushBack( ScaleTo::create(0.2f, 1.0f) );
	//			arr.pushBack( RotateBy::create(0.1f, 35) );
	//
	//			marker->runAction( RepeatForever::create( Sequence::create( arr ) ) );
	//		}
	//	}
}

void GameGS::unmarkPriorityTarget()
{
	//	Node * target = m_board.getPriorityTarget();
	//	if ( target )
	//	{
	//		target->removeChildByTag(kTagTargetMarker);
	//	}
}

void GameGS::onWaveFinished()
{
	for( auto icon : _waveIcons )
	{
		icon->setActive( true );
	}

}

void GameGS::onFinishGame( FinishLevelParams* params )
{
	auto call = CallFunc::create( [this, params](){this->openStatisticWindow( params ); } );
	auto delay = DelayTime::create( 1 );
	runAction( Sequence::createWithTwoActions( delay, call ) );

	bool success = params->livecurrent > 0;
	m_menuCreateTower->disappearance();
	m_menuTower->disappearance();
	m_menuDig->disappearance();
	setTouchDisabled();
	menuFastModeEnabled( false );
	m_interfaceMenu.menu->setEnabled( false );
	AudioEngine::shared().playEffect( success ? kSoundGameFinishSuccess : kSoundGameFinishFailed );

	UserData::shared().write(
		k::user::LastGameResult,
		success ? k::user::GameResultValueWin : k::user::GameResultValueFail );
	
	if( success )
	{
		int wincounter = UserData::shared().get_int(k::user::GameWinCounter);
		++wincounter;
		UserData::shared().write(k::user::GameWinCounter, wincounter);
	}
}

void GameGS::buyLevelsMoney( int count )
{
	_boughtScoresForSession += count;
}

void GameGS::shake(float value)
{
	const float x = 2.0f * value;
	const float t = 0.05f * value;

	Vector<FiniteTimeAction*> actions;
	actions.pushBack( MoveBy::create( t, Point( 0, +1 * x ) ) );
	actions.pushBack( MoveBy::create( t, Point( 0, -2 * x ) ) );
	actions.pushBack( MoveBy::create( t, Point( 0, +1 * x ) ) );
	actions.pushBack( MoveBy::create( t, Point( -0.5*x, 0 ) ) );
	actions.pushBack( MoveBy::create( t, Point( 1 * x, 0 ) ) );
	actions.pushBack( MoveBy::create( t, Point( -0.5*x, 0 ) ) );
	actions.pushBack( MoveBy::create( t, Point( 0, 2 * x ) ) );
	actions.pushBack( MoveBy::create( t, Point( 0, -4 * x ) ) );
	actions.pushBack( MoveBy::create( t, Point( 0, 2 * x ) ) );
	actions.pushBack( MoveBy::create( t, Point( -0.75*x, 0 ) ) );
	actions.pushBack( MoveBy::create( t, Point( 1.5*x, 0 ) ) );
	actions.pushBack( MoveBy::create( t, Point( -0.75*x, 0 ) ) );
	actions.pushBack( MoveBy::create( t, Point( 0, -2 * x ) ) );
	actions.pushBack( MoveBy::create( t, Point( 0, 4 * x ) ) );
	actions.pushBack( MoveBy::create( t, Point( 0, -2 * x ) ) );
	runAction( Sequence::create( actions ) );
}

void GameGS::openStatisticWindow( FinishLevelParams* params )
{
	assert( getChildByName( "win" ) == nullptr );

	unschedule( schedule_selector( GameGS::update ) );
//	AdMob::show();

	bool win = params->livecurrent > 0;
	int level = m_board.getCurrentLevelIndex();
	int stars = params->stars;
	int award = LevelParams::shared().getAwardGold( level, stars, m_board.getGameMode() == GameMode::hard );

	auto window = VictoryMenu::create( win, award, stars );
	addChild( window, 99999 );

	bool showad = UserData::shared().get_int( k::user::UnShowAd ) == 0;
	if( showad && k::configuration::useAds )
	{
		auto showAd = []()
		{
			AdsPlugin::shared().showInterstitialBanner();
		};
		auto delay = DelayTime::create( 1 );
		auto call = CallFunc::create( std::bind( showAd ) );
		auto action = Sequence::createWithTwoActions( delay, call );
		runAction( action );
	}

	std::string music = win ? kMusicVictory : kMusicDefeat;
	AudioEngine::shared().stopMusic();
	AudioEngine::shared().playEffect( music );

}

void GameGS::flyCameraAboveMap( const Point & wave )
{
	auto computePointFinish = [this]( const Point & wavebegan )
	{
		auto dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
		auto mapsize = m_bg->getContentSize();
		mapsize.width *= this->m_mainlayer->getScaleX();
		mapsize.height *= this->m_mainlayer->getScaleY();
		Point wave = wavebegan;
		wave.x /= this->m_mainlayer->getScaleX();
		wave.y /= this->m_mainlayer->getScaleY();
		Point res;
		if( wave.y > dessize.height / 2 )
		{
			res.x = 0;
			res.y = dessize.height - mapsize.height;
		}
		else
		{
			res = Point( 0, 0 );
		}
		return res;
	};
	auto computePointStart = [this]( const Point & finish )
	{
		auto dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
		auto mapsize = m_bg->getContentSize();
		mapsize.width *= this->m_mainlayer->getScaleX();
		mapsize.height *= this->m_mainlayer->getScaleY();
		Point res;

		if( finish.y < 0 )
		{
			res = Point( 0, 0 );
		}
		else
		{
			res.x = 0;
			res.y = dessize.height - mapsize.height;
		}

		return res;
	};
	auto createAction = [this]( const Point & start, const Point & end )
	{
		this->m_mainlayer->setPosition( start );

		auto predelay = DelayTime::create( 1.f );
		auto move2 = EaseInOut::create( MoveTo::create( 1.5f, end ), 2 );
		auto call = CallFunc::create( [this]()
		{
			this->setTouchNormal(); 
			this->m_interfaceMenu.menu->setEnabled( true );
			this->m_interfaceMenu.desant->run( );
			this->m_interfaceMenu.bomb->run( );
			this->m_interfaceMenu.heroSkill->run();
		} );

		return Sequence::create( predelay, move2, call, nullptr );
	};

	Point finish = computePointFinish( wave );
	Point start = computePointStart( finish );
	this->m_mainlayer->runAction( createAction( start, finish ) );
}

void GameGS::createExplosion( const Point& position )
{
	//int indexes[3][2] = {
	//	{0, 19,},
	//	{0, 19,},
	//	{0, 9,},
	//};
	//float durations[3] = { 0.5f, 0.5f, 0.5f, };
	//int index = rand() % 3;
	//std::string prefix = kPlistExplosions + intToStr(index + 1) + "_";
	//int index_f =  indexes[index][0];
	//int index_l =  indexes[index][1];
	//
	//Animation * animation = createAnimation( prefix, index_f, index_l, ".png", durations[index]);
	//if( !animation )
	//	return;
	//
	//Sprite * sprite = ImageManager::sprite();
	//sprite->setPosition(position);
	//sprite->setOpacity(128);
	//
	//auto action = Sequence::create(
	//	Animate::create(animation),
	//	CallFunc::create( std::bind(&Node::removeFromParent, sprite) ),
	//	nullptr);
	//sprite->runAction( action );
	//addObject( sprite, zorder::creep_sky);

}

void GameGS::createExplosionWave( const Point& position )
{
	//	auto resetGrid = []( Point pos, NodeGrid * grid )
	//	{
	//		Grid3D * g = dynamic_cast<Grid3D *>(grid->getGrid());
	//		assert( g );
	//		Grid3D * ng = Grid3D::create(g->getGridSize());
	//		grid->setGrid(ng);
	//		ng->setActive(true);
	//		
	//	};
	//	auto effect = Ripple3D::create(0.5f, Size(32, 32), position, 100, 1, 100);
	//	auto reset = CallFunc::create( std::bind( resetGrid, position, m_mainlayer ) );
	//	m_mainlayer->runAction( Sequence::createWithTwoActions(effect,reset) );
}

void GameGS::createFragments( const Point& position )
{
	//float minDistance(50);
	//float maxDistance(200);
	//float duration(0.9f);
	//Fragment * fragment = Fragment::create( position, 10, duration, minDistance, maxDistance, 5 );
	//m_fragments.push_back( fragment );
	//if( m_fragments.size() > 20 )
	//{
	//	auto removed = m_fragments.front();
	//	
	//	m_bg->begin();
	//	removed->visit();
	//	m_bg->end();
	//
	//	m_fragments.pop_front();
	//	removeObject( removed );
	//}
	//
	//addObject( fragment, 0 );
}

void GameGS::createExplosionSpot( const Point& position )
{
	//int index = rand() % 3;
	//std::string framename = kPlistExplosions + "spot" + intToStr(index) + ".png";
	//auto sprite = ImageManager::spriteWithSpriteFrame( ImageManager::shared().spriteFrame(framename) );
	//
	//sprite->setOpacity(64);
	//sprite->setPosition( position );
	//sprite->setPositionX( sprite->getPositionX() + CCRANDOM_MINUS1_1() * 10 );
	//sprite->setPositionY( sprite->getPositionY() + CCRANDOM_MINUS1_1() * 10 );
	//
	//m_bg->begin();
	//sprite->visit();
	//m_bg->end();	
}

void GameGS::createEffect( Unit*base, Unit*target, const std::string & effect )
{
	auto effects = ShootsEffectsCreate( base, target, effect );
	for( auto& effect : effects )
	{
		int z = effect->getLocalZOrder();
		addObject( effect, 0 );
		if( z != 0 )
			effect->setLocalZOrder( z );
	}
}

/*
void GameGS::createMeat(const Point& position)
{
//if( rand() % 3 != 0 )
//	return;
//Sprite * sprite = ImageManager::sprite("images/explosions/bang_0.png");
//sprite->setColor( Color3B(255, 50, 0) );
//sprite->setOpacity(92);
//sprite->setPosition(position);
//sprite->setScaleX( 0 );
//sprite->setScaleY( 0 );
//
//auto action = Sequence::create(
//	EaseBackOut::create( ScaleTo::create(0.2f, 1) ),
//	DelayTime::create(0.3f),
//	CallFunc::create( std::bind(&Node::removeFromParent, sprite) ),
//	nullptr);
//sprite->runAction( action );
//
//addObject(sprite, zorder::creep_sky);
}
*/
void GameGS::createCloud( const Point& position )
{
	//
	//if( rand() % 2 != 0 )
	//	return;
	//
	//Sprite * sprite = ImageManager::sprite( kPlistExplosions + "cloud_" + intToStr(rand()%2) + ".png");
	//sprite->setOpacity(0);
	//sprite->setPosition(position);
	//sprite->setScaleX( 0 );
	//sprite->setScaleY( 0 );
	//sprite->setOpacity(128);
	//
	//float duration(0.2f);
	//auto actionScale = Sequence::create(
	//	EaseBackOut::create( ScaleTo::create(duration, 1) ),
	//	DelayTime::create(0.3f),
	//	ScaleTo::create(duration, 5),
	//	CallFunc::create( std::bind(&Node::removeFromParent, sprite) ),
	//	nullptr);
	//auto actionFade = Sequence::create(
	//	FadeTo::create(duration, 64),
	//	DelayTime::create(0.3f),
	//	FadeTo::create(duration, 0),
	//	nullptr);
	//
	//sprite->runAction( actionScale );
	//sprite->runAction( actionFade );
	//
	//addObject(sprite, zorder::creep_sky);
	// 
}

void GameGS::createRoutesMarkers( const Route & route, UnitLayer type )
{
	//if( route.empty() )
	//	return;
	//std::string icon = type == UnitLayer::earth ? kPathIconRouteMarkerYellow : kPathIconRouteMarkerBlue;
	//
	//std::vector<Point> points;
	//float D = 50;
	//float sL = 0;
	//float sR = D - sL;
	//Point curr = route.front();
	//
	//for( unsigned i = 0; i < route.size() - 1; ++i )
	//{
	//	Point r = route[i + 1] - route[i];
	//	Point n = r.getNormalized();
	//	float L = r.getLength();
	//
	//	if( L < sR )
	//	{
	//		sL += L;
	//		sR = D - sL;
	//		curr = curr + n * sL;
	//	}
	//	else
	//	{
	//		while( L > sR )
	//		{
	//			sL = sR;
	//			sR = D - sL;
	//			curr = curr + n * sL;
	//			points.push_back( curr );
	//			L -= sL;
	//			sL = 0;
	//			sR = D - sL;
	//		}
	//		sL = L;
	//		sR = D - sL;
	//		curr = curr + n * sL;
	//	}
	//}
	//
	//float predelay( 0 );
	//float step = 4.0f / points.size();
	//
	//for( auto point : points )
	//{
	//	auto marker = ImageManager::sprite( icon );
	//	marker->setPosition( point );
	//	marker->setScale( 0 );
	//	addObject( marker, zorder::sky );
	//
	//	Vector<FiniteTimeAction*> actions;
	//	float timein = 0.4f;
	//	float timeout = 0.4f;
	//	float delay = 0.2f;
	//	actions.pushBack( DelayTime::create( predelay += step ) );
	//	actions.pushBack( EaseBackOut::create( ScaleTo::create( timein, 1 ) ) );
	//	actions.pushBack( DelayTime::create( delay ) );
	//	actions.pushBack( EaseBackIn::create( ScaleTo::create( timeout, 0 ) ) );
	//	actions.pushBack( CallFunc::create( std::bind( &Node::removeFromParent, marker ) ) );
	//	marker->runAction( Sequence::create( actions ) );
	//}
}

void GameGS::createIconForWave( const Route & route, const WaveInfo & wave, UnitLayer type, const std::list<std::string> & icons, float delay )
{
	Point start = route.front();
	auto callback = std::bind( &GameGS::startWave, this,
		std::placeholders::_1,
		std::placeholders::_2,
		std::placeholders::_3
		);

	auto icon = WaveIcon::create( start, delay, m_dalayWaveIcon, callback, type );
	icon->setName( "waveicon" );
	_waveIcons.push_back( icon );
	m_interface->addChild( icon, zOrderInterfaceWaveIcon );
	if( _runFlyCamera )
	{
		_runFlyCamera = false;
		flyCameraAboveMap( route.front() );

		//run tutorial
		int index = this->m_board.getCurrentLevelIndex( );
		if (!(index == 1 && !k::configuration::useInapps)) {
			std::string event = "level" + intToStr(index) + "_enter";
			TutorialManager::shared().dispatch(event);
		}
	}

	std::string event = "level" + intToStr( m_board.getCurrentLevelIndex() ) + "_waveicon";
	TutorialManager::shared().dispatch( event );
}

void GameGS::removeIconsForWave()
{
	for( auto& icon : _waveIcons )
	{
		icon->removeFromParent();
	}
	_waveIcons.clear();
}

void GameGS::startWave( WaveIcon* icon, float elapsed, float duration )
{
	float percent( 0 );
	if( duration > 0.001f )
	{
		percent = elapsed / duration;
		percent = std::max( 0.f, percent );
		percent = std::min( 1.f, percent );
		percent = 1 - percent;
		float award = static_cast<float>(_scoresForStartWave)* percent;
		int score = static_cast<int>(award);
		if( score > 0 )
		{
			ScoreCounter::shared().addMoney( kScoreLevel, score, false );
			createAddMoneyNodeForWave( score, icon->getPosition() );
		}
	}

	WaveGenerator::shared().resume();
	removeIconsForWave();
	AudioEngine::shared().playMusic( kMusicGameBattle );

	std::string event = "level" + intToStr( m_board.getCurrentLevelIndex() ) + "_startwave";
	TutorialManager::shared().dispatch( event );
		
}

void GameGS::createAddMoneyNode( unsigned count, const Point & position )
{
	//Icon * icon = Icon::create( kPlistInterface + "money.png", "" );
	//icon->setIntegerValue( count );
	//addObject( icon, 9999 );
	//FiniteTimeAction * cb = CallFuncN::create( std::bind( &Node::removeFromParent, icon ) );
	//icon->setPosition( position );
	//icon->createAndRunDisappearanceEffect( 0.5f, cb );
	//
	//AudioEngine::shared().playEffect( kSoundGameMoneyAdd );
	//m_scoresNode->updateScores();
}

void GameGS::createAddMoneyNodeForWave( unsigned count, const Point & position )
{
	if( count > 0 )
	{
		xmlLoader::macros::set( "scores", intToStr( count ) );
		xmlLoader::macros::set( "position", pointToStr( position ) );
		auto node = xmlLoader::load_node( "ini/gamescene/gearforwave.xml" );
		xmlLoader::macros::erase( "scores" );
		xmlLoader::macros::erase( "position" );
		m_interface->addChild( node );
	}
}

void GameGS::createSubMoneyNode( unsigned count, const Point & position )
{}


void GameGS::createAddCrystalNode( unsigned count, const Point & position )
{
	//
	//auto icon = CartridgeIcon::create();
	//icon->setPosition( position );
	//icon->runOnce();
	//m_interface->addChild( icon );
	//
	//auto y0 = MoveBy::create( 0.15f + CCRANDOM_0_1() * 0.1f, Point( 0, 30 ) );
	//auto y1 = EaseBounceOut::create( MoveBy::create( 0.6f + CCRANDOM_0_1() * 0.2f, Point( 0, -40 ) ) );
	//auto Y = Sequence::create( y0, y1, nullptr );
	//
	//auto X = MoveBy::create( 0.75f + CCRANDOM_0_1() * 0.2f, Point( 60, 0 ) );
	//
	//auto delay = DelayTime::create( 3 + CCRANDOM_0_1() * 0.5f );
	//auto fade = MoveTo::create( 1, m_scoresNode->getPosition() );
	//auto remove = CallFunc::create( std::bind( &Node::removeFromParent, icon ) );
	//icon->runAction( Sequence::create( delay, fade, remove, nullptr ) );
	//icon->runAction( Y );
	//icon->runAction( X );
	//
	//AudioEngine::shared().playEffect( kSoundGameCrystalAdd );
	//
	//m_scoresNode->updateScores();

}

void GameGS::updateWaveCounter()
{
	m_scoresNode->updateWaves();
}

void GameGS::setOnEnterParam_needExit()
{}

void GameGS::menuFastModeEnabled( bool enabled )
{
#if (CC_TARGET_PLATFORM == CC_PLATFORM_MAC) || (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
	const float fast = 1.95f;
#else
	const float fast = 1.95f;
#endif
	//m_gameRate = enabled ? fast : 1.0f;

	//	std::string sound = enabled ? kSoundGameFastModeOn : kSoundGameFastModeOff;
	//	AudioEngine::shared().playEffect( sound );

	//Director::getInstance()->getScheduler()->setTimeScale( m_gameRate );

	if( m_interfaceMenu.rateFast ) m_interfaceMenu.rateFast->setVisible( !enabled );
	if( m_interfaceMenu.rateNormal ) m_interfaceMenu.rateNormal->setVisible( enabled );
}

void GameGS::menuRestart()
{
	//	closeStatisticWindow( false );
	//	int index = MapLayer::getInstace()->getCurrentLevel();
	//	MapLayer::getInstace()->fastStartGame( index );
	//	Director::getInstance()->popScene();

}

void runLayer( LayerPointer layer )
{
	int zthis = GameGS::getInstance()->getLocalZOrder();
	int zshadow = zthis + 1;
	int zlayer = zshadow + 1;

	if( layer )
	{
		GameGS::getInstance()->getScene()->addChild( layer, zlayer );
		GameGS::getInstance()->onExit();
	}
	auto shadow = ImageManager::sprite( kPathSpriteSquare );
	if( shadow )
	{
		auto dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
		shadow->setName( "shadow" );
		shadow->setScaleX( dessize.width );
		shadow->setScaleY( dessize.height );
		shadow->setColor( Color3B( 0, 0, 0 ) );
		shadow->setOpacity( 0 );
		shadow->setPosition( Point( dessize / 2 ) );
		GameGS::getInstance()->getScene()->addChild( shadow, zshadow );
		shadow->runAction( FadeTo::create( 0.2f, 204 ) );
	}
}

void GameGS::menuSkill( Ref * sender, Skill skill ) 
{
	//close box menu before using skills
	m_box->close();

	MenuItemCooldown * item = dynamic_cast<MenuItemCooldown*>(sender);
	
	if( _selectedSkill && item == _selectedSkill )
	{
		item->showCancel( false );
		setTouchNormal();
	}
	else if( item != _selectedSkill )
	{
		setTouchNormal();
		setTouchSkill( skill );
		item->showCancel( true );
		_selectedSkill = item;
	}

	TutorialManager::shared().dispatch( "clickskillbutton" );
}

void GameGS::resetSkillButtons()
{
	_selectedSkill = nullptr;
	m_interfaceMenu.bomb->showCancel(false);
	m_interfaceMenu.desant->showCancel(false);
	m_interfaceMenu.heroSkill->showCancel(false);
}

void GameGS::setTouchDisabled()
{
	_touchListenerDesant->setEnabled( false );
	_touchListenerBomb->setEnabled( false );
	_touchListenerNormal->setEnabled( false );
	_touchListenerHero->setEnabled( false );
	_touchListenerHeroSkill->setEnabled( false );
	_eventDispatcher->removeEventListener( _touchListenerDesant );
	_eventDispatcher->removeEventListener( _touchListenerBomb );
	_eventDispatcher->removeEventListener( _touchListenerNormal );
	_eventDispatcher->removeEventListener( _touchListenerHero );
	_eventDispatcher->removeEventListener( _touchListenerHeroSkill );
}

void GameGS::setTouchNormal()
{
	setTouchDisabled();
	_eventDispatcher->addEventListenerWithSceneGraphPriority( _touchListenerNormal, this );
	_touchListenerNormal->setEnabled( true );
	_skillModeActived = false;
	resetSkillButtons();

	m_interfaceMenu.hero->showCancel( false );
}

void GameGS::setTouchSkill( Skill skill )
{
	setTouchDisabled();
	switch( skill )
	{
		case Skill::desant:
			_eventDispatcher->addEventListenerWithSceneGraphPriority( _touchListenerDesant, this );
			_touchListenerDesant->setEnabled( true );
			break;
		case Skill::bomb:
			_eventDispatcher->addEventListenerWithSceneGraphPriority( _touchListenerBomb, this );
			_touchListenerBomb->setEnabled( true );
			break;
		case Skill::heroskill:
			_eventDispatcher->addEventListenerWithSceneGraphPriority( _touchListenerHeroSkill, this );
			_touchListenerHeroSkill->setEnabled( true );
			break;
	}
	_skillModeActived = true;
}

void GameGS::setTouchHero()
{
	setTouchDisabled();
	_eventDispatcher->addEventListenerWithSceneGraphPriority( _touchListenerHero, this );
	_touchListenerHero->setEnabled( true );
	resetSkillButtons();
	_skillModeActived = false;

	m_interfaceMenu.hero->showCancel( true );
}

void GameGS::menuPause( Ref * sender )
{
	AudioEngine::shared( ).pauseAllEffects( );
	SmartScene * scene = dynamic_cast<SmartScene*>(getScene( ));
	auto pause = GamePauseLayer::create( "ini/gamescene/pause.xml" );
	scene->pushLayer( pause, true );
	pause->setGlobalZOrder( 2 );
}

void GameGS::menuShop( Ref*sender, bool gears )
{
#if PC != 1
	auto shop = gears ?
		ShopLayer::create( false, false, true, true ) :
		ShopLayer::create( false, true, false, true );

	if( shop )
	{
		AudioEngine::shared( ).pauseAllEffects( );
		SmartScene * scene = dynamic_cast<SmartScene*>(getScene( ));
		scene->pushLayer( shop, true );
		shop->setGlobalZOrder( 2 );

		auto on_purchase = [this]( int type, int value )
		{
			this->buyLevelsMoney( value );
		};
		shop->observerOnPurchase().add( _ID, std::bind( on_purchase, std::placeholders::_1, std::placeholders::_2 ) );

		TutorialManager::shared().dispatch( "level_openshop" );
	}
#endif
}

void GameGS::menuHero( Ref*sender )
{
	if( _touchListenerHero->isEnabled() == false )
		setTouchHero();
	else
		setTouchNormal();
}

void GameGS::menuPauseOff()
{
	onEnter();

	auto scene = getScene();
	auto shadow = scene->getChildByName( "shadow" );
	if( shadow )
	{
		auto a0 = FadeTo::create( 0.2f, 0 );
		auto a1 = CallFunc::create( std::bind( &Node::removeFromParent, shadow ) );
		shadow->runAction( Sequence::createWithTwoActions( a0, a1 ) );
	}
}

void GameGS::addObject( Node * object, int zOrder )
{
	//if( zOrder == zorder::tree )
	//{
	//	static int tag = 123;
	//	Node * node = m_objects->getChildByTag( tag );
	//	if( node == nullptr )
	//	{
	//		node = Node::create();
	//		m_objects->addChild( node, zOrder, tag );
	//	}
	//	node->addChild( object, zOrder + zOrderOfArriavalCounter++ );
	//}
	//else
	{
		//		object->setGlobalZOrder( ++zOrderOfArriavalCounter );

		//		object->setGlobalZOrder( ++zOrderOfArriavalCounter );
	}
	m_objects->addChild( object, -object->getPositionY() );
}

void GameGS::removeObject( Node * object )
{
	if( m_objects )
		m_objects->removeChild( object );
}

void GameGS::update( float dt )
{
//#ifdef _DEBUG
//	dt = std::min<float>(dt, 1.f / 20);
//#endif
	//dt *= m_gameRate;
	m_board.update( dt );

#if PC == 1
	MouseHoverScroll::shared().update( dt );
#endif
}

Unit * GameGS::getObjectInLocation( const Point & location )
{
	Vector<Node*> objects = m_objects->getChildren();

	float distance( 2048 * 2048 );
	Unit * result( NULL );
	for( int i = 0; i < objects.size(); ++i )
	{
		Unit * object = dynamic_cast<Unit*>(objects.at( i ));
		if( !object )
			continue;
		float d = object->getPosition().getDistance( location );
		if( d < 50 && d < distance )
		{
			result = object;
			distance = d;
		}
	}
	return result;
}

void GameGS::achievementsObtained( const std::string & nameachiv )
{
	return;
}

void GameGS::achievementsWindowClose( Ref * ref )
{
	auto scene = Director::getInstance()->getRunningScene();
	auto node = scene->getChildByTag( 1 );

	auto a1 = EaseBackIn::create( ScaleTo::create( 0.5f, 0 ) );
	auto a2 = CallFunc::create( std::bind( &Director::popScene, Director::getInstance() ) );
	node->runAction( Sequence::create( a1, a2, nullptr ) );
}

/*
MenuSelect::MenuSelect()
{
bool result = init();
assert(result);
}

MenuSelect::~MenuSelect()
{
}

void MenuSelect::appearance()
{
setEnabled(false);
stopAllActions();

float delay(0.0f);
float duration(0.15f);
Vector<Node*> objects = getChildren();
for(auto object : objects)
{
Node * child = (Node*)object;
child->setScale(0, 0);
Animations::appearanceButtonNoSound( delay += 0.01f, duration, dynamic_cast<MenuItem*>(child) );
}

FiniteTimeAction * action0 = DelayTime::create(delay);
FiniteTimeAction * action1 = CallFunc::create( CC_CALLBACK_0(MenuSelect::afterAppearance, this) );
runAction( Sequence::create(action0, action1, nullptr) );
}

void MenuSelect::disappearance()
{
if ( !getParent() )
return;
setEnabled(false);
stopAllActions();

float duration(0.1f);
FiniteTimeAction * action0 = EaseBackIn::create( ScaleTo::create(duration, 0.1f) );
FiniteTimeAction * action1 =  CallFunc::create( CC_CALLBACK_0(MenuSelect::afterDisappearance, this) );
Action * action = Sequence::create(action0, action1, nullptr);

Vector<Node*> objects = getChildren();
for(auto object : objects)
{
Node * child = (Node*)object;
child->runAction( action->clone() );
}
}

void MenuSelect::afterAppearance()
{
setEnabled(true);
}

void MenuSelect::afterDisappearance()
{
GameGS::getInstance()->setEnabled(true);
setEnabled(false);
removeFromParent();
}
*/

/*
MenuCreateTower::MenuCreateTower( )
: m_towerButtons()
, m_towerLabels()
, m_itemPositions()
, m_itemNames()
, m_clickPoint()
, m_excludedTowers()
, m_isActived(false)
{
setName( "MenuCreateTower" );
auto desSize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();

float XL = desSize.width - 342 + 100;
float XR = desSize.width - 100;
float Y0 = 60 + 167*3;
float Y1 = 60 + 167*2;
float Y2 = 60 + 167*1;
m_itemPositions.resize(6);

m_itemPositions[0] = Point(XL, Y0);
m_itemPositions[1] = Point(XR, Y0);
m_itemPositions[2] = Point(XL, Y1);
m_itemPositions[3] = Point(XR, Y1);
m_itemPositions[4] = Point(XL, Y2);
m_itemPositions[5] = Point(XR, Y2);
if( iPad )
{
float x = 80;
float y = 80;
float w = 150;
m_itemPositions[0] = Point( x + w * 0, y );
m_itemPositions[1] = Point( x + w * 1, y );
m_itemPositions[2] = Point( x + w * 2, y );
m_itemPositions[3] = Point( x + w * 3, y );
m_itemPositions[4] = Point( x + w * 4, y );
m_itemPositions[5] = Point( x + w * 5, y );
}

m_itemNames.resize(m_itemPositions.size());


std::vector<std::string> towers;
towers.push_back( kTowerNameAckAck );
towers.push_back( kTowerNameFlaregun );
towers.push_back( kTowerNameLaser );
towers.push_back( kTowerNameNitrogen );
towers.push_back( kTowerNameFiregun );
towers.push_back( kTowerNameTesla );

for( unsigned index = 0; index < towers.size(); ++index )
{
const std::string nametower = towers[ index ];
const std::string icon = kPlistInterface + nametower + kExt_png;
const std::string icon_un = kPlistInterface + nametower + kSuffixUn + kExt_png;

int tag = index;
auto buyOk = std::bind( &MenuCreateTower::selectCreate, this, nametower );
auto buyNo = std::bind( &MenuCreateTower::cancelBuy, this, std::placeholders::_1 );
m_towerButtons[nametower] = MenuItemImageWithText::create( icon, icon, kFontNumbers, "", buyOk);
m_towerButtons[nametower + kSuffixUn] =MenuItemImageWithText::create( icon_un, icon_un, kFontNumbers, "", buyNo );

m_towerButtons[nametower]->setPosition(m_itemPositions[ index ]);
m_towerButtons[nametower + kSuffixUn]->setPosition(m_itemPositions[ index ]);
m_itemNames[ index ] = nametower;
addChild(m_towerButtons[nametower], 0, tag );
addChild(m_towerButtons[nametower + kSuffixUn],	0, tag );

auto iconnormal = m_towerButtons[nametower];
auto iconun = m_towerButtons[nametower + kSuffixUn];
auto size = iconnormal->getNormalImage()->getContentSize();
auto position = Point(size.width / 2 + 4, 20);
unsigned cost = mlTowersInfo::shared().getCost(nametower, 1);
auto label = Label::create(intToStr(cost).c_str(), kFontNumbers.c_str());
auto label_un = Label::create(intToStr(cost).c_str(), kFontNumbers.c_str());
label->setPosition(position);
label->setOpacity( 255 );
label_un->setPosition(position);
label_un->setOpacity( 128 );
m_towerLabels[nametower] = label;
m_towerLabels[nametower + kSuffixUn] = label_un;
iconnormal->addChild(label);
iconun->addChild(label_un);
}

auto createInfoButton = []( const std::string & tower, MenuCreateTower * menu )
{
//auto ns = ImageManager::sprite(kPathButtonInfo);
//auto ss = ImageManager::sprite(kPathButtonInfo);
//ss->setScale(0.8f);
//ss->setPosition( 3, 3 );
auto item = MenuItemImageWithText::create( kPathButtonInfo, kPathButtonInfo, std::bind( &MenuCreateTower::showInfo, menu, std::placeholders::_1, tower ) );

return item;
};

int i(0);
for( auto tower : towers )
{
auto item = createInfoButton( tower, this );
item->setPosition( m_itemPositions[i++] + Point(50,50) );
m_towerButtonsInfo[tower] =item;
addChild( item, 1 );
}

schedule(schedule_selector(MenuCreateTower::update));
}

MenuCreateTower::~MenuCreateTower()
{
disappearance();
}

void MenuCreateTower::appearance()
{
//MenuSelect::appearance();

if( iPad )
{
std::vector<std::string> towers;
towers.push_back( kTowerNameAckAck );
towers.push_back( kTowerNameFlaregun );
towers.push_back( kTowerNameLaser );
towers.push_back( kTowerNameNitrogen );
towers.push_back( kTowerNameFiregun );
towers.push_back( kTowerNameTesla );
int index(0);
for( auto& tower : towers )
{
auto action = [index](Node * button, const Point & pos ) mutable
{
auto delay = DelayTime::create( index * 0.05f );
auto move = MoveTo::create(0.2f, pos);

button->stopAllActions();
button->runAction( Sequence::create( delay, EaseBackOut::create(move), nullptr ) );
};
auto pos = m_towerButtons[tower]->getPosition();
pos.y = 80;
action( m_towerButtons[tower], pos );
action( m_towerButtons[tower + kSuffixUn], pos );

pos = m_itemPositions[index] + Point(50,50);
action( m_towerButtonsInfo[tower], pos );
++index;
}
}

//update(0);
}

void MenuCreateTower::disappearance()
{
//MenuSelect::disappearance();

if( iPad )
{
std::vector<std::string> towers;
towers.push_back( kTowerNameAckAck );
towers.push_back( kTowerNameFlaregun );
towers.push_back( kTowerNameLaser );
towers.push_back( kTowerNameNitrogen );
towers.push_back( kTowerNameFiregun );
towers.push_back( kTowerNameTesla );
int index(0);
for( auto& tower : towers )
{
auto action = [index](Node * button, const Point & pos) mutable
{
auto delay = DelayTime::create( index * 0.05f );
auto move = MoveTo::create(0.2f, pos);
button->stopAllActions();
button->runAction( Sequence::create( delay, EaseBackOut::create(move), nullptr ) );
};
auto pos = m_towerButtons[tower]->getPosition();
pos.y = -30;
action( m_towerButtons[tower], pos );
action( m_towerButtons[tower + kSuffixUn], pos );

pos = m_itemPositions[index] + Point(50,50);
pos.y -= 110;
action( m_towerButtonsInfo[tower], pos );

++index;
}
}

//unschedule(schedule_selector(MenuCreateTower::update));
}

void MenuCreateTower::afterAppearance()
{
}

void MenuCreateTower::afterDisappearance()
{
}

void MenuCreateTower::showInfo( Ref * selector, const std::string & tower )
{
TowerInfo::Def def;
def.icontexture = kPlistGamescene + tower + ".png";
def.caption = Language::shared().string( tower + "_name" );
def.text = Language::shared().string(tower + "_desc");

def.one.value = mlTowersInfo::shared().getDamage( tower );
def.one.maxvalue = 10;
def.one.name = Language::shared().string("Damage");

def.two.value = mlTowersInfo::shared().getFirerate( tower );;
def.two.maxvalue = 10;
def.two.name = Language::shared().string("Firerate");

def.three.value = mlTowersInfo::shared().getRadius( tower );;
def.three.maxvalue = 10;
def.three.name = Language::shared().string("Radius");

auto node = TowerInfo::create(def);
GameGS::getInstance()->addChild(node, 999999);
node->setPosition( 512, 384 );
GameGS::getInstance()->showDialog(node);
}

void MenuCreateTower::cancelBuy( Ref * selector )
{
AudioEngine::shared().playEffect( kSoundGameTowerBuyCancel );
}

void MenuCreateTower::selectCreate(const std::string & towerName)
{
GameGS::getInstance()->getGameBoard().createTower( towerName );
disappearance();
}

void MenuCreateTower::update(float dt)
{
for( auto i : m_itemNames )
{
if ( i.empty() ) continue;
assert(m_towerButtons.find(i) != m_towerButtons.end());
unsigned cost = mlTowersInfo::shared().getCost(i, 1);
unsigned score = ScoreCounter::shared().getMoney(kScoreLevel);

Node * visibled(nullptr);
Node * unvisibled(nullptr);
bool excluded(false);
if( std::find(m_excludedTowers.begin(), m_excludedTowers.end(), i) != m_excludedTowers.end() )
excluded = true;

if ( cost <= score && excluded == false && m_isActived )
{
visibled = m_towerButtons[i];
unvisibled = m_towerButtons[i + kSuffixUn];
}
else
{
unvisibled = m_towerButtons[i];
visibled = m_towerButtons[i + kSuffixUn];
}
if( visibled->isVisible() == false && !iPad )
{
visibled->runAction( Sequence::create(
EaseBackIn::create(ScaleTo::create(0.2f, 0.5f)),
EaseBackOut::create(ScaleTo::create(0.2f, 1.f)), nullptr ) );
}
visibled->setVisible(true);
unvisibled->setVisible(false);
}
auto place = GameGS::getInstance()->getSelectedTowerPlaces();
setEnabled( place != nullptr );
}

void MenuCreateTower::addExludedTower( const std::string & name )
{
auto i = std::find( m_excludedTowers.begin(), m_excludedTowers.end(), name );
if( i == m_excludedTowers.end() )
m_excludedTowers.push_back(name);
}

void MenuCreateTower::removeExludedTower( const std::string & name )
{
auto i = std::find( m_excludedTowers.begin(), m_excludedTowers.end(), name );
if( i != m_excludedTowers.end() )
m_excludedTowers.erase(i);
}
*/
/*
MenuInfoTower::MenuInfoTower()
: m_tower(nullptr)
, m_sellDisabled(false)
{
setName( "MenuInfoTower" );

float radius(92);

const ccMenuCallback callbacks[] = {
std::bind( &MenuInfoTower::cbUpgrade, this),
std::bind( &MenuInfoTower::cbSell, this),
std::bind( &MenuInfoTower::cbClose, this),
std::bind( &MenuInfoTower::cbFlag, this),
std::bind( &MenuInfoTower::cbSellAsk, this),
};

m_buttons.resize(6);

m_buttons[0] = MenuItemImageManager::sprite( ImageManager::sprite(kPlistInterface+"upgrade.png"), ImageManager::sprite(kPlistInterface+"upgrade.png"), callbacks[0] );
m_buttons[1] = MenuItemImageManager::sprite( ImageManager::sprite(kPlistInterface+"upgrade2.png"), ImageManager::sprite(kPlistInterface+"upgrade2.png"), callbacks[0] );
m_buttons[2] = MenuItemImageManager::sprite( ImageManager::sprite(kPlistInterface+"sell.png"), ImageManager::sprite(kPlistInterface+"sell.png"), callbacks[4] );
m_buttons[3] = MenuItemImageManager::sprite( ImageManager::sprite(kPlistInterface+"menutowerbg.png"), ImageManager::sprite(kPlistInterface+"menutowerbg.png"), callbacks[2] );
m_buttons[4] = MenuItemImageManager::sprite( ImageManager::sprite(kPlistInterface+"flag.png"), ImageManager::sprite(kPlistInterface+"flag.png"), callbacks[3] );
m_buttons[5] = MenuItemImageManager::sprite( ImageManager::sprite(kPlistInterface+"sell2.png"), ImageManager::sprite(kPlistInterface+"sell2.png"), callbacks[1] );

m_labelUpgrade = Label::create("", kFontNumbers.c_str());
m_labelUpgrade->setPosition(Point(m_buttons[0]->getNormalImage()->getContentSize().width / 2, 23));
m_buttons[0]->addChild(m_labelUpgrade, 1, 1);

m_labelUpgradeUn =Label::create("", kFontNumbers.c_str());
m_labelUpgradeUn->setPosition(Point(m_buttons[1]->getNormalImage()->getContentSize().width / 2, 23));
m_labelUpgradeUn->setOpacity( 128 );
m_buttons[1]->addChild(m_labelUpgradeUn, 1, 1);

m_labelSell = Label::create("", kFontNumbers.c_str());
m_labelSell->setPosition(Point(m_buttons[2]->getNormalImage()->getContentSize().width / 2, 23));
m_buttons[2]->addChild(m_labelSell, 1, 1);

std::vector<Point>positions;
computePointsByRadius(positions, radius, 4, 90);
m_buttons[0]->setPosition(positions[0]);
m_buttons[1]->setPosition(positions[0]);
m_buttons[2]->setPosition(positions[2]);
m_buttons[3]->setPosition(Point(0,0));
m_buttons[4]->setPosition(positions[3]);
m_buttons[5]->setPosition(positions[2]);

addChild(m_buttons[0],  0, 0);
addChild(m_buttons[1],  0, 1);
addChild(m_buttons[2],  0, 2);
addChild(m_buttons[3], -1, 3);
addChild(m_buttons[4],  0, 4);
addChild(m_buttons[5],  1, 5);

//	init();
}

MenuInfoTower::~MenuInfoTower()
{
}

void MenuInfoTower::disabelSellButton( bool var )
{
m_buttons[2]->setVisible(!var);
m_sellDisabled = var;
}

void MenuInfoTower::setObject(mlTower * tower)
{
__push_auto_check("MenuInfoTower::setObject");
m_tower = tower;
if ( m_tower )
{
m_buttons[4]->setVisible( m_tower->useFlag() );
}
}

void MenuInfoTower::appearance()
{
__push_auto_check("MenuInfoTower::appearance");
GameGS::getInstance()->setEnabled(false);
if ( !m_tower )
return;
MenuSelect::appearance();
m_tower->setDrawRadiusDamage(true);

unsigned cost = mlTowersInfo::shared().getCost(m_tower->getName(), m_tower->getLevel() + 1);
unsigned sell = mlTowersInfo::shared().getSellCost(m_tower->getName(), m_tower->getLevel());
m_labelUpgrade->setString(intToStr(cost).c_str());
m_labelUpgradeUn->setString(intToStr(cost).c_str());
m_labelSell->setString(intToStr(sell).c_str());

update(0);
m_buttons[2]->setVisible(!m_sellDisabled);
m_buttons[5]->setVisible(false);

schedule(schedule_selector(MenuInfoTower::update));
}

void MenuInfoTower::disappearance()
{
__push_auto_check("MenuInfoTower::disappearance");
MenuSelect::disappearance();
if ( m_tower ) m_tower->setDrawRadiusDamage(false);
unschedule(schedule_selector(MenuInfoTower::update));
}

void MenuInfoTower::afterDisappearance()
{
MenuSelect::afterDisappearance();
removeFromParent();
}


void MenuInfoTower::setPosition(const Point & position)
{
__push_auto_check("MenuInfoTower::setPosition");
MenuSelect::setPosition(position);
}

void MenuInfoTower::cbUpgrade()
{
__push_auto_check("MenuInfoTower::cbUpgrade");
if (!m_tower )
return;
//GameGS::getInstance()->getGameBoard().upgradeTower(m_tower);
disappearance();
}

void MenuInfoTower::cbSell()
{
__push_auto_check("MenuInfoTower::cbSell");
AudioEngine::shared().playEffect( kSoundGameTowerSelling );
//GameGS::getInstance()->getGameBoard().removeTower(m_tower);
setObject( nullptr );
disappearance();
}

void MenuInfoTower::cbSellAsk()
{
__push_auto_check("MenuInfoTower::cbSell");
m_buttons[2]->setVisible(false);
m_buttons[5]->setVisible(true);
m_buttons[5]->setScale(0,0);
m_buttons[5]->runAction( EaseBackOut::create(ScaleTo::create(0.2f, 1)));
}

void MenuInfoTower::cbClose()
{
__push_auto_check("MenuInfoTower::cbClose");
disappearance();
}

void MenuInfoTower::cbFlag()
{
__push_auto_check("MenuInfoTower::cbFlag");
//GameGS::getInstance()->sendNextTouchToObject(m_tower);
disappearance();
}

void MenuInfoTower::update(float dt)
{
int cost = mlTowersInfo::shared().getCost(m_tower->getName(), m_tower->getLevel() + 1);

Node * visible(nullptr);
Node * unvisible(nullptr);
if ( ScoreCounter::shared().getMoney(kScoreLevel) >= cost )
{
visible = m_buttons[0];
unvisible = m_buttons[1];
}
else
{
visible = m_buttons[1];
unvisible = m_buttons[0];
}
assert(visible && unvisible);
visible->setVisible(true);
unvisible->setVisible(false);

if ( m_tower->getMaxLevel() == m_tower->getLevel() )
visible->setVisible(false);
}
*/

/*
MenuSkills::MenuSkills( GameGS * gs )
: m_gs(gs)
, m_mine(nullptr)
, m_bomb(nullptr)
{
bool r = init();
assert(r);

auto size = Director::getInstance()->getVisibleSize();

auto X0 = size.width - 105;
auto X1 = size.width - 342 + 105;
auto Y = 80;

m_mine = ProgressIconMenuItem::create("mine");
m_mine->setDuration(5);
m_mine->setPosition( X0, Y );
m_mine->start();
m_mine->setCallback( CC_CALLBACK_1(MenuSkills::mine, this) );
addChild( m_mine );

m_bomb = ProgressIconMenuItem::create("bomba");
m_bomb->setDuration(5);
m_bomb->setPosition( X1, Y );
m_bomb->start();
m_bomb->setCallback( CC_CALLBACK_1(MenuSkills::bomb, this) );
addChild( m_bomb );

appearance();
}

void MenuSkills::mine( Ref * ref )
{
}

void MenuSkills::bomb( Ref * ref )
{
}
*/
ScoresNode::ScoresNode()
: m_scores()
, m_healths( nullptr )
, m_golds( nullptr )
, m_waves( nullptr )
{
	__push_auto_check( "ScoresNode::ScoresNode" );
	Node::init();
	m_healths = Label::createWithBMFont(  kFontStroke, "" );
	m_golds = Label::createWithBMFont( kFontStroke, "" );
	m_waves = Label::createWithBMFont( kFontStroke, "" );

	addChild( m_healths, 1 );
	addChild( m_golds, 1 );
	addChild( m_waves, 1 );

	m_healths->setAnchorPoint( Point( 0, 0.5f ) );
	m_golds->setAnchorPoint( Point( 0, 0.5f ) );
	m_waves->setAnchorPoint( Point( 0, 0.5f ) );

	m_healths->setPosition( Point( 85, -25 ) );
	m_golds->setPosition( Point( 190, -25 ) );
	m_waves->setPosition( Point( 85, -70 ) );

	m_healths->setScale( 0.5f );
	m_golds->setScale( 0.5f );
	m_waves->setScale( 0.5f );

	m_healthsIcon = ImageManager::sprite( k::resourceGameSceneFolder + "icon_lifes.png" );
	m_healthsIcon->setPosition( 62, -30 );
	addChild( m_healthsIcon );
	auto icon = ImageManager::sprite( k::resourceGameSceneFolder + "icon_gold1.png" );
	icon->setPosition( 162, -30 );
	addChild( icon );
	icon = ImageManager::sprite( k::resourceGameSceneFolder + "icon_wave1.png" );
	icon->setPosition( 62, -75 );
	addChild( icon );

	ScoreCounter::shared().observer( kScoreLevel ).add( _ID, std::bind( &ScoresNode::on_change_money, this, std::placeholders::_1 ) );
	ScoreCounter::shared().observer( kScoreHealth ).add( _ID, std::bind( &ScoresNode::on_change_lifes, this, std::placeholders::_1 ) );
}

ScoresNode::~ScoresNode()
{
	ScoreCounter::shared().observer( kScoreLevel ).remove( _ID );
	ScoreCounter::shared().observer( kScoreHealth ).remove( _ID );
}

ScoresNode* ScoresNode::create()
{
	ScoresNode* p = new ScoresNode;
	p->autorelease();
	return p;
}

void ScoresNode::updateWaves()
{
	int wave = WaveGenerator::shared().getWaveIndex();
	int count = WaveGenerator::shared().getWavesCount();
	std::string text = intToStr( wave ) + "/" + intToStr( count );
	m_waves->setString( text.c_str() );
}

void ScoresNode::on_change_lifes( int score )
{
	int health = std::max<int>( 0, ScoreCounter::shared().getMoney( kScoreHealth ) );
	m_healths->setString( intToStr( health ) );

	auto run = []( Node*node )
	{
		float s = node->getScale();
		if( node->getActionByTag( 0x12 ) )
			return;

		auto action = EaseBackInOut::create( Sequence::create(
			ScaleTo::create( 0.5f, s * 1.5f ),
			ScaleTo::create( 0.5f, s * 1.0f ),
			nullptr ) );
		action->setTag( 0x12 );
		node->runAction( action );
	};

	run( m_healths );
	run( m_healthsIcon );
}

void ScoresNode::on_change_money( int score )
{
	int prev = m_scores[kScoreLevel];
	int curr = ScoreCounter::shared().getMoney( kScoreLevel );
	if( prev != curr )
	{
		curr = std::max<int>( 0, curr );
		m_scores[kScoreLevel] = curr;
		auto action = ActionText::create( 0.2f, curr, true );
		action->setTag( 1 );
		m_golds->stopActionByTag( 1 );
		m_golds->runAction( action );
	}
}

Icon::Icon()
: m_label( nullptr )
, m_bg( nullptr )
{}

bool Icon::init( const std::string & bgResource, const std::string & text )
{
	m_bg = ImageManager::sprite( bgResource.c_str() );
	if( !m_bg ) return false;
	m_label = Label::createWithBMFont( kFontStroke, text );
	if( !m_label ) return false;
	addChild( m_label );
	addChild( m_bg );
	m_label->setAnchorPoint( Point( 1, 0.5 ) );
	m_bg->setAnchorPoint( Point( 0, 0.5 ) );
	return true;
}

Icon::~Icon()
{}

Icon * Icon::create( const std::string & bgResource, const std::string & text )
{
	Icon * ptr = new Icon;
	if( ptr && ptr->init( bgResource, text ) )
		ptr->autorelease();
	return ptr;
}

FiniteTimeAction * Icon::createAndRunAppearanceEffect( float duration, FiniteTimeAction * extraAction )
{
	Vector<FiniteTimeAction*>actions;
	actions.pushBack( EaseOut::create( MoveBy::create( duration * 0.30f, Point( 0, 35 ) ), 1 ) );
	actions.pushBack( EaseIn::create( MoveBy::create( duration * 0.25f, Point( 0, -35 ) ), 1 ) );
	actions.pushBack( EaseOut::create( MoveBy::create( duration * 0.20f, Point( 0, 25 ) ), 1 ) );
	actions.pushBack( EaseIn::create( MoveBy::create( duration * 0.15f, Point( 0, -25 ) ), 1 ) );
	actions.pushBack( EaseOut::create( MoveBy::create( duration * 0.10f, Point( 0, 10 ) ), 1 ) );
	actions.pushBack( EaseIn::create( MoveBy::create( duration * 0.05f, Point( 0, -10 ) ), 1 ) );
	actions.pushBack( DelayTime::create( duration ) );

	if( extraAction )
		actions.pushBack( extraAction );

	Sequence * action = Sequence::create( actions );

	runAction( action );
	m_label->runAction( Sequence::create( DelayTime::create( duration ), FadeTo::create( 1, 128 ), nullptr ) );
	m_bg->runAction( Sequence::create( DelayTime::create( duration ), FadeTo::create( 1, 128 ), nullptr ) );
	return action;
}

FiniteTimeAction * Icon::createAndRunDisappearanceEffect( float duration, FiniteTimeAction * extraAction )
{
	FiniteTimeAction * a0 = MoveBy::create( duration, Point( 15, 100 ) );
	FiniteTimeAction * a1 = FadeTo::create( duration, 128 );
	FiniteTimeAction * a2 = FadeTo::create( duration, 128 );

	FiniteTimeAction * action( nullptr );
	if( extraAction )
	{
		Vector<FiniteTimeAction*>arr;
		arr.pushBack( a0 );
		arr.pushBack( extraAction );
		action = Sequence::create( arr );
	}
	else
	{
		action = a0;
	}
	assert( action );
	runAction( action );
	m_label->runAction( a1 );
	m_bg->runAction( a2 );
	return action;
}

void Icon::setIntegerValue( unsigned value )
{
	std::string s = intToStr( value );
	const char * c = s.c_str();
	m_label->setString( c );
}

NS_CC_END;
