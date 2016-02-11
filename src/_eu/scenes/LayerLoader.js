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

EU.LayerLoader = cc.Layer.extend({

    /** For Test Instance of */
    __LayerLoader : true,


    callback: null,
    target: null,
    atlases: null,

    ctor: function( callback, target ){
        this.initExt();
        this._super();
        this.callback = callback;
        this.target = target;
        this.atlases = {};
    },
    addPlists: function( atlases ){
        this.atlases = atlases;
    },
    loadCurrentTexture: function(){

    },
});
EU.NodeExt.call(EU.LayerLoader.prototype);
