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

EU.Animation = {
    
    createAnimation: function( a, b, c, d, e) {
        "use strict";
        if ( e !== undefined ) {
            this.createAnimation5(a,b,c,d,e)
        }
        else if ( d !== undefined ) {
            this.createAnimation4(a,b,c,d)
        }
        else if ( b !== undefined ) {
            this.createAnimation2(a,b)
        }
    },

    createAnimation5: function( path, firstIndex, lastIndex, fileExt, duration) {
        var buildIndex = function(index )
        {
            var result = "" + index ;
            var numbers = std.max( ( "" + firstIndex).length, (""+ lastIndex ).length );
            while( result.length < numbers )
            {
                result = "0" + result;
            }
            return result;
        };
        var indexes = [];
        if( lastIndex >= firstIndex )
        {
            for(var i=firstIndex; i<=lastIndex; ++i )
            indexes.push( buildIndex( i ) );
        }
        else
        {
            for(var i=lastIndex; i<=firstIndex; ++i )
            indexes.push( buildIndex( i ) );
            indexes = indexes.reverse();
        }
        return this.createAnimation4(path, indexes, fileExt, duration);
    },

    createAnimation4: function( path, indexes, fileExt, duration)
    {
        var files = [];
        for (var i = 0; i < indexes.length; i++) {
            var index = indexes[i];
            files.push( path + index + fileExt );
        }
        return this.createAnimation2( files, duration );
    },

    createAnimation2: function(textures, duration)
    {
        /**Vector<SpriteFrame>*/ frames = [];
        for (var i = 0; i < textures.length; i++) {
            var texturePath = textures[i];
            var texturePath = texturePath.indexOf( EU.xmlLoader.resourcesRoot ) == 0 ?
                texturePath : EU.xmlLoader.resourcesRoot + texturePath;
            var frame = EU.ImageManager.sprite( texturePath );
            if( frame )
            {
                frames.push(frame );
                continue;
            }
            //
            var texture = cc.textureCache.addImage(texturePath);
            if(!texture)
            {
                if (EU.USE_CHEATS == 1) {
                    var message = "cannot create animation. Path [" + texturePath + "].";
                    cc.log( "%s", message );
                    //EU.MessageBox( message, "Animation not created" );
                }
                continue;
            }
            var rect = cc.rect();
            rect.width = texture.getContentSize().width;
            rect.height = texture.getContentSize().height;

            frames.push( new cc.SpriteFrame( texturePath, rect) );
        }
        var delay = duration / frames.length;
    
        return new cc.Animation(frames, delay);
    }
};
