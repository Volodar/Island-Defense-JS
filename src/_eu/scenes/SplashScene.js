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


EU.SplashScene = cc.Layer.extend({

    /** @type {Label} */ _gold : null,
    /** @type {Label} */ _fuel : null,
    /** @type {Label} */ _time : null,
    /** @type {Label} */ _star : null,
    /** @type {MenuItem} */ _shop : null,


    ctor: function()
    {
        this._super();
        EU.assert( this.init(), "Cannot init a SplashScene");
    },

    /**
     * Do not call this init, call the constructor instead
     * @returns {boolean}
     */
    init: function()
    {
        //CC_BREAK_IF( !Scene::init() );
        if ( EU.NodeExt.prototype.init.call(this) ) return false;

        this.load_str( EU.xmlLoader.resourcesRoot + "splash/splash.xml" );
        this.runEvent( "appearance" );

        var action = this.getAction("delay");
        if( !action )
            return false;

        var duration = /**FiniteTimeAction*/ action.getDuration();
        var delay = new cc.delayTime(duration);
        var func = new cc.callFunc( function()
        {
            var scene = EU.MainGS.scene();
            cc.director.runScene( scene );
        } );
        this.runAction( new cc.sequence(delay, func) );

        return true;
    }

});

EU.NodeExt.call(EU.SplashScene.prototype);
