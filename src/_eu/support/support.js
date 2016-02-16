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

/**Type:Array<cc.p> */EU.Route = [];

EU.UnitLayer = {
    earth : 0,
    sky : 1,
    sea : 2,
    any : 3
};

EU.UnitType = {
    creep : 0,
    tower: 1,
    desant: 2,
    hero: 3,
    other: 4
};

EU.RouteSubType = {
    defaultvalue : -1,
    random : -1,
    main : 0,
    left0 : 1,
    right0 : 2,
    max : 3
};

EU.TripleRoute = cc.Class.extend({
    type : null,
    main : null,
    left : null,
    right : null,
    ctor: function(){
        this.type = EU.RouteSubType.main;
        this.main = [];
        this.left = [];
        this.right = [];
    }
});

EU.BodyType = {
    defaultvalue : 0,
    equipment : 0,
    meat : 1
};

/**
 * Maybe duplicate with ccs.extBezierTo if using 'cocostudio' extension/package.
 * @param a
 * @param b
 * @param c
 * @param d
 * @param t
 * @returns {cc.Point}
 */
EU.compute_bezier = function( a, b, c, d, t )
{
    var v0 = Math.pow( 1 - t, 3 );
    var v1 = 3 * t*(Math.pow( 1 - t, 2 ));
    var v2 = 3 * Math.pow( t, 2 )*(1 - t);
    var v3 = Math.pow( t, 3 );
    var x = (v0 * a.x + v1 * b.x + v2 * c.x + v3 * d.x);
    var y = (v0 * a.y + v1 * b.y + v2 * c.y + v3 * d.y);
    return cc.p( x, y );
};

EU.ScrollTouchInfo = cc.Class.extend({

    touchBegan : null,
    nodeposBegan : null,
    lastShift : null,
    node : null,
    touchID : null,

    fitPosition: function( position, winsize )
    {
        EU.assert( this.node );
        var pos = position;
        if( this.node )
        {
            var size = this.node.getContentSize();
            size.width *= this.node.getScale( );
            size.height  *= this.node.getScale( );
            pos.x = Math.min( pos.x, 0 );
            pos.x = Math.max( pos.x, winsize.width - size.width );
            pos.y = Math.min( pos.y, 0 );
            pos.y = Math.max( pos.y, winsize.height - size.height );
        }
        return pos;
    }
});

EU.SpriteForRadius = null;
EU.showRadius= function( position, radius )
{
    if( !EU.SpriteForRadius )
    {
        EU.SpriteForRadius = EU.ImageManager.sprite( EU.k.resourceGameSceneFolder + "circle.png" )
    }
    var scalex = radius / (EU.SpriteForRadius.getContentSize( ).width / 2);
    var scaley = radius / (EU.SpriteForRadius.getContentSize( ).height / 2) / EU.k.IsometricValue;
    EU.SpriteForRadius.setScale( scalex, scaley);
    EU.SpriteForRadius.setPosition( position );


    if( EU.SpriteForRadius.getParent( ) )
        EU.SpriteForRadius.removeFromParent();
    EU.GameGSInstance.addObject( EU.SpriteForRadius );
};

EU.hideRadius = function()
{
    EU.GameGSInstance.removeObject( EU.SpriteForRadius );
};

EU.radiusTowerIsHiden = function()
{
    return EU.SpriteForRadius.getParent() == null;
};

EU.checkRadiusByEllipse = function( a, b, radius )
{
    var x = Math.abs( a.x - b.x );
    var y = Math.abs( a.y - b.y ) * EU.k.IsometricValue;
    var d = Math.sqrt( x*x + y*y );
    return d <= radius;
};


//ActionText.ActionText( ) {}
//ActionText.~ActionText( ) {}
//bool ActionText.init( var duration, var endValue, bool floatTruncation )
//{
//    if( ActionInterval.initWithDuration( duration ) )
//    {
//        _floatTruncation = floatTruncation;
//        _endValue = endValue;
//        return true;
//    }
//    return false;
//}
//void ActionText.startWithTarget( cocos2d.Node *target )
//{
//    ActionInterval.startWithTarget( target );
//    var label = dynamic_cast<LabelProtocol*>(target);
//    assert( label );
//    _startValue = strToFloat( label.getString() );
//}
//
//void ActionText.update( var t )
//{
//    var label = dynamic_cast<LabelProtocol*>(getTarget());
//    assert( label );
//
//    var value = _startValue + (_endValue - _startValue) * t;
//    if( _floatTruncation )
//    {
//        label.setString( intToStr( var( value ) ) );
//    }
//    else
//    {
//        label.setString( floatToStr( value ) );
//    }
//
//}
//ActionInterval* ActionText.reverse( ) const
//    {
//        return ActionText.create( getDuration(), _startValue, _floatTruncation );
//};
//
//ActionInterval* ActionText.clone( ) const
//    {
//        return ActionText.create( getDuration( ), _endValue, _floatTruncation );
//}

EU.checkPointOnRoute_1 = function( point, maxDistanceToRoad, allowLayer, outdistance )
{
    EU.assert( EU.GameGSInstance );
    var board = EU.GameGSInstance.getGameBoard();
    var routes = board.getCreepsRoutes();
    for( var i=0; i<routes.length; ++i )
    {
        var route = routes[i];
        if( (route.type == allowLayer || allowLayer == EU.UnitLayer.any) && EU.checkPointOnRoute_2( point, route, maxDistanceToRoad, outdistance ) )
            return true;
    }
    return false;
};

EU.checkPointOnRoute_2 = function( point, route, maxDistanceToRoad, outdistance )
{
    var index_min = -1;
    var distance_min = 9999999;

    var road = route.main;
    for( var i = 1; i < road.length; ++i )
    {
        var p0 = road[i - 1];
        var p1 = road[i];
        var dist = EU.Common.distanse_pointToLineSegment( p0, p1, point );
        if( dist < distance_min )
        {
            distance_min = dist;
            index_min = i;
        }
    }
    outdistance = distance_min;
    return distance_min < maxDistanceToRoad;
};

EU.getElapsedTimeFromPreviosLaunch = function( timeId )
{
    var elapsed = 0;
    //TODO: time
    //var times = EU.UserData.get_str( timeId );
    //if( times.empty( ) == false )
    //{
    //    struct tm last;
    //    sscanf( times.c_str( ), "%d-%d-%d-%d", &last.tm_sec, &last.tm_min, &last.tm_hour, &last.tm_yday );
    //    time_t time = .time( 0 );
    //    struct tm now = *localtime( &time );
    //    long long last_sec =
    //    last.tm_sec +
    //    last.tm_min * 60 +
    //    last.tm_hour * 60 * 60 +
    //    last.tm_yday * 60 * 60 * 24;
    //    long long now_sec =
    //    now.tm_sec +
    //    now.tm_min * 60 +
    //    now.tm_hour * 60 * 60 +
    //    now.tm_yday * 60 * 60 * 24;
    //    long long diff = now_sec - last_sec;
    //    elapsed = static_cast<var>(diff);
    //}
    return elapsed;
};


EU.strToUnitLayer = function( value )
{
    if( value == "earth" )return EU.UnitLayer.earth;
    if( value == "sky" )return EU.UnitLayer.sky;
    if( value == "sea" )return EU.UnitLayer.sea;
    if( value == "any" )return EU.UnitLayer.any;
    return EU.UnitLayer.earth;
};

EU.unitLayerToStr = function( unitLayer )
{
    switch( unitLayer )
    {
        case EU.UnitLayer.earth: return "earth";
        case EU.UnitLayer.sky: return "sky";
        case EU.UnitLayer.sea: return "sea";
        case EU.UnitLayer.any: return "any";
    }
    EU.assert( 0 );
    return "";
};

EU.strToUnitType = function( value )
{
    if( value == "creep" ) return EU.UnitType.creep;
    if( value == "tower" ) return EU.UnitType.tower;
    if( value == "desant" ) return EU.UnitType.desant;
    if( value == "hero" ) return EU.UnitType.hero;
    return EU.UnitType.other;
};

EU.unitTypeToStr = function( unittype )
{
    switch( unittype )
    {
        case EU.UnitType.creep: return "creep";
        case EU.UnitType.tower: return "tower";
        case EU.UnitType.desant: return "desant";
        case EU.UnitType.hero: return "hero";
        case EU.UnitType.other: return "other";
    }
    EU.assert( 0 );
    return "";
};


EU.strToRouteSubType = function( value )
{
    if( value == "random" )return EU.RouteSubType.random;
    if( value == "-1" )return EU.RouteSubType.random;
    if( value == "main" )return EU.RouteSubType.main;
    if( value == "left" )return EU.RouteSubType.left0;
    if( value == "right" )return EU.RouteSubType.right0;
    return EU.RouteSubType.random;
};

EU.strToBodyType = function( value )
{
    if( value == "equipment" )return EU.BodyType.equipment;
    if( value == "meat" )return EU.BodyType.meat;
    return EU.BodyType.defaultvalue;
};

//TODO: openUrl
openUrl = function(url){
};

EU.MouseHoverScroll = {
    scrollMouseHoverX : null,
    scrollMouseHoverY : null,
    winSize : null,
    touchListener : null,
    scroller : null,
    node : null,
    velocity : null,
    border : null,

    setScroller: function( scroller ){this.scroller = scroller;},
    setNode: function( node ){this.node = node;},

    init: function(){
        this.scrollMouseHoverX = 0;
        this.scrollMouseHoverY = 0;
        this.scroller = null;
        this.winSize = cc.view.getDesignResolutionSize();
        this.touchListener = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseMove: this.mouseHover,
            onMouseUp: null,
            onMouseDown: null,
            onMouseScroll: null
        });
        cc.eventManager.addListener(this.touchListener, -9999);
        this.node = null;
        this.velocity = 300;
        this.border = 100;
    },

    update: function(dt)
    {
        if (!this.node || !this.scroller)
            return;
        var pos = this.node.getPosition();
        pos.x += this.scrollMouseHoverX * dt * this.velocity;
        pos.y += this.scrollMouseHoverY * dt * this.velocity;
        this.scroller.node = this.node;
        pos = this.scroller.fitPosition( pos, this.winSize );
        this.node.setPosition(pos);
    },
    enable: function(){
    },
    disable: function() {
    },
    disable_schedule: function(){
    },
    mouseHover: function(event)
    {
        var border = EU.MouseHoverScroll.border;
        var sx = 0, sy=0;
    
        if (event.getLocationX() < border)
            sx = +Math.abs( 1 - event.getLocationX() / border);
        else if( event.getLocationX() > (EU.MouseHoverScroll.winSize.width - border) )
            sx = -Math.abs( 1 - (EU.MouseHoverScroll.winSize.width - event.getLocationX()) / border );
    
        if (event.getLocationY() < border)
            sy = +Math.abs(1 - event.getLocationY() / border);
        else if( event.getLocationY() > (EU.MouseHoverScroll.winSize.height - border) )
            sy = -Math.abs( 1 - (EU.MouseHoverScroll.winSize.height - event.getLocationY()) / border );

        EU.MouseHoverScroll.scrollMouseHoverX = sx;
        EU.MouseHoverScroll.scrollMouseHoverY = sy;

        EU.MouseHoverScroll.scrollMouseHoverX = Math.min(EU.MouseHoverScroll.scrollMouseHoverX, EU.MouseHoverScroll.velocity);
        EU.MouseHoverScroll.scrollMouseHoverY = Math.min(EU.MouseHoverScroll.scrollMouseHoverY, EU.MouseHoverScroll.velocity);
    }

};

(function(){
    EU.MouseHoverScroll.init();
})();
