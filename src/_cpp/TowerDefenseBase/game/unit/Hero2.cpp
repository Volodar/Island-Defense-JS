#include "ml/AStar.h"
#include "Hero2.h"
#include "GameGS.h"
#include "support.h"
#include "gameboard.h"
#include "GameGS.h"
#include "ml/loadxml/xmlLoader.h"
NS_CC_BEGIN



/*****************************************************************************/
//MARK: Hero2
/*****************************************************************************/
UnitSniper::UnitSniper()
: _target( nullptr )
, _aimAnimation( nullptr )
, _aim(nullptr)
, _state( State::wait )
, _timer( 0 )
, _delay( 10 )
, _prepare( 2 )
, _colling( 0.5 )
, _effect(nullptr)
{}

UnitSniper::~UnitSniper()
{}

bool UnitSniper::init( const pugi::xml_node & xmlNode, Unit* unit )
{
	UnitSkill::init( xmlNode, unit );
	_effect.setUnit( unit );

	_delay = xmlNode.attribute( "delay" ).as_float();
	_prepare = xmlNode.attribute( "prepare" ).as_float();
	_colling = xmlNode.attribute( "colling" ).as_float();
	_radius = xmlNode.attribute( "radius" ).as_float();
	_aim = xmlLoader::load_node( xmlNode.child( "aim" ) );
	_aimAnimation = xmlLoader::load_action( xmlNode.child( "aim_action" ) );
	_effect.load( xmlNode.child( "effects" ) );

	return true;
}

void UnitSniper::update( float dt, Unit* context )
{
	if( _state == State::wait )
	{
		_timer += dt;
		if( _timer >= _delay )
		{
			_timer = 0;
			_state = State::prepare;
		}
	}
	else if( _state == State::prepare )
	{
		if( getUnit()->current_state().get_name() != Unit::State::state_move )
		{
			if( _target )
				_timer += dt;
			else
				captureTarget();

			if( _timer >= _prepare )
			{
				_timer = 0;
				shoot();
				_state = State::colling;
			}
		}
	}
	else if( _state == State::colling )
	{
		_timer += dt;
		if( _timer >= _colling )
		{
			_timer = 0;
			releaseTarget();
			_state = State::wait;
		}
	}
}

bool UnitSniper::execution()
{
	return _state != State::wait && _target != nullptr;
}

void UnitSniper::shoot()
{
	getUnit()->forceShoot( _target, _effect );
}

void UnitSniper::captureTarget()
{
	auto& board = GameGS::getInstance()->getGameBoard();
	
	auto center = getUnit()->getPosition();
	std::vector < Unit* > units;
	board.getTargetsByRadius( units, center, _radius );

	for( auto target : units )
	{
		bool ok = true;
		ok = ok && target != getUnit();
		ok = ok && target->getType() == UnitType::creep;
		if( ok )
			_target = target;
	}

	if( _target )
	{
		_aim->removeFromParent();
		_target->addChild( _aim, 999 );
		_aim->runAction( _aimAnimation->clone() );
	}
}

void UnitSniper::releaseTarget()
{
	_aim->removeFromParent();
	_target.reset( nullptr );
}

/*****************************************************************************/
//MARK: Hero2
/*****************************************************************************/
Hero2::Hero2()
{}

Hero2::~Hero2()
{}

bool Hero2::init( const std::string & path, const std::string & xmlFile )
{
	do
	{
		CC_BREAK_IF( !Hero::init( path, xmlFile ) );

		return true;
	}
	while( false );
	return false;
}

void Hero2::update( float dt )
{
	Hero::update( dt );
}

UnitSkill::Pointer Hero2::loadXmlSkill( const pugi::xml_node & xmlnode )
{
	std::string type = xmlnode.name();
	UnitSkill::Pointer skill;

	if( type == "sniper" )
		skill = UnitSniper::create( xmlnode, this );
	else
		skill = Hero::loadXmlSkill( xmlnode );

	return skill;
}

NS_CC_END