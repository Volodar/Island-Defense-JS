#include "ml/AStar.h"
#include "Hero.h"
#include "GameGS.h"
#include "support.h"
#include "ml/pugixml/pugixml.hpp"
#include "UserData.h"
#include "consts.h"
#include "Achievements.h"
#include "configuration.h"
NS_CC_BEGIN


bool HeroExp::isHeroAvailabled( const std::string& name )const
{
	return UserData::shared().get_bool( k::user::HeroBought + name );
}

bool HeroExp::isHeroAsInapp( const std::string& name )
{
	auto iter = _heroInappDetails.find( name );
	return iter != _heroInappDetails.end();
}

unsigned HeroExp::getLevelForUnlockHero( const std::string& name )
{
	auto iter = _levelsForUnclockHeroes.find( name );
	return iter != _levelsForUnclockHeroes.end() ? iter->second : 0;
}

void HeroExp::heroBought( const std::string& name )const
{
	if( UserData::shared().get_bool( k::user::HeroBought + name) == false )
	{
		UserData::shared().write( k::user::HeroBought + name, true );
		Achievements::shared().process( "heroes_open", 1 );
	}
}

inapp::SkuDetails HeroExp::getHeroSkuDetails( const std::string& name )
{
	if( _heroInappDetails[name].result != inapp::Result::Ok )
	{
		auto callback = [this, name]( inapp::SkuDetails details )
		{
			if( details.result == inapp::Result::Ok )
			{
				_heroInappDetails[name] = details;
			}
		};
		if( k::configuration::useHeroRoom )
		{
			inapp::details( _heroInappDetails[name].productId, std::bind( callback, std::placeholders::_1 ) );
		}
	}
	
	
	inapp::SkuDetails dummy;
	dummy.result = inapp::Result::Fail;
	if( _heroInappDetails.find( name ) == _heroInappDetails.end() )
		return dummy;
	return _heroInappDetails.at( name );
}

void HeroExp::setEXP( const std::string & name, float exp )
{
	assert( (exp >= 0) && (exp <= 10E+10) );
	float currEXP = getEXP( name );
	int curr = getLevel( currEXP );
	int next = getLevel( exp );
	for( int i = curr; i < next; ++i )
	{
		std::string key = "herolevel_" + intToStr( i + 1 );
		if( UserData::shared().get_bool( key + name ) == false )
		{
			Achievements::shared().process( key, 1 );
		}
	}
	UserData::shared().write( k::user::HeroExp + name, exp );
}

float HeroExp::getEXP( const std::string & name )
{
	return UserData::shared().get_float( k::user::HeroExp + name );
}

float HeroExp::getLevel( float exp )const
{
	float level( 0 );
	float diff( 0 );
	float prev( 0 );
	for( size_t i = 0; i < _heroLevels.size(); ++i )
	{
		diff = (i < (_heroLevels.size() - 1)) ? _heroLevels[i + 1] - _heroLevels[i] : 0.f;
		if( exp < _heroLevels[i] )
			break;
		prev = _heroLevels[i];
		++level;
	}
	level += diff != 0 ? (exp - prev) / diff : 0;
	return level;
}

float HeroExp::getExpOnLevelFinished( unsigned level )const
{
	return _levelAwards[level];
}

float HeroExp::getHeroLevelExtValue( unsigned level )const
{
	return _heroLevels[level];
}

float HeroExp::getCostLevelup( unsigned level )const
{
	return _levelCosts[level];
}

unsigned HeroExp::getMaxLevel()const
{
	return static_cast<unsigned>(_heroLevels.size());
}

void HeroExp::skills( const std::string& name, std::vector<unsigned> & skills )
{
	skills = _skills[name];
}

unsigned HeroExp::skillPoints( const std::string& name )
{
	//return UserData::shared().get_int( k::user::HeroSkillPoints + name );
	int points = getLevel( getEXP( name ) );
	std::vector<unsigned> skills;
	this->skills( name, skills );
	for( auto skill : skills )
		points -= skill;
	assert( points >= 0 );
	return static_cast<unsigned>(points);
}

void HeroExp::setSkills( const std::string& name, const std::vector<unsigned> & skills )
{
	_skills[name] = skills;

	int index = 0;
	for( int skill : skills )
	{
		std::string key = k::user::HeroSkillPoints + name + intToStr( index );
		UserData::shared().write( key, skill );
		++index;
	}
}

void HeroExp::checkUnlockedHeroes()
{
	int passed = UserData::shared().level_getCountPassed();
	for( auto pair : _levelsForUnclockHeroes )
	{
		auto hero = pair.first;
		auto level = pair.second;
		if( isHeroAvailabled( hero ) == false && level <= passed )
		{
			heroBought( hero );
		}
	}
}

void HeroExp::onCreate()
{
	pugi::xml_document doc;
	doc.load_file( "ini/herolevels.xml" );
	auto xmlexp = doc.root().first_child().child( "exp" );
	auto xmllevels = doc.root().first_child().child( "levels" );
	auto xmlcosts = doc.root().first_child().child( "upgradecost" );
	auto xmlHeroCosts = doc.root().first_child().child( "heroesparams" );
	FOR_EACHXML( xmlexp, child )
	{
		float exp = child.attribute( "exp" ).as_float();
		_heroLevels.push_back( exp );
	}
	FOR_EACHXML( xmllevels, child )
	{
		float exp = child.attribute( "exp" ).as_float();
		_levelAwards.push_back( exp );
	}
	FOR_EACHXML( xmlcosts, child )
	{
		float exp = child.attribute( "exp" ).as_float();
		_levelCosts.push_back( exp );
	}
	FOR_EACHXML( xmlHeroCosts, child )
	{
		std::string name = child.attribute( "name" ).as_string();
		std::string productid = child.attribute( "productid" ).as_string();
		unsigned levelforunlock = child.attribute( "availabledafterlevel" ).as_uint();

		float exp = child.attribute( "exp" ).as_float();
		exp = std::max( getEXP( name ), exp );
		setEXP( name, exp );

		if( productid.empty() == false )
		{
			_heroInappDetails[name].result = inapp::Result::Fail;

			auto callback = [this, name]( inapp::SkuDetails details )
			{
				if( details.result == inapp::Result::Ok )
				{
					_heroInappDetails[name] = details;
				}
			};
			if( k::configuration::useHeroRoom )
			{
				productid = k::configuration::kInappPackage + productid;
				_heroInappDetails[name] = inapp::SkuDetails();
				_heroInappDetails[name].productId = productid;
				_heroInappDetails[name].result = inapp::Result::Fail;
				inapp::details( productid, std::bind( callback, std::placeholders::_1 ) );
			}
		}
		else
		{
			_levelsForUnclockHeroes[name] = levelforunlock;
		}

	}
	
	_skills["hero1"].resize( 5 );
	_skills["hero2"].resize( 5 );
	_skills["hero3"].resize( 5 );
	for( auto& pair : _skills )
	{
		int index = 0;
		for( auto& skill : pair.second )
		{
			std::string key = k::user::HeroSkillPoints + pair.first + intToStr( index );
			skill = UserData::shared().get_int( key, skill );
			++index;
		}
	}

	checkUnlockedHeroes();
}


Hero::Hero()
:_dieTimer( 0 )
, _regeneration( 0 )
{}

Hero::~Hero()
{}

void Hero::die_update( float dt )
{
	_dieTimer += dt;
	float dlife = (getDefaultHealth() * getRate()) / MachineUnit::_death.duration;
	float health = dlife * _dieTimer + getCurrentHealth();

	observerHealth.unlock();
	setCurrentHealth( health );
	observerHealth.lock();
	setCurrentHealth( 0 );
}

bool Hero::init( const std::string & path, const std::string & xmlFile )
{
	do
	{
		MachineExt::add_event( Event::live ).set_string_name( "live" );

		CC_BREAK_IF( !UnitDesant::init( path, xmlFile ) );

		return true;
	}
	while( false );
	return false;
}

void Hero::initSkills()
{
	std::vector<UnitSkill::Pointer> skills = getSkills();
	for( auto skill : skills )
	{
		bool checkUnitSkill = skill->getNeedUnitSkill().empty() == false;
		if( checkUnitSkill == false ) continue;
		unsigned type = strToInt( skill->getNeedUnitSkill() );
		unsigned level = skill->getNeedUnitSkillLevel();

		std::vector<unsigned> heroSkills;
		HeroExp::shared().skills( getName(), heroSkills );
		if( heroSkills[type] != level )
			removeSkill( skill );
	}

	skills = getSkills();
	for( auto skill : skills )
	{
		auto paramSkill = dynamic_cast<UnitSkillRateParameter*>(skill.ptr());
		if( paramSkill )
		{
			std::string param = paramSkill->getParameter();
			float rate = paramSkill->getRate();

			if( param == "health" )
			{
				setProperty( param, floatToStr( getHealth() * rate ) );
			}
			else if( param == "armor" )
			{
				auto& effect = getEffect();
				effect.positive.armor *= rate;
			}
			else if( param == "damage" )
			{
				auto& effect = getEffect();
				effect.positive.damage *= rate;
				effect.positive.electroRate *= rate;
				effect.positive.fireRate *= rate;
				effect.positive.iceRate *= rate;
			}
		}
	}
}

bool Hero::moveTo( const Point & position )
{
	Route myRoute;
	if( myRoute.empty() ) findOneRoute( position, myRoute );
	if( myRoute.empty() ) findTwoRoute( position, myRoute );

	if( myRoute.empty() == false )
	{
		finalizateRoute( position, myRoute );
		setBasePosition( position );
		getMover().setRoute( myRoute );
		move();
	}

	return myRoute.empty() == false;
}

void Hero::checkRoute( const TripleRoute & tripleroute, const Point & A, const Point & B, Route & route )
{
	float maxDistToRoute( 50 );
	float distance( -1 );
	bool checkSelf = checkPointOnRoute( A, tripleroute, maxDistToRoute * 2, &distance );
	bool checkTarget = checkPointOnRoute( B, tripleroute, maxDistToRoute, &distance );
	if( checkSelf && checkTarget )
	{
		size_t i0 = -1;
		size_t i1 = -1;
		float min_0( 9999 );
		float min_1( 9999 );
		auto & r = tripleroute.main;
		for( size_t i = 0; i < r.size(); ++i )
		{
			float d0 = A.getDistance( r[i] );
			float d1 = B.getDistance( r[i] );
			if( d0 < min_0 )
			{
				min_0 = d0;
				i0 = i;
			}
			if( d1 < min_1 )
			{
				min_1 = d1;
				i1 = i;
			}
		}
		assert( i0 != -1 );
		assert( i1 != -1 );
		size_t step = i1 > i0 ? 1 : -1;
		for( size_t i = i0; i != i1; i += step )
		{
			route.push_back( r[i] );
		}
		if( i0 == i1 )
		{
			route.push_back( r[i0] );
		}
	}
}

void  Hero::findOneRoute( const Point & position, Route & out )
{
	GameBoard& board = GameGS::getInstance()->getGameBoard();
	const std::vector<TripleRoute>& routes = board.getCreepsRoutes();

	for( auto &route : routes )
	{
		checkRoute( route, getPosition(), position, out );
		CC_BREAK_IF( !out.empty() );
	}
}

void Hero::findTwoRoute( const Point & position, Route & route )
{
	GameBoard& board = GameGS::getInstance()->getGameBoard();
	std::vector<TripleRoute> atroutes = board.getCreepsRoutes();
	std::vector<TripleRoute> troutes;

	Route temp;
	for( size_t i = 0; i < atroutes.size(); ++i )
	{
		temp.clear();
		checkRoute( atroutes[i], getPosition(), atroutes[i].main[0], temp );
		if( temp.empty() == false )
			troutes.push_back( atroutes[i] );
	}
	for( size_t i = 0; i < atroutes.size(); ++i )
	{
		temp.clear();
		checkRoute( atroutes[i], position, atroutes[i].main[0], temp );
		if( temp.empty() == false )
			troutes.push_back( atroutes[i] );
	}
	if( troutes.empty() ) return;

	std::vector< Route > routes;

	for( size_t i = 0; i < troutes.size(); ++i )
	{
		for( auto point : troutes[i].main )
		{
			temp.clear();
			checkRoute( troutes[i], getPosition(), point, temp );
			size_t size = temp.size();
			if( size == 0 )
				continue;
			temp.push_back( point );
			routes.push_back( temp );
		}
	}

	for( size_t i = 0; i < routes.size(); )
	{
		bool path = false;
		for( auto troute : troutes )
		{
			temp.clear();
			checkRoute( troute, routes[i].back(), position, temp );
			size_t size = temp.size();
			if( size != 0 )
			{
				routes[i].insert( routes[i].end(), temp.begin(), temp.end() );
				path = true;
			}
		}
		if( path == false )
		{
			routes.erase( routes.begin() + i );
		}
		else
		{
			++i;
		}
	}

	std::sort( routes.begin(), routes.end(), 
		[]( const Route & L, const Route & R )
	{
		auto length = []( const Route & route )
		{
			float l( 0 );
			for( unsigned i = 1; i < route.size(); ++i )
			{
				l += route[i - 1].getDistanceSq( route[i] );
			}
			return l;
		};
		return length( L ) < length( R );
	} );

	if( routes.empty() == false )
	{
		route = routes.front();
	}
}

void Hero::finalizateRoute( const Point & position, Route & route )
{
	route.push_back( position );
	while( route.size() >= 2 )
	{
		Vec2 r1 = route[0] - getPosition();
		Vec2 r2 = route[1] - route[0];
		float angle = getAngle( r1, r2 );
		if( std::fabs( angle ) > 90 )
		{
			route.erase( route.begin() );
		}
		else
		{
			break;
		}
	}
	route.insert( route.begin(), getPosition() );
}

bool Hero::setProperty( const std::string & stringproperty, const std::string & value )
{
	if( stringproperty == "regeneration" )
		_regeneration = strToFloat( value );
	else if( stringproperty == "skill" )
		_skill = value;
	else 
		return UnitDesant::setProperty( stringproperty, value );
	
	return true;
}

void Hero::on_die()
{
	UnitDesant::on_die();
	observerHealth.lock();
	_dieTimer = 0;
}

void Hero::on_die_finish()
{
	NodeExt::runEvent( "on_die_finish" );
	setCurrentHealth( getDefaultHealth() * getRate() );
	MachineExt::push_event( Event::live );
	observerHealth.unlock();
}

void Hero::stop_update( float dt )
{
	float health = getCurrentHealth();
	health = std::min( getDefaultHealth() * getRate(), health + _regeneration * dt );
	setCurrentHealth( health );
}


NS_CC_END
