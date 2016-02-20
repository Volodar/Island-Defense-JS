/******************************************************************************
 * Copyright 2014-2016 Vladimir Tolmachev
 * Copyright 2016 Visionarity AG
 * Vladimir Tolmachev and Visionarity AG have unlimited commercial
 * licenses for commercial use and customization
 *
 * Author: Vladimir Tolmachev (tolvl@hotmail.com)
 * Ported C++ to Javascript: Visionarity AG / Vladimir Tolmachev
 * Project: Island Defense (JS)
 * If you received the code not from the author, please contact us
 ******************************************************************************/

//Define namespace
var EU = EU || {};

EU.HeroIcon = EU.MenuItemImageWithText.extend({
    _hero : null,
    _timer : null,
    _cancelImage : null,
    _unselectedHero : null,
    _selectedHero : null,

    ctor:function( heroname, callback, target )
    {
        this._super( "", "", "", "", "", callback, target);
        var normal = EU.k.resourceGameSceneFolder + heroname + "_2" + ".png";
        var selected = EU.k.resourceGameSceneFolder + heroname + "_3" + ".png";
        var disabled = EU.k.resourceGameSceneFolder + heroname + "_1" + ".png";

        this._unselectedHero = normal;
        this._selectedHero = selected;

        var timer = EU.k.resourceGameSceneFolder + "hero_progressbar1" + ".png";
        var timer_bg = EU.k.resourceGameSceneFolder + "hero_progressbar2" + ".png";

        this.setImageNormal( normal );
        this.setImageDisabled( disabled );

        var progress = Node.create();
        var image = EU.ImageManager.sprite( timer );
        this._timer = new cc.ProgressTimer( image );

        image.setAnchorPoint( cc.p(0,0) );
        this._timer.setType( cc.ProgressTimer.TYPE_BAR );
        this._timer.setMidpoint( cc.p( 0.0, 0.5 ) );
        this._timer.setBarChangeRate( cc.p( 1, 0 ) );
        this._timer.setPercentage( 0 );

        progress.addChild( EU.ImageManager.sprite( timer_bg ) );
        progress.addChild( this._timer, 1 );

        this.addChild( progress );
        var pos = cc.p(0,0);
        pos.x = this.getNormalImage().getContentSize().width / 2;
        pos.y = -image.getContentSize().height * 0.7;
        progress.setPosition( pos );
    },

    setHero: function( hero )
    {
        EU.assert( !this._hero );
        EU.assert( hero );
        this._hero = hero;
        this._hero.observerHealth.add( __instanceId, this.dispatchHealth.bind(this) );
    },
    dispatchHealth:function(current, health){
        var percent = current / health * 100;
        this._timer.setPercentage( percent );
    
        var enabled = this._hero.current_state().get_name() != Hero.State.state_death;
        var opacity = enabled ? 255 : 128;
        this.setEnabled( enabled );
        this.getNormalImage().setOpacity( opacity );
        this._timer.setOpacity( opacity );
    },
    showCancel: function( mode )
    {
        if( this._cancelImage )
        {
            this._cancelImage.setVisible( mode );
        }

        if( this._hero )
        {
            this._hero.runEvent( mode ? "onselect" : "ondeselect" );
        }

        var image = mode ? this._selectedHero : this._unselectedHero;
        EU.xmlLoader.setProperty_int( this.getNormalImage(), EU.xmlKey.Image.int, image );
    }
});