//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "Unit.h"
#include "consts.h"
#include "GameGS.h"
#include "tower.h"
#include "UserData.h"
#include "ml/Audio/AudioEngine.h"
#include "Bullet.h"
NS_CC_BEGIN





Unit::Unit()
: _effect( this )
, _extra()
, _mover()
, _angle( -1 )
, _targets()
, _currentDamager( nullptr )
, _healthIndicator( nullptr )
, _currentHealth( 1 )
, _soundMoveID( -1 )
, _effectOnShoot()
, _level( 1 )
, _maxLevel( 1 )
, _maxLevelForLevel( -1 )
, _cost( 0 )
, _radius( 0 )
, _rate( 1 )
, _bodyType( BodyType::equipment )
, _defaultHealth( 1 )
, _health( 1 )
, _moveFinished( false )
, _damageBySector( false )
, _damageBySectorAngle( 0 )
, _unitLayer( UnitLayer::earth )
, _allowTargets()
, _maxTargets( 1 )
, _type()
, _soundMove()
, _lifecost( 0 )
, _additionalZorder( 0 )
, _damageShield( 1 )
, _damageRate( 1 )
, _exp(0)
{}

Unit::~Unit()
{
	if( _soundMoveID != -1 )
	{
		AudioEngine::shared().stopEffect( _soundMoveID );
		_soundMoveID = -1;
	}
}

bool Unit::init( const std::string & path, const std::string & xmlFile, Unit* upgradedUnit )
{
	if( init( path, xmlFile ) == false )
		return false;

	if( upgradedUnit )
	{
		auto state = MachineUnit::current_state().get_name();
		if( state != MachineUnit::current_state().get_name() )
			MachineUnit::start( state );
		MachineUnit::_timer = upgradedUnit->MachineUnit::_timer;
		MachineUnit::_fireReady.charge_volume =
			upgradedUnit->MachineUnit::_fireReady.charge_volume;
	}
	return true;
}

bool Unit::init( const std::string & path, const std::string & xmlFile )
{
	do
	{
		CC_BREAK_IF( !NodeExt::init() );
		CC_BREAK_IF( !MachineUnit::init() );
		//CC_BREAK_IF( !MachineMove::init() );

		_healthIndicator = IndicatorNode::create();
		addChild( _healthIndicator );


		NodeExt::load( path, xmlFile );

		int level = UserData::shared().tower_upgradeLevel( getName() );
		setMaxLevelForLevel( level );

		auto cb = std::bind( &Unit::on_mover, this,
							std::placeholders::_1,
							std::placeholders::_2 );
		_mover.setOnChangePosition( cb );
		_mover.setOnFinish( std::bind( &Unit::on_movefinish, this ) );

		//if( _type == UniType::tower )
		//{
		//	//float rate = mlTowersInfo::shared().rate( getName() );
		//	//_effect.positive.damage *= rate;
		//	//_effect.positive.fireRate *= rate;
		//	//_effect.positive.iceRate *= rate;
		//	//_effect.positive.electroRate *= rate;
		//	//setRadius( getRadius() * rate );
		//	//MachineUnit::_fireReady.delay /= rate;
		//}

		return true;
	}
	while( false );
	return false;
}

void Unit::load( const pugi::xml_node & root )
{
	NodeExt::load( root );

	start( current_state().get_name() );
}

bool Unit::loadXmlEntity( const std::string & tag, const pugi::xml_node & xmlnode )
{
	if( tag == k::xmlTag::MachineUnit )
	{
		MachineUnit::load( xmlnode );
	}
	else if( tag == k::xmlTag::Effects )
	{
		_effect.load( xmlnode );
	}
	else if( tag == k::xmlTag::Mover )
	{
		_mover.load( xmlnode );
	}
	else if( tag == k::xmlTag::ExtraProperties )
	{
		_extra._electroPosition = strToPoint( xmlnode.attribute( "electro_pos" ).as_string() );
		_extra._electroSize = xmlnode.attribute( "electro_size" ).as_string();
		_extra._electroScale = xmlnode.attribute( "electro_scale" ).as_float( 1 );
		_extra._firePosition = strToPoint( xmlnode.attribute( "fire_pos" ).as_string() );
		_extra._fireScale = xmlnode.attribute( "fire_scale" ).as_float( 1 );
		_extra._freezingPosition = strToPoint( xmlnode.attribute( "freezing_pos" ).as_string() );
		_extra._freezingScale = xmlnode.attribute( "freezing_scale" ).as_float( 0.5 );
	}
	else if( tag == k::xmlTag::UnitSkills )
	{
		loadXmlSkills( xmlnode );
	}
	else
	{
		return NodeExt::loadXmlEntity( tag, xmlnode );
	}
	return true;
}

UnitSkill::Pointer Unit::loadXmlSkill( const pugi::xml_node & xmlnode )
{
	std::string type = xmlnode.name();
	UnitSkill::Pointer skill;

	if( type == "medic" )
		skill = UnitSkillMedic::create( xmlnode, this );
	else if( type == "runeventsbytime" )
		skill = UnitSkillRunTasksByTime::create( xmlnode, this );
	else if( type == "skillcounter" )
		skill = UnitSkillCounter::create( xmlnode, this );
	else if( type == "rateparameter" )
		skill = UnitSkillRateParameter::create( xmlnode, this );

	return skill;
}

void Unit::loadXmlSkills( const pugi::xml_node & xmlnode )
{
	for( auto xml : xmlnode )
	{
		auto skill = loadXmlSkill( xml );
		if( skill )
			_skills.push_back( skill );
	}
}

bool Unit::setProperty( const std::string & name, const std::string & value )
{
	bool result = true;
	//setName( root.attribute( "name" ).as_string( "unnamed" ) );

	if( name == "radius" )
	{
		setRadius( strToFloat( value ) );
	}
	else if( name == "health" )
	{
		_currentHealth =
		_defaultHealth =
		_health = strToFloat( value );
	}
	else if( name == "velocity" )
	{
		float velocity = strToFloat( value );
		//float random = CCRANDOM_MINUS1_1() * 0.1f + 1;
		//velocity *= random;
		_mover.setVelocity( velocity );
		_mover.setDefaultVelocity( velocity );
	}
	else if( name == "unittype" )
	{
		_type = strToUnitType( value );
	}
	else if( name == "effect_on_shoot" )
	{
		_effectOnShoot = value;
	}
	else if( name == "maxlevel" )
	{
		_maxLevel = strToInt( value );
	}
	else if( name == "damagebysector" )
	{
		_damageBySector = strToBool( value );
	}
	else if( name == "sectorangle" )
	{
		_damageBySectorAngle = strToFloat( value );
	}
	else if( name == "maxtargets" )
	{
		_maxTargets = strToInt( value );
	}
	else if( name == "unitlayer" )
	{
		_unitLayer = value.empty() ? UnitLayer::any : strToUnitLayer( value );
	}
	else if( name == "sound_onmove" )
	{
		_soundMove = xmlLoader::macros::parse( value );
	}
	else if( name == "lifecost" )
	{
		_lifecost = strToInt( value );
	}
	else if( name == "allowtargets" )
	{
		std::list<std::string> targets;
		split( targets, value );
		for( auto target : targets )
		{
			_allowTargets.push_back( strToUnitLayer( target ) );
		}
	}
	else if( name == "additionalzorder" )
	{
		_additionalZorder = strToInt( value );
	}
	else if( name == "exp" )
	{
		_exp = strToFloat( value );
	}
	else if( name == "bullet" )
	{
		_bulletXml = value;
	}
	else if( name == "bullet_params" )
	{
		//45,30,0x0:	135:150,0x0:	225,210,0x0:	315,330,0x0
		std::list<std::string> params;
		split( params, value, '|' );
		for( auto param : params )
		{
			std::vector<std::string> args;
			split( args, param, ',' );
			BulletParams bp;
			bp.byangle = strToInt( args[0] );
			bp.useangle = strToInt( args[1] );
			bp.offset = strToPoint( args[2] );
			_bulletParams[bp.byangle] = bp;
		}
	}
	else
	{
		result = NodeExt::setProperty( name, value );
	}
	return result;
}

ccMenuCallback Unit::get_callback_by_description( const std::string & name )
{
	if( name.find( "push_event:" ) == 0 )
	{
		auto len = std::string( "push_event:" ).size();
		std::string eventname = name.substr( len );
		auto& event = FiniteState::Machine::event( eventname );

		auto callback = std::bind( [this, event]( Ref* ){
			push_event( event.get_name() );
		}, std::placeholders::_1 );
		return callback;
	}
	else return NodeExt::get_callback_by_description( name );
}

mlEffect& Unit::getEffect() { return _effect; }
const mlEffect& Unit::getEffect()const { return _effect; }

Unit::Extra& Unit::extra()
{
	return _extra;
}

bool Unit::checkTargetByRadius( const Unit * target )const
{
	return true;
}

void Unit::capture_targets( const std::vector<Unit::Pointer> & targets )
{
	assert( targets.size() <= _maxTargets );
	_targets = targets;
	if( _targets.empty() ) MachineUnit::capture_target( nullptr );
	else MachineUnit::capture_target( _targets.front() );
}

void Unit::get_targets( std::vector<Unit::Pointer> & targets )const
{
	targets = _targets;
}

void Unit::stopAllLoopedSounds()
{}

void Unit::clear()
{
	_targets.clear();
	_currentDamager.reset( nullptr );
	_skills.clear();
	_healthIndicator.reset( nullptr );
	MachineUnit::start( MachineUnit::state_sleep );
}

void Unit::update( float dt )
{
	bool execution( false );
	for( auto& skill : getSkills() )
	{
		execution = execution || skill->execution();
	}

	if( current_state().get_name() != state_death )
	for( auto& skill : getSkills() )
	{
		bool allow = (execution == false) || (skill->execution());
		allow = allow && (skill->getOnlyState().empty() ? true : skill->getOnlyState() == current_state().get_string_name());
		if( allow )
			skill->update( dt, this );
	}

	if( execution == false )
	{
		bool needturn = true;
		needturn = needturn && current_state().get_name() != state_move;
		needturn = needturn && current_state().get_name() != state_death;
		needturn = needturn && current_state().get_name() != state_enter;
		if( needturn )
		{
			turn( dt );
		}
		MachineUnit::update( dt );

		_effect.update( dt );
		applyVelocityRate( dt );
		applyTimedDamage( dt );
	}
}

void Unit::applyVelocityRate( float dt )
{
	float rate = _effect.computeMoveVelocityRate();
	float velocity = _mover.getDefaultVelocity() * rate;
	_mover.setVelocity( velocity );
}

void Unit::applyTimedDamage( float dt )
{
	float damage = _effect.computeExtendedDamage( dt ) * _damageShield;
	setCurrentHealth( _currentHealth - damage );
	if( damage != 0 ) on_damage( damage );
}

void Unit::turn( float dt )
{
	Unit::Pointer target = _targets.empty() ? nullptr : _targets.front();
	if( target )
	{
		Vec2 now = (target->getPosition() - getPosition()).getNormalized();
		_mover.setDirection( now );
		on_mover( getPosition(), now );
	}
}

void Unit::applyDamageToTarget( Unit::Pointer target )
{
	assert( target );

	if( _damageBySector )
	{
		GameGS::getInstance()->getGameBoard().applyDamageBySector( this );
	}
	else
	{
		if( target )
		{
			target->applyDamage( this );
			GameGS::getInstance()->createEffect( this, target, _effectOnShoot );
		}
	}
}

void Unit::applyDamage( Unit* damager, float time )
{
	_currentDamager = damager;

	_effect.applyEffects( damager );
	float damage = _effect.computeDamage( damager ) * time * _damageShield * damager->_damageRate;
	setCurrentHealth( _currentHealth - damage );

	if( damage != 0 )
	{
		on_damage( damage );
		GameGS::getInstance()->getGameBoard().onDamage( damager, this, damage );

	}

	for( auto skill : _skills )
	{
		skill->onDamage( damage );
	}

	if( _currentHealth <= 0 )
	{
		GameGS::getInstance()->getGameBoard().onKill( damager, this );
	}
}

void Unit::applyDamageExtended( float time )
{
	_effect.update( time );
	float damage = _effect.computeExtendedDamage( time ) * _damageShield;
	setCurrentHealth( _currentHealth - damage );

	if( damage != 0 )
		on_damage( damage );
}

void Unit::on_shoot( unsigned index )
{
	if( dynamic_cast<Bullet*>(this) )
		return;

	runEvent( "on_shoot" );
	runEvent( "on_shoot" + intToStr( index ) );
	runEvent( "on_shoot" + intToStr( index ) + "_byangle" + intToStr( _angle ) );
	runEvent( "on_shoot_byangle" + intToStr( _angle ) );

	if( _bulletXml.empty() )
	{
		for( auto target : _targets )
		{
			assert( target );
			applyDamageToTarget( target );
		}
	}
	else
	{
		for( auto target : _targets )
		{
			assert( target );
			float angle = _bulletParams[getMover().getCurrentAngle()].useangle;
			Point position = _bulletParams[getMover().getCurrentAngle()].offset + getPosition();
			auto bullet = Bullet::create( _bulletXml, this, target, angle, position );
			bullet->setType( UnitType::tower );
			GameGS::getInstance()->getGameBoard().addUnit( bullet );
		}
	}
};

void Unit::on_sleep( float duration )
{
	runEvent( "on_sleep" );
};

void Unit::on_cocking( float duration )
{
	runEvent( "on_cocking" );
};

void Unit::on_relaxation( float duration )
{
	runEvent( "on_relaxation" );
};

void Unit::on_readyfire( float duration )
{
	runEvent( "on_readyfire" );
};

void Unit::on_charging( float duration )
{
	runEvent( "on_charging" );
};

void Unit::on_waittarget( float duration )
{
	float angle = _mover.getRandomAngle();
	runEvent( "on_waittarget" );
	runEvent( "on_waittarget_" + intToStr( angle ) );

	move();
};

void Unit::on_move()
{
	_angle = -1;
	if( _currentHealth > 0 )
	{
		runEvent( "on_move" );
		_moveFinished = false;
		if( _soundMove.empty() == false )
		{
			_soundMoveID = AudioEngine::shared().playEffect( _soundMove, true, 0 );
		}
	}
}

void Unit::on_stop()
{
	if( _currentHealth > 0 )
	{
		runEvent( "on_stop" );
	}
	if( _soundMoveID != -1 )
	{
		AudioEngine::shared().stopEffect( _soundMoveID );
		_soundMoveID = -1;
	}
	_angle = -1;
}

void Unit::on_die()
{
	MachineUnit::push_event( MachineUnit::event_notarget );
	runEvent( "on_die" );
	setCurrentHealth( 0 );
}

void Unit::on_enter()
{
	runEvent( "on_enter" );
}

void Unit::moveByRoute( const Route & aroute )
{
	Route route = aroute;

	Point pos = getPosition();
	size_t index( 0 );
	float min_dist( 99999 );
	for( size_t i = 0; i < route.size(); ++i )
	{
		float dist = pos.getDistance( route[i] );
		if( dist < min_dist )
		{
			index = i; 
			min_dist = dist;
		}
	}

	//if( index > 0 )
	route.erase( route.begin(), route.begin() + index+1 );
	route.insert( route.begin(), pos );
	getMover().setRoute( route );
}

void Unit::setCurrentHealth( float value )
{
	_currentHealth = value;
	float progress = _currentHealth / (_health != 0 ? _health : 1);
	bool isVisible = _currentHealth < _defaultHealth * _rate && _currentHealth > 0;
	_healthIndicator->setProgress( progress );
	_healthIndicator->setVisible( isVisible );

	observerHealth.pushevent( _currentHealth, _defaultHealth * _rate );
}

void Unit::removeSkill( UnitSkill::Pointer skill )
{
	auto it = std::find( _skills.begin(), _skills.end(), skill );
	if( it != _skills.end() )
		_skills.erase( it );
}

std::vector<UnitSkill::Pointer>& Unit::getSkills()
{
	return _skills;
}

const std::vector<UnitSkill::Pointer>& Unit::getSkills()const
{
	return _skills;
}

void Unit::forceShoot( Unit* target, const mlEffect& effect )
{
	const auto hist = _targets;
	_targets.clear();
	_targets.push_back( target );
	mlEffect histeffect = _effect;
	_effect = effect;

	on_shoot( 0 );

	_targets = hist;
	_effect = histeffect;
}

void Unit::skillActivated( UnitSkill* skill )
{
	auto skillcounter = dynamic_cast<UnitSkillCounter*>(skill);
	if( skillcounter )
	{
		std::string type = skillcounter->getType();
		float rate = skillcounter->getValue();

		if( type == "shield" )
		{
			_damageShield = rate;
			runEvent( "skill_activated_shield" );
		}
		else if( type == "rage" )
		{
			_damageRate = rate;

			runEvent( "skill_activated_rage" );
		}
	}
}

void Unit::skillDeactivated( UnitSkill* skill )
{
	auto skillcounter = dynamic_cast<UnitSkillCounter*>(skill);
	if( skillcounter )
	{
		std::string type = skillcounter->getType();
		if( type == "shield" )
		{
			_damageShield = 1;
			runEvent( "skill_deactivated_shield" );
		}
		else if( type == "rage" )
		{
			_damageRate = 1;
			runEvent( "skill_deactivated_rage" );
		}
	}
}

void Unit::on_die_finish()
{
	runEvent( "on_die_finish" );
	GameGS::getInstance()->getGameBoard().death( this );
}

void Unit::move_update( float dt )
{
	_mover.update( dt );
}

void Unit::stop_update( float dt )
{}

void Unit::on_mover( const Point & position, const Vec2 & direction )
{
	unsigned angle = _mover.getCurrentAngle();
	setPosition( position );
	if( angle != _angle )
	{
		_angle = angle;
		runEvent( "on_rotate" + intToStr( _angle ) );
	}

	float z = _unitLayer == UnitLayer::sky ? 9000 : -position.y;
	z += _additionalZorder;
	setZOrder( z );
}

void Unit::on_movefinish()
{
	stop();
	_moveFinished = true;
}

void Unit::on_damage( float value )
{}


/*****************************************************************************/
//MARK: Unit::Extra
/*****************************************************************************/

Unit::Extra::Extra()
	: _electroPosition()
, _electroSize()
, _electroScale( 0 )
, _firePosition()
, _fireScale( 0 )
, _freezingPosition()
, _freezingScale( 0 )
{}

const Point& Unit::Extra::getPositionElectro()const
{
	return _electroPosition;
}

const std::string& Unit::Extra::getSizeElectro()const
{
	return _electroSize;
}

const float Unit::Extra::getScaleElectro()const
{
	return _electroScale;
}

const Point& Unit::Extra::getPositionFire()const
{
	return _firePosition;
}

const float Unit::Extra::getScaleFire()const
{
	return _fireScale;
}

const Point& Unit::Extra::getPositionFreezing()const
{
	return _freezingPosition;
}

const float Unit::Extra::getScaleFreezing()const
{
	return _freezingScale;
}

float Unit::getRate()
{
	return _rate;
}

void Unit::setRate( float value )
{
	_rate = value;
	float health = getDefaultHealth() * _rate;
	setCurrentHealth( health );
	setHealth( health );
}

NS_CC_END