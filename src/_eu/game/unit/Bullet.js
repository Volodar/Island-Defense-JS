//Define namespace
var EU = EU || {};


EU.Bullet = EU.Unit.extend({
    Trajectory: {
        line: null,
        parabolic: null,
    },
    _bopyPart: null,
    _trajectory: null,
    _base: null,
    _target: null,
    _startPoint: null,
    _targetPoint: null,
    _targetPointOffset: null,
    _steering: null,
    _isStuck: null,
    _parabolicParams: {
        H: null,
        timer: null,
        duration: null,
    }

});
