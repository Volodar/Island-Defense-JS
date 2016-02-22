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
/**TESTED**/
//Define namespace
var EU = EU || {};

EU.ImageManager  = {
    frames: {},
    atlases: {},
    _frameConfigCache : {},

    /**
     * reading plist keys
     * @param url
     * @returns {*}
     */
    getFrameConfig: function (url) {
        var dict = this._frameConfigCache[url] || cc.loader.getRes(url);
        if(!dict || !dict["frames"])
            return;
        var frameConfig = this._frameConfigCache[url] || this._getFrameConfig(url);
        return frameConfig;
    },
    _getFrameConfig : function(url){
        var dict = cc.loader.getRes(url);

        if(dict._inited){
            this._frameConfigCache[url] = dict;
            return dict;
        }
        this._frameConfigCache[url] = this._parseFrameConfig(dict);
        return this._frameConfigCache[url];
    },
    _parseFrameConfig: function(dict) {
        var tempFrames = dict["frames"], tempMeta = dict["metadata"] || dict["meta"];
        var frames = {}, meta = {};
        var format = 0;
        if(tempMeta){//init meta
            var tmpFormat = tempMeta["format"];
            format = (tmpFormat.length <= 1) ? parseInt(tmpFormat) : tmpFormat;
            meta.image = tempMeta["textureFileName"] || tempMeta["textureFileName"] || tempMeta["image"];
        }
        for (var key in tempFrames) {
            var frameDict = tempFrames[key];
            if(!frameDict) continue;
            frames[key] = true;
        }
        return {_inited: true, frames: frames, meta: meta};
    },

    load: function(path, name){
        var plist = EU.xmlLoader.resourcesRoot + path;
        var framePrefix = name + "::";

        //_spriteFrames is not in jsb/cpp, so we have to implement
        // another funciton to read plist keys
        var frameConfig = this.getFrameConfig(plist);

        cc.spriteFrameCache.addSpriteFrames(plist);

        for( var key in frameConfig.frames ) {
            var frame = cc.spriteFrameCache.getSpriteFrame(key);
            var fullname = framePrefix + key;
            this.frames[fullname] = frame;

            /** no retain in javascript but in jsb, so we call only when there's the function*/
            if (frame.retain) frame.retain();

            cc.spriteFrameCache.removeSpriteFrameByName(key);
        }
        this.atlases[name] = true;
    },
    build: function(type) {
    },
    isSpriteFrame: function(value){
        var k = value.indexOf("::");
        if( k == -1 )
            return false;
        var atlas = value.substr(0,k);
        return atlas in this.atlases;
    },
    getSpriteFrame: function(name)
    {
        var frame = this.frames[name];
        return frame;
    },
    getTextureForKey: function(key){
        if( this.isSpriteFrame(key) )
        {
            var frame = this.getSpriteFrame(key);
            if( frame != undefined )
                return frame.getTexture();
            else
                EU.assert(0);
        }
        else
        {
            if( key.indexOf( EU.xmlLoader.resourcesRoot ) != 0 )
                key = EU.xmlLoader.resourcesRoot + key;
            var texture =  cc.textureCache.getTextureForKey(key);
            if( !texture )
                texture = cc.textureCache.addImage(key);
            return texture;
        }
    },
    sprite: function( spriteFrameOrTexture )
    {
        var sprite = null;
        var frame = null;
        if( spriteFrameOrTexture in this.frames )
            frame = this.frames[spriteFrameOrTexture];
        if( frame )
        {
            sprite = new cc.Sprite( frame );
        }
        else
        {
            var path;
            if( spriteFrameOrTexture[0] == "#" )
                path = spriteFrameOrTexture;
            else
                path = spriteFrameOrTexture.indexOf( EU.xmlLoader.resourcesRoot ) == 0 ? spriteFrameOrTexture :
            EU.xmlLoader.resourcesRoot + spriteFrameOrTexture;
            sprite = new cc.Sprite( path );
        }
        if( !sprite )
        {
            cc.log( "Sprite with resource not created: " + spriteFrameOrTexture );
        }
        EU.assert( sprite );
        return sprite;
    }
};