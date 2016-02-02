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

EU.compute_bezier = function( a, b, c, d, t )
{
    return (Math.pow( 1 - t, 3 ) * a + 3 * t*(Math.pow( 1 - t, 2 ))*b + 3 * Math.pow( t, 2 )*(1 - t)*c + Math.pow( t, 3 )*d);
}
