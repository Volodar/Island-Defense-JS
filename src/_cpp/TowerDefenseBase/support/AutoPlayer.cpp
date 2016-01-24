#include "AutoPlayer.h"
#include "MapLayer.h"
#include "GameGS.h"
#include "ScoreCounter.h"
#include "tower.h"
#include "UserData.h"
NS_CC_BEGIN


#define SCHEDULE(func, interval) Director::getInstance()->getScheduler()->scheduleSelector( schedule_selector( AutoPlayer::func ), this, interval, false )
#define UNSCHEDULE() Director::getInstance()->getScheduler()->unscheduleAllForTarget( this )
MapLayer* getMap()
{
	auto scene = Director::getInstance()->getRunningScene();
	auto node = scene->getChildByName( "maplayer" );
	return dynamic_cast<MapLayer*>(node);
}

GameGS* getGame()
{
	auto scene = Director::getInstance()->getRunningScene();
	auto node = scene->getChildByName( "gamelayer" );
	return dynamic_cast<GameGS*>(node);
}

AutoPlayer*inst( nullptr );

AutoPlayer::AutoPlayer()
: _mode(GameMode::normal)
{
	inst = this;
}

AutoPlayer::~AutoPlayer( )
{
	inst = nullptr;
}

AutoPlayer* AutoPlayer::getInstance()
{
	return inst;
}

bool AutoPlayer::init( bool runCurrentLevel, bool onlyOnceLevel, float rate, bool withoutDefeat )
{
	time_t t;
	time( &t );
	srand( t );

	_runCurrentLevel = runCurrentLevel;
	_onlyOnceLevel = onlyOnceLevel;
	_withoutDefeat = withoutDefeat;

	_currentLevel = runCurrentLevel ? getMap()->_selectedLevelIndex : 0;
	if( _currentLevel == -1 )
		_currentLevel = 0;

	Director::getInstance()->setTimeRate( rate );

	SCHEDULE( state_selectLevel, 1 );
	
	return true;
}

void AutoPlayer::state_selectLevel( float dt )
{
	if( getMap() )
	{
		_currentTowerForBuild = "";
		ScoreCounter::shared().setMoney( kScoreFuel, 100, false );
		getMap()->runLevel( _currentLevel, _mode );
		UNSCHEDULE();
		SCHEDULE( state_waitLoading, 1 );
	}
}

void AutoPlayer::state_waitLoading( float dt )
{
	if( getGame() )
	{
		UNSCHEDULE();
		SCHEDULE( state_play, 1.5f );
	}
}

void AutoPlayer::state_play( float dt )
{
	if( !GameGS::getInstance() )
	{
		UNSCHEDULE();
		release();
		return;
	}
	if( GameGS::getInstance()->getGameBoard().checkGameFinished() )
	{
		UNSCHEDULE();
		SCHEDULE( state_victory, 1 );
		return;
	}

	if( GameGS::getInstance()->getGameBoard().isGameStarted() == false )
	{
		int score = ScoreCounter::shared().getMoney( kScoreLevel );
		ScoreCounter::shared().addMoney( kScoreLevel, score / 2, false );

		if( _withoutDefeat )
			ScoreCounter::shared().setMoney( kScoreHealth, 99999, false );
	}

	auto icon = getNodeByPath<WaveIcon>( GameGS::getInstance(), "interface/waveicon" );
	bool click = GameGS::getInstance()->getGameBoard().isGameStarted() == false;
	if( icon )
	{
		click = click || icon->_elapsed > icon->_duration / 2.5;
	}
	if( click && icon )
	{
		icon->on_click( nullptr );
	}

	auto places = GameGS::getInstance()->getTowerPlaces();
	int scores = ScoreCounter::shared().getMoney( kScoreLevel );
	if( places.empty() == false )
	{
		if( _currentTowerForBuild.empty() )
		{
			while( true )
			{
				std::list<std::string> towers;
				mlTowersInfo::shared().fetch( towers );
				int index = rand() % towers.size();
				while( index-- )
					towers.pop_front();
				_currentTowerForBuild = towers.front();
				if( _previuosTowerForBuild != _currentTowerForBuild && _previuosTowerForBuild2 != _currentTowerForBuild )
					break;
			}
		}

		int cost = mlTowersInfo::shared().getCost( _currentTowerForBuild, 1 );
		if( cost <= scores )
		{
			TowerPlace::Pointer place;
			int min( 0 );
			float min_d( 9999999 );
			auto decorations = GameGS::getInstance()->getDecorations( "base_point" );
			if( decorations.empty() == false )
			{
				auto decor = decorations[rand() % decorations.size()];
				int index( 0 );
				for( auto place : places )
				{
					float d = place->getPosition().getDistance( decor->getPosition() );
					if( d < min_d )
					{
						min_d = d;
						min = index;
					}
					++index;
				}
				place = places[min];
			}
			else
			{
				int index = rand() % places.size();
				place = places[index];
			}


			if( place )
			{
				GameGS::getInstance()->setSelectedTowerPlaces( place );
				_towers.push_back( GameGS::getInstance()->getGameBoard().createTower( _currentTowerForBuild ) );
				_previuosTowerForBuild2 = _previuosTowerForBuild;
				_previuosTowerForBuild = _currentTowerForBuild;
				_currentTowerForBuild.clear();
			}
		}
	}
	else if( _towers.empty() == false )
	{
		auto towerForUpgrade = _towers[rand() % _towers.size()];

		int level = towerForUpgrade->getLevel();
		int cost = mlTowersInfo::shared().getCost( towerForUpgrade->getName(), level + 1 );
		if( cost <= scores )
		{
			auto tower = GameGS::getInstance()->getGameBoard().upgradeTower( towerForUpgrade );
			if( tower )
			{
				_towerUpgraded.push_back( tower );
				auto iter = std::find( _towers.begin(), _towers.end(), towerForUpgrade );
				if( iter != _towers.end() )
					_towers.erase( iter );
			}
		}

		if( _towers.empty() )
		{
			_towers = _towerUpgraded;
			_towerUpgraded.clear();
		}
	}
}

void AutoPlayer::state_victory( float dt )
{
	if( ScoreCounter::shared().getMoney( kScoreHealth ) > 0 )
		++_currentLevel;
	
	_currentTowerForBuild.clear();
	_previuosTowerForBuild.clear();
	_previuosTowerForBuild2.clear();
	_towers.clear();
	_towerUpgraded.clear();

	Director::getInstance()->popScene();
	UNSCHEDULE();
	SCHEDULE( state_waitMap, 1 );
}

void AutoPlayer::state_waitMap( float dt )
{
	if( getMap() )
	{
		UNSCHEDULE();
		SCHEDULE( state_loop, 1 );
	}
}

void AutoPlayer::state_loop( float dt )
{
	UNSCHEDULE();
	if( !_onlyOnceLevel )
	{
		SCHEDULE( state_selectLevel, 1 );
	}
	else
	{
		release();
	}
}

#undef SCHEDULE
#undef UNSCHEDULE

NS_CC_END