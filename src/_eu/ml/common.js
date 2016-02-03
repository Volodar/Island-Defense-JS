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

EU.Common = {
    /**
     * Convert string to
     * @param {string} string ("yes", "true", "Y", "y", "Yes")
     */
    strToBool: function (string) {
        return string == "yes" || string == "y" || string == "true" || string == "Yes" || string == "Y";
    },
    /**
     * Convert string to var
     * @param {string} string
     */
    strToInt: function (string) {
        if (EU.xmlLoader.stringIsEmpty(string) == false)
            return parseInt(string);
        else
            return "0";
    },
    /**
     * Convert string to float
     * @param {string} string
     */
    strToFloat: function (string) {
        if (EU.xmlLoader.stringIsEmpty(string) == false)
            return parseFloat(string);
        else
            return "0";
    },
    /**
     * Convert string to cc.Point
     * @param {string} value
     */
    strToPoint: function (value) {
        if (!value)
            return new cc.Point(0, 0);
        var frame = cc.winSize;
        var string = value;
        var point = null;

        var add = null;
        var addk = string.indexOf("add:");
        if (addk != -1) {
            EU.assert(addk != 0);
            var s = string.substr(addk + 4);
            add = EU.Common.strToPoint(s);
            string = string.substr(0, addk);
        }

        var framek = string.indexOf("frame:");
        if (framek == 0) {
            string = string.substr(framek + 6);
            point = EU.Common.strToPoint(string);
            point.x *= frame.width;
            point.y *= frame.height;
            return add == null ? point : new cc.Point(point.x + add.y, point.y + add.y);
        }

        var rb = string.indexOf("right:");
        if (rb == 0) {
            string = string.substr(rb + 6);
            point = EU.Common.strToPoint(string);
            point.x = frame.width + point.x;
            return add == null ? point : new cc.Point(point.x + add.y, point.y + add.y);
        }
        var lt = string.indexOf("top:");
        if (lt == 0) {
            string = string.substr(lt + 4);
            point = EU.Common.strToPoint(string);
            point.y = frame.height + point.y;
            return add == null ? point : new cc.Point(point.x + add.y, point.y + add.y);
        }
        var rt = string.indexOf("righttop:");
        if (rt == 0) {
            string = string.substr(rt + 9);
            point = EU.Common.strToPoint(string);
            point.x = frame.width + point.x;
            point.y = frame.height + point.y;
            return add == null ? point : new cc.Point(point.x + add.y, point.y + add.y);
        }
        var hb = string.indexOf("halfbottom:");
        if (hb == 0) {
            string = string.substr(hb + 11);
            point = EU.Common.strToPoint(string);
            point.x = frame.width / 2 + point.x;
            return add == null ? point : new cc.Point(point.x + add.y, point.y + add.y);
        }
        var ht = string.indexOf("halftop:");
        if (ht == 0) {
            string = string.substr(ht + 8);
            point = EU.Common.strToPoint(string);
            point.x = frame.width / 2 + point.x;
            point.y = frame.height + point.y;
            return add == null ? point : new cc.Point(point.x + add.y, point.y + add.y);
        }
        var lh = string.indexOf("lefthalf:");
        if (lh == 0) {
            string = string.substr(lh + 9);
            point = EU.Common.strToPoint(string);
            point.y = frame.height / 2 + point.y;
            return add == null ? point : new cc.Point(point.x + add.y, point.y + add.y);
        }
        var rh = string.indexOf("righthalf:");
        if (rh == 0) {
            string = string.substr(rh + 10);
            point = EU.Common.strToPoint(string);
            point.x = frame.width + point.x;
            point.y = frame.height / 2 + point.y;
            return add == null ? point : new cc.Point(point.x + add.y, point.y + add.y);
        }

        var k = string.indexOf("x");
        if (k == -1)
            return new cc.Point(0, 0) + add;

        var x = EU.Common.strToFloat(string.substr(0, k));
        var y = EU.Common.strToFloat(string.substr(k + 1));
        point = new cc.Point(x, y);
        return add == null ? point : new cc.Point(point.x + add.y, point.y + add.y);
    },
    /**
     *
     * @param value
     * @returns {*}
     */
    strToSize: function (value) {
        var size = new cc.Size(0, 0);
        var k = value.indexOf("x");
        if (k == -1) {
            return cc.Point(0, 0) + add;
        }
        else {
            size.width = EU.Common.strToFloat(value.substr(0, k));
            size.height = EU.Common.strToFloat(value.substr(k + 1));
        }
        return size;
    },

    /**
     * return distance between two points
     * @param {cc.Point} a
     * @param {cc.Point} b
     * @returns {number}
     */
    pointDistance: function (a, b) {
        var x = a.x - b.x;
        var y = a.y - b.y;
        return Math.sqrt(x * x + y * y);
    },
    pointLength: function (a) {
        return Math.sqrt(a.x * a.x + a.y * a.y);
    },
    pointNormalized: function (a) {
        var l = EU.Common.pointLength(a);
        if (l < 0.0001)
            return new cc.Point(0, 0);
        return new cc.Point(a.x / l, a.y / l);
    },
    pointAdd: function (a, b) {
        return new cc.Point(a.x + b.x, a.y + b.y);
    },
    pointDiff: function (a, b) {
        return new cc.Point(a.x - b.x, a.y - b.y);
    },
    /**
     * return square distance between two points
     * @param {cc.Point} a
     * @param {cc.Point} b
     * @returns {number}
     */
    pointDistanceSq: function (a, b) {
        var x = a.x - b.x;
        var y = a.y - b.y;
        return x * x + y * y;
    },

    /**
     *
     * @param {cc.Point} a
     * @param {cc.Point} b
     * @returns {number}
     */
    getAngle: function (a, b) {
        return -Math.atan2(a.x * b.y - b.x * a.y, a.x * b.x + a.y * b.y) * 180 / Math.PI
    },

    /**
     *
     * @param {number} direction
     * @returns {cc.Point}
     */
    getVectorByDirection: function (direction) {
        var rad = cc.degreesToRadians(direction);
        var x = Math.cos(rad);
        var y = -Math.sin(rad);
        return cc.Point(x, y);
    },

    /**
     *
     * @param {cc.Point} radius
     * @returns {number}
     */
    getDirectionByVector: function (radius) {
        var axis = cc.Point(1, 0);
        return EU.Common.getAngle(axis, radius);
    },
    /**
     *
     * @param {number} start
     * @param {number} end
     * @param {number} amount
     * @returns {number}
     */
    lerpDegrees: function (start, end, amount) {
        var difference = Math.abs(end - start);
        if (difference > 180) {
            if (end > start)
                start += 360;
            else
                end += 360;
        }

        var value = start + (end - start) * amount;
        while (value >= 360) value -= 360;
        while (value < 0) value += 360;
        return value;
    },
    /**
     * get distance from point to line (A,B)
     * @param {cc.Point} point
     * @param {cc.Point} A
     * @param {cc.Point} B
     * @returns {number}
     */
    getDistance: function (point, A, B) {
        var x = point.x;
        var y = point.y;
        var x1 = A.x;
        var y1 = A.y;
        var x2 = B.x;
        var y2 = B.y;
        return Math.abs((x - x1) * (y2 - y1) - (y - y1) * (x2 - x1)) / Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    },
    /**
     *
     * @param {cc.Point} segmentA
     * @param {cc.Point} segmentB
     * @param {cc.Point} point
     * @returns {number}
     */
    distanse_pointToLineSegment: function (segmentA, segmentB, point) {
        var P0 = point;
        var P1 = segmentA;
        var P2 = segmentB;

        var p01 = P0 - P1;
        var p21 = P2 - P1;

        var T = p21.dot(p01) / (p21.x * p21.x + p21.y * p21.y );

        if (T < 0 || T > 1) {
            var res = 1E+37;
            return res;
        }

        var P = P1 + p21 * T;
        return pointDistance(P, point);
    },
    /**
     *
     * @param {cc.Point[]} route
     * @param {number} objectSpeed
     * @returns {actions}
     */
    createRouteAction: function (route, objectSpeed) {
        var actions = [];
        for (i = 1; i < route.length; ++i) {
            var duration = EU.Common.pointDistance(route[i - 1], route[i]) / objectSpeed;
            actions.push(cc.MoveTo.create(duration, route[i]));
        }
        return cc.Sequence.sequence(actions);
    },
    /**
     *
     * @param out
     * @param values
     * @param delimiter
     */
    split: function (out, values, delimiter) {
        if (values.length > 0)
            return;
        var string = values;
        do
        {
            var k = string.indexOf(delimiter);
            if (k == -1) {
                out[out.length] = string;
                break;
            }

            out[out.length] = string.substr(0, k);
            string = string.substr(k + 1);
            if (string.empty())
                break;
        }
        while (true);
    },
    /**
     *
     * @param value
     * @returns {string}
     */
    boolToStr: function (value) {
        return value ? "yes" : "no";
    },
    /**
     *
     * @param point
     * @returns {string}
     */
    pointToStr: function (point) {
        return point.x.toString() + "x" + point.y.toString();
    },
    /**
     *
     * @param size
     * @returns {string}
     */
    sizeToStr: function (size) {
        return size.width.toString() + "x" + size.height.toString();
    },
    /**
     *
     * @param out
     * @param radius
     * @param countPoints
     * @param startAngleInDegree
     */
    computePointsByRadius: function (out, radius, countPoints, startAngleInDegree) {
        var delta = Math.PI * 2.0 / countPoints;
        var startAngleInRadian = startAngleInDegree * Math.PI / 180;
        for (var i = 0; i < countPoints; ++i) {
            var angle = startAngleInRadian + delta * i;
            out[i].x = radius * Math.cos(angle);
            out[i].y = radius * Math.sin(angle);
        }
    },
    /**
     *
     * @param root
     * @param tagspath
     * @returns {*}
     */
    getNodeByTagsPath: function (root, tagspath) {
        var node = root;
        var i = 0;
        while (node && i < tags.length) {
            node = node.getChildByTag(tags[i]);
            ++i;
        }
        return node;
    },
    /**
     *
     * @param node
     */
    getSceneOfNode: function (node) {
        var root = node;
        var curr = root;
        while (curr) {
            root = curr;
            curr = root.getParent();
        }
        return root;
    },

    /**
     *
     * @param root
     * @param path_names
     * @returns {*}
     */
    getNodeByPath: function (root, path_names) {
        var names = [];
        EU.Common.split(names, path_names, '/');
        var node = root;

        var i = 0;
        while (node && i < names.length) {
            var name = names[i];
            if (name == "..") node = node.getParent();
            else if (name == "."){}
            else if (name.length == 0 && path_names[0] == '/') {
                node = node.getScene();
                if (node == null)
                    node = cc.director.getRunningScene();
            }
            else
                node = node.getChildByName(name);
            ++i;
        }
        return node;
    },
    /**
     *
     * @param url
     */
    //TODO: openUrl function
    openUrl: function (url) {
    },
    /**
     *
     * @param node
     * @param pointInParentSpace
     * @param depth
     * @returns {boolean}
     */
    checkPointInNode: function (node, pointInParentSpace, depth) {
        if (!node)
            return false;
        var bb = node.getBoundingBox();
        var point = pointInParentSpace;

        var parent = node;
        while (parent) {
            if (parent.isVisible() == false)
                return false;
            parent = parent.getParent();
        }
        if (point.x > bb.origin.x &&
            point.x < (bb.origin.x + bb.size.width) &&
            point.y > bb.origin.y &&
            point.y < (bb.origin.y + bb.size.height)) {
            return true;
        }
        return false;
    },
    /**
     *
     * @param size
     * @returns {string}
     */
    sizeToStr: function (size) {
        return EU.Common.pointToStr(new cc.Point(size.width, size.height));
    },
    /**
     *
     * @param value
     * @returns {cc.Rect}
     */
    strToRect: function (value) {
        var rect = new cc.Rect(0, 0, 0, 0);
        var list = [];
        EU.Common.split(list, value);
        rect.origin = EU.Common.strToPoint((list.length > 0) ? list[0] : "");
        rect.size = EU.Common.strToSize((list.length > 1) ? list[1] : "");
        return rect;
    },
    /**
     *
     * @param rect
     * @returns {string}
     */
    //TODO: rectToStr
    rectToStr: function (rect) {
        cc.log("//TODO: rectToStr");
        return "";
    },
    /**
     *
     * @param value
     * @returns {*}
     */
    strToColor3B: function (value) {
        EU.assert(value.empty() || value.size() == 6);
        if (value.empty()) return cc.Color.WHITE;

        var r = value.substr(0, 2);
        var g = value.substr(2, 2);
        var b = value.substr(4, 2);
        return new cc.Color(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16));
    },
    /**
     *
     * @param color
     */
//TODO: color3BToStr
    color3BToStr: function (color) {
        cc.log("//TODO: color3BToStr");
    },
    /**
     *
     * @param value
     * @returns {*}
     */
    strToBlendFunc: function (value) {
        var ret = cc.BlendFunc._disable;
        return ret;
    },
    /**
     *
     * @param blendFunc
     * @returns {string}
     */
//TODO: blendFuncToStr
    blendFuncToStr: function (blendFunc) {
        cc.log("//TODO: blendFuncToStr");
        return "";
    },
    /**
     *
     * @param seconds
     * @returns {string|*}
     */
    floatToTimeString: function (seconds) {
        var sec = seconds;
        var h = sec / (3600);
        var m = (sec % 3600) / 60;
        var s = sec % 60;

        var result;
        if (h > 0) result = h.toString() + ":";
        if (m > 0 || h > 0) result += m.toString();
        if (m > 0) result += ":";
        result += s.toString();
        return result;
    },
    /**
     *
     * @param center
     * @param radius
     */
    getRandPointInPlace: function (center, radius) {
        var r = cc.Point(0, 0);
        var angle = Math.random() * Math.PI * 2;
        var ca = Math.cos(angle);
        var sa = Math.sin(angle);
        r.x = center.x + ca * radius;
        r.y = center.y + sa * radius;
        return r;
    },

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
//    EU.assert( 0 );
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
//    if( node == null )
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
}