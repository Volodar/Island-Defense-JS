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

EU.UnitSkill = cc.Class.extend(
{
    //virtual void update( var dt, EU.Unit context )=0;
    /** @type {EU.Unit} */ _unit : null,
    /** @type {String} */ _onlyState : null,
    /** @type {String} */ _needUnitSkill : null,
    /** @type {int} */ _needUnitSkillLevel : 0,

    getNeedUnitSkill: function(){return this._needUnitSkill; },
    getNeedUnitSkillLevel: function(){return this._needUnitSkillLevel; },
    getOnlyState: function(){return this._onlyState;},
    getUnit: function(){return this._unit;},
    onDamage: function(){},
    execution: function () { return false; },



/******************************************************************************/
    //MARK: UnitSkill
    /******************************************************************************/

    ctor: function( /**@type {Element} */ xmlNode, /**@type {EU.Unit} */ unit )
    {
        this._unit = unit;
        this._onlyState = xmlNode.getAttribute( "onlystate" );
        this._needUnitSkill = xmlNode.getAttribute( "unitskill" );
        this._needUnitSkillLevel = EU.Common.strToInt(xmlNode.getAttribute( "unitskilllevel" ));
        if( !this._onlyState )
            this._onlyState = "";
        if( !this._needUnitSkill )
            this._needUnitSkill = "";
        return this._unit != null;
    }

});

EU.UnitSkillMedic = EU.UnitSkill.extend(
{
    /** @type {Number} */ _radius : null,
    /** @type {Number} */ _frequence : null,
    /** @type {Number} */ _health : null,
    /** @type {Number} */ _duration : null,
    /** @type {Number} */ _timer : null,
    /** @type {Number} */ _timerDuration : null,
    /** @type {int} */ _maxTargets : null,
    /** @type {std.string} */ _effectDescription : null,
    /** @type {std.set<std.string>} */ _allowUnits : null,
    /** @type {Boolean} */ _execution : null,


    /******************************************************************************/
    //MARK: UnitSkillMedic
    /******************************************************************************/
    ctor: function( /**@type {Element} */ xmlNode, /**@type {EU.Unit} */ unit )
    {
        "use strict";

        this._radius = 0;
        this._frequence = 0;
        this._health = 0;
        this._duration = 0;
        this._timer = 0;
        this._timerDuration = 0;
        this._effectDescription = "";
        this._maxTargets = -1 ;
        this._allowUnits = [] ;
        this._execution = false ;

        this._super(xmlNode, unit );

        this._radius = EU.Common.strToFloat(xmlNode.getAttribute( "radius" ));
        this._frequence = EU.Common.strToFloat(xmlNode.getAttribute( "frequence" ));
        this._health = EU.Common.strToFloat(xmlNode.getAttribute( "health" ));
        this._duration = EU.Common.strToFloat(xmlNode.getAttribute( "duration" ));
        this._effectDescription = xmlNode.getAttribute( "effect_description" );
        this._maxTargets = EU.Common.strToInt(xmlNode.getAttribute( "maxtargets" ));

        var units = [];
        units = xmlNode.getAttribute( "units").split(',');
        for (var i = 0; i < units.length; i++) {
            var unit = units[i];
            if (!this._allowUnits.indexOf(unit)) this._allowUnits.push( unit );
        }

        return true;
    },

    update: function( /**@type {var} */ dt, /**@type {EU.Unit} */ context )
    {
        EU.assert( context );

        this._timer += dt;
        if( this._timer > this._frequence )
        {
            if( this._timerDuration < 0.001  )
            {
                this.execute( context );
            }
            if( this._timerDuration >= this._duration )
            {
                this.stop( context );
                this._timer = 0;
                this._timerDuration = 0;
            }
            else
            {
                this._timerDuration += dt;
            }
        }
    },

    execution: function()
    {
        return this._execution;
    },

    execute: function( /**@type {EU.Unit} */ context )
    {
        EU.assert( EU.GameGS );
        var board = EU.GameGSInstance.getGameBoard();
        /**
         * @type {Array<EU.Unit>}
         */
        var targets=[];
        var center = context.getPosition();
        board.getTargetsByRadius( targets, center, this._radius );

        var counter = this._maxTargets;
        var wasHealing =false ;
        for (var i = 0; i < targets.length; i++) {
            var target = targets[i];
            if( this._allowUnits.length > 0 )
            {
                var allow = this._allowUnits.indexOf( target.getName() ) >= 0;
                if( allow == false )
                    continue;
            }
            if( target.getType() != EU.UnitType.creep )
                continue;

            var health = target.getCurrentHealth();
            var max = target._health;

            var value = Math.min( max, health + this._health );
            if( health < max )
            {
                target.setCurrentHealth( value );
                EU.GameGSInstance.createEffect( context, target, this._effectDescription );
                wasHealing = true;
                --counter;
            }
            if( counter == 0 )
                break;
        }

        if( wasHealing )
        {
            this._execution = true;
            context.stop();
            context.runEvent( "on_healing" );
        }
    },

    stop: function( /**@type {EU.Unit} */ context )
    {
        this._execution = false;
        context.move();
    }
});

EU.UnitSkillRunTasksByTime = EU.UnitSkill.extend(
{
    /** @type {Number} */ _timer : null,
    /** @type {Number} */ _timerDuration : null,
    /** @type {Number} */ _frequence : null,
    /** @type {Boolean} */ _stopedUnit : null,
    /** @type {Boolean} */ _resumeMoving : null,
    /** @type {Number} */ _stopDuration : null,
    /** @type {int} */ _count : null,
    /** @type {EventsList} */ _events : null,


    /******************************************************************************/
    //MARK: UnitSkillRunTasksByTime
    /******************************************************************************/

    ctor: function( /**@type {Document} */ xmlNode, /**@type {EU.Unit} */ unit )
    {
        this._timer = 0;
        this._timerDuration = 0;
        this._frequence = 0;
        this._events = [];
        this._stopedUnit = false;
        this._resumeMoving = false;
        this._stopDuration = 0;
        this._count = -1;

        this._super(xmlNode, unit);

        this._frequence = EU.Common.strToFloat(xmlNode.getAttribute( "frequence" ));
        this._stopedUnit = EU.Common.strToBool(xmlNode.getAttribute( "stopunit" ));
        this._stopDuration = EU.Common.strToFloat(xmlNode.getAttribute( "stopduration" ) );
        this._count = EU.Common.strToInt(EU.asObject(xmlNode.getAttribute( "count" ),"-1" ));

        var xmlEvents = xmlNode.getElementsByTagName( "eventlist" )[0];
        for (var i = 0; i < xmlEvents.children.length; i++) {
            var xmlEvent = xmlEvents.children[i];
            var event = EU.xmlLoader.load_event_xml_node( xmlEvent );
            if( event )
                this._events.push( event );
        }
        return true;
    },

    update: function( /**@type {var} */ dt, /**@type {EU.Unit} */ context )
    {
        if( this._stopedUnit )
        {
            this._timer += dt;
            if( this._timer > this._frequence )
            {
                if( this._timerDuration < 0.001  )
                {
                    this.execute( context );
                }
                if( this._timerDuration >= this._stopDuration )
                {
                    this.stop( context );
                    this._timer = 0;
                    this._timerDuration = 0;
                }
                else
                {
                    this._timerDuration += dt;
                }
            }
        }
        else
        {
            this._timer += dt;
            if( this._timer > this._frequence )
            {
                this._timer -= this._frequence;
                this.execute( context );
                this.stop( context );
            }
        }
    },

    execute: function( /**@type {EU.Unit} */ context )
    {
        if( this._count > 0 )
        {
            --this._count;
            this._events.execute( context );
            if( this._stopedUnit )
            {
                this._resumeMoving = context.current_state().get_name() == EU.MachineUnit.State.state_move;
                if( this._resumeMoving )
                    context.stop();
            }
        }
    },

    stop: function( /**@type {EU.Unit} */ context )
    {
        if( this._resumeMoving )
            context.move();
    }

});

EU.UnitSkillCounter = EU.UnitSkill.extend(
{
    Counter : function(active, def, left)
    {
        this.active = active;
        this.def = def;
        this.left = left;
        this.self = this;
        this.action = function(decrement)
        {
            if( !self.active ) return false;
            self.left -= decrement;
            if( self.left <= 0 )
            {
                self.left = self.def;
                return true;
            }
            return false;
        }
    },
    /** @type {Boolean} */ _isActive : null,
    /** @type {Counter<int>} */ _damageCounter : null,
    /** @type {Counter<Number>} */ _timeCounter : null,
    /** @type {Counter<int>} */ _damageCounterActive : null,
    /** @type {Counter<Number>} */ _timeCounterActive : null,
    /** @type {Number} */ _value : null,
    /** @type {String} */ _type : null,

    /*****************************************************************************/
    //MARK: UnitSkillCounter
    /*****************************************************************************/
    
    ctor: function( /**@type {Element} */ xmlNode, /**@type {EU.Unit} */ unit )
    {
        this._isActive = false ;
        this._damageCounter = new this.Counter(false, 0, 0  );
        this._timeCounter = new this.Counter(false, 0, 0  );
        this._damageCounterActive = new this.Counter(false, 0, 0  );
        this._timeCounterActive = new this.Counter(false, 0, 0  );

        this._super(xmlNode, unit);

        var xmlDamage = xmlNode.getAttribute( "damage" );
        var xmlDamageActive = xmlNode.getAttribute( "damageactive" );
        var xmlTime = xmlNode.getAttribute( "time" );
        var xmlTimeActive = xmlNode.getAttribute( "timeactive" );

        if( xmlDamage )
        {
            this._damageCounter.active = true;
            this._damageCounter.def = this._damageCounter.left = parseInt(xmlDamage);
        }
        if( xmlDamageActive )
        {
            this._damageCounterActive.active = true;
            this._damageCounterActive.def = this._damageCounterActive.left = parseInt(xmlDamageActive);
        }
        if( xmlTime )
        {
            this._timeCounter.active = true;
            this._timeCounter.def = this._timeCounter.left = parseFloat(xmlTime);
        }
        if( xmlTimeActive )
        {
            this._timeCounterActive.active = true;
            this._timeCounterActive.def = this._timeCounterActive.left = parseFloat(xmlTimeActive);
        }

        this._type = xmlNode.getAttribute( "skilltype" );
        this._value = parseFloat(xmlNode.getAttribute( "skillvalue" ));

        return true;
    },
    
    update: function( /**@type {var} */ dt, /**@type {EU.Unit} */ context )
    {
        var counter = this._isActive ? this._timeCounterActive : this._timeCounter;
        if( counter.action( dt ) )
        {
            if( this._isActive ) this.executeBack();
            else this.execute();
        }
    },
    
    onDamage: function( /**@type {var} */ damage )
    {
        var counter = this._isActive ? this._damageCounterActive : this._damageCounter;
        if( counter.action( 1 ) )
        {
            if( this._isActive ) this.executeBack();
            else this.execute();
        }
    },
    
    execute: function()
    {
        this._isActive = true;
        this.getUnit().skillActivated( this );
    },
    
    executeBack: function()
    {
        this._damageCounterActive.left = this._damageCounterActive.def;
        this._timeCounterActive.left = this._timeCounterActive.def;
        this._isActive = false;
        this.getUnit().skillDeactivated( this );
    }

});

EU.UnitSkillRateParameter = EU.UnitSkill.extend(
{
    /** @type {Number} */ _rate : null,
    /** @type {String} */ _parameter : null,

    getParameter: function(){ return this._parameter;},
    getRate: function(){ return this._rate;},

    /*****************************************************************************/
    //MARK: UnitSkillRateParameter
    /*****************************************************************************/

    ctor: function( /**@type {Element} */ xmlNode, /**@type {EU.Unit} */ unit )
    {
        this._rate = 1 ;
        this._parameter = "";

        this._super(xmlNode, unit);
    
        this._rate = EU.Common.strToFloat(EU.asObject(xmlNode.getAttribute( "rate" ), "1.0"));
        this._parameter = xmlNode.getAttribute( "parameter" );
        return true;
    },
    
    update: function( /**@type {var} */ dt, /**@type {EU.Unit} */ context ) {
        "use strict";

    }

});


