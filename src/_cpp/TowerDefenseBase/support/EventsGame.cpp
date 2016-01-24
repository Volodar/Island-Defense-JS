//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 26.10.2014.
//
//
#include "EventsGame.h"
#include "gameboard.h"
#include "GameGS.h"
#include "ml/common.h"
NS_CC_BEGIN


/*****************************************************************************/
//MARK: class EventCreateUnit
/*****************************************************************************/
EventCreateUnit::EventCreateUnit()
: _radius( 0 )
, _lifetime(30)
, _unitType( UnitType::creep )
{}

EventCreateUnit::~EventCreateUnit()
{}

bool EventCreateUnit::init()
{
	return true;
}

void EventCreateUnit::execute( NodeExt * context )
{
	createUnits( context );
}

std::vector<Unit::Pointer> EventCreateUnit::createUnits( NodeExt * context )
{
	Unit * holder = dynamic_cast<Unit*>(context);
	assert( context );
	assert( _units.empty() == false );
	assert( _units.size() > 1 ? _radius > 0 : true );
	assert( holder );

	float startangle = CCRANDOM_MINUS1_1() * (360 / _units.size());
	std::vector<Point>points;
	computePointsByRadius( points, _radius, _units.size(), startangle );
	auto& board = GameGS::getInstance()->getGameBoard();
	int index( 0 );
	std::vector<Unit::Pointer> units;
	for( const auto& unitname : _units )
	{
		auto& position = holder->getPosition() + points[index];
		if( _unitType == UnitType::creep )
		{
			auto& route = holder->getMover().getRoute();
			auto unit = board.createCreep( unitname, route, position );
			if( unit )
			{
				auto cost = holder->getCost();
				auto rate = holder->getRate();
				unit->setCost( cost );
				unit->setRate( rate );
				units.push_back( unit );
			}
		}
		else if( _unitType == UnitType::desant )
		{
			auto unit = board.createDesant( unitname, position, _lifetime );
			if( unit )
			{
				units.push_back( unit );
			}
		}
		++index;
	}

	return units;
}

void EventCreateUnit::setParam( const std::string & name, const std::string & value )
{
	if( name == "units" ) split( _units, value );
	else if( name == "radius" ) _radius = strToFloat( value );
	else if( name == "unittype" ) _unitType = strToUnitType( value );
	else if( name == "lifetime" ) _lifetime = strToFloat( value );
	else EventBase::setParam( name, value );
}

std::string EventCreateUnit::getParam( const std::string & name )
{
	return "";
}


/*****************************************************************************/
//MARK: class EventCreateUnitReverseRoute
/*****************************************************************************/

EventCreateUnitReverseRoute::EventCreateUnitReverseRoute()
{}

EventCreateUnitReverseRoute::~EventCreateUnitReverseRoute()
{}

bool EventCreateUnitReverseRoute::init()
{
	return EventCreateUnit::init();
}

void EventCreateUnitReverseRoute::execute( NodeExt * context )
{
	auto& board = GameGS::getInstance()->getGameBoard();
	auto units = createUnits( context );
	float distance( 100 );
	for( auto unit : units )
	{
		TripleRoute route = board.getRoute( unit->getUnitLayer(), unit->getPosition(), distance );
		if( route.main.empty() )
			continue;
		std::reverse( route.main.begin(), route.main.end() );
		unit->moveByRoute( route.main );
	}
}

/*****************************************************************************/
//MARK: class EventAreaDamage
/*****************************************************************************/
EventAreaDamage::EventAreaDamage()
: _radius( 0 )
, _sector( 360 )
, _asUnitType( UnitType::tower )
{}

EventAreaDamage::~EventAreaDamage()
{}

bool EventAreaDamage::init()
{
	return true;
}

void EventAreaDamage::execute( NodeExt * context )
{
	Unit * holder = dynamic_cast<Unit*>(context);
	assert( context );
	assert( holder );
	const auto& board = GameGS::getInstance()->getGameBoard();

	float radius = holder->getRadius();
	float sector = holder->getDamageBySectorAngle();
	auto unittype = holder->getType();
	holder->setRadius( _radius );
	holder->setType( _asUnitType );
	holder->setDamageBySectorAngle( _sector );

	board.applyDamageBySector( holder );

	holder->setRadius( radius );
	holder->setDamageBySectorAngle( sector );
	holder->setType( unittype );
}

void EventAreaDamage::setParam( const std::string & name, const std::string & value )
{
	if( name == "radius" )_radius = strToFloat( value );
	else if( name == "sector" ) _sector = strToFloat( value );
	else if( name == "asunittype" ) _asUnitType= strToUnitType( value );
	else EventBase::setParam( name, value );
}

std::string EventAreaDamage::getParam( const std::string & name )
{
	return "";
}


NS_CC_END