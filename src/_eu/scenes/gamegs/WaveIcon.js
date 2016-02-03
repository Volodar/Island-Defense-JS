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

EU.WaveIcon = cc.Menu.extend(
{
    //friend class AutoPlayer;
    /**@type {cc.Node} */ _arrow : new cc.Node(),
    /**@type {EU.MenuItemImageWithText} */ _icon : null,
    /**@type {cc.ProgressTimer} */ _timer : null,
    /**@type {function} */ _callback : null,
    /**@type {cc.Point} */ _wavestart : new cc.Point(0,0),
    /**@type {Number} */ _elapsed : 0.0,
    /**@type {Number} */ _cooldown : 0.0,
    /**@type {Number} */ _duration : 0.0,
    /**@type {Boolean} */ _runned : false,

    ctor: function( startwave, delay, cooldown, onclick, type )
    {
        this._super();
        this.setPosition( 0, 0 );

        this._callback = onclick;
        this.assert( this._callback );
        this._cooldown = Math.min( delay, cooldown );
        this._duration = delay;

        var WaveIconSky = EU.k.resourceGameSceneFolder + "wave_direction0.png";
        var WaveIconEarth = EU.k.resourceGameSceneFolder + "wave_direction1.png";
        var WaveIconArrow = EU.k.resourceGameSceneFolder + "wave_direction2.png";
        var WaveIconTimer = EU.k.resourceGameSceneFolder + "wave_direction3.png";

        var iconImage;
        if( type == EU.UnitLayer.sky )
            iconImage = WaveIconSky;
        else
            iconImage = WaveIconEarth;

        var callback = this.on_click;
        this._icon = new EU.MenuItemImageWithText( iconImage, callback );
        this._icon.setSelectedImage( null );
        this._icon.setSound( kSoundGameWaveIcon );
        this._icon.setName( "icon" );
        this._arrow = Node.create();
        var arrowsprite = EU.ImageManager.sprite( WaveIconArrow );
        this._timer = new cc.ProgressTimer( EU.ImageManager.sprite( WaveIconTimer ) );
        EU.assert( this._icon );
        EU.assert( this._arrow );
        EU.assert( arrowsprite );
        EU.assert( this._timer );

        this._wavestart = startwave;
        this.addChild( this._icon );
        this._icon.addChild( this._arrow, -1 );
        this._arrow.addChild( arrowsprite );
        this._arrow.setPosition( Point( this._icon.getNormalImage().getContentSize().width / 2,
            this._icon.getNormalImage().getContentSize().height / 2 ) );
        arrowsprite.setPosition( 35, 0 );
        this._icon.getNormalImage().addChild( this._timer, 1 );
        this._timer.setPosition( Point( this._icon.getNormalImage().getContentSize() / 2 ) );

        var mover = ( new cc.MoveBy( 0.5, new cc.Point( 10, 0 ))).easing(cc.easeInOut(2.0));
        var scaler = ( new cc.ScaleBy( 0.5, 1.05)).easing(cc.easeInOut(2.0));
        var actionarrow = new cc.Sequence( mover, mover.reverse() );
        var actionicon = new cc.Sequence( scaler, scaler.reverse() );
        arrowsprite.runAction( new cc.RepeatForever( actionarrow ) );
        this._icon.runAction( new cc.RepeatForever( actionicon ) );

        this.setVisible( false );

        this.update( 0 );
        this.scheduleUpdate();
        return true;
    },

    update: function( dt )
    {
        var dessize = cc.director.getOpenGLView().getDesignResolutionSize();
        var worldpoint = GameGS.getInstance().getMainLayer().convertToWorldSpace( this._wavestart );
        var point = worldpoint;
        var borderx = 150.0;
        var bordery = 120.0;
        point.x = Math.max( borderx, point.x );
        point.x = Math.min( dessize.width - borderx, point.x );
        point.y = Math.max( bordery, point.y );
        point.y = Math.min( dessize.height - bordery, point.y );

        var rad = worldpoint - point;
        var angle = EU.Common.getDirectionByVector( rad );
        this._arrow.setRotation( angle );
        /*this._icon.*/this.setPosition( point );

        var self = this;
        var visible = this._elapsed > this._cooldown;
        var playsound = this._elapsed < 0.000 && visible && (visible != this.isVisible( ));
        this.setVisible( visible );
        if( visible && this._runned == false )
        {
            this._runned = true;
            if( this._duration > 0 )
            {
                var actiontimer = new cc.ProgressFromTo( this._duration, 0, 100 );
                var call = new cc.CallFunc( function(){ self.on_click.call(self)});
                var actiontimer2 = new cc.Sequence( actiontimer, call );
                this._timer.runAction( actiontimer2 );
            }
            else
            {
                this._timer.setPercentage( 100 );
            }

        }
        if( playsound )
        {
            var sound = EU.xmlLoader.macros.parse( "##sound_waveicon##" );
            cc.audioEngine.playEffect( sound, false );
        }
        this._elapsed += dt;
    },
    on_click: function()
    {
        if( this._callback )
        {
            this._callback( this, this._elapsed, this._duration );
        }
    },
    setActive: function(variable)
    {
        this._elapsed = Math.max( this._cooldown, this._elapsed );
    }
});
