//
//  Skills.cpp
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 26.11.14.
//
//

#include "Skills.h"
#include "Unit.h"
#include "GameGS.h"
#include "gameboard.h"
#include "consts.h"

NS_CC_BEGIN;

/******************************************************************************/
//MARK: UnitSkill
/******************************************************************************/
UnitSkill::UnitSkill()
: _unit(nullptr)
, _needUnitSkillLevel(0)
{}

UnitSkill::~UnitSkill()
{}

bool UnitSkill::init( const pugi::xml_node & xmlNode, Unit* unit )
{
	_unit = unit;
	_onlyState = xmlNode.attribute( "onlystate" ).as_string();
	_needUnitSkill = xmlNode.attribute( "unitskill" ).as_string();
	_needUnitSkillLevel = xmlNode.attribute( "unitskilllevel" ).as_int();
	return _unit != nullptr;
}

/******************************************************************************/
//MARK: UnitSkillMedic
/******************************************************************************/
UnitSkillMedic::UnitSkillMedic()
: _radius( 0 )
, _frequence( 0 )
, _health( 0 )
, _duration( 0 )
, _timer( 0 )
, _timerDuration( 0 )
, _effectDescription()
, _maxTargets( -1 )
, _execution(false)
{}

UnitSkillMedic::~UnitSkillMedic()
{}

bool UnitSkillMedic::init( const pugi::xml_node & xmlNode, Unit* unit )
{
	UnitSkill::init( xmlNode, unit );

	_radius = xmlNode.attribute( "radius" ).as_float( 0.f );
	_frequence = xmlNode.attribute( "frequence" ).as_float( 0.f );
	_health = xmlNode.attribute( "health" ).as_float( 0.f );
	_duration = xmlNode.attribute( "duration" ).as_float( 0.f );
	_effectDescription = xmlNode.attribute( "effect_description" ).as_string();
	_maxTargets = xmlNode.attribute( "maxtargets" ).as_int();

	std::list<std::string> units;
	split( units, xmlNode.attribute( "units" ).as_string() );
	for( auto unit : units )
		_allowUnits.insert( unit );

	return true;
}

void UnitSkillMedic::update( float dt, Unit* context )
{
	assert( context );

	_timer += dt;
	if( _timer > _frequence )
	{
		if( _timerDuration < 0.001f )
		{
			execute( context );
		}
		if( _timerDuration >= _duration )
		{
			stop( context );
			_timer = 0;
			_timerDuration = 0;
		}
		else
		{
			_timerDuration += dt;
		}
	}
}

bool UnitSkillMedic::execution()
{
	return _execution;
}

void UnitSkillMedic::execute( Unit* context )
{
	assert( GameGS::getInstance() );
	const auto& board = GameGS::getInstance()->getGameBoard();
	std::vector<Unit*> targets;
	Point center = context->getPosition();
	board.getTargetsByRadius( targets, center, _radius );

	unsigned counter = _maxTargets;
	bool wasHealing( false );
	for( auto target : targets )
	{
		if( _allowUnits.empty() == false )
		{
			bool allow = _allowUnits.find( target->getName() ) != _allowUnits.end();
			if( allow == false )
				continue;
		}
		if( target->getType() != UnitType::creep )
			continue;

		float health = target->getCurrentHealth();
		float max = target->getHealth();

		float value = std::min( max, health + _health );
		if( health < max )
		{
			target->setCurrentHealth( value );
			GameGS::getInstance()->createEffect( context, target, _effectDescription );
			wasHealing = true;
			--counter;
		}
		if( counter == 0 )
			break;
	}

	if( wasHealing )
	{
		_execution = true;
		context->stop();
		context->runEvent( "on_healing" );
	}
}

void UnitSkillMedic::stop( Unit* context )
{
	_execution = false;
	context->move();
}


/******************************************************************************/
//MARK: UnitSkillRunTasksByTime
/******************************************************************************/
UnitSkillRunTasksByTime::UnitSkillRunTasksByTime()
: _timer( 0 )
, _timerDuration(0)
, _frequence( 0 )
, _events()
, _stopedUnit(false)
, _resumeMoving(false)
, _stopDuration(0)
, _count(-1)
{}

UnitSkillRunTasksByTime::~UnitSkillRunTasksByTime()
{}

bool UnitSkillRunTasksByTime::init( const pugi::xml_node & xmlNode, Unit* unit )
{
	UnitSkill::init( xmlNode, unit );

	_frequence = xmlNode.attribute( "frequence" ).as_float( 0.f );
	_stopedUnit = xmlNode.attribute( "stopunit" ).as_bool( false );
	_stopDuration = xmlNode.attribute( "stopduration" ).as_float( 0.f );
	_count = xmlNode.attribute( "count" ).as_int( -1 );

	auto xmlEvents = xmlNode.child( "eventlist" );
	FOR_EACHXML( xmlEvents, xmlEvent )
	{
		auto event = xmlLoader::load_event( xmlEvent );
		if( event )
			_events.push_back( event );
	}
	return true;
}

void UnitSkillRunTasksByTime::update( float dt, Unit* context )
{
	if( _stopedUnit )
	{
		_timer += dt;
		if( _timer > _frequence )
		{
			if( _timerDuration < 0.001f )
			{
				execute( context );
			}
			if( _timerDuration >= _stopDuration )
			{
				stop( context );
				_timer = 0;
				_timerDuration = 0;
			}
			else
			{
				_timerDuration += dt;
			}
		}
	}
	else
	{
		_timer += dt;
		if( _timer > _frequence )
		{
			_timer -= _frequence;
			execute( context );
			stop( context );
		}
	}
}

void UnitSkillRunTasksByTime::execute( Unit* context )
{
	if( _count > 0 )
	{
		--_count;
		_events.execute( context );
		if( _stopedUnit )
		{
			_resumeMoving = context->current_state().get_name() == MachineUnit::State::state_move;
			if( _resumeMoving )
				context->stop();
		}
	}
}

void UnitSkillRunTasksByTime::stop( Unit* context )
{
	if( _resumeMoving )
		context->move();
}

/*****************************************************************************/
//MARK: UnitSkillCounter
/*****************************************************************************/

UnitSkillCounter::UnitSkillCounter()
: _isActive( false )
, _damageCounter( { false, 0, 0 } )
, _timeCounter( { false, 0, 0 } )
, _damageCounterActive( { false, 0, 0 } )
, _timeCounterActive( { false, 0, 0 } )
{}

UnitSkillCounter::~UnitSkillCounter()
{}

bool UnitSkillCounter::init( const pugi::xml_node & xmlNode, Unit* unit )
{
	do
	{
		CC_BREAK_IF( !UnitSkill::init( xmlNode, unit ) );

		auto xmlDamage = xmlNode.attribute( "damage" );
		auto xmlDamageActive = xmlNode.attribute( "damageactive" );
		auto xmlTime = xmlNode.attribute( "time" );
		auto xmlTimeActive = xmlNode.attribute( "timeactive" );

		if( xmlDamage )
		{
			_damageCounter.active = true;
			_damageCounter.def = _damageCounter.left = xmlDamage.as_int();
		}
		if( xmlDamageActive )
		{
			_damageCounterActive.active = true;
			_damageCounterActive.def = _damageCounterActive.left = xmlDamageActive.as_int();
		}
		if( xmlTime )
		{
			_timeCounter.active = true;
			_timeCounter.def = _timeCounter.left = xmlTime.as_float();
		}
		if( xmlTimeActive )
		{
			_timeCounterActive.active = true;
			_timeCounterActive.def = _timeCounterActive.left = xmlTimeActive.as_float();
		}

		_type = xmlNode.attribute( "skilltype" ).as_string();
		_value = xmlNode.attribute( "skillvalue" ).as_float();

		return true;
	}
	while( false );
	return false;

}

void UnitSkillCounter::update( float dt, Unit* context )
{
	auto& counter = _isActive ? _timeCounterActive : _timeCounter;
	if( counter.action( dt ) )
	{
		if( _isActive ) executeBack();
		else execute();
	}
}

void UnitSkillCounter::onDamage( float damage )
{
	auto& counter = _isActive ? _damageCounterActive : _damageCounter;
	if( counter.action( 1 ) )
	{
		if( _isActive ) executeBack();
		else execute();
	}
}

void UnitSkillCounter::execute()
{
	_isActive = true;
	getUnit()->skillActivated( this );
}

void UnitSkillCounter::executeBack()
{
	_damageCounterActive.left = _damageCounterActive.def;
	_timeCounterActive.left = _timeCounterActive.def;
	_isActive = false;
	getUnit()->skillDeactivated( this );
}


/*****************************************************************************/
//MARK: UnitSkillRateParameter
/*****************************************************************************/
UnitSkillRateParameter::UnitSkillRateParameter() 
: _rate( 1 )
, _parameter()
{}

UnitSkillRateParameter::~UnitSkillRateParameter() 
{}

bool UnitSkillRateParameter::init( const pugi::xml_node & xmlNode, Unit* unit )
{
	UnitSkill::init( xmlNode, unit );

	_rate = xmlNode.attribute( "rate" ).as_float( 1.f );
	_parameter = xmlNode.attribute( "parameter" ).as_string();
	return true;
}

void UnitSkillRateParameter::update( float dt, Unit* context ) {}

NS_CC_END;
