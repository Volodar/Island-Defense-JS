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

EU.Observer = cc.Node.extend({
    listeners: null,
    lockCounter: null,
    ctor: function (){
        this._super();
        this.listeners = {};
        this.lockCounter = 0;
    },
    add: function( ID, callback, target) {
        EU.assert(callback && target);
        EU.assert(cc.isFunction(callback));
        this.listeners[ID] = {};
        this.listeners[ID][callback] = callback;
        this.listeners[ID][target] = target;
    },
    remove: function( ID ){
        if( ID in this.listeners )
            this.listeners[ID] = undefined;
    },
    pushevent: function() {
        if( this.lockCounter == 0 )
        for (var ID in this.listeners) {
            var target = this.listeners[ID].target;
            var callback = this.listeners[ID].callback;
            if (arguments.length == 0)
                target.callback();
            else if (arguments.length == 1)
                target.callback(arguments[0]);
            else if (arguments.length == 2)
                target.callback(arguments[0], arguments[1]);
            else if (arguments.length == 3)
                target.callback(arguments[0], arguments[1], arguments[2]);
            else
                EU.assert(0);
        }
    },
    lock: function(){
        ++this.lockCounter;
        EU.assert( this.lockCounter > 0);
    },
    unlock: function(){
        --this.lockCounter;
        EU.assert( this.lockCounter >= 0);
    }
});