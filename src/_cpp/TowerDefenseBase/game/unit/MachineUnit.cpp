//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "MachineUnit.h"
#include "consts.h"
NS_CC_BEGIN



MachineUnit::MachineUnit( )
: _cocking( { 0 } )
, _relaxation( { 0 } )
, _charging( { 0 } )
, _wait( { 0 } )
, _death( { 0 } )
, _enter( { 0 } )
, _fireReady( { 0, true, 0, 0 } )
, _timer( 0 )
, _target( nullptr )
{}

MachineUnit::~MachineUnit( )
{}

bool MachineUnit::init( )
{
	FSM_ADD_STATE( sleep );
	FSM_ADD_STATE( enter );
	FSM_ADD_STATE( cocking );
	FSM_ADD_STATE( relaxation );
	FSM_ADD_STATE( readyfire );
	FSM_ADD_STATE( charging );
	FSM_ADD_STATE( waittarget );
	FSM_ADD_STATE( move );
	FSM_ADD_STATE( stop );
	FSM_ADD_STATE( death );

	FSM_ADD_EVENT( seetarget );
	FSM_ADD_EVENT( ready );
	FSM_ADD_EVENT( charge );
	FSM_ADD_EVENT( notarget );
	FSM_ADD_EVENT( relax );
	FSM_ADD_EVENT( sleep );
	FSM_ADD_EVENT( move );
	FSM_ADD_EVENT( stop );
	FSM_ADD_EVENT( die );

	state( state_sleep ).add_onActivateCallBack( std::bind( &MachineUnit::state_sleep_start, this ) );
	state( state_cocking ).add_onActivateCallBack( std::bind( &MachineUnit::state_cocking_start, this ) );
	state( state_relaxation ).add_onActivateCallBack( std::bind( &MachineUnit::state_relaxation_start, this ) );
	state( state_readyfire ).add_onActivateCallBack( std::bind( &MachineUnit::state_readyfire_start, this ) );
	state( state_charging ).add_onActivateCallBack( std::bind( &MachineUnit::state_charging_start, this ) );
	state( state_waittarget ).add_onActivateCallBack( std::bind( &MachineUnit::state_waittarget_start, this ) );
	state( state_move ).add_onActivateCallBack( std::bind( &MachineUnit::state_move_start, this ) );
	state( state_stop ).add_onActivateCallBack( std::bind( &MachineUnit::state_stop_start, this ) );
	state( state_death ).add_onActivateCallBack( std::bind( &MachineUnit::state_die_start, this ) );
	state( state_death ).add_onDeactivateCallBack( std::bind( &MachineUnit::state_die_finish, this ) );
	state( state_enter ).add_onActivateCallBack( std::bind( &MachineUnit::state_enter_start, this ) );

	state( state_charging ).set_updateCallback( std::bind( &MachineUnit::state_charging_update, this, std::placeholders::_1 ) );
	state( state_cocking ).set_updateCallback( std::bind( &MachineUnit::state_cocking_update, this, std::placeholders::_1 ) );
	state( state_relaxation ).set_updateCallback( std::bind( &MachineUnit::state_relaxation_update, this, std::placeholders::_1 ) );
	state( state_readyfire ).set_updateCallback( std::bind( &MachineUnit::state_readyfire_update, this, std::placeholders::_1 ) );
	state( state_charging ).set_updateCallback( std::bind( &MachineUnit::state_charging_update, this, std::placeholders::_1 ) );
	state( state_waittarget ).set_updateCallback( std::bind( &MachineUnit::state_waittarget_update, this, std::placeholders::_1 ) );
	state( state_move ).set_updateCallback( std::bind( &MachineUnit::state_move_update, this, std::placeholders::_1 ) );
	state( state_stop ).set_updateCallback( std::bind( &MachineUnit::state_stop_update, this, std::placeholders::_1 ) );
	state( state_death ).set_updateCallback( std::bind( &MachineUnit::state_die_update, this, std::placeholders::_1 ) );
	state( state_enter ).set_updateCallback( std::bind( &MachineUnit::state_enter_update, this, std::placeholders::_1 ) );

	start( state_sleep );
	return true;
}

void MachineUnit::load_other( const pugi::xml_node & node )
{}

void MachineUnit::load_params( const pugi::xml_node & xmlparams )
{
	auto xmlfire = xmlparams.child( k::xmlTag::MachineUnitStateFire );
	auto xmlwait = xmlparams.child( k::xmlTag::MachineUnitStateWait );
	auto xmlcocking = xmlparams.child( k::xmlTag::MachineUnitStateCocking );
	auto xmlcharging = xmlparams.child( k::xmlTag::MachineUnitStateCharging );
	auto xmlrelaxation = xmlparams.child( k::xmlTag::MachineUnitStateRelaxation );
	auto xmldeath = xmlparams.child( k::xmlTag::MachineUnitDie );
	auto xmlenter = xmlparams.child( k::xmlTag::MachineUnitEnter );

	_fireReady.charge_volume = xmlfire.attribute( "charge_volume" ).as_int( );
	_fireReady.charge_volume_default = _fireReady.charge_volume;
	_fireReady.delay = xmlfire.attribute( "delay" ).as_float( );
	_fireReady.havetarget = xmlfire.attribute( "havetarget" ).as_bool(true);
	_wait.duration = xmlwait.attribute( "duration" ).as_float( );
	_cocking.duration = xmlcocking.attribute( "duration" ).as_float( );
	_charging.duration = xmlcharging.attribute( "duration" ).as_float( );
	_relaxation.duration = xmlrelaxation.attribute( "duration" ).as_float( );
	_death.duration = xmldeath.attribute( "duration" ).as_float( );
	_enter.duration = xmlenter.attribute( "duration" ).as_float();
}

void MachineUnit::capture_target( Unit * target )
{
	push_event( target ? event_seetarget : event_notarget );
	_target = target;
}

Unit * MachineUnit::get_target( )
{
	return nullptr;
}

void MachineUnit::update( float dt )
{
	process( );
	current_state( ).update( (void*)(&dt) );
}

void MachineUnit::move( )
{
	push_event( event_move );
	process( );
}

void MachineUnit::stop( )
{
	push_event( event_stop );
	process( );
}

void MachineUnit::die( )
{
	push_event( event_die );
	process( );
}



void MachineUnit::state_sleep_update( void * data )
{
	if( (_timer -= *((float*)data)) <= 0 )
	{
	}
}

void MachineUnit::state_cocking_update( void * data )
{
	if( (_timer -= *((float*)data)) <= 0 )
	{
		push_event( event_ready );
	}
}

void MachineUnit::state_relaxation_update( void * data )
{
	if( (_timer -= *((float*)data)) <= 0 )
	{
		push_event( event_sleep );
	}
}

void MachineUnit::state_readyfire_update( void * data )
{
	readyfire_update( *((float*)data) );
	if( _fireReady.havetarget && _target == nullptr )
	{
		push_event( Event::event_notarget );
		return;
	}

	if( (_timer -= *((float*)data)) <= 0 )
	{
		if( _fireReady.charge_volume <= 0 )
		{
			push_event( event_charge );
		}
		else
		{
			_timer += _fireReady.delay;
			on_shoot( _fireReady.charge_volume_default - _fireReady.charge_volume );
			--_fireReady.charge_volume;

			//if( _fireReady.charge_volume == 0 )
			//	on_emptycharge( 0 );
		}
	}
}

void MachineUnit::state_charging_update( void * data )
{
	if( (_timer -= *((float*)data)) <= 0 )
	{
		push_event( event_ready );
		_fireReady.charge_volume = _fireReady.charge_volume_default;
	}
}

void MachineUnit::state_waittarget_update( void * data )
{
	if( (_timer -= *((float*)data)) <= 0 )
	{
		push_event( event_relax );
	}
}

void MachineUnit::state_move_update( void * data )
{
	move_update( *((float*)(data)) );
}

void MachineUnit::state_stop_update( void * data )
{
	stop_update( *((float*)(data)) );
}

void MachineUnit::state_die_update( void * data )
{
	float dt = *((float*)(data));
	_timer -= dt;
	die_update( dt );

	if( _timer <= 0 )
	{
		push_event( event_stop );
	}
}

void MachineUnit::state_enter_update( void * data )
{
	float dt = *((float*)(data));
	_timer -= dt;
	enter_update( dt );
	if( _timer <= 0 )
	{
		push_event( event_stop );
	}
}

void MachineUnit::state_sleep_start( )
{
	_timer = 0;
	on_sleep( 0 );
}

void MachineUnit::state_cocking_start( )
{
	_timer = _cocking.duration;
	on_cocking( _cocking.duration );
}

void MachineUnit::state_relaxation_start( )
{
	_timer = _relaxation.duration;
	on_relaxation( _relaxation.duration );
}

void MachineUnit::state_readyfire_start( )
{
	_timer = 0;// _fireReady.delay;
	on_readyfire( _fireReady.delay );
}

void MachineUnit::state_charging_start( )
{
	_timer = _charging.duration;
	on_charging( _charging.duration );
}

void MachineUnit::state_waittarget_start( )
{
	_timer = _wait.duration;
	on_waittarget( _wait.duration );
}

void MachineUnit::state_move_start( )
{
	on_move();
}

void MachineUnit::state_stop_start( )
{
	on_stop();
}

void MachineUnit::state_die_start( )
{
	_timer = _death.duration;
	on_die();
}

void MachineUnit::state_enter_start( )
{
	_timer = _enter.duration;
	on_enter();
}

void MachineUnit::state_sleep_finish( ) {}
void MachineUnit::state_cocking_finish( ) {}
void MachineUnit::state_relaxation_finish( ) {}
void MachineUnit::state_readyfire_finish( ) {}
void MachineUnit::state_charging_finish( ) {}
void MachineUnit::state_waittarget_finish( ) {}
void MachineUnit::state_move_finish( ) {}
void MachineUnit::state_stop_finish( ) {}
void MachineUnit::state_die_finish( )
{
	on_die_finish( );
}
void MachineUnit::state_enter_finish( ) {}


/***********************************************************/

bool test_MachineUnit( )
{
	for( MachineUnit::State state = (MachineUnit::State)(MachineUnit::state_start + 1); state != MachineUnit::state_unknow; state = (MachineUnit::State)(state + 1) )
	{
		MachineUnit machine;
		if( !machine.init( ) )
			return false;

		machine.start( state );
		for( MachineUnit::Event event = (MachineUnit::Event)(MachineUnit::event_start + 1); event != MachineUnit::event_unknow; event = (MachineUnit::Event)(event + 1) )
		{
			machine.push_event( event );
			machine.update( 0 );
		}
	}

	//test sleep state
	{
		MachineUnit machine;
		if( !machine.init( ) )
			return false;
		machine.start( MachineUnit::state_sleep );
		//machine.push_event( MachineUnit::event_seetarget );
		machine.push_event( MachineUnit::event_ready );
		machine.push_event( MachineUnit::event_charge );
		machine.push_event( MachineUnit::event_notarget );
		machine.push_event( MachineUnit::event_relax );
		machine.push_event( MachineUnit::event_sleep );
		machine.process( );
		if( machine.current_state( ).get_name( ) != MachineUnit::state_sleep )
			return false;
		machine.push_event( MachineUnit::event_seetarget );
		machine.process( );
		if( machine.current_state( ).get_name( ) != MachineUnit::state_cocking )
			return false;
	}
	//test cocking state
	{
		MachineUnit machine;
		if( !machine.init( ) )
			return false;
		machine.start( MachineUnit::state_cocking );
		machine.push_event( MachineUnit::event_seetarget );
		//machine.push_event( MachineUnit::event_ready );
		machine.push_event( MachineUnit::event_charge );
		machine.push_event( MachineUnit::event_notarget );
		machine.push_event( MachineUnit::event_relax );
		machine.push_event( MachineUnit::event_sleep );
		machine.process( );
		if( machine.current_state( ).get_name( ) != MachineUnit::state_cocking )
			return false;
		machine.push_event( MachineUnit::event_ready );
		machine.process( );
		if( machine.current_state( ).get_name( ) != MachineUnit::state_readyfire )
			return false;
	}
	//test ready fire state
	{
		MachineUnit machine;
		if( !machine.init( ) )
			return false;
		machine.start( MachineUnit::state_readyfire );
		machine.push_event( MachineUnit::event_seetarget );
		machine.push_event( MachineUnit::event_ready );
		//machine.push_event( MachineUnit::event_charge );
		//machine.push_event( MachineUnit::event_notarget );
		machine.push_event( MachineUnit::event_relax );
		machine.push_event( MachineUnit::event_sleep );
		machine.process( );
		if( machine.current_state( ).get_name( ) != MachineUnit::state_readyfire )
			return false;

		machine.push_event( MachineUnit::event_charge );
		machine.process( );
		if( machine.current_state( ).get_name( ) != MachineUnit::state_charging )
			return false;

		machine.start( MachineUnit::state_readyfire );
		machine.push_event( MachineUnit::event_notarget );
		machine.process( );
		if( machine.current_state( ).get_name( ) != MachineUnit::state_waittarget )
			return false;
	}

	//test charging state
	{
		MachineUnit machine;
		if( !machine.init( ) )
			return false;
		machine.start( MachineUnit::state_charging );
		machine.push_event( MachineUnit::event_seetarget );
		//machine.push_event( MachineUnit::event_ready );
		machine.push_event( MachineUnit::event_charge );
		//machine.push_event( MachineUnit::event_notarget );
		machine.push_event( MachineUnit::event_relax );
		machine.push_event( MachineUnit::event_sleep );
		machine.process( );
		if( machine.current_state( ).get_name( ) != MachineUnit::state_charging )
			return false;

		//machine.push_event( MachineUnit::event_ready );
		//machine.process( );
		//if( machine.current_state( ).name( ) != MachineUnit::state_readyfire )
		//	return false;

		machine.start( MachineUnit::state_charging );
		machine.push_event( MachineUnit::event_ready );
		machine.process( );
		if( machine.current_state( ).get_name( ) != MachineUnit::state_waittarget )
			return false;
	}

	//test waittarget state
	{
		MachineUnit machine;
		if( !machine.init( ) )
			return false;
		machine.start( MachineUnit::state_waittarget );
		//machine.push_event( MachineUnit::event_seetarget );
		machine.push_event( MachineUnit::event_ready );
		machine.push_event( MachineUnit::event_charge );
		machine.push_event( MachineUnit::event_notarget );
		//machine.push_event( MachineUnit::event_relax );
		machine.push_event( MachineUnit::event_sleep );
		machine.process( );
		if( machine.current_state( ).get_name( ) != MachineUnit::state_waittarget )
			return false;

		machine.push_event( MachineUnit::event_seetarget );
		machine.process( );
		if( machine.current_state( ).get_name( ) != MachineUnit::state_readyfire )
			return false;

		machine.start( MachineUnit::state_waittarget );
		machine.push_event( MachineUnit::event_relax );
		machine.process( );
		if( machine.current_state( ).get_name( ) != MachineUnit::state_relaxation )
			return false;
	}

	//test relaxation state
	{
		MachineUnit machine;
		if( !machine.init( ) )
			return false;
		machine.start( MachineUnit::state_relaxation );
		machine.push_event( MachineUnit::event_seetarget );
		machine.push_event( MachineUnit::event_ready );
		machine.push_event( MachineUnit::event_charge );
		machine.push_event( MachineUnit::event_notarget );
		machine.push_event( MachineUnit::event_relax );
		//machine.push_event( MachineUnit::event_sleep );
		machine.process( );
		if( machine.current_state( ).get_name( ) != MachineUnit::state_relaxation )
			return false;
		machine.push_event( MachineUnit::event_sleep );
		machine.process( );
		if( machine.current_state( ).get_name( ) != MachineUnit::state_sleep )
			return false;
	}

	return true;
};


NS_CC_END