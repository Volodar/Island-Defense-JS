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
    /** @type {Number} */ _handRadius : 60 ,
    /** @type {Number} */ _handRadiusSector : 30,
    /** @type {Array<EU.Unit>} */ _targets : [] ,
    /** @type {cc.Point} */ _basePosition : new cc.Point(0,0) ,
    //CC_SYNTHESIZE_PASS_BY_REF( Point, _basePosition, BasePosition );

    ctor: function(    path,    xmlFile )
    {
        return this.init_str_str( path, xmlFile );
    },

    checkTargetByRadius: function(   target )
    {
        EU.assert( target );
        var a = this._basePosition;
        var b = target.getPosition( );
        var byradius = EU.Support.checkRadiusByEllipse( a, b, this.getRadius( ) );
        return byradius;
    },

    capture_targets: function(targets)
    {
        for (var i = 0; i < this._targets.length; ) {
            var target = this._targets[i];
            var release = false;
            release = release || target._moveFinished;
            release = release || target.getCurrentHealth() <= 0;
            release = release || targets.indexOf(target) < 0;
            if( release )
                this._targets.splice( i , 1);
            else
                ++i;
        }

        if( this._targets.length < this._maxTargets )
        {
            for (var i = 0; i < targets.length; i++) {
                var target = targets[i];
                if( this._targets.indexOf(target) < 0 )
                {
                    this._targets.push( target );
                }
            }
        }
        for (var i = 0; i < this._targets.length; i++ ) {
            var target = this._targets[i];
            target.stop();
        }

        if( this._targets.length > 0 )
        {
            if( this.current_state( ).get_name( ) != EU.State.state_move && this.isNearestTarget() == false )
            {
                var route;
                this.buildRouteToTarget( route );
                this.getMover().setRoute( route );
                this.move();
            }
            else
            {
                var t = [];
                t.push( this._targets[0] );
                this.capture_targets( t );
            }
        }
        else
        {
            this.capture_targets( this._targets );
            if( this.isNearestBase() == false )
            {
                if( this.current_state().get_name() != EU.State.state_move )
                {
                    var route;
                    this.buildRouteToBase( route );
                    this.getMover().setRoute( route );
                    this.move();
                }
            }
        }
    },

    setProperty: function(    stringproperty,    value )
    {
        if( stringproperty == "handradius" )
            this._handRadius = parseFloat( value );
        else if( stringproperty == "handradiussector" )
            this._handRadiusSector = parseFloat( value );
        else
            return this.setProperty( stringproperty, value );
        return true;
    },

    on_die: function()
    {
        this.on_die();
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

    buildRouteToBase: function(  route )
    {
        route.resize( 2 );
        route[0] = this.getPosition();
        route[1] = this._basePosition;
    },

    buildRouteToTarget: function(  route )
    {
        var target = this._targets.empty() ? null : this._targets[0];
        if( !target )
            return;

        var radius = cc.pSub(target.getPosition() , this.getPosition()) ;

        var add = new cc.Point( (this._handRadius - 1) * (radius.x < 0 ? 1 : -1), 0 );


        var a = this.getPosition();
        var b = target.getPosition( );
        cc.pAddIn(b, add);

        route.splice(2);
        route[0] = a;
        route[1] = b;
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
            r = r || (angle <= 0 + this._handRadiusSector || angle >= 360 - this._handRadiusSector);
            r = r || (angle <= 180 + this._handRadiusSector || angle >= 180 - this._handRadiusSector);
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

