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

    onCreate: function(){
    },
    load: function(path, name){
        var plist = EU.xmlLoader.resourcesRoot + path;
        var framePrefix = name + "::";
        cc.spriteFrameCache.addSpriteFrames(plist);
        for( var key in cc.spriteFrameCache._spriteFrames ) {
            var frame = cc.spriteFrameCache._spriteFrames[key];
            this.frames[framePrefix + key] = frame;
            cc.spriteFrameCache._spriteFrames[key] = undefined;
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
            return frame.getTexture();
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