/******************************************************************************
 * Copyright 2014-2016 Vladimir Tolmachev
 * Copyright 2016 Visionarity AG
 * Vladimir Tolmachev and Visionarity AG have unlimited commercial
 * licenses for commercial use and customization
 *
 * Author: Vladimir Tolmachev (tolthis.vl@hotmail.com)
 * Ported C++ to Javascript: Visionarity AG / Vladimir Tolmachev
 * Project: Island Defense (JS)
 * If you received the code not from the author, please contact us
 ******************************************************************************/

/**TESTED**/

//Define namespace
var EU = EU || {};

EU.Language  = {
    packs: {},
    current: {},
    string: function( id )
    {
        var temp = id;
        var result = "";
        while( true )
        {
            var k0 = temp.indexOf( "#" );
            var k1 = temp.substr(k0+1).indexOf( "#" );
            if( k0 != -1 && k1 != -1 )
            {
                var word = temp.substr( k0+1, k1 );
                word = this.string(word);
                result += temp.substr(0,k0) + word;
                temp = temp.substr( k0+k1+2 );
            }
            else
            {
                if( this.current )
                {
                    if( id in this.current )
                        result = this.current[id];
                    else
                        result += temp;
                }
                break;
            }
        }
        return result;
    },

    set: function( language )
    {
        if( !(language in this.packs) )
        {
            set("en");
            //this.current = this.packs["en"];
        }
        else
        {
            this.current = this.packs[language];
        }
    },
    load: function()
    {
        var root = null;
        EU.pugixml.readXml( "lang/lang.xml", function(err, doc) {
             root = doc.firstElementChild;

        }, this);
        var lang = root.getElementsByTagName("languages")[0];
        for (var i = 0; i < lang.children.length; ++i) {
            var node = lang.children[i];
            var id = node.attributes[0].name;
            var path = node.attributes[0].value;
            this.packs[id] = this.loadPack(path);
            cc.log("language added: [" + id + "] [" + path + "]");
        }
        this.set("en");

        //TODO: get system language
        //var def = lang.getAttribute("default");
        //var systemlang = "en"
        //var forced = lang.getAttribute("forced").value();
        //if (forced.length() > 0) {
        //    set(forced);
        //    return;
        //}
        //switch( systemlang )
        //{
        //    case LanguageType::ENGLISH: set( "en" ); break;
        //    case LanguageType::RUSSIAN: set( "ru" ); break;
        //    case LanguageType::CHINESE: set( "cz" ); break;
        //    case LanguageType::GERMAN: set( "de" ); break;
        //    case LanguageType::POLISH: set( "pl" ); break;
        //    default: set(def);
        //}
    },
    loadPack: function(from)
    {
        var doc = null;
        EU.pugixml.readXml( from , function(error, data) {
            doc = data;
        }, this, true);
        var root = doc.firstElementChild;
        var pack = {};
        var allLangKeys = root.children;
        for (var i = 0; i < allLangKeys.length; i++)
        {
            var key = allLangKeys[i].tagName;
            var value = allLangKeys[i].textContent;
            pack[key] = value;
        }
        return pack;
    }


};

(function() {
    EU.Language.load();
})();
