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
    /**@type {int} */ _levelIndex : -1,
    /**@type {GameMode} */ _levelMode : EU.GameMode.normal,
    /**@type {bool} */ _popSceneOnEnter : false,
    /**@type set<string> */ _units : {},
    /**@type map<string, Array<map<String,String>>> */ _resourcePacks : {},

    LoadLevelSceneInst: null,

    ctor: function() {
        this.setName( "LoadLevelScene" );
        //LoadLevelSceneInst = this;
    },
//
//    release: function()
//    {
//        EU.ImageManager.unloadReservedPlists();
//        this.LoadLevelSceneInst = null;
//    },
//
//    bool LoadLevelScene.init( int level, GameMode mode )
//    {
//        do
//        {
//            _levelIndex = level;
//            _levelMode = mode;
//
//
//            load( "ini/gamescene/loading.xml" );
//            parceLevel();
//            createLoading();
//
//
//
//            return true;
//        }
//        while( false );
//        return false;
//    }
//
//    LoadLevelScene* LoadLevelScene.getInstance()
//    {
//        return LoadLevelSceneInst;
//    }
//
//    void LoadLevelScene.loadInGameResources( const std.string& packname )
//    {
//        auto pack = _resourcePacks.find( packname );
//        if( pack == _resourcePacks.end() )
//            return;
//
//        for( auto res : pack->second )
//        {
//            Texture2D.setDefaultAlphaPixelFormat(Texture2D.PixelFormat.RGBA4444);
//            ImageManager.shared().load_plist( res.first, res.second );
//            Texture2D.setDefaultAlphaPixelFormat(Texture2D.PixelFormat.RGBA8888);
//            ImageManager.shared().addUnloadPlist( res.second );
//        }
//    }
//
//    void LoadLevelScene.onEnter()
//    {
//        Scene.onEnter();
//        if( _popSceneOnEnter )
//        {
//            auto delay = DelayTime.create( 2 );
//            auto call = CallFunc.create( [](){ Director.getInstance()->popScene();} );
//            runAction( Sequence.createWithTwoActions(delay, call) );
//        }
//    }
//
//    bool LoadLevelScene.loadXmlEntity( const std.string & tag, const pugi.xml_node & xmlnode )
//    {
//        if( tag == "resources" )
//        {
//            FOR_EACHXML( xmlnode, xmlPack )
//            {
//                std.vector< std.pair<std.string, std.string> > pack;
//                FOR_EACHXML( xmlPack, xmlRes )
//                {
//                    std.string name = xmlRes.attribute( "name" ).as_string();
//                    std.string path = xmlRes.attribute( "path" ).as_string();
//                    pack.emplace_back( path, name );
//                }
//                std.string packName = xmlPack.attribute( "name" ).as_string();
//                _resourcePacks[packName] = pack;
//            }
//        }
//        else
//            return NodeExt.loadXmlEntity( tag, xmlnode );
//        return true;
//    }
//
//    void LoadLevelScene.parceLevel()
//    {
//        pugi.xml_document doc;
//        std.string pathToFile = FileUtils.getInstance()->fullPathForFilename( kDirectoryToMaps + intToStr( _levelIndex ) + ".xml" );
//        doc.load_file( pathToFile.c_str() );
//
//        auto xmlTagWaves = (_levelMode == GameMode.normal ? k.xmlTag.LevelWaves : k.xmlTag.LevelWavesHard);
//        auto xmlWaves = doc.root().first_child().child( xmlTagWaves );
//
//        auto getUnitName = []( const pugi.xml_node& node )
//        {
//            std.string unit;
//            auto def = node.attribute( "defaultname" );
//            auto name = node.attribute( "name" );
//            if( def ) unit = def.as_string();
//            if( name )unit = name.as_string();
//            return unit;
//        };
//
//        FOR_EACHXML( xmlWaves, wave )
//        {
//            auto name = getUnitName( wave );
//            if( name.empty() == false )
//                _units.insert( name );
//            FOR_EACHXML( wave, unit )
//            {
//                auto name = getUnitName( unit );
//                if( name.empty() == false )
//                    _units.insert( name );
//            }
//        }
//    }
//
//    void LoadLevelScene.createLoading()
//    {
//        auto layer = LayerLoader.create( std.vector<std.string>(), std.bind( &LoadLevelScene.onLoadingFinished, this ) );
//
//        auto addPlist = [this, layer]( const std.string& name )
//        {
//            auto pack = _resourcePacks.find( name );
//            if( pack == _resourcePacks.end() )
//            {
//            #if USE_CHEATS == 1
//                MessageBox( name.c_str(), "Unknow creep" );
//#endif
//                return;
//            }
//
//            layer->addPlists( pack->second );
//
//            for( auto res : pack->second )
//            {
//                ImageManager.shared().addUnloadPlist( res.second );
//            }
//        };
//
//        for( auto& unit : _units )
//        {
//            if( unit.empty() )continue;
//            addPlist( unit );
//        }
//
//        int heroIndex = UserData.shared().hero_getCurrent() + 1;
//
//        addPlist( "game" );
//        addPlist( "hero" + intToStr( heroIndex ) );
//
//        addChild( layer, 999, 0x123 );
//        layer->loadCurrentTexture();
//    }
//
//    void LoadLevelScene.onLoadingFinished()
//    {
//        auto game = GameGS.createScene();
//        GameGS.getInstance()->getGameBoard().loadLevel( _levelIndex, _levelMode );
//        Director.getInstance()->pushScene( game );
//        _popSceneOnEnter = true;
//
//        auto layer = getChildByTag(0x123);
//        if( layer ) layer->setVisible(false);
//    }



});


EU.NodeExt.call(EU.LoadLevelScene.prototype);
