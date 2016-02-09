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
}

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
