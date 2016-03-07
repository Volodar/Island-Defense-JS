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
EU.asObject = function (obj, defaultObj) {
    if (obj != null) return obj;
    return defaultObj;
};

EU.Common = {

    TimeCounter : cc.Class.extend({
        counter:null,
        timer:null,
        ctor: function(){
            this.counter = 0;
            this.timer = 0;
        },
        set: function( time ) { this.timer = time; this.reset(); },
        reset: function() { this.counter = this.timer; },
        tick: function( elapsetime ) { this.counter -= elapsetime; },
        value: function() { return this.timer; },
        is:function() { return this.counter <= 0; },
    }),

    /**
     * Convert string to
     * @param {string} string ("yes", "true", "Y", "y", "Yes")
     */
    strToBool: function (string) {
        return string == "yes" || string == "y" || string == "true" || string == "Yes" || string == "Y"|| string == "1";
    },
    /**
     * Convert string to var
     * @param {string} string
     */
    strToInt: function (string) {
        if (EU.xmlLoader.stringIsEmpty(string) == false)
            return isNaN(parseInt(string)) ? 0 : parseInt(string) ;
        else
            return 0;
    },
    /**
     * Convert string to float
     * @param {string} string
     */
    strToFloat: function (string) {
        if (EU.xmlLoader.stringIsEmpty(string) == false)
            return isNaN(parseFloat(string)) ? 0 : parseFloat(string) ;
        else
            return 0;
    },
    /**
     * Convert string to cc.p
     * @param {string} value
     */
    strToPoint: function (value) {
        if (!value)
            return cc.p(0, 0);
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
            return add == null ? point : cc.p(point.x + add.y, point.y + add.y);
        }

        var rb = string.indexOf("right:");
        if (rb == 0) {
            string = string.substr(rb + 6);
            point = EU.Common.strToPoint(string);
            point.x = frame.width + point.x;
            return add == null ? point : cc.p(point.x + add.y, point.y + add.y);
        }
        var lt = string.indexOf("top:");
        if (lt == 0) {
            string = string.substr(lt + 4);
            point = EU.Common.strToPoint(string);
            point.y = frame.height + point.y;
            return add == null ? point : cc.p(point.x + add.y, point.y + add.y);
        }
        var rt = string.indexOf("righttop:");
        if (rt == 0) {
            string = string.substr(rt + 9);
            point = EU.Common.strToPoint(string);
            point.x = frame.width + point.x;
            point.y = frame.height + point.y;
            return add == null ? point : cc.p(point.x + add.y, point.y + add.y);
        }
        var hb = string.indexOf("halfbottom:");
        if (hb == 0) {
            string = string.substr(hb + 11);
            point = EU.Common.strToPoint(string);
            point.x = frame.width / 2 + point.x;
            return add == null ? point : cc.p(point.x + add.y, point.y + add.y);
        }
        var ht = string.indexOf("halftop:");
        if (ht == 0) {
            string = string.substr(ht + 8);
            point = EU.Common.strToPoint(string);
            point.x = frame.width / 2 + point.x;
            point.y = frame.height + point.y;
            return add == null ? point : cc.p(point.x + add.y, point.y + add.y);
        }
        var lh = string.indexOf("lefthalf:");
        if (lh == 0) {
            string = string.substr(lh + 9);
            point = EU.Common.strToPoint(string);
            point.y = frame.height / 2 + point.y;
            return add == null ? point : cc.p(point.x + add.y, point.y + add.y);
        }
        var rh = string.indexOf("righthalf:");
        if (rh == 0) {
            string = string.substr(rh + 10);
            point = EU.Common.strToPoint(string);
            point.x = frame.width + point.x;
            point.y = frame.height / 2 + point.y;
            return add == null ? point : cc.p(point.x + add.y, point.y + add.y);
        }

        var k = string.indexOf("x");
        if (k == -1)
            return cc.p(0, 0) + add;

        var x = EU.Common.strToFloat(string.substr(0, k));
        var y = EU.Common.strToFloat(string.substr(k + 1));
        point = cc.p(x, y);
        return add == null ? point : cc.p(point.x + add.y, point.y + add.y);
    },
    /**
     *
     * @param value
     * @returns {*}
     */
    strToSize: function (value) {
        var size = cc.size(0, 0);
        var k = value.indexOf("x");
        if (k == -1) {
            return cc.p(0, 0) + add;
        }
        else {
            size.width = EU.Common.strToFloat(value.substr(0, k)) || 0;
            size.height = EU.Common.strToFloat(value.substr(k + 1)) || 0;
        }
        return size;
    },

    /**
     * return distance between two points
     * @param {cc.p} a
     * @param {cc.p} b
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
            return cc.p(0, 0);
        return cc.p(a.x / l, a.y / l);
    },
    pointAdd: function (a, b) {
        return cc.p(a.x + b.x, a.y + b.y);
    },
    pointDiff: function (a, b) {
        return cc.p(a.x - b.x, a.y - b.y);
    },
    /**
     * return square distance between two points
     * @param {cc.p} a
     * @param {cc.p} b
     * @returns {number}
     */
    pointDistanceSq: function (a, b) {
        var x = a.x - b.x;
        var y = a.y - b.y;
        return x * x + y * y;
    },

    /**
     *
     * @param {cc.p} a
     * @param {cc.p} b
     * @returns {number}
     */
    getAngle: function (a, b) {
        return -Math.atan2(a.x * b.y - b.x * a.y, a.x * b.x + a.y * b.y) * 180 / Math.PI
    },

    /**
     *
     * @param {number} direction
     * @returns {cc.p}
     */
    getVectorByDirection: function (direction) {
        var rad = cc.degreesToRadians(direction);
        var x = Math.cos(rad);
        var y = -Math.sin(rad);
        return cc.p(x, y);
    },

    /**
     *
     * @param {cc.p} radius
     * @returns {number}
     */
    getDirectionByVector: function (radius) {
        var axis = cc.p(1, 0);
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
     * @param {cc.p} point
     * @param {cc.p} A
     * @param {cc.p} B
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
     * @param {cc.p} segmentA
     * @param {cc.p} segmentB
     * @param {cc.p} point
     * @returns {number}
     */
    distanse_pointToLineSegment: function (segmentA, segmentB, point) {
        var P0 = point;
        var P1 = segmentA;
        var P2 = segmentB;

        var p01 = cc.pSub(P0 ,P1);
        var p21 = cc.pSub(P2 ,P1);

        var T = cc.pDot(p21, p01)/ (p21.x * p21.x + p21.y * p21.y );
        //var T = p21.dot(p01) / (p21.x * p21.x + p21.y * p21.y );

        if (T < 0 || T > 1) {
            var res = 1E+37;
            return res;
        }

        var P = cc.pAdd(P1, cc.pMult(p21 , T));
        return this.pointDistance(P, point);
    },
    /**
     *
     * @param {cc.p[]} route
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
        out = values.split(delimiter ? delimiter : ",");
        return out;
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
        var delta = (Math.PI * 2.0) / countPoints;
        var startAngleInRadian = startAngleInDegree * Math.PI / 180.0;
        out = out || [];
        for (var i = 0; i < countPoints; ++i) {
            var angle = startAngleInRadian + delta * i;
            out[i] = cc.p(0,0);
            out[i].x = radius * Math.cos(angle);
            out[i].y = radius * Math.sin(angle);
        }
        return out;
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
        return root instanceof cc.Scene ? root : null;
    },

    /**
     *
     * @param root
     * @param path_names
     * @returns {*}
     */
    getNodeByPath: function (root, path_names) {
        //cc.log( "getNodeByPath: [" +  (root ? root.getName() : "null") + "],[" + path_names + "]" );
        if (!path_names || path_names.length == 0)
            return root;
        var names = [];
        names = path_names.split('/');
        var node = root;

        var i = 0;
        while (node && i < names.length) {
            var name = names[i];
            if (name == "..") node = node.getParent();
            else if (name == ".") {
            }
            else if (name.length == 0 && path_names[0] == '/') {
                node = EU.Common.getSceneOfNode(node);
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
        if (point.x > bb.x &&
            point.x < (bb.x + bb.width) &&
            point.y > bb.y &&
            point.y < (bb.y + bb.height)) {
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
        return EU.Common.pointToStr(cc.p(size.width, size.height));
    },
    /**
     *
     * @param value
     * @returns {cc.Rect}
     */
    strToRect: function (value) {
        var rect = cc.rect(0, 0, 0, 0);
        var list = [];
        list = EU.Common.split(list, value);
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
        EU.assert(EU.xmlLoader.stringIsEmpty(value) || value.length == 6);
        if (EU.xmlLoader.stringIsEmpty(value))
            return cc.Color.WHITE;

        var r = value.substr(0, 2);
        var g = value.substr(2, 2);
        var b = value.substr(4, 2);
        return cc.color(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16));
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
        var r = cc.p(0, 0);
        var angle = Math.random() * Math.PI * 2;
        var ca = Math.cos(angle);
        var sa = Math.sin(angle);
        r.x = center.x + ca * radius;
        r.y = center.y + sa * radius;
        return r;
    },

    Strech: cc.Class.extend({
        /**
         * x
         * y
         * xy
         * max
         * min
         */
        mode: "",
        maxScaleX: -1,
        maxScaleY: -1,
        minScaleX: -1,
        minScaleY: -1,
        empty: function () {
            return this.mode.length == 0;
        }
    }),
    strToStrech: function (string) {
        var result = new EU.Common.Strech();
        var mode = "";
        var size = null;
        var paramB = string.indexOf("[");
        var paramE = string.lastIndexOf("]");
        var k = -1;
        if (paramB == -1) {
            k = string.lastIndexOf(":");
        }
        else {
            var pos = string.indexOf(':', 0);
            while (pos < paramB) {
                k = pos;
                pos = string.indexOf(':', pos + 1);
            }
        }

        if (k != -1) {
            size = string.substr(0, k);
            if (paramB == -1)
                mode = string.substr(k + 1);
            else
                mode = string.substr(k + 1, paramB - (k + 1));
        }

        if (paramB != -1) {
            var paramsString = "";
            if (paramE != -1)
                paramsString = string.substr(paramB + 1, paramE - (paramB + 1));
            else
                paramsString = string.substr(paramB + 1);

            var pc = new EU.ParamCollection(paramsString);
            result.maxScaleX = pc.isExist("maxx") ? parseFloat(pc.get("maxx")) : result.maxScaleX;
            result.maxScaleY = pc.isExist("maxu") ? parseFloat(pc.get("maxu")) : result.maxScaleY;
            result.minScaleX = pc.isExist("minx") ? parseFloat(pc.get("minx")) : result.minScaleX;
            result.minScaleY = pc.isExist("miny") ? parseFloat(pc.get("miny")) : result.minScaleY;
            if (pc.isExist("max"))
                result.maxScaleX = result.maxScaleY = parseFloat(pc.get("max"));
            if (pc.isExist("min"))
                result.minScaleX = result.minScaleY = parseFloat(pc.get("min"));
        }


        result.boundingSize = EU.Common.strToSize(size);
        result.mode = mode;
        return result;
    },
    strechNode: function (node, strech) {
        if (!node)
            return;

        var size = node.getContentSize();
        if (size.width == 0 || size.height == 0) {
            return;
        }
        var sx = strech.boundingSize.width / size.width;
        var sy = strech.boundingSize.height / size.height;
        var ssx = node.getScaleX();
        var ssy = node.getScaleY();
        var zx = ssx / fabs(ssx);
        switch (strech.mode) {
            case "max":
                ssy = ssx = std.max(sx, sy);
                break;
            case "min":
                ssy = ssx = std.min(sx, sy);
                break;
            case "xy":
                ssx = sx;
                ssy = sy;
                break;
            case "x":
                ssx = sx;
                break;
            case "y":
                ssy = sy;
                break;
            default:
                break;
        }

        if (zx < 0)
            ssy = -ssy;

        if (strech.maxScaleX != -1) ssx = Math.min(ssx, strech.maxScaleX);
        if (strech.maxScaleY != -1) ssy = Math.min(ssy, strech.maxScaleY);
        if (strech.minScaleX != -1) ssx = Math.max(ssx, strech.minScaleX);
        if (strech.minScaleY != -1) ssy = Math.max(ssy, strech.minScaleY);

        node.setScale(ssx, ssy);
    }
};

//EU.ActionEnable = cc.Action.extend({
//    update: function (time) {
//        EU.xmlLoader.setProperty_int(this.getTarget(), EU.xmlKey.Enabled.int, EU.Common.boolToStr(true));
//    },
//    reverse: function () {
//        return new EU.ActionDisable();
//    },
//    clone: function () {
//        return new EU.ActionEnable();
//    }
//});
//
//EU.ActionDisable = cc.Action.extend({
//    update: function (time) {
//        EU.xmlLoader.setProperty_int(this.getTarget(), EU.xmlKey.Disabled.int, EU.Common.boolToStr(true));
//    },
//    reverse: function () {
//        return new EU.ActionEnable();
//    },
//    clone: function () {
//        return new EU.ActionDisable();
//    }
//});