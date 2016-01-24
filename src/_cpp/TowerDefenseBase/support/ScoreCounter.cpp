//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "ScoreCounter.h"
#include "GameGS.h"
#include "consts.h"
#include "resources.h"
#include "UserData.h"
#include <ctime>
#include "Log.h"
#include "configuration.h"

NS_CC_BEGIN;


ScoreCounter::ScoreCounter( void )
{}

void ScoreCounter::onCreate()
{
	for( unsigned i = 0; i<6; ++i )
	{
		std::string s( kUser_Scores_suffix );
		s += intToStr( i );
		int score = UserData::shared().get_int( s, 0 );
		if( score > 0 )
			addMoney( i, score, false );
	}
}

ScoreCounter::~ScoreCounter( void )
{}

void ScoreCounter::change( int id, int value, bool saveValueToUserData )
{
	auto i = m_scores.find( id );
	if( i == m_scores.end() )
	{
		i = m_scores.insert( std::pair<unsigned, int>( id, 0 ) ).first;
	}
	assert( i != m_scores.end() );
	i->second += value;
	auto& observer = this->observer( id );
	observer.pushevent( i->second );

	if( saveValueToUserData )
	{
		std::string s( kUser_Scores_suffix );
		s += intToStr( id );
		UserData::shared().write( s.c_str(), i->second );
	}
}

void ScoreCounter::setMoney( int id, int value, bool saveValueToUserData )
{
	int current = getMoney( id );
	addMoney( id, -current + value, saveValueToUserData );
}

void ScoreCounter::addMoney( int id, int value, bool saveValueToUserData )
{
	change( id, value, saveValueToUserData );
}

void ScoreCounter::subMoney( int id, int value, bool saveValueToUserData )
{
	change( id, -value, saveValueToUserData );
}

int ScoreCounter::getMoney( int id )const
{
	//return 9999;

	auto i = m_scores.find( id );
	if( i != m_scores.end() )
		return i->second;
	else
		return 0;
}

ScoreCounter::Observer_OnChangeScore& ScoreCounter::observer( int id )
{
	return _onChangeScores[id];
}

/***************************************************************/

ScoreByTime::ScoreByTime()
: _timer( 0 )
, _time( 0 )
, _interval( 60 )
, _max( 10 )
{
	__log_line( "" );
	ScoreCounter::shared().observer( kScoreTime ).add( _ID, std::bind( &ScoreByTime::changeTime, this, std::placeholders::_1 ) );
	ScoreCounter::shared().observer( kScoreFuel ).add( _ID, std::bind( &ScoreByTime::changeFuel, this, std::placeholders::_1 ) );
}

ScoreByTime::~ScoreByTime()
{
	__log_line( "" );
	savetime();
}

void ScoreByTime::onCreate()
{
	__log_line( "" );
	pugi::xml_document doc;
	doc.load_file( "ini/fuel.xml" );
	auto root = doc.root().first_child();
	_max = root.child( "max" ).attribute( "value" ).as_int();
	_interval = root.child( "delay" ).attribute( "value" ).as_int();

	log( "ScoreByTime::_max = [%d]", _max );
	log( "ScoreByTime::_interval = [%d]", _interval );

	Director::getInstance()->getScheduler()->schedule( std::bind( &ScoreByTime::update, this, std::placeholders::_1 ), this, 1, false, "scorebytime" );

	checkMaxValue();
	checktime();
}

void ScoreByTime::checkMaxValue( )
{	
	_max = UserData::shared( ).get_int( k::user::MaxFuelValue, _max );
}

void ScoreByTime::checktime()
{
	__log_line( "" );
	auto times = UserData::shared().get_str( "score_timer" );
	if( times.empty() == false )
	{
		struct tm last;
		sscanf( times.c_str(), "%d-%d-%d-%d", &last.tm_sec, &last.tm_min, &last.tm_hour, &last.tm_yday );
		time_t time = ::time( 0 );
		struct tm now = *localtime( &time );
		long long last_sec =
			last.tm_sec +
			last.tm_min * 60 +
			last.tm_hour * 60 * 60 +
			last.tm_yday * 60 * 60 * 24;
		long long now_sec =
			now.tm_sec +
			now.tm_min * 60 +
			now.tm_hour * 60 * 60 +
			now.tm_yday * 60 * 60 * 24;
		long long diff = now_sec - last_sec;
		__log_line( "" );
		ScoreCounter::shared().subMoney( kScoreTime, diff, true );
		__log_line( "ok0" );
	}
	else
	{
		ScoreCounter::shared().setMoney( kScoreTime, _interval, true );
		ScoreCounter::shared().setMoney( kScoreFuel, _max, true );
	}
	savetime();
}

int ScoreByTime::gettime()const
{
	return 0;
}

int ScoreByTime::getinterval()const
{
	return 0;
}

void ScoreByTime::update( float dt )
{
	__log_line( "" );
	if( ScoreCounter::shared().getMoney( kScoreFuel ) >= _max )
	{
		__log_line( "" );
		ScoreCounter::shared().setMoney( kScoreTime, _interval, true );
		savetime();
	}
	_timer += dt;
	if( _timer > 1.f )
	{
		_timer -= 1.f;
		ScoreCounter::shared().subMoney( kScoreTime, 1, true );
	}
}

void ScoreByTime::changeTime( int score )
{
	if( score <= 0 )
	{
		int addfuel = (-score) / ( _interval == 0 ? 1 : _interval) + 1;
		int addtime = addfuel * _interval;

		if( addtime > 0 )
			ScoreCounter::shared().addMoney( kScoreTime, addtime, true );

		int fuel = ScoreCounter::shared().getMoney( kScoreFuel );
		int nfuel = fuel + addfuel;
		if( nfuel > _max ) addfuel = _max - fuel;
		addfuel = std::max( addfuel, 0 );
		if( addfuel > 0 )
			ScoreCounter::shared().addMoney( kScoreFuel, addfuel, true );
		savetime();
	}
}

void ScoreByTime::changeFuel( int score )
{

}

void ScoreByTime::savetime()
{
	__log_line( "" );
	char buf[128];
	time_t time = ::time( 0 );
	struct tm now = *localtime( &time );
	sprintf( buf, "%d-%d-%d-%d", now.tm_sec, now.tm_min, now.tm_hour, now.tm_yday );
	UserData::shared().write( "score_timer", std::string(buf) );
}


void LevelParams::onCreate()
{
	loadRealParams();
	loadLevelParams();

	const char * key = "award_was_obtained_for_real_default";
	if( UserData::shared().get_int( key ) == 0 )
	{
		ScoreCounter::shared().addMoney( kScoreCrystals, _goldOnFirstRun, true );
		UserData::shared().write( key, 1 );
	}
}

void LevelParams::loadRealParams()
{
	pugi::xml_document doc;
	doc.load_file( "ini/realgold.xml" );
	auto root = doc.root().first_child();
	_goldOnFirstRun = root.child( "default" ).attribute( "value" ).as_int();
}

void LevelParams::loadLevelParams()
{
	pugi::xml_document doc;
	doc.load_file( "ini/levels.xml" );
	auto root = doc.root().first_child();

	int i = 0;
	pugi::xml_node node;
	do
	{
		std::string tag = "level_" + intToStr( i + 1 );
		node = root.child( tag.c_str() );
		if( !node )
			break;
		_params[i].normal.stars.resize( 3 );
		_params[i].normal.stars[0] = node.attribute( "star1" ).as_int( 1 );
		_params[i].normal.stars[1] = node.attribute( "star2" ).as_int( 1 );
		_params[i].normal.stars[2] = node.attribute( "star3" ).as_int( 1 );
		
		_params[i].hard.award = node.attribute( "starhard" ).as_int( 0 );
		_params[i].hard.stars = node.attribute( "starshard" ).as_int( 0 );
		_params[i].hard.exclude = node.attribute( "excludetext" ).as_string();
	
		if( k::configuration::useFuel )
		{
			_params[i].normal.fuel = node.attribute( "fuel" ).as_int( 1 );
			_params[i].hard.fuel = node.attribute( "fuelhard" ).as_int( 1 );
		}
		else
		{
			_params[i].normal.fuel = 0;
			_params[i].hard.fuel = 0;
		}

		parceLevel( i );
	}
	while( ++i );
}

void LevelParams::parceLevel(int index)
{
	pugi::xml_document doc;
	doc.load_file( (kDirectoryToMaps + intToStr( index ) + ".xml").c_str() );
	auto root = doc.root().first_child();
	
	auto waveN = root.child( k::xmlTag::LevelWaves );
	auto waveH = root.child( k::xmlTag::LevelWavesHard );
	auto normal = root.child( k::xmlTag::LevelParams );
	auto hard = root.child( k::xmlTag::LevelParamsHard );
	if( !normal ) normal = root;

	_params[index].normal.gear = normal.attribute( "startscore" ).as_int();
	_params[index].hard.gear = hard.attribute( "startscore" ).as_int();
	_params[index].normal.lifes = normal.attribute( "healths" ).as_int();
	_params[index].hard.lifes = hard.attribute( "healths" ).as_int();
	_params[index].normal.exclude = normal.attribute( "exclude" ).as_string();

	_params[index].normal.waves = 0;
	_params[index].hard.waves = 0;
	FOR_EACHXML( waveN, wave ) { _params[index].normal.waves++; }
	FOR_EACHXML( waveH, wave ) { _params[index].hard.waves++; }
}

int LevelParams::getMaxStars( int level, bool forhard )const
{
	auto iter = _params.find( level );
	if( iter != _params.end() )
	{
		if( forhard == false )
		{
			return iter->second.normal.stars.size();
		}
		else
		{
			return iter->second.hard.stars;
		}
	}
	else
	{
		cocos2d::MessageBox(
			("Sorry, I have not award for level [" + intToStr( level ) + "]").c_str(),
			"Error" );
	}
	return 0;
}

int LevelParams::getAwardGold( int levelIndex, int stars, bool forhard )const
{
	auto iter = _params.find( levelIndex );
	if( iter != _params.end() )
	{
		return forhard ?
			(stars > 0 ? iter->second.hard.award : 0 ):
			(stars > 0 ? iter->second.normal.stars[stars - 1] : 0);
	}
	else
	{
		cocos2d::MessageBox(
			("Sorry, I have not award for level [" + intToStr( levelIndex ) + "]").c_str(),
			"Error" );
	}
	return 0;
}

int LevelParams::getFuel( int levelIndex, bool forhard )const
{
	auto iter = _params.find( levelIndex );
	if( iter != _params.end() )
	{
		return forhard ? 
			iter->second.hard.fuel:
			iter->second.normal.fuel;
	}
	else
	{
		cocos2d::MessageBox(
			("Sorry, I have not fuel for level [" + intToStr( levelIndex ) + "]").c_str(),
			"Error" );
	}
	return 0;
}

int LevelParams::getStartGear( int level, bool forhard )const
{
	return forhard ?
		_params.at( level ).hard.gear :
		_params.at( level ).normal.gear;
}

int LevelParams::getWaveCount( int level, bool forhard )const
{
	return forhard ?
		_params.at( level ).hard.waves :
		_params.at( level ).normal.waves;
}

int LevelParams::getLives( int level, bool forhard )const
{
	return forhard ?
		_params.at( level ).hard.lifes :
		_params.at( level ).normal.lifes;
}

std::string LevelParams::getExclude( int level, bool forhard )const
{
	return forhard ?
		_params.at( level ).hard.exclude :
		_params.at( level ).normal.exclude;
}

void LevelParams::onLevelStarted( int levelIndex )
{
	GameMode mode = GameGS::getInstance()->getGameBoard().getGameMode();
	int count = getFuel( levelIndex, GameMode::hard == mode );
	ScoreCounter::shared().subMoney( kScoreFuel, count, true );
	UserData::shared().save();
}

void LevelParams::onLevelFinished( int index, int stars )
{
	GameMode mode = GameGS::getInstance()->getGameBoard().getGameMode();
	int award = getAwardGold( index, stars, GameMode::hard == mode );
	ScoreCounter::shared().addMoney( kScoreCrystals, award, true );

	if( stars > 0 )
	{
		if( mode == GameMode::hard )
			stars = getMaxStars( index, false ) + getMaxStars( index, true );
		int obtained = UserData::shared().get_int( k::user::LevelStars + intToStr( index ) );
		int diff = std::max( 0, stars - obtained );
		ScoreCounter::shared().addMoney( kScoreStars, diff, true );
		int all = diff;
		all += UserData::shared().get_int( k::user::LevelStars + intToStr( index ) );
		UserData::shared().write( k::user::LevelStars + intToStr( index ), all );
	}
	UserData::shared().save();
}

NS_CC_END;