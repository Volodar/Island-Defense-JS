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

EU.MapLayer = cc.Layer.extend({
    ctor: function(){
        this._super();
    },
});
EU.NodeExt.call(EU.MapLayer.prototype);

EU.MapLayer.scene = function(){
    var scene = new cc.Scene();
    var layer = new EU.MapLayer();
    scene.addChild( layer );
    return scene;
};
