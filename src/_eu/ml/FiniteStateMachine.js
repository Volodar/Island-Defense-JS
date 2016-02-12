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

EU.Tag = {
    InvalidTag : -1
};

EU.State = cc.Class.extend(
{
    /** For Test Instance of */
    __State : true,

    /** @type {EU.Machine} */ _machine : null,
    /** @type {string} */ _string_name : "",
    /** @type {Tag} */ _name : EU.Tag.InvalidTag,
    /** @type {Object<Event.toString(), [Event, Tag]>} */ _transitions : null,
    /** @type {Array<Tag>} */ _inherited_transitions : null,

    /** @type {Array<Function>} */ _onActivate : null,
    /** @type {Array<Function>} */ _onDeactivate : null,
    /** @type {Function} */ _onUpdate : null,


    ctor: function(machine, cb){
        this._machine = machine;
        this._transitions = {};
        this._inherited_transitions = [];
        this._onActivate = [];
        this._onDeactivate = [];
        this.add_onActivateCallBack( cb );
    },

    add_transition: function(/** Tag*/ onEvent,  /** Tag*/ toState )
    {
        var event = this._machine.event_tag( onEvent );
        var state = this._machine.state_tag( toState );
        var pair = [event, state.get_name() ];
        if (this._transitions[event.toString()]) {
            return false;
        } else {
            this._transitions[event.toString()] = pair ;
            return true;
        }
        //EU.assert( insertRes.second == true );
        //return insertRes.second;
    },

    inherit_transitions: function(  /** Tag*/ state )
    {
        this._inherited_transitions.push( state );
    },

    /**
     *
     * @param event
     * @returns {Tag}
     */
    process: function(event )
    {
        var result = EU.Tag.InvalidTag;
        var i = this._transitions[event.toString()];
        if(i)
        {
            result = i[1];
        }
        else
        {
            for (var j = 0; j < this._inherited_transitions.length; j++) {
                var tag = this._inherited_transitions[j];
                var state = this._machine.state_tag( tag );
                var state_next = state.process( event );
                if( state_next != EU.Tag.InvalidTag )
                {
                    result = state_next;
                    break;
                }
            }
        }
        return result;
    },

    set_name: function(/** Tag*/ name )
    {
        EU.assert( this._machine.is_exist_state( name ) == false );
        this._name = name;
    },

    set_string_name: function( name )
    {
        EU.assert( this._machine.is_exist_state( name ) == false );
        this._string_name = name;
    },

    get_name: function()
    {
        return this._name;
    },

    get_string_name: function()
    {
        return this._string_name;
    },

    update: function(  data )
    {
        if( this._onUpdate )
            this._onUpdate.call(this._machine, data );
    },

    onActivate: function()
    {
        this._execute( this._onActivate );
    },

    onDeactivate: function()
    {
        this._execute( this._onDeactivate );
    },

    add_onActivateCallBack: function(  cb )
    {
        this._add_callback( this._onActivate, cb );
    },

    add_onDeactivateCallBack: function(  cb )
    {
        this._add_callback( this._onDeactivate, cb );
    },

    set_updateCallback: function( cb )
    {
        this._onUpdate = cb;
    },

    clear_onActivateCallBack: function()
    {
        this._onActivate = [];
    },

    clear_onDeactivateCallBack: function()
    {
        this._onDeactivate = [];
    },

    _execute: function(  cblist )
    {
        for (var i = 0; i < cblist.length; i++) {
            var callback = cblist[i];
            EU.assert( callback );
            callback.call(this._machine);
        }
    },

    _add_callback: function( cblist,  cb)
    {
        if( cb )
        {
            cblist.push( cb );
        }
    }
});


EU.Event = cc.Class.extend({

    /** For Test Instance of */
    __Event : true,

    /*****************************************************************************/
    //MARK:	class Event
    /*****************************************************************************/

    /** @type {Machine&} */ _machine : null,
    /** @type {string} */ _string_name : "",
    /** @type {Tag} */ _name : null ,

    ctor: function( machine )
    {
        "use strict";
        this._machine = machine;
    },

    set_name: function( name )
    {
        EU.assert( this._machine.is_exist_event_tag( name ) == false );
        this._name = name;
    },

    set_string_name: function(name )
    {
        EU.assert( this._machine.is_exist_event_str( name ) == false );
        this._string_name = name;
    },
    get_name: function()
    {
        return this._name;
    },
    get_string_name: function()
    {
        return this._string_name;
    },
    toString: function() {
        "use strict";
        return this._string_name;
    }

});


EU.Machine = function(){

    /** For Test Instance of */
    this.__Machine = true;

    this.initMachine = function(){
        this._states = [];
        this._fsmEvents = [];
        this._eventsQueue = []
    };
    this.add_state = function( nameState, onActivate )
    {
        var i = this._get_state( nameState );
        EU.assert( this._isvalid( i ) == false );
        var state = new EU.State( this, onActivate );
        state.set_name( nameState );
        this._states.push( state );
        return state;
    };

    /** @type {State *} */ this._currentState = null;
    /** @type {StatesList} */ this._states = null;
    /** @type {EventsList} */ this._fsmEvents = null;
    /** @type {std.queue<Event*>} */ this._eventsQueue = null;


    /*****************************************************************************/
    //MARK:	class Machine
    /*****************************************************************************/

    // TODO: onExit function for Machine if necessary
    // this.onExitMachine = function()
    //{
    //    for( var i : this._states )
    //    delete i;
    //    for( var i : this._fsmEvents )
    //    delete i;
    //}

    this.start = function(  stateTag )
    {
        this._set_state(this.state_tag( stateTag ) );
    };

    this.is_exist_state = function( name )
    {
        return this._isvalid( this._get_state( name ) );
    };

    this.is_exist_state = function( name )
    {
        for (var i = 0; i < this._states.length; i++) {
            var state = this._states[i];
            if( state.get_string_name() == name )
                return true;
        }
        return false;
    };

    this.is_exist_event_tag = function( name )
    {
        return this._isvalid( this._event( name ) );
    };

    this.is_exist_event_str = function( name )
    {
        for (var i = 0; i < this._fsmEvents.length; i++) {
            var event = this._fsmEvents[i];
            if( event.get_string_name() == name )
                return true;
        }
        return false;
    };

    this.add_event = function( nameEvent )
    {
        EU.assert( this._isvalid( this._event( nameEvent ) ) == false );

        var event = new EU.Event(this );
        event.set_name( nameEvent );
        this._fsmEvents.push( event );

        return this._fsmEvents.slice(-1)[0];
    };

    this.event_tag = function( tag )
    {
        var i = this._event( tag );
        EU.assert( this._isvalid( i ) );
        return i;
    };

    this.event_str = function( name )
    {
        for (var i = 0; i < this._fsmEvents.length; i++) {
            var event = this._fsmEvents[i];
            if (event.get_string_name() == name )
                return event;
        }
        EU.assert( 0 );
        //TODO: this dummy can be static variable
        var dummy = new EU.Event( this );
        dummy.set_name( -1 );
        dummy.set_string_name( "dummy" );
        return dummy;
    };

    this.state_tag = function( tag )
    {
        var i = this._get_state( tag );
        EU.assert( this._isvalid( i ) );
        return i;
    };

    this.state_str = function( name )
    {
        for (var i = 0; i < this._states.length; i++) {
            var state = this._states[i];
            if (state.get_string_name() == name )
                return state;
        }
        EU.assert( 0 );
        //TODO: this dummy can be static variable
        var dummy = new EU.State( this, null );
        dummy.set_name( -1 );
        dummy.set_string_name( "dummy" );
        return dummy;
    };

    this.current_state = function()
    {
        return this._currentState;
    };

    this.process = function()
    {
        var queue = this._eventsQueue;
        this._eventsQueue = [];
        //lock.unlock();

        while( queue.length > 0 )
        {
            var event = queue[0];
            var nextState = this._currentState.process( event );
            var iState = this._get_state( nextState );
            if( this._isvalid( iState ) )
            {
                this._set_state( iState );
            }
            queue.shift();
        }
    };

    this.push_event = function( eventTag )
    {
        var event = this.event_tag( eventTag );
        this._eventsQueue.push( event );
    };

    this._isvalid = function( obj )
    {
        return obj != null && obj !== undefined;
    };

    this._event = function(tag )
    {
        for (var i = 0; i < this._fsmEvents.length; i++) {
            var event = this._fsmEvents[i];
            if (event.get_name() == tag )
                return event;
        }
        return null;
    };

    this._get_state = function(tag )
    {
        for (var i = 0; i < this._states.length; i++) {
            var state = this._states[i];
            if (state.get_name() == tag )
                return state;
        }
        return null;
    };

    this._set_state = function(state )
    {
        EU.assert( state );
        if( this._currentState )
            this._currentState.onDeactivate();
        this._currentState = state;
        this._currentState.onActivate();
    };
};

