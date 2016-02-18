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

EU.MenuItemCooldown = EU.MenuItemImageWithText.extend(
{
    /** @type {cc.ProgressTimer} */ _timer : null,
    /** @type {cc.FiniteTimeAction} */ _action : null,
    /** @type {Number} */ _duration : 0,
    /** @type {Sprite} */ _cancelImage : null,
    /** @type {string} */ _cancelImageResource : null,
    /** @type {string} */ _animationFrame : null,


    ctor: function( /**@type {String} */ back, /**@type {String} */ forward, /**@type {Number} */ duration,
                    /**@type {Function} */ callback, /**@type {string} */ resourceCancel )
    {

        this._timer = null;
        this._action = null;
        this._duration = 0;
        this._cancelImage = null;
        this._cancelImageResource = resourceCancel;

        var e = "";

        var CB = callback ? callback : this._callback;
        this._super();
        this.initWithNormalImage( forward, "", back, e, e, CB );

        if( forward.length > 0 )
        {
            var image = EU.ImageManager.sprite( forward );
            image.setOpacity( 92 );
            this._timer = new cc.ProgressTimer( image );
            if ( !this._timer ) return null;

            image.setAnchorPoint( cc.p(0,0) );
            this._timer.setType( cc.ProgressTimer.TYPE_BAR );
            this._timer.setMidpoint( cc.p( 0.5, 0 ) );
            this._timer.setBarChangeRate( cc.p( 0, 1 ) );
            this._timer.setAnchorPoint( cc.p(0,0) );
            this._timer.setPercentage( 0 );
            this.getDisabledImage().addChild( this._timer, 1 );
            this.getDisabledImage().setOpacity( 128 );
            this._duration = duration;

            var timer = new cc.ProgressFromTo( this._duration, 0, 100 );
            var disabler = cc.callFunc(this.setEnabled.bind(this, false ), this);
            var enabler = cc.callFunc( this.setEnabled.bind(this, true ), this);
            var call = cc.callFunc( this.onFull, this );
            this._action = cc.sequence( disabler, timer, enabler, call );
        }

        if( this._cancelImageResource != resourceCancel && resourceCancel.length > 0 )
        {
            this._cancelImageResource = resourceCancel;
        }

        if (this._cancelImageResource.length > 0 && this.getNormalImage())
        {
            if (this._cancelImage)
                this._cancelImage.removeFromParent();

            this._cancelImage = EU.ImageManager.sprite( this._cancelImageResource );
            this.addChild( this._cancelImage );

            this._cancelImage.setAnchorPoint(cc.p(0.5, 0.5));
            this._cancelImage.setPosition(cc.p(cc.pMult(this.getNormalImage().getContentSize(), 0.5)));
            this._cancelImage.setCascadeColorEnabled(true);
            this._cancelImage.setCascadeOpacityEnabled(true);
            this._cancelImage.setVisible(false);

            //var s1 = cc.scaleTo( 0.4, 1.2 );
            //var s2 = cc.scaleTo( 0.4, 1.0 );
            //var d = cc.delayTime( 1 );
            //var s = cc.sequence( s1, s2, d, null );
            //var action = new cc.RepeatForever( new cc.EaseInOut( s, 0.5 ) );
            //_cancelImage.runAction( action );
        }

        return true;
    },

    run: function( )
    {
        this.showCancel( false );
        if( this._timer )
            this._timer.runAction( this._action.clone() );
    },

    stop: function()
    {
        this.showCancel( false );
        if( this._timer )
        {
            this._timer.stopAllActions();
            this._timer.setPercentage( 0 );
        }
        this.setEnabled( false );
    },

    showCancel: function( /**@type {var} */ mode )
    {
        if( this._cancelImage )
        {
            this._cancelImage.setVisible( mode );
        }
        if (this._normalImage && this._timer )
        {
            this._normalImage.setVisible( this._timer.getPercentage() >= 100.0 );
        }
    },

    setAnimationOnFull: function( /**@type {var} */ animationFrame )
    {
        this._animationFrame = animationFrame;
    },

    setPercentage: function( /**@type {var} */ percent )
    {
        if( this._timer )
            this._timer.setPercentage( percent );
    },

    on_click: function( /**@type {var} */ sender )
    {
        this._super( sender );
    },

    onFull: function( )
    {
        if( this._animationFrame.length == 0 )
            return;
        var frames = [];
        frames.push( "buttoln_skills.button_" + this._animationFrame + "_0001.png" );
        frames.push( "buttoln_skills.button_" + this._animationFrame + "_0002.png" );
        frames.push( "buttoln_skills.button_" + this._animationFrame + "_0003.png" );
        frames.push( "buttoln_skills.button_" + this._animationFrame + "_0004.png" );
        frames.push( "buttoln_skills.button_" + this._animationFrame + "_0005.png" );
        frames.push( "buttoln_skills.button_" + this._animationFrame + "_0006.png" );
        frames.push( "buttoln_skills.button_" + this._animationFrame + "_0007.png" );

        if (!EU.k.desertBuild) {
            frames.push( "buttoln_skills.button_" + this._animationFrame + "_0008.png" );
            frames.push( "buttoln_skills.button_" + this._animationFrame + "_0009.png" );
            frames.push( "buttoln_skills.button_" + this._animationFrame + "_0010.png" );
            frames.push( "buttoln_skills.button_" + this._animationFrame + "_0011.png" );
            frames.push( "buttoln_skills.button_" + this._animationFrame + "_0012.png" );
            frames.push( "buttoln_skills.button_" + this._animationFrame + "_0013.png" );
            frames.push( "buttoln_skills.button_" + this._animationFrame + "_0014.png" );
            frames.push( "buttoln_skills.button_" + this._animationFrame + "_0015.png" );
            frames.push( "buttoln_skills.button_" + this._animationFrame + "_0016.png" );
            frames.push( "buttoln_skills.button_" + this._animationFrame + "_0017.png" );
        }

        if( EU.ImageManager.getSpriteFrame( frames[0] ) == null )
            return;

        var sprite = EU.ImageManager.sprite( frames[0] );

        var animation = EU.Animation.createAnimation( frames, 0.5 );
        var animate = cc.animate( animation );
        var remover = cc.callFunc( sprite.removeFromParent.bind(sprite) );
        var action = cc.sequence( animate, remover );

        sprite.runAction( action );
        this.getNormalImage().addChild( sprite, 99 );
        sprite.setPosition( cc.p(c.pAdd(cc.pMult(this.getNormalImage().getContentSize(), 1 / 2 )) , cc.p( 1.5, -1.5 )) );

    },

    selected: function()
    {
        this._super();

        if (this._useScaleEffectOnSelected)
        {
           var tag = 0x123;
            var actionC = cc.scaleTo(0.3, 0.8).easing(cc.easeIn(2));
            actionC.setTag(tag);
            if (this._cancelImage)
            {
                this._cancelImage.stopActionByTag(tag);
                this._cancelImage.runAction(actionC);
            }
        }
    },

    unselected: function()
    {
        this._super();

        if (this._useScaleEffectOnSelected)
        {
           var tag = 0x123;
            var actionC = cc.scaleTo(0.2, 1.0).easing(cc.easeIn(2));
            actionC.setTag(tag);
            if (this._cancelImage)
            {
                this._cancelImage.stopActionByTag(tag);
                this._cancelImage.runAction(actionC);
            }
        }
    }
});