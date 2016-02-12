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
            this.createAnimation_n(a,b,c,d,e)
        }
        else if ( d !== undefined ) {
            this.createAnimation_i(a,b,c,d)
        }
        else if ( b !== undefined ) {
            this.createAnimation_t(a,b)
        }
    },

    createAnimation_n: function (path, firstIndex, lastIndex, fileExt, duration) {
        "use strict";
        var buildIndex = function (firstIndex, lastIndex, index) {
            var result = index.toString();
            var numbers = Math.max(firstIndex.toString().length, lastIndex.toString().length);
            while (result.length < numbers) {
                result = "0" + result;
            }
            return result;
        };
        var indexes = [];
        if (lastIndex >= firstIndex) {
            for (var i = firstIndex; i <= lastIndex; ++i)
                indexes.push(buildIndex(firstIndex, lastIndex, i));
        }
        else {
            EU.assert(0);
            //for( i=lastIndex; i<=firstIndex; ++i )
            //    indexes.push( buildIndex( firstIndex, lastIndex, i ) );
            //std::reverse(indexes.begin(), indexes.end());
        }
        return this.createAnimation(path, indexes, fileExt, duration);
    },

    createAnimation_i: function (path, indexes, fileExt, duration) {
        "use strict";
        var files = [];
        for (var i = 0; i < indexes; ++i )
        {
            files.push(path + indexes[i] + fileExt);
        }
        return this.createAnimation(files, duration);
    },
    createAnimation_t: function (textures, duration) {
        "use strict";
        var frames = [];
        for (var i = 0; i < textures.length; ++i) {
            var texturePath = textures[i];
            var frame = EU.ImageManager.getSpriteFrame(texturePath);
            if (frame) {
                frames.push(frame);
                continue;
            }
            var texture = EU.ImageManager.getTextureForKey(texturePath);
            if (!texture) {
                var message = "cannot create animation. Path [" + texturePath + "].";
                alert(message);
                continue;
            }
            var rect = cc.rect(0, 0, 0, 0);
            rect.width = texture.getContentSize().width;
            rect.height = texture.getContentSize().height;

            frames.push(new cc.SpriteFrame(texture, rect));
        }
        var delay = duration / frames.length;

        return new cc.Animation(frames, delay);
    }
};