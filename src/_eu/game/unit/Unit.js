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

//
EU.BodyType = cc.Class.extend();
EU.BodyType.Equipment = cc.Class.extend();
EU.UnitLayer = cc.Class.extend();
EU.UnitLayer.earth = cc.Class.extend();

EU.Unit = cc.Node.extend({

    /** For Test Instance of */
    __Unit : true,

    /**ObServer<Unit, std::function<void( float, float )>*/
    observerHealth : null,

    Extra : function()
    {
        /** @type {cc.p} */ this._electroPosition = cc.p(0,0);
        /** @type {String} */ this._electroSize = "";
        /** @type {Number} */ this._electroScale = 0;
        /** @type {cc.p} */ this._firePosition = cc.p(0,0);
        /** @type {Number} */ this._fireScale = 0;
        /** @type {cc.p} */ this._freezingPosition = cc.p(0,0);
        /** @type {Number} */ this._freezingScale = 0;

        this.getPositionElectro = function()
        {
            return this._electroPosition;
        };

        /** {String} */ this.getSizeElectro = function()
        {
            return this._electroSize;
        };

        this.getScaleElectro = function()
        {
            return this._electroScale;
        };

        this.getPositionFire = function()
        {
            return this._firePosition;
        };

        this.getScaleFire = function()
        {
            return this._fireScale;
        };

        this.getPositionFreezing = function()
        {
            return this._freezingPosition;
        };

        this.getScaleFreezing = function()
        {
            return this._freezingScale;
        };
    },

    /** @type {EU.mlEffect} */ _effect : null,
    /** @type {Extra} */ _extra : null,
    /** @type {EU.Mover} */ _mover : null,
    /** @type {int} */ _angle : 0,
    /** @type {Array<EU.Unit>} */ _targets : null,
    /** @type {EU.Unit} */ _currentDamager : null,
    /** @type {EU.IndicatorNode} */ _healthIndicator : null,
    /** @type {Array<EU.UnitSkill>} */ _skills : null,
    /** @type {Number} */ _currentHealth : 0.0,
    /** @type {Integer} */ _soundMoveID : 0,
        
    BulletParams : function()
    {
        this.byangle = 0.0;
        this.useangle = 0.0;
        this.offset = cc.p(0,0);
    },
    /** @type {String} */ _bulletXml : null,
    /** @type Object<Number, EU.BulletParams>*/ _bulletParams : null,

    _rate : 0.0,
    /** @type {String} */ _effectOnShoot : "",
    /** @type {Integer} */ _level : null,
    /** @type {Integer} */ _maxLevel : null,
    /** @type {Integer} */ _maxLevelForLevel : null,
    /** @type {Integer} */ _cost : null,
    /** @type {Number} */ _radius : null,
    /** @type {EU.BodyType} */ _bodyType : null,
    /** @type {Number} */ _defaultHealth : null,
    /** @type {Number} */ _health : null,
    /** @type {Boolean} */ _moveFinished : null,
    /** @type {Boolean} */ _damageBySector : null,
    /** @type {Number} */ _damageBySectorAngle : null,
    /** @type {EU.UnitLayer} */ _unitLayer : null,
    /** @type {Array<UnitLayer>} */ _allowTargets : null,
    /** @type {Integer} */ _maxTargets : null,
    /** @type {EU.UnitType} */ _type : null,
    /** @type {String} */ _soundMove : "",
    /** @type {Integer} */ _lifecost : null,
    /** @type {Number} */ _exp : null,
    _additionalZorder : 0,

    _damageShield : 0.0,
    _damageRate : 0.0,

    /** typedef vector<Unit.Pointer>*/ TowersArray: null,

//    var init( const string & path, const string & xmlFile = "ini.xml" );
//    void applyDamage( /**@type {EU.Unit} */ damager, Number time = 1 );
        
    getMover: function() { return this._mover; },
    getDirection: function() { return this._angle; },
    getCurrentHealth: function() { return this._currentHealth; },


    ctor: function()
    {
        this.initExt();
        this._params = new EU.ParamCollection();
        this._actions = [];
        this._events = [];
        this._super();
        this._effect = new EU.mlEffect( this );
        this._extra = new this.Extra();
        this._mover =  new EU.Mover(this);
        this._angle =  -1  ;
        this._targets =  [];
        this._currentDamager =  null  ;
        this._healthIndicator =  null  ;
        this._currentHealth =  1  ;
        this._soundMoveID =  -1  ;
        this._effectOnShoot = "" ;
        this._level =  1  ;
        this._maxLevel =  1  ;
        this._maxLevelForLevel =  -1  ;
        this._cost =  0  ;
        this._radius =  0.0  ;
        this._rate =  1  ;
        this._bodyType =  EU.BodyType.equipment  ;
        this._defaultHealth =  1  ;
        this._health =  1  ;
        this._moveFinished =  false  ;
        this._damageBySector =  false  ;
        this._damageBySectorAngle =  0  ;
        this._unitLayer =  EU.UnitLayer.earth  ;
        this._allowTargets =  [];
        this._skills =  [];
        this._maxTargets =  1  ;
        this._type = null ;
        this._soundMove =  "" ;
        this._lifecost =  0  ;
        this._additionalZorder =  0  ;
        this._damageShield =  1  ;
        this._damageRate =  1  ;
        this._exp = 0 ;
        this._bulletParams = {} ;
        this.TowersArray = [] ;
        this.observerHealth = new EU.Observer();
        this._healthIndicator = new EU.IndicatorNode();
        this.addChild( this._healthIndicator );
    },
    destroy: function()
    {
        if( this._soundMoveID != -1 )
        {
            EU.AudioEngine.stopEffect( this._soundMoveID );
            this._soundMoveID = -1;
        }
    },
    init : function(/**@type {String} */ path,/**@type {String} */ xmlFile, /**@type {EU.Unit} */ upgradedUnit )
    {
        if( this.init_str_str( path, xmlFile ) == false )
            return false;

        if( upgradedUnit )
        {
            var state = this.current_state().get_name();
            if( state != this.current_state().get_name() )
                this.start( state );
            this._timer = upgradedUnit._timer;
            this._fireReady.charge_volume =
                upgradedUnit.this._fireReady.charge_volume;
        }
        return true;
    },
    init_str_str : function(/**@type {String} */ path,/**@type {String} */ xmlFile )
    {
        //do
        //{
            //CC_BREAK_IF( !MachineUnit.ctor.call(this) );
            //CC_BREAK_IF( !MachineMove.init() );
        this.initMachine();
        this.initFSM();
        xmlFile = xmlFile || "ini.xml";

        this.load_str_n_str( path, xmlFile );

        var level = EU.UserData.tower_getUpgradeLevel( this.getName() );
        this._maxLevelForLevel = level ;

        var cb = this.on_mover;
        this._mover._onChangePosition = cb ;
        this._mover._onFinish = this.on_movefinish ;

        //if( this._type == UniType.tower )
        //{
        //	//Number rate = mlTowersInfo.shared().rate( getName() );
        //	//_effect.positive.damage *= rate;
        //	//_effect.positive.fireRate *= rate;
        //	//_effect.positive.iceRate *= rate;
        //	//_effect.positive.electroRate *= rate;
        //	//setRadius( getRadius() * rate );
        //	//this._fireReady.delay /= rate;
        //}

        return true;
        //}
        //while( false );
        //return false;
    },
    load : function( /** @type {Element} */ root )
    {
        /** EU.NodeExt.load_xmlnode */
        this.load_xmlnode( root );
        this.start( this.current_state().get_name() );
    },


    loadXmlSkill : function( /** @type {Element} */ xmlnode )
    {
        /** {String} */ var  type = xmlnode.name();
        /** UnitSkill.Pointer*/ var skill;

        if( type == "medic" )
            skill = new EU.UnitSkillMedic( xmlnode, this );
        else if( type == "runeventsbytime" )
            skill = new EU.UnitSkillRunTasksByTime( xmlnode, this );
        else if( type == "skillcounter" )
            skill = new EU.UnitSkillCounter( xmlnode, this );
        else if( type == "rateparameter" )
            skill = new EU.UnitSkillRateParameter( xmlnode, this );

        return skill;
    },

    loadXmlSkills : function( /** @type {Element} */ xmlnode )
    {
        for(var i=0; i < xmlnode.children.length; i++){
            var xml = xmlnode.children[i];
            var skill = this.loadXmlSkill( xml );
            if( skill )
                this._skills.push( skill );
        }
    },

    get_callback_by_description : function(/**@type {String} */ name )
    {
        if( name.indexOf( "push_event:" ) == 0 )
        {
            var len = /** {String} */  "push_event:".length;
            /** {String} */ var  eventname = name.substr( len );
            var event = EU.Machine.event_str( eventname );

            var self = this;
            var callback = this.push_event.bind(this, event.get_name());
            //function(x){
            //    return self.push_event( event.get_name() );
            //};
            return callback;
        }
        else return this.get_callback_by_description( name );
    },
    getEffect: function() { return this._effect; },
    extra: function()
    {
        return this._extra;
    },
    checkTargetByRadius : function(target )
    {
            return true;
    },
    capture_targets : function( /** Array<EU.Unit> */ targets )
    {
        EU.assert( targets.length <= this._maxTargets );
        this._targets = targets;
        if( this._targets.length == 0) this.capture_target( null );
        else this.capture_target( this._targets[0] );
    },
    get_targets : function( /** Array<EU.Unit> */ targets )
    {
        targets = this._targets;
    },
    stopAllLoopedSounds : function()
    {},
    clear : function()
    {
        while (this._targets.length > 0) { this._targets.pop(); }
        while (this._skills.length > 0) { this._skills.pop(); }
        this._currentDamager = null ;
        this._healthIndicator = null ;
        this.start( this.state_sleep );
    },
    applyVelocityRate : function( dt )
    {
        var rate = this._effect.computeMoveVelocityRate();
        var velocity = this._mover._defaultvelocity * rate;
        this._mover._velocity =  velocity ;
    },
    applyTimedDamage : function( dt )
    {
        var damage = this._effect.computeExtendedDamage( dt ) * this._damageShield;
        this._currentHealth = ( this._currentHealth - damage );
        if( damage != 0 ) this.on_damage( damage );
    },
    turn : function( dt )
    {
        var target = this._targets.length == 0 ? null : this._targets[0];
        if( target )
        {
            var now = cc.pNormalize(cc.pSub( target.getPosition(), this.getPosition()));
            this._mover.setDirection( now );
            this.on_mover( this.getPosition(), now );
        }
    },

    applyDamageToTarget : function(  target )
    {
        EU.assert( target );

        if( this._damageBySector )
        {
            GameGS.getInstance().getGameBoard().applyDamageBySector( this );
        }
        else
        {
            if( target )
            {
                target.applyDamage( this );
                GameGS.getInstance().createEffect( this, target, this._effectOnShoot );
            }
        }
    },
    applyDamage : function( /**@type {EU.Unit} */ damager, time )
    {
        time = time || 1;

        this._currentDamager = damager;

        this._effect.applyEffects( damager );
        var damage = this._effect.computeDamage( damager ) * time * this._damageShield * damager._damageRate;
        this.setCurrentHealth( this._currentHealth - damage );

        if( damage != 0 )
        {
            this.on_damage( damage );
            GameGS.getInstance().getGameBoard().onDamage( damager, this, damage );

        }

        for (var i = 0; i < this._skills.length; i++) {
            var skill = this._skills[i];
            skill.onDamage( damage );
        }

        if( this._currentHealth <= 0 )
        {
            GameGS.getInstance().getGameBoard().onKill( damager, this );
        }
    },

    applyDamageExtended : function( time )
    {
        this._effect.update( time );
        var damage = this._effect.computeExtendedDamage( time ) * this._damageShield;
        this.setCurrentHealth( this._currentHealth - damage );

        if( damage != 0 )
            this.on_damage( damage );
    },
    on_shoot : function( index )
    {
        if( !this.__Bullet )
            return;

        this.runEvent( "on_shoot" );
        this.runEvent( "on_shoot" + ( index ) );
        this.runEvent( "on_shoot" + ( index ) + "_byangle" + ( this._angle ) );
        this.runEvent( "on_shoot_byangle" + ( this._angle ) );

        if( this._bulletXml.length == 0 )
        {
            for (var i = 0; i < this._targets.length; i++) {
                var target = this._targets[i];
                EU.assert( target );
                this.applyDamageToTarget( target );
            }
        }
        else
        {
            for (var i = 0; i < this._targets.length; i++) {
                var target = this._targets[i];
                EU.assert( target );
                var angle = this._bulletParams[this._mover._currentAngle].useangle;
                var position = cc.pAdd(this._bulletParams[this._mover._currentAngle].offset , this.getPosition());
                var bullet = new EU.Bullet( this._bulletXml, this, target, angle, position );
                bullet.setType( EU.UnitType.tower );
                GameGS.getInstance().getGameBoard().addUnit( bullet );
            }
        }
    },
    on_sleep : function( duration )
    {
        this.runEvent( "on_sleep" );
    },

    on_cocking : function( duration )
    {
        this.runEvent( "on_cocking" );
    },

    on_relaxation : function( duration )
    {
        this.runEvent( "on_relaxation" );
    },

    on_readyfire : function( duration )
    {
        this.runEvent( "on_readyfire" );
    },

    on_charging : function( duration )
    {
        this.runEvent( "on_charging" );
    },

    on_waittarget : function( duration )
    {
        var angle = this._mover.getRandomAngle();
        this.runEvent( "on_waittarget" );
        this.runEvent( "on_waittarget_" + ( angle ) );

        this.move();
    },
    on_move : function()
    {
        this._angle = -1;
        if( this._currentHealth > 0 )
        {
            this.runEvent( "on_move" );
            this._moveFinished = false;
            if( this._soundMove.length == 0 == false )
            {
                this._soundMoveID = EU.AudioEngine.playEffect( this._soundMove, false );
            }
        }
    },

    on_stop : function()
    {
        if( this._currentHealth > 0 )
        {
            this.runEvent( "on_stop" );
        }
        if( this._soundMoveID != -1 )
        {
            EU.AudioEngine.stopEffect( this._soundMoveID );
            this._soundMoveID = -1;
        }
        this._angle = -1;
    },

    on_die : function()
    {
        this.push_event( this.event_notarget );
        this.runEvent( "on_die" );
        this.setCurrentHealth( 0 );
    },

    on_enter : function()
    {
        this.runEvent( "on_enter" );
    },
    moveByRoute : function( /**Array<cc.p> */ aroute )
    {
        var route = aroute;

        var pos = this.getPosition();
        var index = 0 ;
        var min_dist = 99999 ;
        for( var i = 0; i < cc.pLength(route); ++i )
        {
            var dist = cc.pDistance(pos, route[i]);
            if( dist < min_dist )
            {
                index = i;
                min_dist = dist;
            }
        }

        //if( index > 0 )
        route.splice(0, index + 1 );
        route.unshift( pos );
        this._mover.setRoute( route );
    },
    setCurrentHealth : function( value )
    {
        this._currentHealth = value;
        var progress = this._currentHealth / (this._health != 0 ? this._health : 1);
        var isVisible = this._currentHealth < this._defaultHealth * this._rate && this._currentHealth > 0;
        if( this._healthIndicator ) {
            this._healthIndicator.setProgress(progress);
            this._healthIndicator.setVisible(isVisible);
        }
        this.observerHealth.pushevent( this._currentHealth, this._defaultHealth * this._rate );
    },

    removeSkill : function( skill )
    {
        var it = this._skills.indexOf(skill);
        if( it >= 0 )
            this._skills.splice( it , 1);
    },
    getSkills: function()
    {
        return this._skills;
    },

    forceShoot : function( /**@type {EU.Unit} */ target, /** mlEffect*/ effect )
    {
        var hist = this._targets;
        while (this._targets.length > 0) { this._targets.pop(); }
        this._targets.push( target );
        var histeffect = this._effect;
        this._effect = effect;

        this.on_shoot( 0 );

        this._targets = hist;
        this._effect = histeffect;
    },
    skillActivated : function(skill )
    {
        var skillcounter = skill;
        if( skillcounter.__UnitSkillCounter )
        {
            /** {String} */ var type = skillcounter.getType();
            var rate = skillcounter.getValue();

            if( type == "shield" )
            {
                this._damageShield = rate;
                this.runEvent( "skill_activated_shield" );
            }
            else if( type == "rage" )
            {
                this._damageRate = rate;

                this.runEvent( "skill_activated_rage" );
            }
        }
    },

    skillDeactivated : function( skill )
    {
        var skillcounter = skill;
        if( skillcounter.__UnitSkillCounter )
        {
            /** {String} */ var  type = skillcounter.getType();
            if( type == "shield" )
            {
                this._damageShield = 1;
                this.runEvent( "skill_deactivated_shield" );
            }
            else if( type == "rage" )
            {
                this._damageRate = 1;
                this.runEvent( "skill_deactivated_rage" );
            }
        }
    },
    on_die_finish : function()
    {
        this.runEvent( "on_die_finish" );
        GameGS.getInstance().getGameBoard().death( this );
    },
    move_update : function( dt )
    {
        this._mover.update( dt );
    },
    stop_update : function( dt )
    {},
    on_mover : function( position, direction )
    {
        var angle = this._mover._currentAngle;
        this.setPosition( position );
        if( angle != this._angle )
        {
            this._angle = angle;
            this.runEvent( "on_rotate" + ( this._angle ) );
        }

        var z = this._unitLayer == EU.UnitLayer.sky ? 9000 : -position.y;
        z += this._additionalZorder;
        this.setLocalZOrder( z );
    },
    on_movefinish : function()
    {
        this.stop();
        this._moveFinished = true;
    },
    on_damage : function( value )
    {},


    /*****************************************************************************/
    //MARK: Unit.Extra
    /*****************************************************************************/

    getRate : function()
    {
        return this._rate;
    },

    setRate : function( value )
    {
        this._rate = value;
        var health = this._defaultHealth * this._rate;
        this.setCurrentHealth( health );
        this._health = ( health );
    },
    getMoveFinished: function(){return this._moveFinished; }
});

EU.NodeExt.call(EU.Unit.prototype);
EU.MachineUnit.call(EU.Unit.prototype);

EU.Unit.prototype.update = function( dt )
{
    var execution = false ;
    for (var i = 0; i < this._skills.length; i++) {
        var skill = this._skills[i];
        execution = execution || skill.execution();
    }

    if( this.current_state().get_name() != this.State.state_death )
        for (var i = 0; i < this._skills.length; i++) {
            var skill = this._skills[i];

            var allow = (execution == false) || (skill.execution());
            //TODO: EU.Skill.getOnlyState().length
            allow = allow && (skill.getOnlyState().length == 0 ? true : skill.getOnlyState() == this.current_state().get_string_name());
            if( allow )
                skill.update( dt, this );
        }

    if( execution == false )
    {
        var needturn = true;
        needturn = needturn && this.current_state().get_name() != this.State.state_move;
        needturn = needturn && this.current_state().get_name() != this.State.state_death;
        needturn = needturn && this.current_state().get_name() != this.State.state_enter;
        if( needturn )
        {
            this.turn( dt );
        }
        EU.MachineUnit.prototype.update.call( this, dt );

        this._effect.update( dt );
        this.applyVelocityRate( dt );
        this.applyTimedDamage( dt );
    }
};

EU.Unit.prototype.loadXmlEntity = function(/**@type {String} */ tag, /** @type {Element} */ xmlnode )
{
    if( tag == EU.k.MachineUnit )
    {
        this.load_xmlmachine( xmlnode );
    }
    else if( tag == EU.k.Effects )
    {
        this._effect.load_node( xmlnode );
    }
    else if( tag == EU.k.Mover )
    {
        this._mover.load_element( xmlnode );
    }
    else if( tag == EU.k.ExtraProperties )
    {
        this._extra._electroPosition = EU.Common.strToPoint( xmlnode.getAttribute( "electro_pos" ) );
        this._extra._electroSize = xmlnode.getAttribute( "electro_size" );
        this._extra._electroScale = EU.asObject(xmlnode.getAttribute( "electro_scale" ),  1.0 );
        this._extra._firePosition = EU.Common.strToPoint( xmlnode.getAttribute( "fire_pos" ) );
        this._extra._fireScale = EU.asObject(xmlnode.getAttribute( "fire_scale" ), 1.0 );
        this._extra._freezingPosition = EU.Common.strToPoint( xmlnode.getAttribute( "freezing_pos" ) );
        this._extra._freezingScale = EU.asObject(xmlnode.getAttribute( "freezing_scale" ) , 0.5 );
    }
    else if( tag == EU.k.UnitSkills )
    {
        this.loadXmlSkills( xmlnode );
    }
    else
    {
        return this.loadXmlEntity( tag, xmlnode );
    }
    return true;
};
EU.Unit.prototype.setProperty_str = function(/**@type {String} */ name,/**@type {String} */ value )
{
    var result = true;
    //setName( root.getAttribute( "name" ).as_string( "unnamed" ) );

    if( name == "radius" )
    {
        this._radius = ( parseFloat( value ) );
    }
    else if( name == "health" )
    {
        this._currentHealth =
            this._defaultHealth =
                this._health = parseFloat( value );
    }
    else if( name == "velocity" )
    {
        var velocity = parseFloat( value );
        //var random = CCRANDOM_MINUS1_1() * 0.1f + 1;
        //velocity *= random;
        this._mover._velocity = velocity ;
        this._mover._defaultvelocity = velocity ;
    }
    else if( name == "unittype" )
    {
        this._type = EU.strToUnitType( value );
    }
    else if( name == "effect_on_shoot" )
    {
        this._effectOnShoot = value;
    }
    else if( name == "maxlevel" )
    {
        this._maxLevel = parseInt( value );
    }
    else if( name == "damagebysector" )
    {
        this._damageBySector = EU.Common.strToBool( value );
    }
    else if( name == "sectorangle" )
    {
        this._damageBySectorAngle = parseFloat( value );
    }
    else if( name == "maxtargets" )
    {
        this._maxTargets = parseInt( value );
    }
    else if( name == "unitlayer" )
    {
        this._unitLayer = EU.xmlLoader.stringIsEmpty(value) ? EU.UnitLayer.any : EU.strToUnitLayer( value );
    }
    else if( name == "sound_onmove" )
    {
        this._soundMove = EU.xmlLoader.macros.parse( value );
    }
    else if( name == "lifecost" )
    {
        this._lifecost = parseInt( value );
    }
    else if( name == "allowtargets" )
    {
        /** {Array<String>} */ var targets = [];
        targets = value.split(',');
        for (var i = 0; i < targets.length; i++) {
            var target = targets[i];
            this._allowTargets.push( EU.strToUnitLayer( target ) );
        }
    }
    else if( name == "additionalzorder" )
    {
        this._additionalZorder = parseInt( value );
    }
    else if( name == "exp" )
    {
        this._exp = parseFloat( value );
    }
    else if( name == "bullet" )
    {
        this._bulletXml = value;
    }
    else if( name == "bullet_params" )
    {
        //45,30,0x0:	135:150,0x0:	225,210,0x0:	315,330,0x0
        /** {Array<String>} */ var params = [];
        params = value.split('|');
        for (var i = 0; i < params.length; i++) {
            var param = targets[i];
            /** {Array<String>} */ var args = [];
            param = args.split(',');
            /**BulletParams*/ var bp = new this.BulletParams();
            bp.byangle = parseInt( args[0] );
            bp.useangle = parseInt( args[1] );
            bp.offset = EU.Common.strToPoint( args[2] );
            this._bulletParams[bp.byangle] = bp;
        }
    }
    else
    {
        //result = EU.NodeExt.prototype.setProperty_str.call(this, name, value );
    }
    return result;
};
