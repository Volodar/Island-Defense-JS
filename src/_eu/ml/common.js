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
EU = EU || {};

/** return defaultObj if obj is null or undefined*/
EU.asObject = function(obj, defaultObj){
    if (obj != null) return obj;
    return defaultObj;
};

/**
 * Convert string to 
 * @param {string} string ("yes", "true", "Y", "y", "Yes")
 */
var strToBool = function( string ){ return  string == "yes" || string == "y" || string == "true" || string== "Yes" || string == "Y"; };
/**
 * Convert string to var
 * @param {string} string
 */
var strToInt = function( string ){ return  parseInt(string); };
/**
 * Convert string to float
 * @param {string} string
 */
var strToFloat = function( string ){ return  parseFloat(string); };
/**
 * Convert string to cc.Point
 * @param {string} string
 */
var strToPoint = function( value ) {
    var frame = cc.winSize;
    var string = value;

    var add = new cc.Point(0,0);
    var addk = string.indexOf( "add:" );
    if( addk != -1 )
    {
        assert( addk != 0 );
        var s = string.substr( addk + 4 );
        add = this.strToPoint( s );
        string = string.substr( 0, addk );
    }

    var framek = string.indexOf( "frame:" );
    if( framek == 0 )
    {
        string = string.substr( framek + 6 );
        var point = strToPoint( string );
        point.x *= frame.width;
        point.y *= frame.height;
        return new cc.Point(point.x + add.y, point.y + add.y);
    }

    var rb = string.indexOf( "right:" );
    if( rb == 0 )
    {
        string = string.substr( rb + 6 );
        var point = strToPoint( string );
        point.x = frame.width + point.x;
        return point + add;
    }
    var lt = string.indexOf( "top:" );
    if( lt == 0 )
    {
        string = string.substr( lt + 4 );
        var point = strToPoint( string );
        point.y = frame.height + point.y;
        return point + add;
    }
    var rt = string.indexOf( "righttop:" );
    if( rt == 0 )
    {
        string = string.substr( rt + 9 );
        var point = strToPoint( string );
        point.x = frame.width + point.x;
        point.y = frame.height + point.y;
        return point + add;
    }
    var hb = string.indexOf( "halfbottom:" );
    if( hb == 0 )
    {
        string = string.substr( hb + 11 );
        var point = strToPoint( string );
        point.x = frame.width / 2 + point.x;
        return point + add;
    }
    var ht = string.indexOf( "halftop:" );
    if( ht == 0 )
    {
        string = string.substr( ht + 8 );
        var point = strToPoint( string );
        point.x = frame.width / 2 + point.x;
        point.y = frame.height + point.y;
        return point + add;
    }
    var lh = string.indexOf( "lefthalf:" );
    if( lh == 0 )
    {
        string = string.substr( lh + 9 );
        var point = strToPoint( string );
        point.y = frame.height / 2 + point.y;
        return point + add;
    }
    var rh = string.indexOf( "righthalf:" );
    if( rh == 0 )
    {
        string = string.substr( rh + 10 );
        var point = strToPoint( string );
        point.x = frame.width + point.x;
        point.y = frame.height / 2 + point.y;
        return point + add;
    }

    var k = string.indexOf( "x" );
    if( k == -1 )
        return cc.Point( 0, 0 ) + add;

    var x = strToFloat( string.substr( 0, k ) );
    var y = strToFloat( string.substr( k + 1 ) );
    var p = new cc.Point(x, y );
    return new cc.Point(p.x + add.y, p.y + add.y);
};
/**
 *
 * @param value
 * @returns {*}
 */
var strToSize = function( value ){
    var size = new cc.Size(0,0);
    var k = value.indexOf( "x" );
    if( k == -1 ) {
        return cc.Point(0, 0) + add;
    }
    else {
        size.width = strToFloat( value.substr( 0, k ) );
        size.height = strToFloat( value.substr( k + 1 ) );
    }
    return size;
}

/**
 * return distance between two points
 * @param {cc.Point} a
 * @param {cc.Point} b
 * @returns {number}
 */
var pointDistance = function( a, b ){
    var x = a.x- b.x;
    var y = a.y- b.y;
    return Math.sqrt(x*x+y*y);
}
/**
 * return square distance between two points
 * @param {cc.Point} a
 * @param {cc.Point} b
 * @returns {number}
 */
var pointDistanceSq = function( a, b ){
    var x = a.x- b.x;
    var y = a.y- b.y;
    return x*x+y*y;
}

/**
 *
 * @param {cc.Point} a
 * @param {cc.Point} b
 * @returns {number}
 */
var getAngle = function( a, b ) {
    return -Math.atan2( a.x*b.y - b.x*a.y, a.x*b.x + a.y*b.y ) * 180 / Math.PI
}

/**
 *
 * @param {number} direction
 * @returns {cc.Point}
 */
var getVectorByDirection = function( direction ) {
    var rad = cc.degreesToRadians( direction );
    var x = Math.cos( rad );
    var y = -Math.sin( rad );
    return cc.Point(x,y);
}

/**
 *
 * @param {cc.Point} radius
 * @returns {number}
 */
var getDirectionByVector = function( radius ) {
    var axis = cc.Point( 1, 0 );
    return getAngle( axis, radius );
}
/**
 *
 * @param {number} start
 * @param {number} end
 * @param {number} amount
 * @returns {number}
 */
var lerpDegrees = function( start, end, amount ) {
    var difference = Math.abs( end - start );
    if( difference > 180 )
    {
        if( end > start )
            start += 360;
    else
        end += 360;
    }

    var value = start + (end - start) * amount;
    while( value >= 360 ) value -= 360;
    while( value < 0 ) value += 360;
    return value;
};
/**
 * get distance from point to line (A,B)
 * @param {cc.Point} point
 * @param {cc.Point} A
 * @param {cc.Point} B
 * @returns {number}
 */
var getDistance = function( point, A, B ) {
    var x = point.x;
    var y = point.y;
    var x1 = A.x;
    var y1 = A.y;
    var x2 = B.x;
    var y2 = B.y;
    return Math.abs( (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1) ) / Math.sqrt( (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) );
}
/**
 *
 * @param {cc.Point} segmentA
 * @param {cc.Point} segmentB
 * @param {cc.Point} point
 * @returns {number}
 */
var distanse_pointToLineSegment = function(segmentA, segmentB, point ){
    var P0 = point;
    var P1 = segmentA;
    var P2 = segmentB;

    var p01 = P0 - P1;
    var p21 = P2 - P1;

    var T = p21.dot( p01 ) / (p21.x*p21.x + p21.y*p21.y );

    if( T < 0 || T > 1 ) {
        var res = 1E+37;
        return res;
    }

    var P = P1 + p21 * T;
    return pointDistance(P,point);
}
/**
 *
 * @param {cc.Point[]} route
 * @param {number} objectSpeed
 * @returns {actions}
 */
var createRouteAction = function (route, objectSpeed) {
    var actions = [];
    for ( i = 1; i < route.length; ++i) {
         duration = pointDistance(route[i - 1], route[i]) / objectSpeed;
        actions.pushBack(cc.MoveTo.create(duration, route[i]));
    }
    return cc.Sequence.sequence(actions);
};
/**
 *
 * @param out
 * @param values
 * @param delimiter
 */
var split = function( out, values, delimiter ) {
    if( values.empty() )
        return;
     string = values;
    do
    {
         k = string.indexOf( delimiter );
        if( k == -1 )
        {
            out[out.length] = string;
            break;
        }

        out[out.length] = string.substr( 0, k );
        string = string.substr( k + 1 );
        if( string.empty() )
            break;
    }
    while( true );
}
/**
 *
 * @param value
 * @returns {string}
 */
var boolToStr = function( value ) {
    return value ? "yes" : "no";
};
/**
 *
 * @param point
 * @returns {string}
 */
var pointToStr = function( point ) {
    return numberToStr( point.x ) + "x" + numberToStr( point.y );
}
/**
 *
 * @param size
 * @returns {string}
 */
var sizeToStr = function( size ) {
    return numberToStr( size.width ) + "x" + numberToStr( size.height );
}
/**
 *
 * @param out
 * @param radius
 * @param countPoints
 * @param startAngleInDegree
 */
var computePointsByRadius = function( out, radius, countPoints, startAngleInDegree){
     delta = Math.PI * 2.0 / countPoints;
     startAngleInRadian = startAngleInDegree * Math.PI / 180;
    for( var i=0; i<countPoints; ++i )
    {
        var angle = startAngleInRadian + delta * i;
        out[i].x = radius * Math.cos(angle);
        out[i].y = radius * Math.sin(angle);
    }
}
/**
 *
 * @param root
 * @param tagspath
 * @returns {*}
 */
var getNodeByTagsPath = function( root, tagspath ) {
    var node = root;
    var i = 0;
    while( node && i < tags.length )
    {
        node = node.getChildByTag( tags[i] );
        ++i;
    }
    return node;
}
/**
 *
 * @param node
 */
var getSceneOfNode = function( node ) {

}

/**
 *
 * @param root
 * @param path_names
 * @returns {*}
 */
var getNodeByPath = function( root, path_names ) {
    split( names, path_names, '/' );
    var node = root;

    var i = 0;
    while( node && i < names.length )
    {
        name = names[i];
        if( name == ".." )
            node = node.getParent();
        else if( name == "." )
            node = node;
        else if( name.empty() && path_names[0] == '/' )
        {
            node = node.getScene();
            if( node == nullptr )
                node = Director.getInstance().getRunningScene();
        }
        else
            node = node.getChildByName( name );
        ++i;
    }
    return node;
}
/**
 *
 * @param url
 */
//TODO: openUrl function
var openUrl = function( url ) {
}
/**
 *
 * @param node
 * @param pointInParentSpace
 * @param depth
 * @returns {boolean}
 */
var checkPointInNode = function( node, pointInParentSpace, depth ) {
    if( !node )
        return false;
    var bb = node.getBoundingBox( );
    var point = pointInParentSpace;

    var parent = node;
    while( parent )
    {
        if( parent.isVisible( ) == false )
            return false;
        parent = parent.getParent( );
    }
    if( point.x > bb.origin.x &&
        point.x < bb.origin.x + bb.size.width &&
        point.y > bb.origin.y &&
        point.y < bb.origin.y + bb.size.height )
    {
        return true;
    }
    return false;
};
/**
 *
 * @param size
 * @returns {string}
 */
var sizeToStr = function( size ) {
    return pointToStr( new cc.Point(size.width, size.height) );
}
/**
 *
 * @param value
 * @returns {cc.Rect}
 */
var strToRect = function( value ) {
    var rect = new cc.Rect(0, 0, 0, 0);
    var list = [];
    split( list, value );
    rect.origin = strToPoint( (list.length > 0) ? list[0] : "" );
    rect.size = strToSize( (list.length > 1) ? list[1] : "" );
    return rect;
}
/**
 *
 * @param rect
 * @returns {string}
 */
//TODO: rectToStr
var rectToStr = function( rect ){
    cc.log( "//TODO: rectToStr" );
    return "";
}
/**
 *
 * @param value
 * @returns {*}
 */
var strToColor3B = function( value ){
    assert( value.empty( ) || value.size( ) == 6 );
    if( value.empty( ) ) return cc.Color3B.WHITE;

    var r = value.substr( 0, 2 );
    var g = value.substr( 2, 2 );
    var b = value.substr( 4, 2 );
    return cc.Color3B( parseInt(r, 16), parseInt(g, 16), parseInt(b, 16) );
}
/**
 *
 * @param color
 */
//TODO: color3BToStr
var color3BToStr = function( color ) {
    cc.log( "//TODO: color3BToStr" );
}
/**
 *
 * @param value
 * @returns {*}
 */
var strToBlendFunc = function( value ){
    var ret = cc.BlendFunc._disable;
    return ret;
}
/**
 *
 * @param blendFunc
 * @returns {string}
 */
//TODO: blendFuncToStr
var blendFuncToStr = function( blendFunc ){
    cc.log( "//TODO: blendFuncToStr" );
    return "";
}
/**
 *
 * @param seconds
 * @returns {string|*}
 */
var floatToTimeString = function( seconds ) {
    var sec = seconds;
    var h = sec / (3600);
    var m = (sec % 3600) / 60;
    var s = sec % 60;

    var result;
    if( h > 0 ) result = h.toString() + ":";
    if( m > 0 || h > 0) result += m.toString();
    if( m > 0 ) result += ":";
    result += s.toString();
    return result;
}
/**
 *
 * @param center
 * @param radius
 */
var getRandPointInPlace = function( center, radius ) {
    var r = cc.Point(0,0);
    var angle = Math.random() * Math.PI * 2;
    var ca = Math.cos( angle );
    var sa = Math.sin( angle );
    r.x = center.x + ca * radius;
    r.y = center.y + sa * radius;
    return r;
}

//TODO: Strech
//Strech.Strech()
//: mode( Mode.unknow )
//, maxScaleX(-1)
//, maxScaleY(-1)
//, minScaleX(-1)
//, minScaleY(-1)
//{}
//
//var Strech.empty()const
//{
//    return mode == Mode.unknow;
//}
//
//Strech.Mode strToStrechMode( const & mode )
//{
//    if( mode == "x" ) return Strech.Mode.only_x;
//    if( mode == "y" ) return Strech.Mode.only_y;
//    if( mode == "xy" ) return Strech.Mode.both_xy;
//    if( mode == "max" ) return Strech.Mode.max_scale;
//    if( mode == "min" ) return Strech.Mode.min_scale;
//    assert( 0 );
//    return Strech.Mode.unknow;
//}
//
////"frame:1x1:min[max:1,min:0.5]"
//Strech strToStrech( const & string )
//{
//    Strech result;
//     mode;
//     size;
//    size_t paramB = stringind_last_of( "[" );
//    size_t paramE = stringind_last_of( "]" );
//    size_t k( .npos );
//    if( paramB == .npos )
//    {
//        k = stringind_last_of( ":" );
//    }
//    else
//    {
//        size_t pos = stringind( ':', 0 );
//        while( pos < paramB )
//        {
//            k = pos;
//            pos = stringind( ':', pos + 1 );
//        }
//    }
//
//    if( k != .npos )
//    {
//        size = string.substr( 0, k );
//        if( paramB == .npos )
//            mode = string.substr( k + 1 );
//        else
//            mode = string.substr( k + 1, paramB - (k + 1) );
//    }
//
//    if( paramB != .npos )
//    {
//         paramsString;
//        if( paramE != .npos )
//            paramsString = string.substr( paramB + 1, paramE - (paramB + 1) );
//        else
//            paramsString = string.substr( paramB + 1 );
//
//        ParamCollection pc( paramsString );
//        result.maxScaleX = pc.isExist( "maxx" ) ? strToFloat( pc.get( "maxx" ) ) : result.maxScaleX;
//        result.maxScaleY = pc.isExist( "maxu" ) ? strToFloat( pc.get( "maxu" ) ) : result.maxScaleY;
//        result.minScaleX = pc.isExist( "minx" ) ? strToFloat( pc.get( "minx" ) ) : result.minScaleX;
//        result.minScaleY = pc.isExist( "miny" ) ? strToFloat( pc.get( "miny" ) ) : result.minScaleY;
//        if( pc.isExist( "max" ) )
//            result.maxScaleX = result.maxScaleY = strToFloat( pc.get( "max" ) );
//        if( pc.isExist( "min" ) )
//            result.minScaleX = result.minScaleY = strToFloat( pc.get( "min" ) );
//    }
//
//
//    result.boundingSize = strToSize( size );
//    result.mode = strToStrechMode( mode );
//    return result;
//}
//
//var strechNode( cc.Node*node, const Strech& strech )
//{
//    if( node == nullptr )
//        return;
//
//    Size size = node.getContentSize();
//    if( size.width == 0 || size.height == 0 )
//    {
//        return;
//    }
//     sx = strech.boundingSize.width / size.width;
//     sy = strech.boundingSize.height / size.height;
//     ssx = node.getScaleX();
//     ssy = node.getScaleY();
//     zx = ssx / fabs( ssx );
//    switch( strech.mode )
//    {
//        case Strech.Mode.max_scale:
//            ssy = ssx = std.max( sx, sy );
//            break;
//        case Strech.Mode.min_scale:
//            ssy = ssx = std.min( sx, sy );
//            break;
//        case Strech.Mode.both_xy:
//            ssx = sx;
//            ssy = sy;
//            break;
//        case Strech.Mode.only_x:
//            ssx = sx;
//            break;
//        case Strech.Mode.only_y:
//            ssy = sy;
//            break;
//        case Strech.Mode.unknow:
//            break;
//    }
//
//    if( zx < 0 )
//    {
//        ssy = -ssy;
//    }
//
//    if( strech.maxScaleX != -1 ) ssx = std.min( ssx, strech.maxScaleX );
//    if( strech.maxScaleY != -1 ) ssy = std.min( ssy, strech.maxScaleY );
//    if( strech.minScaleX != -1 ) ssx = std.max( ssx, strech.minScaleX );
//    if( strech.minScaleY != -1 ) ssy = std.max( ssy, strech.minScaleY );
//
//    node.setScale( ssx, ssy );
//}

//TODO: ActionEnable
//TODO: ActionDisable
//ActionEnable* ActionEnable.create(){
//    ActionEnable* ret = new (std.nothrow) ActionEnable();
//
//    if( ret )
//    {
//        ret.autorelease();
//    }
//
//    return ret;
//}
//
//var ActionEnable.update(  time )
//{
//    CC_UNUSED_PARAM( time );
//    xmlLoader.setProperty( _target, xmlLoader.kEnabled, toStr( true ) );
//}
//
//ActionInstant* ActionEnable.reverse() const
//    {
//        return ActionDisable.create();
//}
//
//ActionEnable * ActionEnable.clone() const
//    {
//        // no copy constructor
//        var a = new (std.nothrow) ActionEnable();
//a.autorelease();
//return a;
//}
//
//ActionDisable* ActionDisable.create()
//{
//    ActionDisable* ret = new (std.nothrow) ActionDisable();
//
//    if( ret )
//    {
//        ret.autorelease();
//    }
//
//    return ret;
//}
//
//var ActionDisable.update(  time )
//{
//    CC_UNUSED_PARAM( time );
//    xmlLoader.setProperty( _target, xmlLoader.kEnabled, toStr( false ) );
//}
//
//ActionInstant* ActionDisable.reverse() const
//    {
//        return ActionDisable.create();
//}
//
//ActionDisable * ActionDisable.clone() const
//    {
//        // no copy constructor
//        var a = new (std.nothrow) ActionDisable();
//a.autorelease();
//return a;
//}
