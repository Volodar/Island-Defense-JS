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

EU.SmartScene = cc.Scene.extend(
{
    //void shadow_appearance( var z = 1, var opacity = 204 );
    /** @type {cc.Layer} */ _mainlayer : null,
    /** @type {cc.Sprite} */ _shadow : null,
    /** @type {Boolean} */ _nowBlockedTopLayer : false ,
    /** @type {Array<cc.Layer>} deque*/ _stack : [],

    ctor: function( mainlayer )
    {
        this._super();
        var dessize = cc.view.getDesignResolutionSize();

        this.resetMainLayer( mainlayer );

        this._shadow = EU.ImageManager.sprite( "images/square.png" );
        this._shadow.setName( "shadow" );
        this._shadow.setScaleX( dessize.width );
        this._shadow.setScaleY( dessize.height );
        this._shadow.setColor( new cc.Color( 0, 0, 0 ) );
        this._shadow.setOpacity( 0 );
        this._shadow.setPosition( new cc.Point( dessize.x / 2, dessize.y / 2 ) );
        this.addChild( this._shadow, 1 );

        return true;
    },

    getMainLayer: function() { return this._mainlayer; },

    onExit: function()
    {
        while( this._stack.length > 1 )
        {
            var layer = this._stack.pop();
            layer.onExit();
        }
        this._super();
    },
    resetMainLayer: function( mainlayer )
    {
        if( mainlayer == this._mainlayer ) return;

        if( this._mainlayer )
        {
            this.removeChild( this._mainlayer );
            EU.assert( this._stack.length == 1 );
            this._stack = [];
        }
        this._mainlayer = mainlayer;
        if( this._mainlayer )
        {
            this.addChild( this._mainlayer, 0 );
            this._stack.push( this._mainlayer );
        }
     },

    shadow_appearance: function( z, opacity )
    {
        z = z || 1;
        opacity = opacity || 204;

        this._shadow.setLocalZOrder( z );
        this._shadow.runAction( new cc.FadeTo( 0.2, opacity ) );
     },

    shadow_disappearance: function()
    {
        this._shadow.runAction( new cc.FadeTo( 0.2, 0 ) );
     },

    /**
     *
     * @param {cc.Layer} layer
     * @param exitPrevious
     */
    pushLayer: function(  layer, exitPrevious )
    {
        this.shadow_appearance();
        if( layer )
        {
            EU.assert( this._stack.length > 0 );
            var top = this._stack.slice(-1)[0];
            var z = top.getLocalZOrder() + 2;
            this._shadow.setLocalZOrder( z - 1 );

            var self = this;
            layer.onExit = function() {
                self.on_layerClosed.call(self, layer);
                this._super();
            };
            this.addChild( layer, z );

            this._stack.push( layer );
            if( exitPrevious )
                top.onExit();
        }
     },

    on_layerClosed: function( /**@type {cc.Layer} layer */ layer )
    {
        if( this._nowBlockedTopLayer ) return;

        if( layer == this._stack[this._stack.length - 1])
        {
            EU.assert( this._stack.length >= 2 );
            this._stack.pop();
            this._stack.slice(-1)[0].onEnter();
        }
        if( this._stack.length > 0 )
        {
            var top = this._stack.slice(-1)[0];
            this._shadow.setLocalZOrder( top.getLocalZOrder() - 1 );
        }
        if( this._stack.length == 1 )
        {
            this.shadow_disappearance();
        }
        //removeChild( layer );
     },

    blockTopLayer: function()
    {
        if( this._stack.length > 0 )
        {
            this._nowBlockedTopLayer = true;
            var top = this._stack.slice(-1)[0];
            EU.assert( top.isRunning() );
            top.onExit();
            this._shadow.setLocalZOrder( top.getLocalZOrder() + 1 );
        }
     },

    unblockTopLayer: function()
    {
        if( this._stack.length > 0 )
        {
            var top = this._stack.slice(-1)[0];
            //EU.assert( top.isRunning() == false );
            if(top.isRunning() == false)
                top.onEnter();
            this._shadow.setLocalZOrder( top.getLocalZOrder() - 1 );
            this._nowBlockedTopLayer = false;
        }
    }
});


