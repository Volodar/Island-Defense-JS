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

EU.TowerPlaceDef = cc.Class.extend({
    position: null,
    isActive: null,
    ctor: function(){
        this.position = cc.p(0,0);
        this.isActive = true;
    }
});

EU.TowerPlace = cc.Sprite.extend(
{
    /** For Test Instance of */
    __TowerPlace : true,

    _cost : 0,
    _active : false,

    ctor: function( def )
    {
        this._super();
        this._active = def.isActive;
        this.changeView();
        this.setPosition( def.position );
        return true;
    },
    changeView: function( )
    {
        var image = "";
        if( this._active )
        {
            var duration = 0.5 + cc.randomMinus1To1()*0.1;

            //TODO: EU.Animation
            var frames = [];
            frames.push( EU.k.resourceGameSceneFolder + "active_slot/active_slot_01.png" );
            frames.push( EU.k.resourceGameSceneFolder + "active_slot/active_slot_02.png" );
            frames.push( EU.k.resourceGameSceneFolder + "active_slot/active_slot_03.png" );
            frames.push( EU.k.resourceGameSceneFolder + "active_slot/active_slot_04.png" );
            frames.push( EU.k.resourceGameSceneFolder + "active_slot/active_slot_05.png" );
            frames.push( EU.k.resourceGameSceneFolder + "active_slot/active_slot_06.png" );
            frames.push( EU.k.resourceGameSceneFolder + "active_slot/active_slot_07.png" );
            frames.push( EU.k.resourceGameSceneFolder + "active_slot/active_slot_08.png" );
            frames.push( EU.k.resourceGameSceneFolder + "active_slot/active_slot_09.png" );
            frames.push( EU.k.resourceGameSceneFolder + "active_slot/active_slot_10.png" );
            frames.push( EU.k.resourceGameSceneFolder + "active_slot/active_slot_11.png" );
            frames.push( EU.k.resourceGameSceneFolder + "active_slot/active_slot_12.png" );
            frames.push( EU.k.resourceGameSceneFolder + "active_slot/active_slot_13.png" );
            frames.push( EU.k.resourceGameSceneFolder + "active_slot/active_slot_14.png" );
            frames.push( EU.k.resourceGameSceneFolder + "active_slot/active_slot_15.png" );
            var anim = EU.Animation.createAnimation_t( frames, duration );
            EU.assert( anim );

            var animate = cc.repeatForever( cc.animate( anim ) );
            var action = animate ;

            this.runAction( action );
            image = EU.k.resourceGameSceneFolder + "active_slot/active_slot_01.png";
        }
        else
        {
            image = EU.k.resourceGameSceneFolder + "unactive_slot.png";
            var frame = EU.ImageManager.getSpriteFrame( image );
            if( frame )
            {
                this.setSpriteFrame( frame );
                return;
            }
            EU.xmlLoader.setProperty( this, EU.xmlKey.Image.name, image );
        }

    },
    
    checkClick: function(  location )
    {
        var result = {};
        result.clicked = EU.checkRadiusByEllipse( location, this.getPosition(), 50 );
        result.distance = cc.pDistance(this.getPosition(), location );
        return result;
    },
    selected: function( )
    {
        //var s0 = ScaleTo.create( 0.5f, 1.5f );
        //var s1 = ScaleTo.create( 0.5f, 1.0f );
        //var action = RepeatForever.create( Sequence.create( s0, s1, nullptr ) );
        //runAction( action );
    },
    unselected: function( )
    {
        //stopAllActions( );
        //setScale( 1 );
    },
    getActive: function( )
    {
        return this._active;
    },
    setActive: function()
    {
        EU.assert( this._active == false );
    
        this._active = true;
        this.changeView();
    }

});

    
    
   