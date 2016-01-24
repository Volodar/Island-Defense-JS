#include "consts.h"
#include <mutex>
#include "configuration.h"
#include "AppDelegate.h"
#include "scenes/MainGS.h"
#include "scenes/SplashScene.h"
#include "GameGS.h"
#include "Log.h"
#include "resources.h"
#include "ml/Audio/AudioEngine.h"
#include "ml/Language.h"
#include "MapLayer.h"
#include "ScoreCounter.h"
#include "inapp/Purchase.h"
#include "ml/loadxml/xmlLoader.h"
#include "ml/ParamCollection.h"
#include "ml/ObjectFactory.h"
#include "EventsGame.h"
#include "plugins/AdsPlugin.h"
#include "ShopLayer.h"
#include "appgratis/appgratis.h"
#include "Hero2.h"
#include "ml/ImageManager.h"
#include "game/Achievements.h"
#include "UserData.h"
#include "ml/audio/AudioEngine.h"
#include "playservices/playservices.h"

#if EDITOR==1
#	include "editor/Editor.h"
#endif

USING_NS_CC;

NS_CC_BEGIN;
float DesignScale(1);
bool iPad(true);
bool iPhone(false);
NS_CC_END;

bool g_isFullscreenMode( false );

void createMapsH( int num );
void convertMap( int num );
void registration();
void showCursor();
void createWindow();
void setDesignResolution();

#ifdef WIN32
int AppDelegate::screenResolutionX(0);
int AppDelegate::screenResolutionY(0);
#endif

AppDelegate::AppDelegate()
{
	//createMapsH(27);
#if USE_CHEATS == 1
	addTestDevice( getDeviceID() );
	setTestModeActive( true );
#endif
#if CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID
	addTestDevice( "39ba8a01b59545c2" );
	addTestDevice( "f9f67849b9761228" );
	addTestDevice( "4c39e129afded713" );
#elif CC_TARGET_PLATFORM == CC_PLATFORM_IOS
	addTestDevice( "7D2A3ADC-FE0E-4643-8FFB-DB99475934DB" );
	addTestDevice( "249C79C3-01AA-401E-B9C5-C3CCF19E5C0C" );
#endif
}

AppDelegate::~AppDelegate()
{
}

bool AppDelegate::applicationDidFinishLaunching()
{
#if PC != 1
	inapp::CallBackPurchase cb = std::bind( ShopLayer::request_answer, std::placeholders::_1 );
	inapp::setCallbackPurchase( cb );
#endif
	appgratis::init();

	configurePath();
	ScoreByTime::shared();
	LevelParams::shared();
	Achievements::shared();
	Language::shared();
	if( k::configuration::useLeaderboards )
		PlayServises::init();

	auto setSoundEnabled = []( bool mode ){ UserData::shared().write( "sound_enabled", mode ? true : false ); };
	auto setMusicEnabled = []( bool mode ){ UserData::shared().write( "music_enabled", mode ? true : false ); };
	auto isSoundEnabled = [](){ return UserData::shared().get_bool( "sound_enabled", true ); };
	auto isMusicEnabled = [](){ return UserData::shared().get_bool( "music_enabled", true ); };
	AudioEngine::callback_setSoundEnabled( std::bind( setSoundEnabled, std::placeholders::_1 ) );
	AudioEngine::callback_setMusicEnabled( std::bind( setMusicEnabled, std::placeholders::_1 ) );
	AudioEngine::callback_isSoundEnabled( std::bind( isSoundEnabled ) );
	AudioEngine::callback_isMusicEnabled( std::bind( isMusicEnabled ) );

	createWindow();
	setDesignResolution();
	applyConfigurations();
	loadXmlValues( );
	registration( );
	linkPlugins();

	auto director = Director::getInstance();

#if EDITOR==1
	auto scene = EditorScene::create( );
	director->runWithScene( scene );
#else
	//auto scene = SplashScene::create();
	//director->runWithScene( scene.ptr() );
	auto scene = MainGS::scene();
	Director::getInstance()->runWithScene( scene.ptr() );
#endif
	
	std::list<std::string> items;
	items.push_back( k::configuration::kInappFuel1 );
	items.push_back( k::configuration::kInappGear1 );
	items.push_back( k::configuration::kInappGear2 );
	items.push_back( k::configuration::kInappGear3 );
	items.push_back( k::configuration::kInappGold1 );
	items.push_back( k::configuration::kInappGold2 );
	items.push_back( k::configuration::kInappGold3 );
	items.push_back( k::configuration::kInappGold4 );
	items.push_back( k::configuration::kInappGold5 );
	items.push_back( k::configuration::kInappHero2 );
	items.push_back( k::configuration::kInappHero3 );
	items.push_back( k::configuration::kInappAllHeroes );
	for( auto& item : items )
	{
		auto cb = std::bind( [](){} );
		inapp::details(item, cb);
	}
	HeroExp::shared();

	showCursor();

	return true;
}

void AppDelegate::applicationDidEnterBackground() {
    Director::getInstance()->stopAnimation();
	CocosDenshion::SimpleAudioEngine::getInstance()->pauseAllEffects();
	CocosDenshion::SimpleAudioEngine::getInstance()->pauseBackgroundMusic();
	ScoreByTime::shared().savetime();
}

void AppDelegate::applicationWillEnterForeground() {
    Director::getInstance()->startAnimation();
	CocosDenshion::SimpleAudioEngine::getInstance()->resumeAllEffects();
	CocosDenshion::SimpleAudioEngine::getInstance()->resumeBackgroundMusic();
	ScoreByTime::shared( ).checktime( );
}

void AppDelegate::onReceivedMemoryWarning()
{
    //Director::getInstance()->getTextureCache()->removeUnusedTextures();
}

void AppDelegate::applyConfigurations()
{
	xmlLoader::macros::set("icon_paid_version", k::configuration::iconForPaidGame );
}

void AppDelegate::linkPlugins()
{
	AdsPlugin::shared().use( AdsPlugin::Type::statistic, AdsPlugin::Service::flurry );
	AdsPlugin::shared().use( AdsPlugin::Type::OfferWall, AdsPlugin::Service::supersonic );
	switch( k::configuration::AdsTypeInterstitial )
	{
		case k::configuration::InterstitialAdmob: AdsPlugin::shared().use( AdsPlugin::Type::interstitialBanner, AdsPlugin::Service::admob ); break;
		case k::configuration::InterstitialChartboost: AdsPlugin::shared().use( AdsPlugin::Type::interstitialBanner, AdsPlugin::Service::chartboost ); break;
		case k::configuration::InterstitialSupersonic: AdsPlugin::shared().use( AdsPlugin::Type::interstitialBanner, AdsPlugin::Service::supersonic ); break;
		case k::configuration::InterstitialFyber: AdsPlugin::shared().use( AdsPlugin::Type::interstitialBanner, AdsPlugin::Service::fyber ); break;
		case k::configuration::InterstitialDeltaDNA: AdsPlugin::shared().use( AdsPlugin::Type::interstitialBanner, AdsPlugin::Service::deltadna ); break;
		default: assert( 0 );
	}
	switch( k::configuration::AdsTypeRewardVideo )
	{
		case k::configuration::RewardVideoVungle: AdsPlugin::shared().use( AdsPlugin::Type::rewardVideo, AdsPlugin::Service::vungle ); break;
		case k::configuration::RewardVideoSupersonic: AdsPlugin::shared().use( AdsPlugin::Type::rewardVideo, AdsPlugin::Service::supersonic ); break;
		case k::configuration::RewardVideoFyber: AdsPlugin::shared().use( AdsPlugin::Type::rewardVideo, AdsPlugin::Service::fyber ); break;
		case k::configuration::RewardVideoDeltaDNA: AdsPlugin::shared().use( AdsPlugin::Type::rewardVideo, AdsPlugin::Service::deltadna ); break;
		default: assert( 0 );
	}
	switch( k::configuration::AdsTypeOfferWall )
	{
		case k::configuration::OfferWallSupersonic: AdsPlugin::shared().use( AdsPlugin::Type::OfferWall, AdsPlugin::Service::supersonic ); break;
		default: assert( 0 );
	}
}

void AppDelegate::loadXmlValues( )
{
	ParamCollection macroses;
	xmlLoader::load( &macroses, "ini/sounds.xml" );
	for( auto i : macroses )
	{
		xmlLoader::macros::set( i.first, i.second );
	}
	xmlLoader::macros::set("sound_dir", kPathSound);
	xmlLoader::macros::set("sound_ext", kSoundsEXT);
	xmlLoader::macros::set("music_dir", kPathMusic);
	xmlLoader::macros::set("music_ext", kMusicEXT);

#if PC == 1
	xmlLoader::macros::set("PLATFORM_PC", "yes"); 
#else
	xmlLoader::macros::set("PLATFORM_MOBILE", "yes");
#endif

	xmlLoader::macros::set( "USE_HEROROOM", boolToStr( k::configuration::useHeroRoom ) );
	xmlLoader::macros::set( "NOUSE_HEROROOM", boolToStr( !k::configuration::useHeroRoom ) );
}

void AppDelegate::configurePath()
{
	std::vector<std::string> resourcePaths;
	std::vector<std::string> searchPaths;
	resourcePaths.push_back( "" );
#if CC_TARGET_PLATFORM == CC_PLATFORM_WIN32
#	ifndef _DEBUG
	resourcePaths.push_back( "../../Resources" );
	resourcePaths.push_back( "../Resources" );
	resourcePaths.push_back( "Resources" );
#	endif
#endif


	for( auto path : resourcePaths )
	{
#if PC == 1
		searchPaths.push_back( path + (path.empty() ? "" : "/") + "pc" );
#endif
		if( k::configuration::kGameName.find( "steampunk" ) == 0 )
		{
			auto p = path + (path.empty()  ? "" : "/") + "steampunk";
			searchPaths.push_back( p );
		}
		if( k::configuration::kGameName.find( "steampunkpro" ) == 0 )
		{
			auto p = path + (path.empty()  ? "" : "/") + "steampunkpro";
			searchPaths.push_back( p );
		}
		auto p = path + (path.empty() ? "" : "/") + k::configuration::kGameName;
		searchPaths.push_back( p );
		searchPaths.push_back( path );
	}

	FileUtils::getInstance()->setSearchPaths( searchPaths );
}

void createWindow()
{
#if EDITOR == 1
	float width( k::configuration::LevelMapSize.width + 300 );
	float height( k::configuration::LevelMapSize.height );
	std::string windowTITLE( "Editor: IslandDefense" );
#else
	float width( 1200 );
	float height( 768 );
	std::string windowTITLE( WORD( "window_title" ) );
#endif

#if PC == 1
	g_isFullscreenMode = true;
#endif

	g_isFullscreenMode = UserData::shared().get_bool( "fullscreen", g_isFullscreenMode );

#ifdef _DEBUG
	g_isFullscreenMode = false;
#endif

#ifdef WIN32
#	if PC == 1
	if( AppDelegate::screenResolutionX > 0 && AppDelegate::screenResolutionY > 0 )
	{
		if( g_isFullscreenMode )
		{
			width = AppDelegate::screenResolutionX;
			height = AppDelegate::screenResolutionY;
		}
		else
		{
			if( AppDelegate::screenResolutionX >= 1366 && AppDelegate::screenResolutionY >= 768 )
			{
				width = 1366;
				height = 768;
			}
			else if( AppDelegate::screenResolutionX >= 1024 && AppDelegate::screenResolutionY >= 768 )
			{
				width = 1024;
				height = 768;
			}
			else
			{
				width = 800;
				height = 600;
			}
		}
	}
#	endif
#endif


	auto director = Director::getInstance();
	auto glview = director->getOpenGLView();
	if( !glview )
	{
		if( g_isFullscreenMode )
			glview = GLViewImpl::createWithFullScreen( windowTITLE );
		else
			glview = GLViewImpl::createWithRect( windowTITLE, Rect( 0, 0, width, height ) );
		director->setOpenGLView( glview );
	}
#if USE_CHEATS == 1
	director->setDisplayStats( true );
#else
	director->setDisplayStats( false );
#endif
}

void setDesignResolution()
{
	auto director = Director::getInstance();
	auto glview = director->getOpenGLView();

	std::vector<std::string> paths;
	auto size = glview->getFrameSize();


#ifndef EDITOR
	auto sx = glview->getFrameSize().width;
	auto sy = glview->getFrameSize().height;
	float rate = sx / sy;
	sx = std::max( 1024.f, sx );
	sx = std::min( 1136.f, sx );
	sy = sx / rate;
	glview->setDesignResolutionSize( sx, sy, ResolutionPolicy::SHOW_ALL );

#endif
}

void registration()
{
	Factory::shared().book<EventCreateUnit>( "createunit" );
	Factory::shared().book<EventCreateUnitReverseRoute>( "createunit_reverseroute" );
	Factory::shared().book<EventAreaDamage>( "areadamage" );
	Factory::shared().book<Hero>( "hero" );
	Factory::shared().book<Hero2>( "hero2" );
}

void showCursor()
{
	//if( g_isFullscreenMode == false )
	//	return;

#if PC == 1
	float scale =
		Director::getInstance()->getOpenGLView()->getDesignResolutionSize().width /
		Director::getInstance()->getOpenGLView()->getFrameSize().width;

	ShowCursor( FALSE );
	auto sprite = ImageManager::shared().sprite("images/cursor.png");
	sprite->retain();
	sprite->setGlobalZOrder(9999);
	sprite->setAnchorPoint(Point(0, 1));
	sprite->setScale( scale );

	EventDispatcher * _eventDispatcher = Director::getInstance()->getEventDispatcher();

	auto touchBegan = [](Touch*, Event*){ return true; };
	auto touchMoved = [sprite](Event*event)mutable
	{
		auto scene = sprite->getScene();
		auto run = Director::getInstance()->getRunningScene();
		if (scene != run && run)
		{
			sprite->removeFromParent();
			run->addChild(sprite);
		}
		EventMouse* em = (EventMouse*)event;
		auto pos = Point(em->getCursorX(), em->getCursorY());
		sprite->setPosition(pos);
	};
	auto touchEnded = [](Touch*, Event*){; };

	auto touchListener = EventListenerMouse::create();
	touchListener->onMouseMove = std::bind(touchMoved, std::placeholders::_1);
	_eventDispatcher->addEventListenerWithFixedPriority(touchListener,-9999 );
#endif
}


