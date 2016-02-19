//Define namespace
var EU = EU || {};


EU.Bullet = EU.Unit.extend({
    /** For Test Instance of */
    __Bullet: true,
    Trajectory: {
        line: 0,
        parabolic: 1,
    },
    _bopyPart: null,
    _trajectory: null,
    /** @type {EU.Unit} */
    _base: null,
    /** @type {EU.Unit} */
    _target: null,
    /** @type {cc.p} */
    _startPoint: null,
    /** @type {cc.p} */
    _targetPoint: null,
    /** @type {cc.p} */
    _targetPointOffset: null,
    steering: null,
    _isStuck: null,
    _parabolicParams: {
        H: null,
        timer: null,
        duration: null,
    },
    onExit: function( )
    {
    },
    ctor: function( path, base, target, startAngle, startPosition )
    {
        //if( !Unit.init( "", path ) ) return false;
        //this._super("", path);
        EU.Unit.prototype.ctor.call(this,"", path);
        this.steering = false ;
        this._isStuck = false ;
        this._trajectory( this.Trajectory.line );
        this._parabolicParams.H = 0;
        this._parabolicParams.timer = 0;

        this._parabolicParams.duration = cc.randomMinus1To1() * 0.2 + 0.5;

        this._base = base;
        this._target = target;

        this.setDamageBySector( base.getDamageBySector() );
        this.setAllowTargets( base.getAllowTargets() );
        this.setType( EU.UnitType.tower );

        var part = this._target.getParamCollection().get( this._bopyPart, "" );
        var rand = this._target.getParamCollection().get( "random_bullet", "" );
        this._targetPointOffset = EU.Common.strToPoint( part );
        if( EU.xmlLoader.stringIsEmpty(rand) == false )
        {
            var point = EU.Common.strToPoint( rand );
            this._targetPointOffset.x += cc.randomMinus1To1() * point.x / 2;
            this._targetPointOffset.y += cc.randomMinus1To1() * point.y / 2;
        }

        this._startPoint = startPosition;
        this.updateTargetPoint();
        this.prepare();

        this.setPosition( startPosition );
        this.setRotation( startAngle );
        var z = this._unitLayer == EU.UnitLayer.sky ? 9000 : -startPosition.y;
        this.setLocalZOrder( z + this._additionalZorder );
        return true;
    },
    setProperty: function(stringproperty, value )
    {
        if( stringproperty == "trajectory" )
        {
            if( value == "line" )
                this._trajectory = this.Trajectory.line;
            else if( value == "parabolic" )
                this._trajectory = this.Trajectory.parabolic;
            else
                EU.assert( 0 );
        }
        else if( stringproperty == "parabolicheight" )
            this._parabolicParams.H = EU.Common.strToFloat( value );
        else if( stringproperty == "steering" )
            this.steering = EU.Common.strToBool( value );
        else if( stringproperty == "bodypart" )
            this._bopyPart = value;
        else if( stringproperty == "parabolic_duration" )
            this._parabolicParams.duration = cc.randomMinus1To1() * 0.2 + EU.Common.strToFloat( value );
        else if( stringproperty == "stuck" )
            this._isStuck = EU.Common.strToBool( value );
        else
            return Unit.setProperty( stringproperty, value );
        return true;
    },
    update: function( dt )
    {
        EU.Unit.prototype.update.call(this, dt );
    },
    clear: function()
    {
        this._base.reset( null);
        this._target.reset( null);
    },
    readyfire_update: function( dt )
    {
        EU.Unit.prototype.readyfire_update.call(this, dt );

        var pos = this.computePosition( dt );
        this.turn( pos );
        this.setPosition( pos );
        var z = this._unitLayer == EU.UnitLayer.sky ? 9000 : -pos.y;
        this.setLocalZOrder( z + this._additionalZorder );
    },
    on_die: function()
    {
        if( this._base && this._target )
        {
            var p0 = getPosition();
            var p1 = this._target.getPosition() + EU.Common.strToPoint( this._target.getParamCollection().get( this._bopyPart, "" ) );
            var distance = p0.getDistance( p1 );
            var radius = getRadius();
    
            this.getEffect().copyFrom( this._base.getEffect() );
            var applyDamage = false ;
            applyDamage = applyDamage || (distance < radius);
            applyDamage = applyDamage || this.getDamageBySector();
            if( applyDamage )
            {
                this.setType( this._base.getType() );
                this.applyDamageToTarget( this._target );

                EU.Unit.prototype.on_die.call(this, dt );

                if( this._isStuck )
                {
                    var newParent = this._target.getChildByName( "bullet_node" );
                    if( !newParent )newParent = this._target;
    
                    var pos = this.getPosition();
                    pos = this.convertToWorldSpace( cc.POINT_ZERO);
                    pos = newParent.convertToNodeSpace( pos );
                    this.setPosition( pos );
                    this.retain();
                    this.removeFromParentAndCleanup(true);
                    newParent.addChild( this, -10 );
                    release();
                }
    
                this._base.reset( null);
                this._target.reset( null);
            }
        }
    },
    turn: function( newPos )
    {
        if( this._target )
        {
            switch( this._trajectory )
            {
                case this.Trajectory.line:
                {
                    var p0 = newPos;
                    var p1 = this._target.getPosition();
                    var angle = this.getDirectionByVector( p1 - p0 );
                    this.setRotation( angle );
                    break;
                }
                case this.Trajectory.parabolic:
                {
                    var p0 = this.getPosition();
                    var p1 = newPos;
                    var angle = this.getDirectionByVector( p1 - p0 );
                    this.setRotation( angle );
                    break;
                }
                default:
                    EU.assert( 0 );
            }
        }
    },
    
    prepare: function()
    {
        switch( this._trajectory )
        {
            case this.Trajectory.line:
                break;
            case this.Trajectory.parabolic:
                if( this._parabolicParams.H == 0 )
                    this._parabolicParams.H = 200;
                this._parabolicParams.timer = 0;
                break;
        }
    },
    updateTargetPoint: function()
    {
        if( cc.pointEqualToPoint(this._targetPoint , cc.POINT_ZERO) || this.steering )
        {
            this._targetPoint = cc.pAdd(this._target.getPosition() , this._targetPointOffset);
        }
        return this._targetPoint;
    },
    computePosition: function(  dt )
    {
        this.updateTargetPoint();
    
        switch( this._trajectory )
        {
            case this.Trajectory.line:
                return this.computePositionLine( dt );
            case this.Trajectory.parabolic:
                return this.computePositionParabolic( dt );
            default:
                EU.assert( 0 );
        }
        return this.getPosition();
    },
    computePositionLine: function( dt )
    {
        var p0 = this.getPosition();
        var p1 = this._targetPoint;
        var distance = p0.getDistance( p1 );
        var velocity = this.getMover().getVelocity();
        var t = dt*velocity;
        t = Math.min( t, (p1 - p0).getLength() );
        var p = p0 + (p1 - p0).getNormalized() * t;
    
    
        if( EU.Support.checkRadiusByEllipse( p, this._targetPoint, this.getRadius() ) )
            this.push_event( event_die );
    
        return p;
    },
    computePositionParabolic: function( dt )
    {
        /* t = [0;1] */
        var parabolic = function( t ) { return -(2 * t - 1)*(2 * t - 1) + 1; };
        var line = function(t ) { return this._startPoint + (this._targetPoint - this._startPoint) * t; };
    
        this._parabolicParams.timer += dt;
        var t = this._parabolicParams.timer / this._parabolicParams.duration; // 1 - duration;
        t = Math.min( t, 1.0);
        var pos = line( t );
        pos.y += parabolic( t ) * this._parabolicParams.H;
    
        if( t >= 0.999 )
        this.push_event( event_die );
    
        return pos;
    }

});
