//Define namespace
var EU = EU || {};


EU.Mover = cc.Class.extend(
{
    /** For Test Instance of */
    __Mover: true,

    /**@type {Array<cc.p>} */ _route: null,
    /**@type {cc.p} */ _position: null,
    /**@type {cc.p} */_currentDirection: null,
    /**@type {cc.p} */ _truncatedDirection: null,
    _currentAngle: 0,
    _velocity: 0,
    _defaultvelocity: 0,
    _allowAngles: null,
    _threshold: 0,
    _onChangePosition: null,
    _onFinish: null,
    _unit: null,

    ctor: function (unit) {
        "use strict";
        EU.assert( unit );
        this._unit = unit;
        this._route = [];
        this._allowAngles = [];
        this._position = cc.p(0,0);
        this._currentDirection = cc.p(0,0);
        this._truncatedDirection = cc.p(0,0);
    },

    load_element: function (/** @type {Element} */ xmlnode) {
        var xmlparams = xmlnode.getElementsByTagName("params")[0];
        var xmlangles = xmlparams.getElementsByTagName("allowangles")[0];
        var xmlthresold = xmlparams.getElementsByTagName("thresold")[0];

        var angles = xmlangles.getAttribute("value").split(',');
        for (var i = 0; i < angles.length; i++) {
            var angle = angles[i];
            this._allowAngles.push(parseInt(angle));
        }
        this._thresold = parseFloat(xmlthresold.attribute("value"));
    },

    update: function (dt) {
        if (this._route.length == 0)
            return;
        /**@type {cc.p} direction */
        var direction = cc.p(0, 0);

        var moveVelocity = this._velocity;
        while (this._route.length > 0) {
            direction = cc.pSub( this._route[0], this.getPosition());
            var T = cc.pLength(direction) / (moveVelocity * dt);
            if (T < 1)
                this._route.shift();
            else
                break;
        }
        cc.pNormalizeIn(direction);

        var isometric = (1 + Math.abs(direction.x)) / 2;
        var shift = cc.pMult(direction, moveVelocity * dt * isometric);

        this.setLocation(cc.pAdd( this._position, shift));

        if (this._route.length == 0) {
            this._onFinish.call(this._unit);
        }
    },
    setRoute: function (route) {
        this._route = route;

        if (this._route.length == 0) {
            this._onFinish.call(this._unit);
        }
        else {
            var direction = this._route.length > 1 ? cc.pSub(this._route[1], this._route[0])
                : cc.p(1, 0);
            cc.pNormalizeIn(direction);
            this.setDirection(direction);
            this.setLocation(this._route[0]);
        }
    },
    getRoute: function () {
        return this._route;
    },
    getPosition: function () {
        return this._position;
    },
    onFinish: function () {
        if (this._onFinish)
            this._onFinish.call(this._unit);
    },
    setLocation: function (position) {
        var direction = cc.pNormalize(cc.pSub( position, this._position));
        this._position = position;
        this.setDirection(direction);

        if (this._onChangePosition) {
            this._onChangePosition.call(this._unit, this._position, this._truncatedDirection);
        }
    },
    setDirection: function (direction) {
        var self = this;
        var as = function (dir, a) {
            var ra = function (a) {
                while (a < 0) a += 360;
                return a;
            };
            var A = ra(a) < dir + self._thresold;
            var B = ra(a) > ra(dir - self._thresold);
            if ((dir - self._thresold) < 0) return A || B;
            else return A && B;
        };

        /**float*/
        var a = EU.Common.getDirectionByVector(direction);

        for (var i = 0; i < this._allowAngles.length; i++) {
            var angle = this._allowAngles[i];
            if (as(angle, a)) {
                this._currentAngle = angle;
                break;
            }
        }
        return this._truncatedDirection;
    },
    getDirection: function () {
        return this._truncatedDirection;
    },
    getRandomAngle: function () {
        if (this._allowAngles.size() == 0)return 0;

        var index = cc.random0To1() % this._allowAngles.length;
        return this._allowAngles[index];
    }
});
//
//
//CC_SYNTHESIZE( float, _velocity, Velocity );
//CC_SYNTHESIZE( float, _defaultvelocity, DefaultVelocity );
//CC_SYNTHESIZE_PASS_BY_REF( std::vector<unsigned>, _allowAngles, AllowAngles );
//CC_SYNTHESIZE( unsigned, _thresold, AngleThresold );
//CC_SYNTHESIZE( unsigned, _currentAngle, CurrentAngle );
//CC_SYNTHESIZE( std::function<void( const Point&, const Vec2& )>, _onChangePosition, OnChangePosition );
//CC_SYNTHESIZE( std::function<void( )>, _onFinish, OnFinish);
//
