
//Define namespace
var EU = EU || {};

EU.MachineUnit = EU.MachineExt.extend(
{

    State : Object.freeze(
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
    }),
    Event : Object.freeze(
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
    }),

    /** @return void */ on_shoot: function( index ) {},
    /** @return void */ on_sleep: function( duration ) {},
    /** @return void */ on_cocking: function( duration ) {},
    /** @return void */ on_relaxation: function( duration ) {},
    /** @return void */ on_readyfire: function( duration ) {},
    /** @return void */ on_charging: function( duration ) {},
    /** @return void */ on_waittarget: function( duration ) {},
    /** @return void */ on_move: function() {},
    /** @return void */ on_stop: function() {},
    /** @return void */ on_die: function() {},
    /** @return void */ on_die_finish: function() {},
    /** @return void */ on_enter: function() {},

    /** @return void */ move_update: function( dt ) {},
    /** @return void */ stop_update: function( dt ) {},
    /** @return void */ die_update: function( dt ) {},
    /** @return void */ enter_update: function( dt ) {},
    /** @return void */ readyfire_update: function( dt ) {},

    
    Cocking : function(duration) { this.duration = duration},
    Relaxation : function(duration) { this.duration = duration},
    Charging : function(duration) { this.duration = duration},
    Wait : function(duration) { this.duration = duration},
    Death : function(duration) { this.duration = duration},
    Enter : function(duration) { this.duration = duration},
    FireReady: function(delay, havetarget, charge_volume, charge_volume_default)
    {
        //float predelay;
        //float postdelay;
        this.delay = delay;
        this.havetarget = havetarget ;
        this.charge_volume = charge_volume ;
        this.charge_volume_default = charge_volume_default;
    },

    _cocking: null,
    _relaxation: null,
    _charging: null,
    _wait: null,
    _fireReady: null,
    _death: null,
    _enter: null,
    _timer: null, //float
    _target: null, //EU.Unit

    ctor: function() {
        this._super();
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

        this.state( this.State.state_sleep ).add_onActivateCallBack( this.state_sleep_start);
        this.state( this.State.state_cocking ).add_onActivateCallBack( this.state_cocking_start);
        this.state( this.State.state_relaxation ).add_onActivateCallBack( this.state_relaxation_start);
        this.state( this.State.state_readyfire ).add_onActivateCallBack( this.state_readyfire_start);
        this.state( this.State.state_charging ).add_onActivateCallBack( this.state_charging_start);
        this.state( this.State.state_waittarget ).add_onActivateCallBack( this.state_waittarget_start);
        this.state( this.State.state_move ).add_onActivateCallBack( this.state_move_start);
        this.state( this.State.state_stop ).add_onActivateCallBack( this.state_stop_start);
        this.state( this.State.state_death ).add_onActivateCallBack( this.state_die_start);
        this.state( this.State.state_death ).add_onDeactivateCallBack( this.state_die_finish);
        this.state( this.State.state_enter ).add_onActivateCallBack( this.state_enter_start);

        this.state( this.State.state_charging ).set_updateCallback( this.state_charging_update);
        this.state( this.State.state_cocking ).set_updateCallback( this.state_cocking_update);
        this.state( this.State.state_relaxation ).set_updateCallback( this.state_relaxation_update);
        this.state( this.State.state_readyfire ).set_updateCallback( this.state_readyfire_update);
        this.state( this.State.state_charging ).set_updateCallback( this.state_charging_update);
        this.state( this.State.state_waittarget ).set_updateCallback( this.state_waittarget_update);
        this.state( this.State.state_move ).set_updateCallback( this.state_move_update);
        this.state( this.State.state_stop ).set_updateCallback( this.state_stop_update);
        this.state( this.State.state_death ).set_updateCallback( this.state_die_update);
        this.state( this.State.state_enter ).set_updateCallback( this.state_enter_update);

        this.start( this.State.state_sleep );
    },

    load_other: function(/**@type {Element} */node )
    {},
    load_params: function(/**@type {Element} */xmlparams )
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
    capture_target: function( target )
    {
        this.push_event( target ? EU.MachineUnit.Event.event_seetarget : EU.MachineUnit.Event.event_notarget );
        this._target = target;
    },
    get_target: function( )
    {
        return null;
    },
    update: function(dt )
    {
        this.process( );
        this.current_state().update( dt);
    },
    move: function( )
    {
        this.push_event( EU.MachineUnit.Event.event_move );
        this.process( );
    },
    stop: function( )
    {
        this.push_event( EU.MachineUnit.Event.event_stop );
        this.process( );
    },
    die: function( )
    {
        this.push_event( EU.MachineUnit.Event.event_die );
        this.process( );
    },
    state_sleep_update: function( data )
    {
        if( (this._timer -= data) <= 0 )
        {
        }
    },
    state_cocking_update: function( data )
    {
        if( (this._timer -= data) <= 0 )
        {
            this.push_event( EU.MachineUnit.Event.event_ready );
        }   
    },
    state_relaxation_update: function( data )
    {
        if( (this._timer -= data) <= 0 )
        {
            this.push_event( EU.MachineUnit.Event.event_sleep );
        }
    },
    state_readyfire_update: function( data )
    {
        this.readyfire_update( data );
        if( this._fireReady.havetarget && this._target == null )
        {
            this.push_event( EU.MachineUnit.Event.event_notarget );
            return;
        }
        if( (this._timer -= data) <= 0 )
        {
            if( this._fireReady.charge_volume <= 0 )
            {
                this.push_event( EU.MachineUnit.Event.event_charge );
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
    state_charging_update: function( data )
    {
        if( (this._timer -= data) <= 0 )
        {
            this.push_event( EU.MachineUnit.Event.event_ready );
            this._fireReady.charge_volume = this._fireReady.charge_volume_default;
        }    
    },
    state_waittarget_update: function( data )
    {
        if( (this._timer -= data) <= 0 )
        {
            this.push_event( EU.MachineUnit.Event.event_relax );
        }    
    },
    state_move_update: function( data )
    {
        this.move_update( data );
    },
    state_stop_update: function( data )
    {
        this.stop_update( data );
    },
    state_die_update: function( data )
    {
        var dt = data;
        this._timer -= dt;
        this.die_update( dt );

        if( this._timer <= 0 )
        {
            this.push_event( EU.MachineUnit.Event.event_stop );
        }    
},
    state_enter_update: function( data )
    {
        var dt = data;
        this._timer -= dt;
        this.enter_update( dt );
        if( this._timer <= 0 )
        {
            this.push_event( EU.MachineUnit.Event.event_stop );
        }    
},
    state_sleep_start: function( )
    {
        this._timer = 0;
        this.on_sleep( 0 );
    },
    state_cocking_start: function( )
    {
        this._timer = this._cocking.duration;
        this.on_cocking( this._cocking.duration );
    },
    state_relaxation_start: function( )
    {
        this._timer = this._relaxation.duration;
        this.on_relaxation( this._relaxation.duration );
    },
    state_readyfire_start: function( )
    {
        this._timer = 0;// this._fireReady.delay;
        this.on_readyfire( this._fireReady.delay );
    },
    state_charging_start: function( )
    {
        this._timer = this._charging.duration;
        this.on_charging( this._charging.duration );
    },
    state_waittarget_start: function( )
    {
        this._timer = this._wait.duration;
        this.on_waittarget( this._wait.duration );
    },
    state_move_start: function( )
    {
        this.on_move();
    },
    state_stop_start: function( )
    {
        this.on_stop();
    },
    state_die_start: function( )
    {
        this._timer = this._death.duration;
        this.on_die();
    },
    state_enter_start: function( )
    {
        this._timer = this._enter.duration;
        this.on_enter();
    },
    state_sleep_finish: function( ) {},    
    state_cocking_finish: function( ) {},
    state_relaxation_finish: function( ) {},
    state_readyfire_finish: function( ) {},
    state_charging_finish: function( ) {},
    state_waittarget_finish: function( ) {},
    state_move_finish: function( ) {},
    state_stop_finish: function( ) {},
    state_die_finish: function( )
    {
        this.on_die_finish( );
    },    
    state_enter_finish: function( ) {},

    /***********************************************************/

    /**@return {Boolean}*/ test_MachineUnit: function( )
    {
        for( var state = EU.MachineUnit.Event.state_start + 1; state != EU.MachineUnit.Event.state_unknow; state = state + 1)
        {
            var machine = new EU.Machine();
            if( machine == null)
                return false;
            machine.start( state );
            for( var event = EU.MachineUnit.Event.event_start + 1; event != EU.MachineUnit.Event.event_unknow; event = (event + 1) )
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
            machine.start( EU.MachineUnit.Event.state_sleep );
            //machine.push_event( EU.MachineUnit.Event.event_seetarget );
            machine.push_event( EU.MachineUnit.Event.event_ready );
            machine.push_event( EU.MachineUnit.Event.event_charge );
            machine.push_event( EU.MachineUnit.Event.event_notarget );
            machine.push_event( EU.MachineUnit.Event.event_relax );
            machine.push_event( EU.MachineUnit.Event.event_sleep );
            machine.process( );
            if( machine.current_state( ).get_name( ) != EU.MachineUnit.Event.state_sleep )
                return false;
            machine.push_event( EU.MachineUnit.Event.event_seetarget );
            machine.process( );
            if( machine.current_state( ).get_name( ) != EU.MachineUnit.Event.state_cocking )
                return false;
        }
        //test cocking state
        {
            var machine = new EU.Machine();
            if( machine == null)
                return false;
            machine.start( EU.MachineUnit.Event.state_cocking );
            machine.push_event( EU.MachineUnit.Event.event_seetarget );
            //machine.push_event( EU.MachineUnit.Event.event_ready );
            machine.push_event( EU.MachineUnit.Event.event_charge );
            machine.push_event( EU.MachineUnit.Event.event_notarget );
            machine.push_event( EU.MachineUnit.Event.event_relax );
            machine.push_event( EU.MachineUnit.Event.event_sleep );
            machine.process( );
            if( machine.current_state( ).get_name( ) != EU.MachineUnit.Event.state_cocking )
                return false;
            machine.push_event( EU.MachineUnit.Event.event_ready );
            machine.process( );
            if( machine.current_state( ).get_name( ) != EU.MachineUnit.Event.state_readyfire )
                return false;
        }
        //test ready fire state
        {
            var machine = new EU.Machine();
            if( machine == null)
                return false;
            machine.start( EU.MachineUnit.Event.state_readyfire );
            machine.push_event( EU.MachineUnit.Event.event_seetarget );
            machine.push_event( EU.MachineUnit.Event.event_ready );
            //machine.push_event( EU.MachineUnit.Event.event_charge );
            //machine.push_event( EU.MachineUnit.Event.event_notarget );
            machine.push_event( EU.MachineUnit.Event.event_relax );
            machine.push_event( EU.MachineUnit.Event.event_sleep );
            machine.process( );
            if( machine.current_state( ).get_name( ) != EU.MachineUnit.Event.state_readyfire )
                return false;

            machine.push_event( EU.MachineUnit.Event.event_charge );
            machine.process( );
            if( machine.current_state( ).get_name( ) != EU.MachineUnit.Event.state_charging )
                return false;

            machine.start( EU.MachineUnit.Event.state_readyfire );
            machine.push_event( EU.MachineUnit.Event.event_notarget );
            machine.process( );
            if( machine.current_state( ).get_name( ) != EU.MachineUnit.Event.state_waittarget )
                return false;
        }
        //test charging state
        {
            var machine = new EU.Machine();
            if( machine == null)
                return false;
            machine.start( EU.MachineUnit.Event.state_charging );
            machine.push_event( EU.MachineUnit.Event.event_seetarget );
            //machine.push_event( EU.MachineUnit.Event.event_ready );
            machine.push_event( EU.MachineUnit.Event.event_charge );
            //machine.push_event( EU.MachineUnit.Event.event_notarget );
            machine.push_event( EU.MachineUnit.Event.event_relax );
            machine.push_event( EU.MachineUnit.Event.event_sleep );
            machine.process( );
            if( machine.current_state( ).get_name( ) != EU.MachineUnit.Event.state_charging )
                return false;

            //machine.push_event( EU.MachineUnit.Event.event_ready );
            //machine.process( );
            //if( machine.current_state( ).name( ) != EU.MachineUnit.Event.state_readyfire )
            //	return false;

            machine.start( EU.MachineUnit.Event.state_charging );
            machine.push_event( EU.MachineUnit.Event.event_ready );
            machine.process( );
            if( machine.current_state( ).get_name( ) != EU.MachineUnit.Event.state_waittarget )
                return false;
        }
        //test waittarget state
        {
            var machine = new EU.Machine();
            if( machine == null)
                return false;
            machine.start( EU.MachineUnit.Event.state_waittarget );
            //machine.push_event( EU.MachineUnit.Event.event_seetarget );
            machine.push_event( EU.MachineUnit.Event.event_ready );
            machine.push_event( EU.MachineUnit.Event.event_charge );
            machine.push_event( EU.MachineUnit.Event.event_notarget );
            //machine.push_event( EU.MachineUnit.Event.event_relax );
            machine.push_event( EU.MachineUnit.Event.event_sleep );
            machine.process( );
            if( machine.current_state( ).get_name( ) != EU.MachineUnit.Event.state_waittarget )
                return false;

            machine.push_event( EU.MachineUnit.Event.event_seetarget );
            machine.process( );
            if( machine.current_state( ).get_name( ) != EU.MachineUnit.Event.state_readyfire )
                return false;

            machine.start( EU.MachineUnit.Event.state_waittarget );
            machine.push_event( EU.MachineUnit.Event.event_relax );
            machine.process( );
            if( machine.current_state( ).get_name( ) != EU.MachineUnit.Event.state_relaxation )
                return false;
        }
        //test relaxation state
        {
            var machine = new EU.Machine();
            if( machine == null)
                return false;
            machine.start( EU.MachineUnit.Event.state_relaxation );
            machine.push_event( EU.MachineUnit.Event.event_seetarget );
            machine.push_event( EU.MachineUnit.Event.event_ready );
            machine.push_event( EU.MachineUnit.Event.event_charge );
            machine.push_event( EU.MachineUnit.Event.event_notarget );
            machine.push_event( EU.MachineUnit.Event.event_relax );
            //machine.push_event( EU.MachineUnit.Event.event_sleep );
            machine.process( );
            if( machine.current_state( ).get_name( ) != EU.MachineUnit.Event.state_relaxation )
                return false;
            machine.push_event( EU.MachineUnit.Event.event_sleep );
            machine.process( );
            if( machine.current_state( ).get_name( ) != EU.MachineUnit.Event.state_sleep )
                return false;
        }
        return true;
    }
});



