//Define namespace
var EU = EU || {};

EU.mlEffect = cc.Class.extend({

    /** For Test Instance of */
    __mlEffect: true,

    Negative: function() {
        this.Damage = function()
        {
            this.damageTime = 0.0;
            this.damageRate = 0.0;
        };
        this.velocityMoveRate = 0.0;
        this.velocityMoveTimeLeft = 0.0;
        this.armorLowRate = 0.0;
        this.armorLowTimeLeft = 0.0;

        this.fire = new this.Damage();
        this.ice = new this.Damage();
        this.electro = new this.Damage();

        this.referentialExtendedDamageFire = 0.0;
        this.referentialExtendedDamageIce = 0.0;
        this.referentialExtendedDamageElectro = 0.0;
    },
    negative: null,

    Positive: function() {
        this.damage = 0.0;
        this.armor = 0.0;
        this.isCanStoppedMove = false;
        this.fireRate= 0.0;
        this.iceRate= 0.0;
        this.electroRate= 0.0;
        this.velocityRate= 0.0;
        this.fireTime= 0.0;
        this.iceTime= 0.0;
        this.electroTime= 0.0;
        this.velocityTime= 0.0;
        this.fireResist= 0.0;
        this.electroResist= 0.0;
        this.iceResist= 0.0;
    },
    positive: null,
    m_unit: null,

    ctor: function( selfObject )
    {
        this.negative = new this.Negative();
        this.positive = new this.Positive();
        this.m_unit = selfObject ;

        this.negative.velocityMoveRate = 1.0;
        this.negative.velocityMoveTimeLeft = 0.0;
        this.negative.armorLowRate = 0.0;
        this.negative.armorLowTimeLeft = 0.0;
        this.negative.fire.damageRate = 0.0;
        this.negative.fire.damageTime = 0.0;
        this.negative.ice.damageRate = 0.0;
        this.negative.ice.damageTime = 0.0;
        this.negative.electro.damageRate = 0.0;
        this.negative.electro.damageTime = 0.0;
        this.negative.referentialExtendedDamageIce = 0.0;
        this.negative.referentialExtendedDamageFire = 0.0;
        this.negative.referentialExtendedDamageElectro = 0.0;
    
        this.positive.damage = 0.0;
        this.positive.fireRate = 0.0;
        this.positive.iceRate = 0.0;
        this.positive.electroRate = 0.0;
        this.positive.velocityRate = 1.0;
        this.positive.fireTime = 0.0;
        this.positive.iceTime = 0.0;
        this.positive.electroTime = 0.0;
        this.positive.velocityTime = 1.0;
        this.positive.isCanStoppedMove = false;
        this.positive.armor = 0.0;
        this.positive.fireResist = 1.0;
        this.positive.electroResist = 1.0;
        this.positive.iceResist = 1.0;
    },
    setUnit: function(selfObject )
    {
        this.m_unit = selfObject;
    },
    clear: function()
    {
        this.negative.velocityMoveRate = 1.0;
        this.negative.velocityMoveTimeLeft = 0.0;
        this.negative.armorLowRate = 0.0;
        this.negative.armorLowTimeLeft = 0.0;
        this.negative.fire.damageRate = 0.0;
        this.negative.fire.damageTime = 0.0;
        this.negative.ice.damageRate = 0.0;
        this.negative.ice.damageTime = 0.0;
        this.negative.electro.damageRate = 0.0;
    },
    copyFrom: function(source )
    {
        this.negative = source.negative;
        this.positive = source.positive;
    },
    /**
     * @param {Element} node
     */
    load_node : function( node )
    {
        var p = node.getElementsByTagName( "this.positive" );
        var n = node.getElementsByTagName( "this.negative" );
    
        this.negative.velocityMoveRate = EU.asObject(n.getAttribute( "velocityMoveRate" ) , 1.0 );
        this.negative.velocityMoveTimeLeft = EU.asObject(n.getAttribute( "velocityMoveTimeLeft" ), 0.0 );
        this.negative.armorLowRate = EU.asObject(n.getAttribute( "armorLowRate" ), 0.0 );
        this.negative.armorLowTimeLeft = EU.asObject(n.getAttribute( "armorLowTimeLeft" ), 0.0 );
    
        this.positive.damage = EU.asObject(p.getAttribute( "damage" ), 0.0 );
        this.positive.fireRate = EU.asObject(p.getAttribute( "fireRate" ), 0.0);
        this.positive.iceRate = EU.asObject(p.getAttribute( "iceRate" ), 0.0);
        this.positive.electroRate = EU.asObject(p.getAttribute( "electroRate" ), 0.0);
        this.positive.velocityRate = EU.asObject(p.getAttribute( "velocityRate" ), 1.0);
    
        this.positive.fireTime = EU.asObject(p.getAttribute( "fireTime" ), 0.0);
        this.positive.iceTime = EU.asObject(p.getAttribute( "iceTime" ), 0.0);
        this.positive.electroTime = EU.asObject(p.getAttribute( "electroTime" ), 0.0);
        this.positive.velocityTime = EU.asObject(p.getAttribute( "velocityTime" ), 0.0);
    
        this.positive.isCanStoppedMove = EU.asObject(p.getAttribute( "isCanStoppedMove" ) , false );
        this.positive.armor = EU.asObject(p.getAttribute( "armor" ), 0.0);
        this.positive.fireResist = EU.asObject(p.getAttribute( "fireResist" ), 1.0);
        this.positive.electroResist = EU.asObject(p.getAttribute( "electroResist" ), 1.0);
        this.positive.iceResist = EU.asObject(p.getAttribute( "iceResist" ), 1.0);
    },
    update: function( dt )
    {
        this.negative.fire.damageTime = Math.max( this.negative.fire.damageTime - dt, 0.0);
        this.negative.ice.damageTime = Math.max( this.negative.ice.damageTime - dt, 0.0);
        this.negative.electro.damageTime = Math.max( this.negative.electro.damageTime - dt, 0.0);
        this.negative.velocityMoveTimeLeft = Math.max( this.negative.velocityMoveTimeLeft - dt, 0.0);
        this.negative.armorLowTimeLeft = Math.max( this.negative.armorLowTimeLeft - dt, 0.0);
    
        if( this.negative.fire.damageTime <= 0.0)
        this.negative.referentialExtendedDamageFire = 0.0;
        if( this.negative.ice.damageTime <= 0.0)
        this.negative.referentialExtendedDamageIce = 0.0;
        if( this.negative.electro.damageTime <= 0.0)
        this.negative.referentialExtendedDamageElectro = 0.0;
    },
    applyEffects: function( damager )
    {
        EU.assert( damager );
        var effect = damager.getEffect();
    
        this.negative.referentialExtendedDamageIce += Math.max( 0.0, effect.positive.iceRate * effect.positive.iceTime / this.positive.iceResist );
        this.negative.referentialExtendedDamageFire += Math.max( 0.0, effect.positive.fireRate * effect.positive.fireTime / this.positive.fireResist );
        this.negative.referentialExtendedDamageElectro += Math.max( 0.0, effect.positive.electroRate * effect.positive.electroTime / this.positive.electroResist );
    
        this.negative.fire.damageTime = Math.max(this.negative.fire.damageTime, effect.positive.fireTime);
        this.negative.fire.damageRate = Math.max(this.negative.fire.damageRate, effect.positive.fireRate / this.positive.fireResist );
        this.negative.ice.damageTime = Math.max(this.negative.ice.damageTime, effect.positive.iceTime);
        this.negative.ice.damageRate = Math.max(this.negative.ice.damageRate, effect.positive.iceRate / this.positive.iceResist );
        this.negative.electro.damageTime = Math.max(this.negative.electro.damageTime, effect.positive.electroTime);
        this.negative.electro.damageRate = Math.max(this.negative.electro.damageRate, effect.positive.electroRate / this.positive.electroResist );
        this.negative.fire.damageTime = Math.max(this.negative.fire.damageTime, 0.0);
        this.negative.fire.damageRate = Math.max(this.negative.fire.damageRate, 0.0);
        this.negative.ice.damageTime = Math.max(this.negative.ice.damageTime, 0.0);
        this.negative.ice.damageRate = Math.max(this.negative.ice.damageRate, 0.0);
        this.negative.electro.damageTime = Math.max(this.negative.electro.damageTime, 0.0);
        this.negative.electro.damageRate = Math.max(this.negative.electro.damageRate, 0.0);
    
        this.negative.velocityMoveTimeLeft = Math.max( this.negative.velocityMoveTimeLeft, effect.positive.velocityTime );
        this.negative.velocityMoveRate = Math.max( 0.0, Math.min( this.negative.velocityMoveRate, effect.positive.velocityRate ) );
    },
    /**
     * @param {EU.Unit} damager
     * @returns {number|*}
     */
    computeDamage: function(damager )
    {
        EU.assert( damager );
        var damage = 0.0;
        var effect = damager.getEffect();
        damage = Math.max( 0.0, effect.positive.damage - this.positive.armor );
    
        return damage;
    },
    computeMoveVelocityRate: function()
    {
        var velocity = 1;
        if( this.negative.velocityMoveTimeLeft > 0 )
            velocity = Math.max( 0.0, this.negative.velocityMoveRate * velocity );
        return velocity;
    },
    computeExtendedDamage: function( dt )
    {
        var extendedDamage = 0.0;
        /**
         * @param {Damage} p
         * @returns {number}
         */
        var compute = function( p )
        {
            var time = Math.max(0.0, Math.min(dt, p.damageTime));
            return p.damageRate * time;
        };
        extendedDamage += compute( this.negative.fire );
        extendedDamage += compute( this.negative.ice );
        extendedDamage += compute( this.negative.electro );
    
        extendedDamage = Math.max( 0.0, extendedDamage );
        return extendedDamage;
    }
});
