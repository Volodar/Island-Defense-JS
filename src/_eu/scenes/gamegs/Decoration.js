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

EU.Decoration = cc.Sprite.extend({
    action : null,
    actionDescription : null,
    startPosition : null,
    ctor: function (node, touch) {
        this._super();
        this.action = null;
        this.actionDescription = "";
        this.startPosition = cc.p(0,0);
    },
    setAction: function( action ){ this.action = action; },
    getAction: function(){ return this.action; },
    setStartPosition: function( pos ){ this.startPosition = pos; },
    getStartPosition: function(){ return this.startPosition; },
    setActionDescription: function( desc ){ this.actionDescription = desc; },
    getActionDescription: function(){ return this.actionDescription; },
});
