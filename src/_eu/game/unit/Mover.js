//Define namespace
var EU = EU || {};


EU.Mover = cc.Class.extend(
{
    /** For Test Instance of */
    __Mover: true,

    /**@type {cc.math.Vec2[]}*/ _route: [],
    /**@type {cc.math.Vec2}*/ _position: null,
    /**@type {cc.math.Vec2} */_currentDirection: null,
    /**@type {cc.math.Vec2}*/ _truncatedDirection: null,
    _currentAngle: 0,
    _velocity: 0,
    _defaultvelocity: 0,
    _allowAngles: [],
    _threshold: 0,
    _onChangePosition: null,
    _onFinish: null,

    ctor: function () {
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
        /**@type {cc.math.Vec2} direction */
        var direction = new cc.math.Vec2(0, 0);

        var moveVelocity = this._velocity;
        while (this._route.length > 0) {
            direction = cc.math.Vec2.subtract(direction, this._route[0], this.getPosition());
            var T = direction.length() / (moveVelocity * dt);
            if (T < 1)
                this._route.shift();
            else
                break;
        }
        direction.normalize();

        var isometric = (1 + Math.abs(direction.x)) / 2;
        var shift = direction.scale(moveVelocity * dt * isometric);

        this.setLocation(cc.math.Vec2.add(new cc.math.Vec2(0, 0), this._position, shift));

        if (this._route.length == 0) {
            this._onFinish();
        }
    },
    setRoute: function (route) {
        this._route = route;

        if (this._route.length == 0) {
            this._onFinish();
        }
        else {
            var direction = this._route.length > 1 ? cc.math.Vec2.subtract(new cc.math.Vec2(0, 0), this._route[1], this._route[0])
                : new cc.math.Vec2(1, 0);
            direction.normalize();
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
            this._onFinish();
    },
    setLocation: function (position) {
        var direction = cc.math.Vec2.subtract(new cc.math.Vec2(0, 0), position, this._position).normalize();
        this._position = position;
        this.setDirection(direction);

        if (this._onChangePosition) {
            this._onChangePosition(this._position, this._truncatedDirection);
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
