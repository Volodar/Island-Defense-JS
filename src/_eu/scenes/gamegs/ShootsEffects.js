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

EU.ShootsEffectsBullet = cc.Sprite.extend(
{

    /*****************************************************************************/
    //MARK: class ShootsEffectsBullet
    /*****************************************************************************/

    ctor: function( position )
    {
        //int correan = rand() % 3;
        //if( correan != 0 )
        //	return false;
        this._super();

        /**@type Array<String> */var textures = [];
        textures.push( "splash::splash1_0001.png" );
        textures.push( "splash::splash1_0002.png" );
        textures.push( "splash::splash1_0003.png" );
        textures.push( "splash::splash1_0004.png" );
        textures.push( "splash::splash1_0005.png" );
        textures.push( "splash::splash1_0006.png" );
        textures.push( "splash::splash1_0007.png" );
        textures.push( "splash::splash1_0008.png" );
        textures.push( "splash::splash1_0009.png" );
        textures.push( "splash::splash1_0010.png" );
        textures.push( "splash::splash1_0011.png" );

        var x = cc.randomMinus1To1() * 25;
        var y = cc.randomMinus1To1() * 12;
        var pos = position;
        pos.x += x;
        pos.y += y / EU.k.IsometricValue;
        this.setPosition( pos );

        var animation = EU.Animation.createAnimation( textures, 0.5 );
        var animate =  cc.animate( animation );
        var remover =  cc.callFunc(   this.removeFromParent.bind( this, true ) );
        this.runAction(  cc.sequence( animate, remover ) );

        return true;
    }

});

EU.ShootsEffectsLighting = cc.Sprite.extend(
{
    /** @type {EU.Unit} */ _base : null,
    /** @type {EU.Unit} */ _target : null,
    /** @type {Number} */ _timer : null,
    /** @type {Point} */ _baseOffset : null,
    /** @type {Point} */ _targetOffset : null,

    /*****************************************************************************/
    //MARK: class ShootsEffectsLighting
    /*****************************************************************************/

    onExit: function()
    {
        --EU.ShootsEffects.ShootsEffectsLightingCount;
        this._super();
    },

    ctor: function( /**@type {EU.Unit} */ base, /**@type {EU.Unit} */ target, /**@type {var} */ baseOffset, /**@type {std.string&} */ animatepath )
    {
        ++EU.ShootsEffects.ShootsEffectsLightingCount;
        this._timer = 0;
        this._super();
        this._base = base;
        this._target = target;
        this._baseOffset = baseOffset;

        this.setPosition( this._base.getPosition() + this._baseOffset );
        this.setAnchorPoint( cc.p( 0, 0.5 ) );

        var action = null;
        if( animatepath.length == 0 )
        {
            /**@type Array<String> */var textures = [];
            textures.push( "lighting::lighting0001.png" );
            textures.push( "lighting::lighting0002.png" );
            textures.push( "lighting::lighting0003.png" );
            textures.push( "lighting::lighting0004.png" );
            textures.push( "lighting::lighting0005.png" );
            textures.push( "lighting::lighting0006.png" );
            EU.xmlLoader.setProperty( this, EU.xmlKey.Image.int, textures[0]);
            var animation = EU.Animation.createAnimation( textures, 0.1 );
            action =  cc.animate( animation );
        }
        else
        {
            /**@type {Element} */var doc = null;
            EU.pugixml.readXml(animatepath, function(error, data) {
                doc = data;
            }, this, true);
            var node = doc.firstElementChild.firstElementChild;
            var loaded = EU.xmlLoader.load_action_str( node );
            if (! (loaded instanceof cc.ActionInterval)) loaded = null;
            action = loaded;
        }
        if( action )
            this.runAction(  cc.repeatForever( action  ) );

        var part = this._target.getParamCollection().get( "head", "" );
        var rand = this._target.getParamCollection().get( "random_bullet", "" );
        this._targetOffset = EU.Common.strToPoint( part );
        if( rand.length > 0 )
        {
            var point = EU.Common.strToPoint( rand );
            this._targetOffset.x += cc.randomMinus1To1() * point.x / 2;
            this._targetOffset.y += cc.randomMinus1To1() * point.y / 2;
        }

        this._timer = 0.5;
        this.update( 0 );
        this.scheduleUpdate();
        this.setLocalZOrder( 9999 );

        return true;
    },

    update: function( /**@type {var} */ dt )
    {
        this._timer -= dt;
        if( this._timer <= 0 || this._target.getParent() == null || this._target.getCurrentHealth() <= 0 )
        {
            this.removeFromParent(true);
            return;
        }
        var a = this._base.getPosition() + this._baseOffset;
        var b = this._target.getPosition() + this._targetOffset;
        var r = cc.pSub(b, a);

        var angle = EU.Common.getDirectionByVector( r );

        this.setPosition( a );
        this.setRotation( angle );

        var width = this.getContentSize().width;
        var scale = cc.pLength(r) / width;
        this.setScaleX( scale );
    }

});

EU.ShootsEffectsElectro = cc.Sprite.extend(
{
    /** @type {EU.Unit} */ _target : null,
    /** @type {cc.Point} */ _position : null,
    /** @type static std.set<Unit>*/ s_units : [],

    /*****************************************************************************/
    //MARK: class ShootsEffectsElectro
    /*****************************************************************************/

    onExit: function()
    {
        --EU.ShootsEffects.ShootsEffectsElectroCount;
        var idx = this.s_units.indexOf(this._target);
        if (idx !== -1) {
            this.s_units.splice(idx, 1);
        }
        cc.Sprite.prototype.onExit.call(this);
    },

    ctor: function( /**@type {EU.Unit} */ target, /**@type {cc.Point} */ position, /**@type {Size} */ size, /**@type {var} */ scale )
    {
        this._target = null ;
        this._position = cc.p(0,0);
        ++EU.ShootsEffects.ShootsEffectsElectroCount;
        var idx = this.s_units.indexOf(target);
        if (idx >= 0) return null;

        var result = this.init( target, position, size, scale );
        if (result) this.s_units.insert( target );
        else return null;
    },

    init: function( /**@type {EU.Unit} */ target, /**@type {cc.Point} */ position, /**@type {Size} */ size, /**@type {var} */ scale )
    {
        if( target == null) return false;
        this._super();

        this._target = target;
        this._position = position;
        this.setPosition( cc.pAdd(this._target.getPosition(), this._position ));

        if( this.checkClean() ) return false;

        this.initWithAnimation( size );

        this.setLocalZOrder( 9999 );
        this.setScale( scale );
        this.scheduleUpdate();

        return true;
    },

    initWithAnimation: function( /**@type {Size} */ size )
    {
        var frame = (size == EU.ShootsEffects.Size.Big) ? "tank" : "man";

        /**@type Array<String> */var textures = [];
        textures.push( "electro::electro_" + frame + "_0001.png" );
        textures.push( "electro::electro_" + frame + "_0002.png" );
        textures.push( "electro::electro_" + frame + "_0003.png" );
        textures.push( "electro::electro_" + frame + "_0004.png" );

        var pframe = EU.ImageManager.getSpriteFrame( textures[0] );
        EU.assert( pframe );
        if( pframe )
        {
            this.setSpriteFrame( pframe );
        }

        var animation = EU.Animation.createAnimation( textures, 0.1 );
        var animate =  cc.animate( animation );
        this.runAction(  cc.repeatForever( animate ) );

    },

    getTarget: function()
    {
        return this._target;
    },

    update: function( /**@type {var} */ dt )
    {
        var clean = this.checkClean();
        if( clean )
        {
            this.removeFromParent(true);
        }
        else
        {
            this.setPosition( cc.pAdd(this._target.getPosition(), this._position ));
        }
    },

    checkClean: function()
    {
        var effect = this._target.getEffect();
        var clean = false ;
        clean = clean || (this._target.isRunning() == false);
        clean = clean || (this._target.getCurrentHealth() <= 0);
        clean = clean || (effect.positive.electroResist > 1.01);
        clean = clean || (effect.negative.referentialExtendedDamageElectro <= 0.001);
        return clean;
    }

});

EU.ShootsEffectsFire = EU.ShootsEffectsElectro.extend(
{
    /** @type static std.set<Unit>*/ s_units : [],

    /*****************************************************************************/
    //MARK: class ShootsEffectsFire
    /*****************************************************************************/

    onExit: function()
    {
        --EU.ShootsEffects.ShootsEffectsFireCount;
        var idx = this.s_units.indexOf(this.getTarget() );
        if (idx !== -1) {
            this.s_units.splice(idx, 1);
        }
        cc.Sprite.prototype.onExit.call(this);
    },

    ctor: function( /**@type {EU.Unit} */ target, /**@type {cc.Point} */ position, /**@type {Size} */ size, /**@type {var} */ scale )
    {
        ++EU.ShootsEffects.ShootsEffectsFireCount;

        var idx = this.s_units.indexOf(target);
        if (idx >= 0) return null;

        var result = this.init( target, position, size, scale );
        if (result) this.s_units.insert( target );

    },

    init: function( /**@type {EU.Unit} */ target, /**@type {var} */ position, /**@type {Size} */ size, /**@type {var} */ scale )
    {
        if( EU.ShootsEffectsElectro.init.call(this, target, position, size, scale ) == false )
            return false;
        var ANCHOR_MIDDLE_BOTTOM = c.p(0.5, 0);
        this.setAnchorPoint( ANCHOR_MIDDLE_BOTTOM  );

        return true;
    },

    initWithAnimation: function( /**@type {Size} */ size )
    {
        /**@type Array<String> */var textures = [];
        textures.push( "fire2::fire2_0001.png" );
        textures.push( "fire2::fire2_0002.png" );
        textures.push( "fire2::fire2_0003.png" );
        textures.push( "fire2::fire2_0004.png" );
        textures.push( "fire2::fire2_0005.png" );
        textures.push( "fire2::fire2_0006.png" );
        textures.push( "fire2::fire2_0007.png" );
        textures.push( "fire2::fire2_0008.png" );
        textures.push( "fire2::fire2_0009.png" );
        textures.push( "fire2::fire2_0010.png" );

        var pframe = EU.ImageManager.getSpriteFrame( textures[0] );
        EU.assert( pframe );
        if( pframe )
        {
            this.setSpriteFrame( pframe );
        }

        var animation = EU.Animation.createAnimation( textures, 0.5 );
        var animate =  cc.animate( animation );
        this.runAction(  cc.repeatForever( animate ) );
    },

    checkClean: function()
    {
        //setBlendFunc( BlendFunc.ADDITIVE );
        var effect = this.getTarget().getEffect();
        var clean =  false;
        clean = clean || (this.getTarget().isRunning() == false);
        clean = clean || (this.getTarget().getCurrentHealth() <= 0);
        clean = clean || (effect.positive.fireResist > 1.01);
        clean = clean || (effect.negative.referentialExtendedDamageFire <= 0.001);
        return clean;
    },

    update: function( /**@type {var} */ dt )
    {
        this.setLocalZOrder( this.getTarget().getLocalZOrder() - 2 );
        this.update( dt );
    }

});

EU.ShootsEffectsFreezing = EU.ShootsEffectsElectro.extend(
{
    /** @type static std.set<Unit>*/ s_units : [],

    /*****************************************************************************/
    //MARK: class ShootsEffectsFreezing
    /*****************************************************************************/

    onExit: function()
    {
        --EU.ShootsEffects.ShootsEffectsFreezingCount;
        if( this.getTarget() && this.getTarget().getChildByName( "skin" ) )
            this.getTarget().getChildByName( "skin" ).setVisible( true );
        cc.Sprite.prototype.onExit.call(this);

    },

    ctor: function( /**@type {EU.Unit} */ target, /**@type {var} */ position, /**@type {Size} */ size, /**@type {var} */ scale )
    {
        ++EU.ShootsEffects.ShootsEffectsFreezingCount;

        var result = this.init( target, position, size, scale );
        if (result) this.s_units.insert( target );

    },

    init: function( /**@type {EU.Unit} */ target, /**@type {var} */ position, /**@type {Size} */ size, /**@type {var} */ scale )
    {
        if( EU.ShootsEffectsElectro.init.call(this, target, position, size, scale ) == false )
            return false;
        var ANCHOR_MIDDLE_BOTTOM = c.p(0.5, 0);
        this.setAnchorPoint( ANCHOR_MIDDLE_BOTTOM  );

        if( this.getTarget() && this.getTarget().getChildByName( "skin" ) )
            this.getTarget().getChildByName( "skin" ).setVisible( false );

        return true;
    },

    initWithAnimation: function( /**@type {Size} */ size )
    {
        EU.xmlLoader.setProperty( this, EU.xmlKey.Image.int, "images/effects/ice_block.png");
    },

    checkClean: function()
    {
        var effect = this.getTarget().getEffect();
        var clean = false;
        clean = clean || (this.getTarget().isRunning() == false);
        clean = clean || (this.getTarget().getCurrentHealth() <= 0);
        clean = clean || (effect.positive.velocityRate < 0.001);
        clean = clean || (effect.negative.velocityMoveTimeLeft <= 0.001);
        return clean;
    },

    update: function( /**@type {var} */ dt )
    {
        this.setLocalZOrder( this.getTarget().getLocalZOrder() + 2 );
        this.update( dt );
    }

});

EU.ShootsEffectsIce = cc.Sprite.extend(
{
    /** @type {Number} */ _duration : null,
    /** @type {Number} */ _elapsed : null,


    /*****************************************************************************/
    //MARK: class ShootsEffectsIce
    /*****************************************************************************/

    onExit: function()
    {
        --EU.ShootsEffects.ShootsEffectsIceCount;
        cc.Sprite.prototype.onExit.call(this);
    },

    ctor: function( /**@type {var} */ position, /**@type {var} */ duration )
    {
        this._super();
        this._duration = 0;
        this._elapsed = 0;

        ++EU.ShootsEffects.ShootsEffectsIceCount;
        var index = Math.round(cc.rand()) % 3 + 1;
        var texture = "images/effects/ice" + ( index ) + ".png";
        //EU.xmlLoader.setProperty( this, EU.xmlKey.Image.int, "ice" + ( index ));
        this.setSpriteFrame(EU.ImageManager.sprite(texture).getSpriteFrame());
        //this._super(EU.ImageManager.sprite(texture));

        this._duration = duration;

        var fadein =  cc.fadeTo( 0.2, 200 );

        this.setLocalZOrder( -9999 );
        this.setPosition( position );
        this.setOpacity( 0 );

        this.runAction( fadein );

        this.scheduleUpdate();

        return true;
    },

    setDuration: function( /**@type {var} */ time )
    {
        this._duration = time;
        this._elapsed = 0;
    },

    update: function( /**@type {var} */ dt )
    {
        this._elapsed += dt;
        if( this._elapsed > 0.2 )
        {
            var last = this._duration - this._elapsed;
            last = Math.min( last, 1.0 );
            var opacity = Math.round(last * 200);
            this.setOpacity( opacity );

            if( this._elapsed > this._duration )
                this.death();
        }
    },

    death: function( )
    {
        for (var unitId in EU.ShootsEffects.s_IceUnits) {
            if (EU.ShootsEffects.s_IceUnits.hasOwnProperty(unitId)) {
                var br = false;
                var iceUnits = EU.ShootsEffects.s_IceUnits[unitId];

                for (var i = 0; i < iceUnits.length; i++) {
                    var iceUnit = iceUnits[i];
                    if( iceUnit == this )
                    {
                        iceUnits.splice(i, 1);
                        br = true;
                        break;
                    }
                }
                if( iceUnits.length == 0 )
                {
                    delete EU.ShootsEffects.s_IceUnits[unitId];
                    break;
                }
                if( br )break;
            }
        }
        this.removeFromParent(true);
    },
});

EU.ShootsEffectsIce.computePoints = function( /**@type {var} */ basePosition, /**@type {std.vector} */ points,
                                              /**@type {var} */ radius, /**@type {var} */ maxDistanceToRoad )
{
    var startRadius = 0;
    var distanceByRadius = 30;

    for( var r = startRadius + cc.random0To1() * distanceByRadius; r < radius; r += distanceByRadius )
    {
        var C = r * (cc.PI) * 2;
        var count = Math.round( C / distanceByRadius );
        if( count < 2 ) continue;

        var pointsOnRadius = [];
        pointsOnRadius = EU.Common.computePointsByRadius( pointsOnRadius, r, count, cc.random0To1() * (360 / count) );

        for (var i = 0; i < pointsOnRadius.length; i++) {
            var point = pointsOnRadius[i];
            var dummy = 0;
            point = cc.pAdd(basePosition, cc.p( point.x, point.y / 2 ));
            if( EU.checkPointOnRoute_1( point, maxDistanceToRoad, EU.UnitLayer.sea,  dummy ) ||
                EU.checkPointOnRoute_1( point, maxDistanceToRoad, EU.UnitLayer.earth,  dummy ) )
            {
                points.push( point );
            }
        }
    }
}


EU.ShootsEffectsIce2 = cc.Sprite.extend(
{

    /*****************************************************************************/
    //MARK: class ShootsEffectsIce2
    /*****************************************************************************/
    onExit: function()
    {
        --EU.ShootsEffects.ShootsEffectsIce2Count;
        cc.Sprite.prototype.onExit.call(this);
    },

    ctor: function( /**@type {var} */ position, /**@type {var} */ duration )
    {
        ++EU.ShootsEffects.ShootsEffectsIce2Count;

        //this.initWithFile( "images/effects/ice_texture.png" );
        this._super(EU.ImageManager.sprite("images/effects/ice_texture.png"));


        this.setScaleY( 1 / EU.k.IsometricValue );

        var dfade = duration * 0.4;
        var ddelay = duration - 2 * dfade;

        var fadein =  cc.fadeTo( dfade, 128 );
        var delay =  cc.delayTime( ddelay );
        var fade =  cc.fadeTo( dfade, 0 );
        var remove =  cc.callFunc(   this.removeFromParent.bind( this, true ) );
        var action =  cc.sequence( fadein, delay, fade, remove );

        this.setOpacity( 0 );
        this.setPosition( position );
        this.setLocalZOrder( -9999 );
        this.runAction( action );

        return true;
    }

});

EU.ShootsEffectLaser = cc.Sprite.extend(
{

    /*****************************************************************************/
    //MARK: class ShootsEffectLaser
    /*****************************************************************************/

    ctor: function( /**@type {Unit} */ base, /**@type {Unit} */ target, /**@type {Number} */ addposition,
                    /**@type {Number} */ width, /**@type {cc.Color} */ color )
    {
        this._super();

        var a = cc.pAdd(base.getPosition( ) ,addposition);
        var b = cc.pAdd(target.getPosition( ) , cc.p( 0, 20 ));
        var angle = EU.Common.getDirectionByVector( cc.pSub(b, a) );

        var sprite = EU.ImageManager.sprite( "images/square.png" );
        sprite.setScale( b.getDistance( a ), 2 * width );
        sprite.setRotation( angle );
        sprite.setPosition( a );
        sprite.setAnchorPoint( cc.p( 0, 0.5 ) );
        sprite.setColor( color );
        this.addChild(sprite);
        sprite.setOpacity( 0 );
        sprite.runAction(  cc.sequence(  cc.fadeTo( 0.1, 192 ),  cc.fadeTo( 0.1, 64 ) ) );

        var delay =  cc.delayTime( 0.2 );
        var remover =  cc.callFunc( this.removeFromParent.bind(this, true));
        var action =  cc.sequence( delay, remover);
        this.runAction( action );

        return true;
    }

});

EU.ShootsEffectHealing = cc.Sprite.extend(
{


    /*****************************************************************************/
    //MARK: ShootsEffectHealing
    /*****************************************************************************/

    ctor: function( /**@type {EU.Unit} */ target, /**@type {String} */ image )
    {
        this._super();
        if( image.length > 0 )
        {
            EU.xmlLoader.setProperty( this, EU.xmlKey.Image.int, image);
        }
        if( animation == "blue" )
        {
            var animation = EU.Animation.createAnimation( "healing.blue.hill_blue_00", 1, 19, ".png", 1 );
            var animate =  cc.animate( animation );
            this.runAction( animate );
            this.setAnchorPoint( cc.p( 0.5, 0 ) );
        }
        if( animation == "red" )
        {
            var animation = EU.Animation.createAnimation( "healing.red.hill_red00", 1, 19, ".png", 1 );
            var animate =  cc.animate( animation );
            this.runAction( animate );
            this.setAnchorPoint( cc.p( 0.5, 0 ) );
        }

        this.setPosition(target.getPosition());

        var action1 =  cc.sequence(  cc.moveBy(1.0, cc.p(0, 20)).easing(cc.easeInOut(1)),  cc.removeSelf(true) );
        var action2 =  cc.sequence(  cc.fadeIn(0.2),  cc.delayTime(0.6),  cc.fadeOut(0.2) );
        this.runAction(action1);
        this.runAction(action2);

        this.setLocalZOrder(999);
        return true;
    }

});

/*****************************************************************************/
//MARK: class ShootsEffectsCreate
/*****************************************************************************/
EU.ShootsEffects = {

    ShootsEffectsLightingCount  : 0,
    ShootsEffectsElectroCount  : 0,
    ShootsEffectsFireCount  : 0,
    ShootsEffectsFreezingCount  : 0,
    ShootsEffectsIceCount  : 0,
    ShootsEffectsIce2Count  : 0,
    /**std.set<Unit> */ s_units : [],

    /**static std.map< Unit.__instanceId, std.vector<ShootsEffectsIce>>*/ s_IceUnits : {},

    Size : Object.freeze(
    {
        Big : 1,
        Small: 2
    }),

    ShootsEffectsCreate: function( /**@type {EU.Unit} */ base, /**@type {EU.Unit} */ target, description )
    {
        var result = [];
    
        var params = new EU.ParamCollection( description );
        var type = params.get("type");
    
        if( type == "bullet" )
        {
            result.push( new EU.ShootsEffectsBullet( target.getPosition( ) ) );
        }
        else if( type == "laser" )
        {
            var index = 0;
            var angle = base.getMover()._currentAngle;
            switch( angle )
            {
                case 45: index = 0; break;
                case 135: index = 1; break;
                case 225: index = 2; break;
                case 315: index = 3; break;
                default: index = 0;
            }
    
            var pos = EU.Common.strToPoint( params.get("position" + index ) );
            var width = EU.Common.strToFloat( params.get( "width", "1" ) );
            var color = EU.Common.strToColor3B( params.get( "color", "FF0000" ) );
    
            result.push( new EU.ShootsEffectLaser( base, target, pos, width, color ) );
        }
        else if( type == "lighting" )
        {
            var offset;
            var param = "offset" + base.getMover()._currentAngle ;
            if( params.indexOf(param) >= 0)
                offset = EU.Common.strToPoint( params.get(param) );
            else
                offset = EU.Common.strToPoint( params.get("offset") );
    
            var animatepath = params.get("animatepath");
            var effect = new EU.ShootsEffectsLighting( base, target, offset, animatepath );
            result.push( effect );
    
            var position;
            /*Size*/ var size;
            position = target.extra().getPositionElectro();
            var scale = target.extra().getScaleElectro();
            size = target.extra().getSizeElectro() == "big" ?
                EU.ShootsEffects.Size.Big :
                EU.ShootsEffects.Size.Small;
    
            var electro = new EU.ShootsEffectsElectro( target, position, size, scale );
            if( electro )
                result.push( electro );
        }
        else if( type == "fire" )
        {
            var position;
            var size = EU.ShootsEffects.Size.Small;
            position = target.extra().getPositionFire();
            var scale = target.extra().getScaleFire();
            var fire = new EU.ShootsEffectsFire( target, position, size, scale );
            if( fire )
                result.push( fire );
        }
        else if( type == "ice" )
        {
    
            var maxDistanceToRoad = 20;
            var radius = base._radius;
            var duration = base.getEffect().positive.velocityTime;
    
            if( EU.ShootsEffects.s_IceUnits[base.__instanceId] == null )
            {
                var points = [];
                EU.ShootsEffects.s_IceUnits[base.__instanceId] = [];

                EU.ShootsEffectsIce.computePoints( base.getPosition(), points, radius, maxDistanceToRoad );

                for (var i = 0; i < points.length; i++) {
                    var point = points[i];
                    var ice = new EU.ShootsEffectsIce( point, duration );
                    result.push( ice );
                    EU.ShootsEffects.s_IceUnits[base.__instanceId].push( ice );
                }
            }
            else
            {
                var vector = EU.ShootsEffects.s_IceUnits[base.__instanceId];
                for (var i = 0; i < vector.length; i++) {
                    var ice = vector[i];
                    ice.setDuration( duration );
                }
            }
        }
        else if( type == "medic" )
        {
            var image = params.get("image");
            var animation = params.get("animation");
            var effect = new EU.ShootsEffectHealing( target, image, animation );
            if( effect )
                result.push( effect );
        }
        else if( type == "freezing" )
        {
            var position;
            var size = EU.ShootsEffects.Size.Small;
            position = target.extra().getPositionFreezing();
            var scale = target.extra().getScaleFreezing();
            var freez = new EU.ShootsEffectsFreezing( target, position, size, scale );
            if( freez )
                result.push( freez );
        }
    
        /*
         else if( type == "ice" )
         {
          var maxDistanceToRoad = 20 ;
          var radius = base.getRadius( );
          var duration = base.getEffect( ).positive.velocityTime;
    
         result.push( new EU.ShootsEffectsIce2( base.getPosition(), duration ) );
         }
         */
        return result;
    },
    
    ShootsEffectsClear: function()
    {
        this.s_units = [];
        EU.ShootsEffects.s_IceUnits = {};
    }

};
