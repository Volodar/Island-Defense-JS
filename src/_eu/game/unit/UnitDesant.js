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


EU.UnitDesant = EU.Unit.extend(
{
    /** @type {Number} */ _handRadius : null ,
    /** @type {Number} */ _handRadiusSector : null,
    /** @type {Array<EU.Unit>} */ _targets : null,
    /** @type {cc.p} */ _basePosition : null,
    //CC_SYNTHESIZE_PASS_BY_REF( Point, _basePosition, BasePosition );

    setBasePosition:function(point){ this._basePosition = point; },
    getBasePosition:function(){ return this._basePosition; },

    ctor: function( path, xmlFile )
    {
        this._handRadius = 60;
        this._handRadiusSector = 30;
        this._targets = [];
        this._basePosition = cc.p(0,0) ;
        this._super(path, xmlFile);
        this.runEvent("on_stop");
    },

    checkTargetByRadius: function(   target )
    {
        EU.assert( target );
        var a = this._basePosition;
        var b = target.getPosition( );
        var byradius = EU.checkRadiusByEllipse( a, b, this._radius );
        return byradius;
    },

    capture_targets: function(targets)
    {
        for (var i = 0; i < this._targets.length; ) {
            var target = this._targets[i];
            var release = false;
            release = release || target._moveFinished;
            release = release || target.getCurrentHealth() <= 0;
            release = release || !targets || targets.indexOf(target) == -1;
            if( release )
                this._targets.splice( i , 1);
            else
                ++i;
        }

        if( targets && this._targets.length < this._maxTargets )
        {
            for (i = 0; i < targets.length; i++) {
                target = targets[i];
                if( this._targets.indexOf(target) < 0 )
                {
                    this._targets.push( target );
                }
            }
        }
        for (i = 0; i < this._targets.length; i++ ) {
            target = this._targets[i];
            target.stop();
        }

        if( this._targets.length > 0 )
        {
            if( this.current_state( ).get_name( ) != EU.MachineUnit.State.state_move && this.isNearestTarget() == false )
            {
                var route = this.buildRouteToTarget();
                this.getMover().setRoute( route );
                this.move();
            }
            else
            {
                var t = [];
                t.push( this._targets[0] );
                EU.Unit.prototype.capture_targets.call( this, t );
            }
        }
        else
        {
            EU.Unit.prototype.capture_targets.call( this, this._targets );
            if( this.isNearestBase() == false )
            {
                if( this.current_state().get_name() != EU.MachineUnit.State.state_move )
                {
                    route = this.buildRouteToBase();
                    this.getMover().setRoute( route );
                    this.move();
                }
            }
        }
    },

    setProperty_str: function( stringproperty, value )
    {
        if( stringproperty == "handradius" )
            this._handRadius = parseFloat( value );
        else if( stringproperty == "handradiussector" )
            this._handRadiusSector = parseFloat( value );
        else
            return EU.Unit.prototype.setProperty_str.call(this, stringproperty, value );
        return true;
    },

    on_die: function()
    {
        EU.Unit.prototype.on_die.call(this);
        for (var i = 0; i < this._targets.length; i++ ) {
            var target = this._targets[i];
            target.capture_targets([]);
            target.move();
        }
    },

    //on_mover: function(  var position,  var direction )
    //{
    //	if( this.current_state().get_name() != State.state_readyfire )
    //		this.on_mover( position, direction );
    //}

    buildRouteToBase: function()
    {
        var route = [];
        route[0] = this.getPosition();
        route[1] = this._basePosition;
        return route;
    },

    buildRouteToTarget: function()
    {
        var route = [];
        var target = this._targets.length == 0 ? null : this._targets[0];
        if( !target )
            return;

        var radius = cc.pSub(target.getPosition() , this.getPosition()) ;

        var add = cc.p( (this._handRadius - 1) * (radius.x < 0 ? 1 : -1), 0 );


        var a = this.getPosition();
        var b = target.getPosition( );
        cc.pAddIn(b, add);

        route[0] = a;
        route[1] = b;
        return route;
    },

    isNearestTarget: function()
    {
        var target = this._targets.length == 0 ? null : this._targets[0];
        if( !target )
            return false;
        var result;
        var radius = cc.pSub(this.getPosition() , target.getPosition()) ;
        var dist = cc.pLength(radius);
        result = dist <= this._handRadius;

        if( result )
        {
            var angle = EU.Common.getDirectionByVector( radius );
            while( angle < 0 ) angle += 360;

            var r = false;
            r = r || (angle <= this._handRadiusSector || angle >= (360 - this._handRadiusSector));
            r = r || (angle <= (180 + this._handRadiusSector) || angle >= (180 - this._handRadiusSector));
            result = result && r;
        }

        return result;
    },

    isNearestBase: function( )
    {
        var result = cc.pDistance(this.getPosition(), this._basePosition ) < 10;
        return result;
    }

});

