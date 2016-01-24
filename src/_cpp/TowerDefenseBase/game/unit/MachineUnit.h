//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __MachineUnit_h__
#define __MachineUnit_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "MachineExt.h"
NS_CC_BEGIN

class Unit;

class MachineUnit : public MachineExt
{
	friend bool test_MachineUnit();
	/*
	state( state_sleep ).add_transition( event_seetarget, state_cocking );
	state( state_cocking ).add_transition( event_ready, state_readyfire );
	state( state_readyfire ).add_transition( event_charge, state_charging );
	state( state_readyfire ).add_transition( event_notarget, state_waittarget );
	state( state_charging ).add_transition( event_ready, state_waittarget );
	state( state_waittarget ).add_transition( event_relax, state_relaxation );
	state( state_waittarget ).add_transition( event_seetarget, state_readyfire );
	state( state_relaxation ).add_transition( event_sleep, state_sleep );
	*/
public:
	enum State
	{
		state_start = 0,
		state_enter,
		state_sleep,
		state_cocking,
		state_relaxation,
		state_readyfire,
		state_charging,
		state_waittarget,
		state_move,
		state_stop,
		state_death,
		state_unknow,
	};
	enum Event
	{
		event_start = 0,
		event_seetarget,
		event_ready,
		event_charge,
		event_notarget,
		event_relax,
		event_sleep,
		event_move,
		event_stop,
		event_die,
		event_unknow,
	};
public:
	virtual void capture_target( Unit * target );
	virtual Unit * get_target( );
	void update( float dt );

	void move( );
	void stop( );
	void die( );
protected:
	MachineUnit();
	virtual ~MachineUnit();
	bool init();
	virtual void load_other( const pugi::xml_node & node );
	void load_params( const pugi::xml_node & root );

	virtual void on_shoot( unsigned index ) {};
	virtual void on_sleep( float duration ) {};
	virtual void on_cocking( float duration ) {};
	virtual void on_relaxation( float duration ) {};
	virtual void on_readyfire( float duration ) {};
	virtual void on_charging( float duration ) {};
	virtual void on_waittarget( float duration ) {};
	virtual void on_move( ) {};
	virtual void on_stop( ) {};
	virtual void on_die( ) {};
	virtual void on_die_finish( ) {};
	virtual void on_enter() {};

	virtual void move_update( float dt ) {};
	virtual void stop_update( float dt ) {};
	virtual void die_update( float dt ) {};
	virtual void enter_update( float dt ) {};
	virtual void readyfire_update( float dt ) {};

private:
	void state_sleep_start();
	void state_cocking_start();
	void state_relaxation_start();
	void state_readyfire_start();
	void state_charging_start();
	void state_waittarget_start();
	void state_move_start( );
	void state_stop_start( );
	void state_die_start( );
	void state_enter_start();

	void state_sleep_finish();
	void state_cocking_finish();
	void state_relaxation_finish();
	void state_readyfire_finish();
	void state_charging_finish();
	void state_waittarget_finish();
	void state_move_finish( );
	void state_stop_finish( );
	void state_die_finish( );
	void state_enter_finish();

	void state_sleep_update( void * data );
	void state_cocking_update( void * data );
	void state_relaxation_update( void * data );
	void state_readyfire_update( void * data );
	void state_charging_update( void * data );
	void state_waittarget_update( void * data );
	void state_move_update( void * data );
	void state_stop_update( void * data );
	void state_die_update( void * data );
	void state_enter_update( void * data );
protected:
	struct Cocking { float duration; };
	struct Relaxation { float duration; };
	struct Charging { float duration; };
	struct Wait { float duration; };
	struct Death { float duration; };
	struct Enter { float duration; };
	struct FireReady
	{
		//float predelay;
		//float postdelay;
		float delay;
		bool havetarget;
		int charge_volume;
		int charge_volume_default;
	};

	Cocking _cocking;
	Relaxation _relaxation;
	Charging _charging;
	Wait _wait;
	FireReady _fireReady;
	Death _death;
	Enter _enter;
	float _timer;
private:
	Unit * _target;
};



bool test_MachineUnit();



NS_CC_END
#endif // #ifndef MachineUnit
