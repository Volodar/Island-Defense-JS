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

EU.MachineExt = function(){

    /** For Test Instance of */
    this.__MachineExt = true;

    EU.Machine.call(this);

    this.FSM_ADD_STATE = function(name) {
        return this.add_state( "state_" + name, null).set_string_name(name);
    },
    this.FSM_ADD_EVENT = function(name) {
        return this.add_event( "event_" + name).set_string_name(name);
    },
    /**
     * @type {Element} xmlmachine
     */
    this.load_xmlmachine = function(  xmlmachine )
    {
        for(var i=0; i < xmlmachine.children.length; i++){
            var xmlnode = xmlmachine.children[i];
            var tag = xmlnode.tagName;
            if( tag == EU.k.xmlTag.MachineUnitStateTransitions )
                this.load_transitions( xmlnode );
            else if( tag == EU.k.xmlTag.MachineUnitParams )
                this.load_params( xmlnode );
            else
                this.load_other( xmlnode );
        }

        var statename = xmlmachine.getAttribute( EU.k.xmlTag.StartState );
        if( EU.xmlLoader.stringIsEmpty(statename) == false )
        {
            var state = this.state_str( statename );
            this.start( state.get_name() );
        }
    },
    /**
     * @type {Element} xmlmachine
     */
    this.load_params = function(  xmlparams )
    {},
    /**
     * @type {Element} xmlparams
     */
    this.load_other = function(  xmlparams )
    {},
    /**
     * @type {Element} xmlmachine
     */
    this.load_transitions = function(  xmltransitions )
    {
        for(var i=0; i < xmltransitions.children.length; i++){
            var node = xmltransitions.children[i];
            var state = node.tagName;
            var event = node.attributes[0].name;
            var tostate = node.getAttribute( event );

            var from = this.state_str( state );
            var to = this.state_str( tostate );
            var by = this.event_str( event );

            from.add_transition( by.get_name(), to.get_name() );
        }
    }
};