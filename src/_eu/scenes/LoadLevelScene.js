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


EU.LoadLevelScene = cc.Scene.extend(
{
    /**@type {Integer} */ _levelIndex : -1,
    /**@type {EU.GameMode} */ _levelMode : EU.GameMode.normal,
    /**@type {Boolean} */ _popSceneOnEnter : false,
    /**@type set<string> */ _units : {},
    /**@type Object<string, Array<Object<String,String>>> */ _resourcePacks : {},

    /** For Test Instance of */
    __LoadLevelScene : true,

    LoadLevelSceneInst: null,

    ctor: function(level, mode) {
        this._super();

        this.setName( "LoadLevelScene" );
        this.LoadLevelSceneInst = this;

        this._levelIndex = level;
        this._levelMode = mode;


        this.load_str( "ini/gamescene/loading.xml" );
        this.parseLevel();
        this.createLoading();

    },

    release: function()
    {
        EU.ImageManager.unloadReservedPlists();
        this.LoadLevelSceneInst = null;
    },

    getInstance: function()
    {
        return this.LoadLevelSceneInst;
    },

    loadInGameResources: function( packname )
    {
        var pack = this._resourcePacks[ packname ];
        if( !pack ) return;

        for (var i = 0; i < pack.length; i++) {
            var res = pack[i];

            cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;

            var first = {};
            for(var key in res){
                if(res.hasOwnProperty(key)){
                    first.key = key;
                    first.content =  res[key];
                    break;
                }
            }

            EU.ImageManager.load_plist( first.key, first.content );

            cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;
            EU.ImageManager.addUnloadPlist( first.content );
        }
    },
    onEnter: function()
    {
        cc.Scene.prototype.onEnter.call(this);
        if( this._popSceneOnEnter )
        {
            var delay = new cc.DelayTime( 2 );
            var call = new cc.CallFunc( function(){ cc.director.popScene();} );
            this.runAction( new cc.Sequence(delay, call) );
        }
    },

    loadXmlEntity: function(  tag, xmlnode )
    {
        if( tag == "resources" )
        {
            for(var i=0; i < xmlnode.children.length; i++){
                var xmlPack = xmlnode.children[i];
                var pack = [];
                for(var j=0; j < xmlPack.children.length; j++){
                    var xmlRes = xmlPack.children[j];
                    var name = xmlRes.getAttribute( "name" );
                    var path = xmlRes.getAttribute( "path" );
                    var obj = {};
                    obj[path] = name;
                    pack.push( obj );
                }
                var packName = xmlPack.getAttribute( "name" );
                this._resourcePacks[packName] = [];
            }
        }
        else
            return NodeExt.loadXmlEntity( tag, xmlnode );
        return true;
    },

    parseLevel: function()
    {
        var pathToFile = cc.fileUtils.fullPathForFilename( EU.kDirectoryToMaps + ( this._levelIndex ) + ".xml" );

        var doc = new EU.pugixml.readXml(pathToFile);
        var root = doc.firstElementChild;

        var xmlTagWaves = (this._levelMode == EU.GameMode.normal ? EU.k.LevelWaves : EU.k.LevelWavesHard);

        var xmlWaves = root.getElementsByTagName( xmlTagWaves )[0];

        var getUnitName = function(node )
        {
            var unit;
            var def = node.getAttribute( "defaultname" );
            var name = node.getAttribute( "name" );
            if( def ) unit = def;
            if( name ) unit = name;
            return unit;
        };

        for(var i=0; i < xmlWaves.children.length; i++){
            var wave = xmlWaves.children[i];
            var name = getUnitName( wave );
            if( EU.xmlLoader.stringIsEmpty(name) == false )
                this._units[name]  = true;

            for(var j=0; j < wave.children.length; j++){
                var unit = wave.children[j];
                var name = getUnitName( unit );
                if( EU.xmlLoader.stringIsEmpty(name) == false )
                    this._units[name] = true;
            }
        }
    },
    createLoading: function()
    {
        var layer = new cc.LayerLoader();
        //layer.loadCCNode() std.vector<std.string>(), std.bind( &LoadLevelScene.onLoadingFinished, this ) );

        var addPlist = function( name )
        {
            var pack = this._resourcePacks[name];
            if( !pack )
            {
                if (EU.USE_CHEATS == 1) {
                    EU.MessageBox( name, "Unknow creep" );
                }
                return;
            }

            layer.addPlists( pack );

            for (var i = 0; i < pack.length; i++) {
                var res = pack[i];
                EU.ImageManager.addUnloadPlist( res );
            }
        };

        for (var unit in this._units) {
            if (this._units.hasOwnProperty(unit))
                addPlist( unit );
        }

        var heroIndex = EU.UserData.hero_getCurrent() + 1;

        addPlist( "game" );
        addPlist( "hero" + ( heroIndex ) );

        this.addChild( layer, 999, 0x123 );
        layer.loadCurrentTexture();
    },

    onLoadingFinished: function()
    {
        var game = EU.GameGS.createScene();
        EU.GameGS.getInstance().getGameBoard().loadLevel( this._levelIndex, this._levelMode );
        cc.director.pushScene( game );
        this._popSceneOnEnter = true;

        var layer = this.getChildByTag(0x123);
        if( layer ) layer.setVisible(false);
    }
});

EU.NodeExt.call(EU.LoadLevelScene.prototype);
