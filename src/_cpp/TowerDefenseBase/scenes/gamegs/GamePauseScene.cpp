//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "GameGS.h"
#include "GamePauseScene.h"
#include "consts.h"
#include "MenuItemTextBG.h"
#include "ml/ScrollMenu.h"
#include "gameboard.h"
#include "ml/Audio/AudioEngine.h"
#include "ml/Audio/AudioMenu.h"
#include "resources.h"
#include "ml/Language.h"
#include "ScoreCounter.h"
#include "ml/SmartScene.h"
#include "ShopLayer.h"
#include "ScoreLayer.h"
#include "configuration.h"
#include "MenuItemWithText.h"
#include "UserData.h"

NS_CC_BEGIN;

//const int zOrderBG( -10 );
//const int zOrderShadow( 0 );
//const int zOrderLabels( 10 );
//const int zOrderMenu( 20 );
//const int zOrderOptins( 30 );

float kFadeDuration( 0.2f );

class DialogRestartGame : public LayerExt
{
	DECLARE_BUILDER( DialogRestartGame );
	bool init()
	{
		LayerExt::init();
		load( "ini/maings/dialogclosegame.xml" );
		return true;
	}
	ccMenuCallback get_callback_by_description( const std::string & name )
	{
		if( name == "yes" ) return std::bind( []( Ref* ){ Director::getInstance()->end(); }, std::placeholders::_1 );
		if( name == "no" ) return std::bind( [this]( Ref* ){ removeFromParent(); }, std::placeholders::_1 );
		return LayerExt::get_callback_by_description( name );
	}
};
DialogRestartGame::DialogRestartGame() {}
DialogRestartGame::~DialogRestartGame() {}

GamePauseLayer::GamePauseLayer()
: _scaleFactor( 1 )
{
};

bool GamePauseLayer::init( const std::string& path, bool showScores )
{
	do
	{
		Size desSize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
		CC_BREAK_IF( !Menu::init() );
		setPosition( Point( desSize / 2 ) );
		setContentSize( Size::ZERO );
		setKeyboardEnabled( true );
		_showScores = showScores;

		load( path );

		_resume = getChildByName<MenuItem*>( "resume" );
		_restart = getChildByName<MenuItem*>( "restart" );
		_quit = getChildByName<MenuItem*>( "quit" );
		_store = getChildByName<MenuItem*>( "store" );
		_music_on = getChildByName<MenuItem*>( "music_on" );
		_music_off = getChildByName<MenuItem*>( "music_off" );
		_sound_on = getChildByName<MenuItem*>( "sound_on" );
		_sound_off = getChildByName<MenuItem*>( "sound_off" );
        
//        auto bL = getChildByName("restart");
//        if (bL) {
//            ((MenuItemImageWithText *)bL)->setFont2(kFontStroke);
//            ((MenuItemImageWithText *)bL)->setText2(WORD("restart"));
//            auto text2 = (Label *)bL->getChildByName("normal")->getChildByName("text2");
//            if (text2) {
//                text2->setPositionY( 58.f );
//                text2->setScale( 0.45f );
//            }
//        }

		auto cost = _restart?_restart->getChildByName<Label*>( "normal" ) : nullptr;
        cost = cost?cost->getChildByName<Label*>( "cost" ) : nullptr;

		if( cost )
		{
			int index = GameGS::getInstance()->getGameBoard().getCurrentLevelIndex();
			GameMode mode = GameGS::getInstance()->getGameBoard().getGameMode();
			int value = LevelParams::shared().getFuel( index, mode == GameMode::hard );
			cost->setString(intToStr(value));
		}


		auto bg = getChildByName( "bg" );
		if( bg )
		{
			auto size = bg->getContentSize();
			float sx = std::min<float>( 1, desSize.width / size.width );
			float sy = std::min<float>( 1, desSize.height / size.height );
			float s = std::min<float>( sx, sy );
			s = std::min<float>( 1, s );
			_scaleFactor = s;
		}
        
        if (k::configuration::useFuel) {
            auto restart_text = this->getChildByPath("restart/normal/restart_text");
            if (restart_text) {
                restart_text->setPositionY(restart_text->getPositionY() + 14.f);
            }
            auto restart_fuel_icon = this->getChildByPath("restart/normal/icon");
            if (restart_fuel_icon) restart_fuel_icon->setVisible(true);
            auto restart_fuel_cost = this->getChildByPath("restart/normal/cost");
            if (restart_fuel_cost) restart_fuel_cost->setVisible(true);
        }

		setOpacity( 0 );
		fadeenter();
		checkAudio();
		checkFullscreen();

		return true;
	}
	while( false );
	return false;
}

GamePauseLayer::~GamePauseLayer()
{
	removeAllChildrenWithCleanup( true );
	//Director::getInstance()->getTextureCache()->removeUnusedTextures();
};

void GamePauseLayer::onEnter()
{
	Menu::onEnter();
	setKeyboardEnabled( true );
	AudioEngine::shared().playEffect( kSoundGamePauseOn );

	if( _showScores )
	{
		auto scene = Director::getInstance()->getRunningScene();
		auto scores = scene->getChildByName( "scorelayer" );
		if( !scores )
		{
			auto scores = ScoreLayer::create();
			scene->addChild( scores, 999 );
		}
	}
	if( _resume ) _resume->setEnabled( true );
	if( _restart ) _restart->setEnabled( true );
}

void GamePauseLayer::onKeyReleased( EventKeyboard::KeyCode keyCode, Event* event )
{
	if( keyCode == EventKeyboard::KeyCode::KEY_BACK )
		cb_resume( nullptr );
}

ccMenuCallback GamePauseLayer::get_callback_by_description( const std::string & name )
{
	if( name == "resume" ) return CC_CALLBACK_1( GamePauseLayer::cb_resume, this );
	if( name == "restart" ) return CC_CALLBACK_1( GamePauseLayer::cb_restart, this );
	if( name == "quit" ) return CC_CALLBACK_1( GamePauseLayer::cb_exit, this );
	if( name == "music_on" ) return CC_CALLBACK_1( GamePauseLayer::cb_music, this, false );
	if( name == "music_off" ) return CC_CALLBACK_1( GamePauseLayer::cb_music, this, true );
	if( name == "sound_on" ) return CC_CALLBACK_1( GamePauseLayer::cb_sound, this, false );
	if( name == "sound_off" ) return CC_CALLBACK_1( GamePauseLayer::cb_sound, this, true );
	if( name == "fullscreen" )
	{
		auto cb = [this]( Ref*sender )
		{
			auto fullscreen = !UserData::shared().get_bool( "fullscreen", true );
			UserData::shared().write( "fullscreen", fullscreen );
			checkFullscreen();

			auto layer = DialogRestartGame::create();
			auto scene = static_cast<SmartScene*>(getScene());
			scene->pushLayer( layer, true );
		};
		return std::bind( cb, std::placeholders::_1 );
	}
	return nullptr;
}

void GamePauseLayer::cb_resume( Ref*sender )
{
	auto func = CallFunc::create( std::bind( &GamePauseLayer::gameresume, this ) );
	runAction( Sequence::create( DelayTime::create( kFadeDuration ), func, nullptr ) );
	fadeexit();
}

void GamePauseLayer::cb_restart( Ref*sender )
{
	int index = GameGS::getInstance( )->getGameBoard( ).getCurrentLevelIndex( );
	GameMode mode = GameGS::getInstance()->getGameBoard().getGameMode();
	int cost = LevelParams::shared().getFuel( index, GameMode::hard == mode );
	int fuel = ScoreCounter::shared( ).getMoney( kScoreFuel );
	if( cost <= fuel )
	{
		auto delay = DelayTime::create( kFadeDuration );
		auto func = CallFunc::create( std::bind( &GamePauseLayer::restart, this ) );
		runAction( Sequence::create( delay, func, nullptr ) );
		fadeexit();
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
	if( _resume ) _resume->setEnabled( false );
	if( _restart ) _restart->setEnabled( false );
}

void GamePauseLayer::cb_exit( Ref*sender )
{
	auto delay = DelayTime::create( kFadeDuration );
	auto func = CallFunc::create( std::bind( &GamePauseLayer::exit, this ) );
	runAction( Sequence::create( delay, func, nullptr ) );
	fadeexit();

	if( _resume ) _resume->setEnabled( false );
	if( _restart ) _restart->setEnabled( false );
}

void GamePauseLayer::cb_sound( Ref*sender, bool enabled )
{
	AudioEngine::shared().soundEnabled(enabled);
	checkAudio();
}

void GamePauseLayer::cb_music( Ref*sender, bool enabled )
{
	AudioEngine::shared().musicEnabled(enabled);
	checkAudio();
}

void GamePauseLayer::checkAudio()
{
	bool s = AudioEngine::shared().isSoundEnabled();
	bool m = AudioEngine::shared().isMusicEnabled();
	if( _sound_off )_sound_off->setVisible( !s );
	if( _sound_on  )_sound_on->setVisible( s );
	if( _music_off )_music_off->setVisible( !m );
	if( _music_on )_music_on->setVisible( m );
}

void GamePauseLayer::gameresume()
{
	AudioEngine::shared().resumeAllEffects();
	setEnabled( false );
	removeFromParent();
}

void GamePauseLayer::restart()
{
	setEnabled( false );
	removeFromParent();
	GameGS::restartLevel();
}

void GamePauseLayer::exit()
{
	setEnabled( false );
	Director::getInstance()->popScene();
	removeFromParent();
}

void GamePauseLayer::shop_did_closed()
{
	setEnabled( true );
}

void GamePauseLayer::fadeexit()
{
	auto scene = Director::getInstance()->getRunningScene();
	auto scores = scene->getChildByName("scorelayer");
	if(scores)
	{
		scores->removeFromParent();
	}

	runAction( ScaleTo::create( kFadeDuration, _scaleFactor * 1.2f ) );
	runAction( FadeTo::create( kFadeDuration, 0 ) );
}

void GamePauseLayer::fadeenter()
{
	setScale( _scaleFactor * 1.2f );
	runAction( ScaleTo::create( kFadeDuration, _scaleFactor * 1.f ) );
	runAction( FadeTo::create( kFadeDuration, 255 ) );
}

void GamePauseLayer::checkFullscreen()
{
	auto fullscreen = UserData::shared().get_bool( "fullscreen", true );
	auto item = getNodeByPath<mlMenuItem>( this, "fullscreen" );
	if( item )
	{
		auto on = item->getParamCollection().get( "on", "" );
		auto off = item->getParamCollection().get( "off", "" );
		item->setImageNormal( fullscreen ? on : off );
	}
}

NS_CC_END;
