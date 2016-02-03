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

EU.UnitWithFadeEffects = EU.Unit.extend({

    //bool init( const std::string & path, const std::string & xmlFile = "ini.xml" );
    _time_ice : 0.0,
    _time_fire : 0.0,
    _time_electro : 0.0,
    _fire : false,
    _ice : false,
    _electro : false,
    /** Color3B* */ _color_fire : null,
    /** Color3B* */ _color_ice : null,
    /** Color3B* */ _color_electro : null,

    duration : 0.5,
    
    ctor: function(path, xmlFile )
    {
        this._super();
        if ( EU.Unit.prototype.init_str_str.call(this, path, xmlFile ) ) return false;
    
        this.setCascadeColorEnabled( true );
        return true;
    },
    /**@type {Element} root */
    load : function(root )
    {
        EU.Unit.prototype.load.call( this, root );
    },
    setProperty: function( name, value )
    {
        if( name == "color_fire" )
            this._color_fire = cc.hexToColor( EU.xmlLoader.stringIsEmpty(value) ? "FF0000" : value );
        else if( name == "color_ice" )
            this._color_ice = cc.hexToColor( EU.xmlLoader.stringIsEmpty(value) ? "00FFFF" : value );
        else if( name == "color_electro" )
            this._color_electro = cc.hexToColor( EU.xmlLoader.stringIsEmpty(value) ? "FFFF00" : value );
        else
            return EU.Unit.prototype.setProperty.call(this, name, value);
        return true;
    },
    update: function( dt )
    {
        EU.Unit.prototype.update.call(this, dt );
        var Vec3 = cc.math.Vec3;
    
        var color = cc.WHITE;
    
        var effect = this.getEffect( );
        if( effect.negative.fire.damageTime > 0 ||
            effect.negative.ice.damageTime > 0 ||
            effect.negative.electro.damageTime > 0
        )
        {
            var F = effect.negative.referentialExtendedDamageFire > 0 && effect.positive.fireResist == 1;
            var I = effect.negative.referentialExtendedDamageIce > 0 && effect.positive.iceResist == 1;
            var E = effect.negative.referentialExtendedDamageElectro > 0 && effect.positive.electroResist == 1;
            var count = F + I + E;
    
            if( count == 1 )
            {
                this._fire = F;
                this._ice = I;
                this._electro = E;
            }
            else if ( count > 1 )
            {
                if( F && this._time_fire < duration * 2 ) { this._fire = true; this._ice = false; this._electro = false; }
                else if( F && this._fire && (this._time_fire > duration * 2) ) this._fire = false;
                if( I && !this._fire && this._time_ice < duration * 2 ) { this._fire = false; this._ice = true; this._electro = false; }
                else if( I && !this._fire && this._ice && (this._time_ice > duration * 2) ) this._ice = false;
                if( E && !this._fire && !this._ice && this._time_electro < duration * 2 ) { this._fire = false; this._ice = false; this._electro = true; }
                else if( E && !this._fire && !this._ice && this._electro && (this._time_electro > duration * 2) ) this._electro = false;
    
                EU.assert( (this._fire + this._ice + this._electro) == 1 );
            }
            else
            {
                this._fire = false;
                this._ice = false;
                this._electro = false;
            }

            if( this._fire )
            {
                if( this._time_fire > duration * 2 ) this._time_fire -= duration * 2;
                this._time_fire += dt;
                var t = this._time_fire / duration;
                if( t > 1 ) t = 2 - t;
    
                var a = new Vec3( 1, 1, 1 );
                var b = (new Vec3( this._color_fire.r, this._color_fire.g, this._color_fire.b)).scale(1.0 / 255) ;
                var c = (a.add(b.subtract(a)).scale(t)).scale(255);
                color = new cc.Color( c.x, c.y, c.z );
            }
            else if( this._ice )
            {
                this._time_electro += dt;
                if( this._time_electro > duration * 2 ) this._time_electro -= duration * 2;
                var t = this._time_electro / duration;
                if( t > 1 ) t = 2 - t;

                var a = new Vec3( 1, 1, 1 );
                var b = new Vec3( this._color_ice.r, this._color_ice.g, this._color_ice.b).scale(1.0 / 255);
                var c = (a.add(b.subtract(a)).scale(t)).scale(255);
                color = new cc.Color( c.x, c.y, c.z );
            }
            else if( this._electro )
            {
                this._time_electro += dt;
                if( this._time_electro > duration * 2 ) this._time_electro -= duration * 2;
                var t = this._time_electro / duration;
                if( t > 1 ) t = 2 - t;

                var a = new Vec3( 1, 1, 1 );
                var b = new Vec3( this._color_electro.r, this._color_electro.g, this._color_electro.b ).scale(1.0 / 255);
                var c = (a.add(b.subtract(a)).scale(t)).scale(255);
                color = new cc.Color( c.x, c.y, c.z );
            }
    
        }
    
        this.setColor( color );
    }

});