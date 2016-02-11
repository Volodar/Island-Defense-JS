/******************************************************************************
 * Copyright 2014-2016 Vladimir Tolmachev
 * Copyright 2016 Visionarity AG
 * Vladimir Tolmachev and Visionarity AG have unlimited commercial
 * licenses for commercial use and customization
 *
 * Author: Vladimir Tolmachev (tolm_vl@hotmail.com)
 * Ported C++ to Javascript: Visionarity AG / Vladimir Tolmachev
 * Project: Island Defense (JS)
 * If you received the code not from the author, please contact us
 ******************************************************************************/

//Define namespace
var EU = EU || {};

EU.MachineUnit = function() {

    /** For Test Instance of */
    this.__MachineUnit = true;

    EU.MachineExt.call(this);

    this.State =  EU.MachineUnit.State;
    this.Event =  EU.MachineUnit.Event;

    /** @return void */ this.on_shoot = function( index ) {},
    /** @return void */ this.on_sleep = function( duration ) {},
    /** @return void */ this.on_cocking = function( duration ) {},
    /** @return void */ this.on_relaxation = function( duration ) {},
    /** @return void */ this.on_readyfire = function( duration ) {},
    /** @return void */ this.on_charging = function( duration ) {},
    /** @return void */ this.on_waittarget = function( duration ) {},
    /** @return void */ this.on_move = function() {},
    /** @return void */ this.on_stop = function() {},
    /** @return void */ this.on_die = function() {},
    /** @return void */ this.on_die_finish = function() {},
    /** @return void */ this.on_enter = function() {},

    /** @return void */ this.move_update = function( dt ) {},
    /** @return void */ this.stop_update = function( dt ) {},
    /** @return void */ this.die_update = function( dt ) {},
    /** @return void */ this.enter_update = function( dt ) {},
    /** @return void */ this.readyfire_update = function( dt ) {},

    
    this.Cocking = function(duration) { this.duration = duration},
    this.Relaxation = function(duration) { this.duration = duration},
    this.Charging = function(duration) { this.duration = duration},
    this.Wait = function(duration) { this.duration = duration},
    this.Death = function(duration) { this.duration = duration},
    this.Enter = function(duration) { this.duration = duration},
    this.FireReady = function(delay, havetarget, charge_volume, charge_volume_default)
    {
        //float predelay;
        //float postdelay;
        this.delay = delay;
        this.havetarget = havetarget ;
        this.charge_volume = charge_volume ;
        this.charge_volume_default = charge_volume_default;
    },

    this._cocking = null,
    this._relaxation = null,
    this._charging = null,
    this._wait = null,
    this._fireReady = null,
    this._death = null,
    this._enter = null,
    this._timer = null, //float
    this._target = null, //EU.Unit

    this.init = function() {
        //this._super();
        this._cocking = new this.Cocking( 0.0 );
        this._relaxation = new this.Relaxation( 0.0 );
        this._charging = new this.Charging( 0.0 );
        this._wait = new this.Wait( 0.0 );
        this._death = new this.Death( 0.0 );
        this._enter = new this.Enter( 0.0 );
        this._fireReady = new this.FireReady(  0, true, 0, 0 );
        this._timer = 0.0;
        this._target = null;
            
        this.FSM_ADD_STATE( "sleep");
        this.FSM_ADD_STATE( "enter");
        this.FSM_ADD_STATE( "cocking");
        this.FSM_ADD_STATE( "relaxation");
        this.FSM_ADD_STATE( "readyfire");
        this.FSM_ADD_STATE( "charging");
        this.FSM_ADD_STATE( "waittarget");
        this.FSM_ADD_STATE( "move");
        this.FSM_ADD_STATE( "stop");
        this.FSM_ADD_STATE( "death");

        this.FSM_ADD_EVENT( "seetarget");
        this.FSM_ADD_EVENT( "ready");
        this.FSM_ADD_EVENT( "charge");
        this.FSM_ADD_EVENT( "notarget");
        this.FSM_ADD_EVENT( "relax");
        this.FSM_ADD_EVENT( "sleep");
        this.FSM_ADD_EVENT( "move");
        this.FSM_ADD_EVENT( "stop");
        this.FSM_ADD_EVENT( "die");

        this.state_tag( this.State.state_sleep ).add_onActivateCallBack( this.state_sleep_start);
        this.state_tag( this.State.state_cocking ).add_onActivateCallBack( this.state_cocking_start);
        this.state_tag( this.State.state_relaxation ).add_onActivateCallBack( this.state_relaxation_start);
        this.state_tag( this.State.state_readyfire ).add_onActivateCallBack( this.state_readyfire_start);
        this.state_tag( this.State.state_charging ).add_onActivateCallBack( this.state_charging_start);
        this.state_tag( this.State.state_waittarget ).add_onActivateCallBack( this.state_waittarget_start);
        this.state_tag( this.State.state_move ).add_onActivateCallBack( this.state_move_start);
        this.state_tag( this.State.state_stop ).add_onActivateCallBack( this.state_stop_start);
        this.state_tag( this.State.state_death ).add_onActivateCallBack( this.state_die_start);
        this.state_tag( this.State.state_death ).add_onDeactivateCallBack( this.state_die_finish);
        this.state_tag( this.State.state_enter ).add_onActivateCallBack( this.state_enter_start);

        this.state_tag( this.State.state_charging ).set_updateCallback( this.state_charging_update);
        this.state_tag( this.State.state_cocking ).set_updateCallback( this.state_cocking_update);
        this.state_tag( this.State.state_relaxation ).set_updateCallback( this.state_relaxation_update);
        this.state_tag( this.State.state_readyfire ).set_updateCallback( this.state_readyfire_update);
        this.state_tag( this.State.state_charging ).set_updateCallback( this.state_charging_update);
        this.state_tag( this.State.state_waittarget ).set_updateCallback( this.state_waittarget_update);
        this.state_tag( this.State.state_move ).set_updateCallback( this.state_move_update);
        this.state_tag( this.State.state_stop ).set_updateCallback( this.state_stop_update);
        this.state_tag( this.State.state_death ).set_updateCallback( this.state_die_update);
        this.state_tag( this.State.state_enter ).set_updateCallback( this.state_enter_update);

        this.start( this.State.state_sleep );
    },

    this.load_other = function(/**@type {Element} */node )
    {},
    this.load_params = function(/**@type {Element} */xmlparams )
    {
        var xmlfire = xmlparams.getElementsByTagName( EU.k.xmlTag.MachineUnitStateFire )[0];
        var xmlwait = xmlparams.getElementsByTagName( EU.k.xmlTag.MachineUnitStateWait )[0];
        var xmlcocking = xmlparams.getElementsByTagName( EU.k.xmlTag.MachineUnitStateCocking )[0];
        var xmlcharging = xmlparams.getElementsByTagName( EU.k.xmlTag.MachineUnitStateCharging )[0];
        var xmlrelaxation = xmlparams.getElementsByTagName( EU.k.xmlTag.MachineUnitStateRelaxation )[0];
        var xmldeath = xmlparams.getElementsByTagName( EU.k.xmlTag.MachineUnitDie )[0];
        var xmlenter = xmlparams.getElementsByTagName( EU.k.xmlTag.MachineUnitEnter )[0];

        this._fireReady.charge_volume = parseInt(xmlfire.attribute( "charge_volume" ));
        this._fireReady.charge_volume_default = this._fireReady.charge_volume;
        this._fireReady.delay = parseFloat(xmlfire.attribute( "delay" ));
        this._fireReady.havetarget = !(xmlfire.attribute( "havetarget" ) === "no");
        this._wait.duration = parseFloat(xmlwait.attribute( "duration" ));
        this._cocking.duration = parseFloat(xmlcocking.attribute( "duration" ));
        this._charging.duration = parseFloat(xmlcharging.attribute( "duration" ));
        this._relaxation.duration = parseFloat(xmlrelaxation.attribute( "duration" ));
        this._death.duration = parseFloat(xmldeath.attribute( "duration" ));
        this._enter.duration = parseFloat(xmlenter.attribute( "duration" ));
    },
    this.capture_target = function( target )
    {
        this.push_event( target ? this.Event.event_seetarget : this.Event.event_notarget );
        this._target = target;
    },
    this.get_target = function( )
    {
        return null;
    },
    this.update = function(dt )
    {
        this.process( );
        this.current_state().update( dt);
    },
    this.move = function( )
    {
        this.push_event( this.Event.event_move );
        this.process( );
    },
    this.stop = function( )
    {
        this.push_event( this.Event.event_stop );
        this.process( );
    },
    this.die = function( )
    {
        this.push_event( this.Event.event_die );
        this.process( );
    },
    this.state_sleep_update = function( data )
    {
        if( (this._timer -= data) <= 0 )
        {
        }
    },
    this.state_cocking_update = function( data )
    {
        if( (this._timer -= data) <= 0 )
        {
            this.push_event( this.Event.event_ready );
        }   
    },
    this.state_relaxation_update = function( data )
    {
        if( (this._timer -= data) <= 0 )
        {
            this.push_event( this.Event.event_sleep );
        }
    },
    this.state_readyfire_update = function( data )
    {
        this.readyfire_update( data );
        if( this._fireReady.havetarget && this._target == null )
        {
            this.push_event( this.Event.event_notarget );
            return;
        }
        if( (this._timer -= data) <= 0 )
        {
            if( this._fireReady.charge_volume <= 0 )
            {
                this.push_event( this.Event.event_charge );
            }    
        else
            {
                this._timer += this._fireReady.delay;
                this.on_shoot( this._fireReady.charge_volume_default - this._fireReady.charge_volume );
                --this._fireReady.charge_volume;

                //if( this._fireReady.charge_volume == 0 )
                //	on_emptycharge( 0 );
            }    
        }
    },
    this.state_charging_update = function( data )
    {
        if( (this._timer -= data) <= 0 )
        {
            this.push_event( this.Event.event_ready );
            this._fireReady.charge_volume = this._fireReady.charge_volume_default;
        }    
    },
    this.state_waittarget_update = function( data )
    {
        if( (this._timer -= data) <= 0 )
        {
            this.push_event( this.Event.event_relax );
        }    
    },
    this.state_move_update = function( data )
    {
        this.move_update( data );
    },
    this.state_stop_update = function( data )
    {
        this.stop_update( data );
    },
    this.state_die_update = function( data )
    {
        var dt = data;
        this._timer -= dt;
        this.die_update( dt );

        if( this._timer <= 0 )
        {
            this.push_event( this.Event.event_stop );
        }    
    },
    this.state_enter_update = function( data )
    {
        var dt = data;
        this._timer -= dt;
        this.enter_update( dt );
        if( this._timer <= 0 )
        {
            this.push_event( this.Event.event_stop );
        }    
    },
    this.state_sleep_start = function( )
    {
        this._timer = 0;
        this.on_sleep( 0 );
    },
    this.state_cocking_start = function( )
    {
        this._timer = this._cocking.duration;
        this.on_cocking( this._cocking.duration );
    },
    this.state_relaxation_start = function( )
    {
        this._timer = this._relaxation.duration;
        this.on_relaxation( this._relaxation.duration );
    },
    this.state_readyfire_start = function( )
    {
        this._timer = 0;// this._fireReady.delay;
        this.on_readyfire( this._fireReady.delay );
    },
    this.state_charging_start = function( )
    {
        this._timer = this._charging.duration;
        this.on_charging( this._charging.duration );
    },
    this.state_waittarget_start = function( )
    {
        this._timer = this._wait.duration;
        this.on_waittarget( this._wait.duration );
    },
    this.state_move_start = function( )
    {
        this.on_move();
    },
    this.state_stop_start = function( )
    {
        this.on_stop();
    },
    this.state_die_start = function( )
    {
        this._timer = this._death.duration;
        this.on_die();
    },
    this.state_enter_start = function( )
    {
        this._timer = this._enter.duration;
        this.on_enter();
    },
    this.state_sleep_finish = function( ) {},    
    this.state_cocking_finish = function( ) {},
    this.state_relaxation_finish = function( ) {},
    this.state_readyfire_finish = function( ) {},
    this.state_charging_finish = function( ) {},
    this.state_waittarget_finish = function( ) {},
    this.state_move_finish = function( ) {},
    this.state_stop_finish = function( ) {},
    this.state_die_finish = function( )
    {
        this.on_die_finish( );
    },    
    this.state_enter_finish = function( ) {},

    /***********************************************************/

    /**@return {Boolean}*/ this.test_MachineUnit = function( )
    {
        for( var state = this.Event.state_start + 1; state != this.Event.state_unknow; state = state + 1)
        {
            var machine = new EU.Machine();
            if( machine == null)
                return false;
            machine.start( state );
            for( var event = this.Event.event_start + 1; event != this.Event.event_unknow; event = (event + 1) )
            {
                machine.push_event( event );
                machine.update( 0 );
            }    
        }
        //test sleep state
        {
            var machine = new EU.Machine();
            if( machine == null)
                return false;
            machine.start( this.Event.state_sleep );
            //machine.push_event( this.Event.event_seetarget );
            machine.push_event( this.Event.event_ready );
            machine.push_event( this.Event.event_charge );
            machine.push_event( this.Event.event_notarget );
            machine.push_event( this.Event.event_relax );
            machine.push_event( this.Event.event_sleep );
            machine.process( );
            if( machine.current_state( ).get_name( ) != this.Event.state_sleep )
                return false;
            machine.push_event( this.Event.event_seetarget );
            machine.process( );
            if( machine.current_state( ).get_name( ) != this.Event.state_cocking )
                return false;
        }
        //test cocking state
        {
            var machine = new EU.Machine();
            if( machine == null)
                return false;
            machine.start( this.Event.state_cocking );
            machine.push_event( this.Event.event_seetarget );
            //machine.push_event( this.Event.event_ready );
            machine.push_event( this.Event.event_charge );
            machine.push_event( this.Event.event_notarget );
            machine.push_event( this.Event.event_relax );
            machine.push_event( this.Event.event_sleep );
            machine.process( );
            if( machine.current_state( ).get_name( ) != this.Event.state_cocking )
                return false;
            machine.push_event( this.Event.event_ready );
            machine.process( );
            if( machine.current_state( ).get_name( ) != this.Event.state_readyfire )
                return false;
        }
        //test ready fire state
        {
            var machine = new EU.Machine();
            if( machine == null)
                return false;
            machine.start( this.Event.state_readyfire );
            machine.push_event( this.Event.event_seetarget );
            machine.push_event( this.Event.event_ready );
            //machine.push_event( this.Event.event_charge );
            //machine.push_event( this.Event.event_notarget );
            machine.push_event( this.Event.event_relax );
            machine.push_event( this.Event.event_sleep );
            machine.process( );
            if( machine.current_state( ).get_name( ) != this.Event.state_readyfire )
                return false;

            machine.push_event( this.Event.event_charge );
            machine.process( );
            if( machine.current_state( ).get_name( ) != this.Event.state_charging )
                return false;

            machine.start( this.Event.state_readyfire );
            machine.push_event( this.Event.event_notarget );
            machine.process( );
            if( machine.current_state( ).get_name( ) != this.Event.state_waittarget )
                return false;
        }
        //test charging state
        {
            var machine = new EU.Machine();
            if( machine == null)
                return false;
            machine.start( this.Event.state_charging );
            machine.push_event( this.Event.event_seetarget );
            //machine.push_event( this.Event.event_ready );
            machine.push_event( this.Event.event_charge );
            //machine.push_event( this.Event.event_notarget );
            machine.push_event( this.Event.event_relax );
            machine.push_event( this.Event.event_sleep );
            machine.process( );
            if( machine.current_state( ).get_name( ) != this.Event.state_charging )
                return false;

            //machine.push_event( this.Event.event_ready );
            //machine.process( );
            //if( machine.current_state( ).name( ) != this.Event.state_readyfire )
            //	return false;

            machine.start( this.Event.state_charging );
            machine.push_event( this.Event.event_ready );
            machine.process( );
            if( machine.current_state( ).get_name( ) != this.Event.state_waittarget )
                return false;
        }
        //test waittarget state
        {
            var machine = new EU.Machine();
            if( machine == null)
                return false;
            machine.start( this.Event.state_waittarget );
            //machine.push_event( this.Event.event_seetarget );
            machine.push_event( this.Event.event_ready );
            machine.push_event( this.Event.event_charge );
            machine.push_event( this.Event.event_notarget );
            //machine.push_event( this.Event.event_relax );
            machine.push_event( this.Event.event_sleep );
            machine.process( );
            if( machine.current_state( ).get_name( ) != this.Event.state_waittarget )
                return false;

            machine.push_event( this.Event.event_seetarget );
            machine.process( );
            if( machine.current_state( ).get_name( ) != this.Event.state_readyfire )
                return false;

            machine.start( this.Event.state_waittarget );
            machine.push_event( this.Event.event_relax );
            machine.process( );
            if( machine.current_state( ).get_name( ) != this.Event.state_relaxation )
                return false;
        }
        //test relaxation state
        {
            var machine = new EU.Machine();
            if( machine == null)
                return false;
            machine.start( this.Event.state_relaxation );
            machine.push_event( this.Event.event_seetarget );
            machine.push_event( this.Event.event_ready );
            machine.push_event( this.Event.event_charge );
            machine.push_event( this.Event.event_notarget );
            machine.push_event( this.Event.event_relax );
            //machine.push_event( this.Event.event_sleep );
            machine.process( );
            if( machine.current_state( ).get_name( ) != this.Event.state_relaxation )
                return false;
            machine.push_event( this.Event.event_sleep );
            machine.process( );
            if( machine.current_state( ).get_name( ) != this.Event.state_sleep )
                return false;
        }
        return true;
    }
};

EU.MachineUnit.State =  Object.freeze(
{
    state_start : 0,
    state_enter : 1,
    state_sleep : 2,
    state_cocking : 3,
    state_relaxation : 4,
    state_readyfire : 5,
    state_charging : 6,
    state_waittarget : 7,
    state_move : 8,
    state_stop : 9,
    state_death : 10,
    state_unknow : 11
});

EU.MachineUnit.Event = Object.freeze(
{
    event_start : 0,
    event_seetarget : 1,
    event_ready : 2,
    event_charge : 3,
    event_notarget : 4,
    event_relax : 5,
    event_sleep : 6,
    event_move : 7,
    event_stop : 8,
    event_die : 9,
    event_unknow : 10
});
