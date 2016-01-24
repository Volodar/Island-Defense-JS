//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "VictoryMenu.h"
#include "GameGS.h"
#include "support.h"
#include "ScoreCounter.h"
#include "ml/SmartScene.h"
#include "ShopLayer.h"
#include "ScoreLayer.h"
#include "configuration.h"

NS_CC_BEGIN


VictoryMenu::VictoryMenu()
{
}

VictoryMenu::~VictoryMenu( )
{
}

bool VictoryMenu::init( bool victory, int scores, int stars )
{
	do
	{
		CC_BREAK_IF( !NodeExt::init() );

		auto listener = EventListenerKeyboard::create();
		listener->onKeyReleased = CC_CALLBACK_2(VictoryMenu::onKeyReleased, this);
		_eventDispatcher->addEventListenerWithSceneGraphPriority(listener, this);
		
		std::string ini = victory? "victory.xml" : "defeat.xml";
		NodeExt::load( "ini/gamescene", ini );

		auto menu = getChildByPath( "menu" );
		auto close = menu?menu->getChildByName<MenuItem*>( "close" ) : nullptr;
		auto restart = menu?menu->getChildByName<MenuItem*>( "restart" ) : nullptr;
		auto cost = restart?restart->getChildByName<Label*>( "normal" ) : nullptr;
        cost = cost?cost->getChildByName<Label*>( "cost" ) : nullptr;

		if( menu )
		{
			if( close ) close->setCallback( CC_CALLBACK_1( VictoryMenu::cb_close, this ) );
			if( restart ) restart->setCallback( CC_CALLBACK_1( VictoryMenu::cb_restart, this ) );
		}
		if( cost )
		{
			int index = GameGS::getInstance( )->getGameBoard( ).getCurrentLevelIndex( );
			GameMode mode = GameGS::getInstance()->getGameBoard().getGameMode();
			int value = LevelParams::shared().getFuel( index, GameMode::hard == mode );
			cost->setString( intToStr( value ) );
		}

		auto starnode = getChildByName( "star" + intToStr( stars ) );
		if( starnode ) starnode->setVisible( true );

		auto label = dynamic_cast<Label*>(getChildByPath( "score/value" ));
		if( label )
		{
			label->setString( "0" );
			auto action = ActionText::create( 1, scores );
			label->runAction( action );
		}

		auto dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
		auto size = getContentSize();
		float sx = std::min<float>( 1, dessize.width / size.width );
		float sy = std::min<float>( 1, dessize.height / size.height );
		float s = std::min( sx, sy );
		setScale( s );

		runEvent( "run" );
		
		auto scene = Director::getInstance()->getRunningScene();
		auto scores = scene->getChildByName("scoreslayer");
		if(!scores)
		{
			auto scores = ScoreLayer::create();
			scores->setName("scoreslayer");
			scene->addChild(scores, 999);
		}
        
        if (k::configuration::useFuel) {
            auto restart_text = this->getChildByPath("menu/restart/normal/restart_text");
            if (restart_text) {
                restart_text->setPositionY(restart_text->getPositionY() + 14.f);
            }
            auto restart_fuel_icon = this->getChildByPath("menu/restart/normal/icon");
            if (restart_fuel_icon) restart_fuel_icon->setVisible(true);
            auto restart_fuel_cost = this->getChildByPath("menu/restart/normal/cost");
            if (restart_fuel_cost) restart_fuel_cost->setVisible(true);
        }


		return true;
	}
	while( false );
	return false;
}

void VictoryMenu::cb_restart( Ref* )
{
	int index = GameGS::getInstance( )->getGameBoard( ).getCurrentLevelIndex( );
	GameMode mode = GameGS::getInstance()->getGameBoard().getGameMode();
	int cost = LevelParams::shared().getFuel( index, GameMode::hard == mode );
	int fuel = ScoreCounter::shared( ).getMoney( kScoreFuel );
	if( cost <= fuel )
	{
		restart();
	}
	else
	{
#if PC != 1
		auto shop = ShopLayer::create(k::configuration::useFreeFuel, false, false, false);
		if( shop )
		{
			auto scene = Director::getInstance()->getRunningScene();
			auto smartscene = dynamic_cast<SmartScene*>(scene);
			assert(smartscene);
			smartscene->pushLayer(shop, true);
		}
#endif
	}
	
}

void VictoryMenu::cb_close( Ref* )
{
	close();
}

void VictoryMenu::restart( )
{
	auto scene = Director::getInstance()->getRunningScene();
	auto scores = scene->getChildByName("scoreslayer");
	if(scores)
	{
		scores->removeFromParent();
	}

	removeFromParent( );
	GameGS::restartLevel( );
}

void VictoryMenu::close()
{
	auto scene = Director::getInstance()->getRunningScene();
	auto scores = scene->getChildByName("scoreslayer");
	if(scores)
	{
		scores->removeFromParent();
	}

	Director::getInstance()->popScene();
}

void VictoryMenu::onKeyReleased( EventKeyboard::KeyCode keyCode, Event* event )
{
	if( keyCode == EventKeyboard::KeyCode::KEY_BACK )
		close();
}



NS_CC_END
