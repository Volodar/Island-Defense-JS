//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//

#include "MainGS.h"
#include "LayerLoader.h"
#include "ImageManager.h"
#include "ml/Audio/AudioEngine.h"
#include "ml/Language.h"
#include "ml/loadxml/xmlProperties.h"
#include "GameGS.h"
#include "MenuItemTextBG.h"
#include "resources.h"
#include "consts.h"
#include "MapLayer.h"
#include "Achievements.h"

#include "Log.h"
#include "UserData.h"
#include "ScoreCounter.h"

#include "MenuCreateTower.h"
#include "lab/Laboratory.h"
#include "shop/ShopLayer.h"
#include "Tower.h"
#include "VictoryMenu.h"
#include "inapp/Purchase.h"
#include "appgratis/appgratis.h"
#include "SmartScene.h"
#include "configuration.h"
#include "dosads/DOSAds.h"
#include "deltadna/deltadna.h"
#include "plugins/AdsPlugin.h"
#include "inapp/Purchase.h"
#include "fyber/fyber.h"
#include "gamegs/GamePauseScene.h"
#include "flurry/flurry_.h"
#include "chartboost/chartboost_.h"
/*
*/
extern bool iPad;
NS_CC_BEGIN;

void printNodes()
{
	//	auto nodes = getNodesList();
	//	int index(0);
	//	for( auto i : nodes )
	//	{
	//		log( "[%d]: 0x%x ->refcount(%d) -> %d ", index++, int(long(i)), i->getReferenceCount(), i->_ID );
	//	}
}

MainGS::MainGS()
: m_menu( nullptr )
, m_menuAudio( nullptr )
, m_resourceIsLoaded( false )
{}

ScenePointer MainGS::scene()
{
	__push_auto( "MainGS::scene" );
	MainGS *layer = MainGS::create();
	auto scene = SmartScene::create( layer );
	scene->setName( "TitleScene" );

	return scene;
}

bool MainGS::init()
{
	do
	{
		mlTowersInfo::shared();
		CC_BREAK_IF( !Layer::init() );

		NodeExt::load( "ini/maings", "mainlayer.xml" );
		m_menu.reset( getChildByName<Menu*>( "mainmenu" ) );

		loadResources( std::bind( &MainGS::onResourcesDidLoaded, this ) );
		m_menu->setEnabled( false );

		runEvent( "oncreate" );
        
        if (!k::configuration::hideMainLogo) {
            runEvent("showLogo");
        } else {
            runEvent("showTitle");
        }

#if PC == 1
		auto settings = getNodeByPath( this, "menusettings" );
		if( settings )settings->setVisible( true );
#else
#	if CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID
		auto promo = getNodeByPath( this, "menupromo" );
		if( promo )
			promo->setVisible( true );
#	endif
#endif

		if( isTestDevice() )
		{
			createDevMenu();
		}
		return true;
	}
	while( false );
	return false;
}

void MainGS::load( const pugi::xml_node & root )
{
	NodeExt::load( root );

	auto xmlRes = root.child( "resources" );
	auto xml_tex = xmlRes.child( "textures" );
	auto xml_atl = xmlRes.child( "atlases" );
	FOR_EACHXML( xml_tex, child )
	{
		m_loadingList.resources.push_back( child.attribute( "path" ).as_string() );
	}
	FOR_EACHXML( xml_atl, child )
	{
		std::string path = child.attribute( "path" ).as_string();
		std::string name = child.attribute( "name" ).as_string();
		m_loadingList.atlases.push_back( std::pair<std::string, std::string>( path, name ) );
	}
}

ccMenuCallback MainGS::get_callback_by_description( const std::string & name )
{
	if( name == "pushGame" ) return CC_CALLBACK_1( MainGS::pushGame, this );
	if( name == "close_redeem_win" ) return CC_CALLBACK_1( MainGS::closeRedeemMsg, this );
	//if (name == "moreApps") return std::bind([](Ref*) { AdsPlugin::shared().showMoreApps(); }, std::placeholders::_1);
	if (name == "exit") return std::bind([](Ref*) { Director::getInstance()->end(); }, std::placeholders::_1);
	if (name == "restore") return std::bind([this](Ref*)
	{
		auto callback = [this]( int, int )
		{
			if( _blockLayer )
			{
				_blockLayer->removeFromParent();
				_blockLayer.reset(nullptr);
			}
		};
#if PC == 1
#else
		ShopLayer::observerOnPurchase().add( _ID, std::bind( callback, std::placeholders::_1, std::placeholders::_2 ) );
		inapp::restore("");
#endif
		
		
		SmartScene * scene = dynamic_cast<SmartScene*>(getScene());
		_blockLayer = LayerExt::create();
		auto sprite = ImageManager::shared().sprite("images/loading.png");
		_blockLayer->addChild(sprite);
		sprite->runAction(RepeatForever::create(RotateBy::create(1, 360)));
		sprite->setPosition( Point(Director::getInstance()->getOpenGLView()->getDesignResolutionSize()/2) );
		if( scene )
			scene->pushLayer( _blockLayer, true );

		scene->runAction(Sequence::create(
		   DelayTime::create(10),
		   CallFunc::create(std::bind( callback, 0, 0 )),
		   nullptr ));

	}, std::placeholders::_1);

	if( name == "settings" )
	{
		auto cb = [this](Ref*)
		{
			xmlLoader::bookDirectory( this );
			auto settings = GamePauseLayer::create( "ini/maings/settings.xml", false );
			auto scene = static_cast<SmartScene*>(getScene());
			if( scene && settings )
				scene->pushLayer( settings, true );
			xmlLoader::unbookDirectory();
		};
		return std::bind( cb, std::placeholders::_1 );
	}
	if( name == "link:kidsvszombies" )
	{
		auto cb = []( Ref* )
		{
			ParamCollection pc;
			pc["event"] = "promo_button";
			pc["link"] = "kidsvszombies";
			flurry::logEvent( pc );
			openUrl( "https://play.google.com/store/apps/details?id=com.stereo7.kidszombies" );
		};
		return std::bind( cb, std::placeholders::_1 );
	}
	return nullptr;
}

void MainGS::onEnter()
{
	__push_auto_check( "MainGS::onEnter" );
	Layer::onEnter();
	AudioEngine::shared().playMusic( kMusicMainMenu );

	setKeyboardEnabled( true );
}

void MainGS::onKeyReleased( EventKeyboard::KeyCode keyCode, Event* event )
{
#if PC == 1
#	if USE_CHEATS == 1
	if( keyCode == EventKeyboard::KeyCode::KEY_F10 )
	{
		steam_clearAchievements();
	}
#	endif
#else
	if( keyCode == EventKeyboard::KeyCode::KEY_BACK )
		Director::getInstance()->popScene();
#endif
}

void MainGS::loadResources( std::function<void()> callback )
{
	auto layer = LayerLoader::create( m_loadingList.resources, callback );
	layer->addPlists( m_loadingList.atlases );
	addChild( layer, 999 );
	layer->setVisible( false );
	layer->setTag( 999 );
	layer->loadCurrentTexture();

}

void MainGS::pushGame( Ref* )
{
	//fyber::showInterstitial();
	//return;

	if( m_menu->isEnabled() == false ) return;
	m_menu->setEnabled( false );
	if( m_resourceIsLoaded )
		onResourcesDidLoaded_runMap();
	else
		loadResources( std::bind( &MainGS::onResourcesDidLoaded_runMap, this ) );
}

void MainGS::onResourcesDidLoaded()
{
	m_menu->setEnabled( true );
	removeChildByTag( 999 );
	
	if( m_resourceIsLoaded == false )
	{
        //hide "More" button if needed
        if (k::configuration::hideMoreButton == false)
        {
            runEvent( "resourcesloaded2" );
        }

		runEvent( "resourcesloaded" );
		appgratis::setCallback( std::bind( &MainGS::appGratis_onRedeem, this, std::placeholders::_1 ) );
	}

	m_resourceIsLoaded = true;

	//deltadna::requestEngage("chooseAds");

}

void MainGS::closeRedeemMsg(Ref*)
{
	if( _redeemLayer )
		_redeemLayer->removeFromParent();
}

void MainGS::appGratis_onRedeem(const ParamCollection & pc )
{
	std::string redeemName;
	for( auto pair : pc )
	{
		redeemName = pair.first;
		int redeem = UserData::shared().get_int(redeemName);
		if( redeem == 1 )
			continue;
		UserData::shared().write( redeemName, 1 );
		
		if( redeemName == "Pro" || redeemName == "PRO" || redeemName == "pro" )
		{
			xmlLoader::bookDirectory( this );
			auto node = xmlLoader::load_node("ini/appgratis_redeem_win.xml");
			xmlLoader::unbookDirectory();

			_redeemLayer = Layer::create();
			_redeemLayer->addChild(node);
			
			SmartScene * scene = (SmartScene*)getScene();
			scene->pushLayer(_redeemLayer, true);
			
			int gold = ScoreCounter::shared().getMoney(kScoreCrystals);
			gold = std::max( 10000, gold );
			//ScoreCounter::shared().setMoney(kScoreFuel, 10000, true);
			ScoreCounter::shared().setMoney(kScoreCrystals, gold, true);
			UserData::shared().write( k::user::UnShowAd, 1 );
		}
	}
}

void MainGS::createDevMenu()
{
	if( isTestDevice() == false )
		return;
	auto menu = Menu::create();
	menu->setPosition( 0, 0 );
	addChild( menu );

	static auto activator = []( Ref*sender )
	{
		static int counter = 0;
		if( isTestModeActive() == false )
		{
			if( ++counter == 10 )
			{
				counter = 0;
				setTestModeActive( true );
				static_cast<Node*>(sender)->getParent()->setOpacity( 255 );
			}
		}
		else
		{
			if( ++counter == 5 )
			{
				counter = 0;
				setTestModeActive( false );
				static_cast<Node*>(sender)->getParent()->setOpacity( 0 );
			}
		}
	};
	auto userdata = [](Ref*)
	{
		UserData::shared().clear();
	};
	
	auto i = MenuItemTextBG::create( "++", Color4F::GRAY, Color3B::BLACK, std::bind( activator, std::placeholders::_1 ) );
	auto user = MenuItemTextBG::create( "clear UD", Color4F::GRAY, Color3B::BLACK, std::bind( userdata, std::placeholders::_1 ) );
	i->setScale( 5 );
	i->setPosition( 10, 10 );
	i->setCascadeOpacityEnabled( true );
	menu->addChild( i );

	user->setPosition( Point(50, 100) );
	user->setCascadeOpacityEnabled( true );
	menu->addChild( user );
	menu->setCascadeOpacityEnabled(true);
	menu->setOpacity(true);
}

void MainGS::onResourcesDidLoaded_runMap()
{
	onResourcesDidLoaded();
	auto scene = MapLayer::scene();
	Director::getInstance()->pushScene( scene );
}

void MainGS::rateme()
{}


NS_CC_END;
