//Define namespace
var EU = EU || {};

EU.MachineExt = EU.Machine.extend({

    FSM_ADD_STATE: function(name) {
        return EU.Machine.add_state( "state_" + name, null).set_string_name(name);
    },
    FSM_ADD_EVENT: function(name) {
        return EU.Machine.add_event( "event_" + name).set_string_name(name);
    },
    /**
     * @type {Element} xmlmachine
     */
    load: function(  xmlmachine )
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
        if( EU.xmlLoader.isEmpty(statename) == false )
        {
            var state = EU.Machine.state( statename );
            this.start( state.get_name() );
        }
    },
    /**
     * @type {Element} xmlmachine
     */
    load_params: function(  xmlparams )
    {},
    /**
     * @type {Element} xmlparams
     */
    load_other: function(  xmlparams )
    {},
    /**
     * @type {Element} xmlmachine
     */
    load_transitions: function(  xmltransitions )
    {
        for(var i=0; i < xmltransitions.children.length; i++){
            var node = xmltransitions.children[i];
            var state = node.tagName;
            var event = node.attributes[0].name;
            var tostate = node.getAttribute( event );

            var from = EU.Machine.state( state );
            var to = EU.Machine.state( tostate );
            var by = EU.Machine.event( event );

            from.add_transition( by.get_name(), to.get_name() );
        }
    }
});