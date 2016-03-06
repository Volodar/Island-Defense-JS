cc.game.onStart = function(){
    var sx = cc.director.getWinSize().width;
    var sy = cc.director.getWinSize().height;
    var rate = sx / sy;
    sx = Math.max( 1024, sx );
    sx = Math.min( 1136, sx );
    sy = sx / rate;

    cc.view.setDesignResolutionSize(sx, sy, cc.ResolutionPolicy.SHOW_ALL);
    cc.view.resizeWithBrowserSize(true);
    //load resources
    cc.LoaderScene.preload(g_resources, function () {

        var loadXmlValues = function( )
        {
            var macroses = new EU.ParamCollection("");
            EU.xmlLoader.load_paramcollection_n_path(macroses, "ini/sounds.xml" );
            var p = macroses.params;
            for (var key in p) {
                EU.xmlLoader.macros.set( key, macroses.get(key) );
            }
            EU.xmlLoader.macros.set("sound_dir", EU.kPathSound);
            EU.xmlLoader.macros.set("sound_ext", EU.kSoundsEXT);
            EU.xmlLoader.macros.set("music_dir", EU.kPathMusic);
            EU.xmlLoader.macros.set("music_ext", EU.kMusicEXT);

            if (!cc.sys.isMobile)
                EU.xmlLoader.macros.set("PLATFORM_PC", "yes");
            else
                EU.xmlLoader.macros.set("PLATFORM_MOBILE", "yes");

            EU.xmlLoader.macros.set( "USE_HEROROOM", EU.Common.boolToStr( EU.k.useHeroRoom ) );
            EU.xmlLoader.macros.set( "NOUSE_HEROROOM", EU.Common.boolToStr( !EU.k.useHeroRoom ) );
        };

        var applyConfigurations = function()
        {
            EU.xmlLoader.macros.set("icon_paid_version", EU.k.iconForPaidGame );
        };

        var registration = function()
        {
            EU.Factory.add_build = function( type ){
                if( type == "hero" ) return new EU.Hero();
                if( type == "createunit" ) return new EU.EventCreateUnit();
                if( type == "createunit_reverseroute" ) return new EU.EventCreateUnitReverseRoute();
                if( type == "areadamage" ) return new EU.EventAreaDamage();
                //if( type == "hero2" ) return new EU.Hero2();
                return null;
            }
        };

        /**
         * ApplicationWillEnterForeground
         */
        registration();
        cc.director.startAnimation();
        cc.audioEngine.resumeAllEffects();
        cc.audioEngine.resumeMusic();
        EU.ScoreByTime.checktime( );
        EU.mlTowersInfo.checkAvailabledTowers();
        EU.HeroExp.onCreate();
        /** */


        /**
         * applicationDidFinishLaunching
         */
        if (cc.sys.isMobile) {
            //TODO: inapp here
            //inapp.CallBackPurchase cb = std.bind( ShopLayer.request_answer, std.placeholders._1 );
            //inapp.setCallbackPurchase( cb );
        }
        //TODO:
        //appgratis.init();

        //TODO:
        //configurePath();
        //TODO:
        if( EU.k.useLeaderboards );
            //PlayServises.init();
    
        var setSoundEnabled = function( mode ){ EU.UserData.write( "sound_enabled", mode ? "true" : "false" ); };
        var setMusicEnabled = function( mode ){ EU.UserData.write( "music_enabled", mode ? "true" : "false" ); };
        var isSoundEnabled = function(){ return EU.UserData.get_bool( "sound_enabled", true ); };
        var isMusicEnabled = function(){ return EU.UserData.get_bool( "music_enabled", true ); };
        EU.AudioEngine.callback_setSoundEnabled( setSoundEnabled );
        EU.AudioEngine.callback_setMusicEnabled( setMusicEnabled );
        EU.AudioEngine.callback_isSoundEnabled( isSoundEnabled);
        EU.AudioEngine.callback_isMusicEnabled( isMusicEnabled );
    
        //TODO:
        //createWindow();
        //setDesignResolution();
        applyConfigurations();
        loadXmlValues( );
        //registration( );
        //linkPlugins();
    
        var director = cc.director;
    
        //#if EDITOR==1
        //    var scene = EditorScene.create( );
        //    director->runWithScene( scene );
        //#else
        //    //var scene = SplashScene.create();
        //    //director->runWithScene( scene.ptr() );
        //    var scene = MainGS.scene();
        //    cc.director.runWithScene( scene.ptr() );
        //#endif
    
        //std.list<std.string> items;
        //items.push_back( k.configuration.kInappFuel1 );
        //items.push_back( k.configuration.kInappGear1 );
        //items.push_back( k.configuration.kInappGear2 );
        //items.push_back( k.configuration.kInappGear3 );
        //items.push_back( k.configuration.kInappGold1 );
        //items.push_back( k.configuration.kInappGold2 );
        //items.push_back( k.configuration.kInappGold3 );
        //items.push_back( k.configuration.kInappGold4 );
        //items.push_back( k.configuration.kInappGold5 );
        //items.push_back( k.configuration.kInappHero2 );
        //items.push_back( k.configuration.kInappHero3 );
        //items.push_back( k.configuration.kInappAllHeroes );
        //for( auto& item : items )
        //{
        //    var cb = std.bind( [](){} );
        //    inapp.details(item, cb);
        //}
        //HeroExp.shared();
    
        //showCursor();
    
        cc.director.runScene( EU.MainGS.scene() );//run the GameScene
        //cc.director.runScene( new EU.AudioMenu() );//run the GameScene
        cc.director.pushScene(EU.MapLayer.scene());

    }, this);
};

cc.game.onStop = function() {
    cc.director.stopAnimation();
    cc.audioEngine.pauseAllEffects();
    cc.audioEngine.pauseMusic();
    EU.ScoreByTime.savetime();
};

cc.game.run();

//
//
//NS_CC_BEGIN;
//float DesignScale(1);
//bool iPad(true);
//bool iPhone(false);
//NS_CC_END;
//
//bool g_isFullscreenMode( false );
//
//void createMapsH( int num );
//void convertMap( int num );
//void registration();
//void showCursor();
//void createWindow();
//void setDesignResolution();
//
//#ifdef WIN32
//int AppDelegate.screenResolutionX(0);
//int AppDelegate.screenResolutionY(0);
//#endif
//
//AppDelegate.AppDelegate()
//{
//    //createMapsH(27);
//#if USE_CHEATS == 1
//    addTestDevice( getDeviceID() );
//    setTestModeActive( true );
//#endif
//#if CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID
//    addTestDevice( "39ba8a01b59545c2" );
//    addTestDevice( "f9f67849b9761228" );
//    addTestDevice( "4c39e129afded713" );
//#elif CC_TARGET_PLATFORM == CC_PLATFORM_IOS
//    addTestDevice( "7D2A3ADC-FE0E-4643-8FFB-DB99475934DB" );
//    addTestDevice( "249C79C3-01AA-401E-B9C5-C3CCF19E5C0C" );
//#endif
//}
//
//
//void AppDelegate.onReceivedMemoryWarning()
//{
//    //cc.director.getTextureCache()->removeUnusedTextures();
//}
//

//
//void AppDelegate.linkPlugins()
//{
//    AdsPlugin.use( AdsPlugin.Type.statistic, AdsPlugin.Service.flurry );
//    AdsPlugin.use( AdsPlugin.Type.OfferWall, AdsPlugin.Service.supersonic );
//    switch( k.configuration.AdsTypeInterstitial )
//    {
//        case k.configuration.InterstitialAdmob: AdsPlugin.use( AdsPlugin.Type.interstitialBanner, AdsPlugin.Service.admob ); break;
//        case k.configuration.InterstitialChartboost: AdsPlugin.use( AdsPlugin.Type.interstitialBanner, AdsPlugin.Service.chartboost ); break;
//        case k.configuration.InterstitialSupersonic: AdsPlugin.use( AdsPlugin.Type.interstitialBanner, AdsPlugin.Service.supersonic ); break;
//        case k.configuration.InterstitialFyber: AdsPlugin.use( AdsPlugin.Type.interstitialBanner, AdsPlugin.Service.fyber ); break;
//        case k.configuration.InterstitialDeltaDNA: AdsPlugin.use( AdsPlugin.Type.interstitialBanner, AdsPlugin.Service.deltadna ); break;
//        default: assert( 0 );
//    }
//    switch( k.configuration.AdsTypeRewardVideo )
//    {
//        case k.configuration.RewardVideoVungle: AdsPlugin.use( AdsPlugin.Type.rewardVideo, AdsPlugin.Service.vungle ); break;
//        case k.configuration.RewardVideoSupersonic: AdsPlugin.use( AdsPlugin.Type.rewardVideo, AdsPlugin.Service.supersonic ); break;
//        case k.configuration.RewardVideoFyber: AdsPlugin.use( AdsPlugin.Type.rewardVideo, AdsPlugin.Service.fyber ); break;
//        case k.configuration.RewardVideoDeltaDNA: AdsPlugin.use( AdsPlugin.Type.rewardVideo, AdsPlugin.Service.deltadna ); break;
//        default: assert( 0 );
//    }
//    switch( k.configuration.AdsTypeOfferWall )
//    {
//        case k.configuration.OfferWallSupersonic: AdsPlugin.use( AdsPlugin.Type.OfferWall, AdsPlugin.Service.supersonic ); break;
//        default: assert( 0 );
//    }
//}
//

//
//void AppDelegate.configurePath()
//{
//    std.vector<std.string> resourcePaths;
//    std.vector<std.string> searchPaths;
//    resourcePaths.push_back( "" );
//#if CC_TARGET_PLATFORM == CC_PLATFORM_WIN32
//    #	ifndef _DEBUG
//    resourcePaths.push_back( "../../Resources" );
//    resourcePaths.push_back( "../Resources" );
//    resourcePaths.push_back( "Resources" );
//#	endif
//#endif
//
//
//    for( var path : resourcePaths )
//    {
//    #if PC == 1
//        searchPaths.push_back( path + (path.empty() ? "" : "/") + "pc" );
//#endif
//        if( k.configuration.kGameName.find( "steampunk" ) == 0 )
//        {
//            var p = path + (path.empty()  ? "" : "/") + "steampunk";
//            searchPaths.push_back( p );
//        }
//        if( k.configuration.kGameName.find( "steampunkpro" ) == 0 )
//        {
//            var p = path + (path.empty()  ? "" : "/") + "steampunkpro";
//            searchPaths.push_back( p );
//        }
//        var p = path + (path.empty() ? "" : "/") + k.configuration.kGameName;
//        searchPaths.push_back( p );
//        searchPaths.push_back( path );
//    }
//
//    FileUtils.getInstance()->setSearchPaths( searchPaths );
//}
//
//void createWindow()
//{
//#if EDITOR == 1
//    float width( k.configuration.LevelMapSize.width + 300 );
//    float height( k.configuration.LevelMapSize.height );
//    std.string windowTITLE( "Editor: IslandDefense" );
//#else
//    float width( 1200 );
//    float height( 768 );
//    std.string windowTITLE( WORD( "window_title" ) );
//#endif
//
//#if PC == 1
//    g_isFullscreenMode = true;
//#endif
//
//    g_isFullscreenMode = UserData.get_bool( "fullscreen", g_isFullscreenMode );
//
//#ifdef _DEBUG
//    g_isFullscreenMode = false;
//#endif
//
//#ifdef WIN32
//#	if PC == 1
//    if( AppDelegate.screenResolutionX > 0 && AppDelegate.screenResolutionY > 0 )
//    {
//        if( g_isFullscreenMode )
//        {
//            width = AppDelegate.screenResolutionX;
//            height = AppDelegate.screenResolutionY;
//        }
//        else
//        {
//            if( AppDelegate.screenResolutionX >= 1366 && AppDelegate.screenResolutionY >= 768 )
//            {
//                width = 1366;
//                height = 768;
//            }
//            else if( AppDelegate.screenResolutionX >= 1024 && AppDelegate.screenResolutionY >= 768 )
//            {
//                width = 1024;
//                height = 768;
//            }
//            else
//            {
//                width = 800;
//                height = 600;
//            }
//        }
//    }
//#	endif
//#endif
//
//
//    var director = Director.getInstance();
//    var glview = director->getOpenGLView();
//    if( !glview )
//    {
//        if( g_isFullscreenMode )
//            glview = GLViewImpl.createWithFullScreen( windowTITLE );
//        else
//            glview = GLViewImpl.createWithRect( windowTITLE, Rect( 0, 0, width, height ) );
//        director->setOpenGLView( glview );
//    }
//#if USE_CHEATS == 1
//    director->setDisplayStats( true );
//#else
//    director->setDisplayStats( false );
//#endif
//}
//
//void setDesignResolution()
//{
//    var director = Director.getInstance();
//    var glview = director->getOpenGLView();
//
//    std.vector<std.string> paths;
//    var size = glview->getFrameSize();
//
//
//#ifndef EDITOR
//    var sx = glview->getFrameSize().width;
//    var sy = glview->getFrameSize().height;
//    float rate = sx / sy;
//    sx = std.max( 1024.f, sx );
//    sx = std.min( 1136.f, sx );
//    sy = sx / rate;
//    glview->setDesignResolutionSize( sx, sy, ResolutionPolicy.SHOW_ALL );
//
//#endif
//}
//
//
//void showCursor()
//{
//    //if( g_isFullscreenMode == false )
//    //	return;
//
//#if PC == 1
//    float scale =
//    cc.director.getOpenGLView()->getDesignResolutionSize().width /
//    cc.director.getOpenGLView()->getFrameSize().width;
//
//    ShowCursor( FALSE );
//    var sprite = ImageManager.sprite("images/cursor.png");
//    sprite->retain();
//    sprite->setGlobalZOrder(9999);
//    sprite->setAnchorPoint(Point(0, 1));
//    sprite->setScale( scale );
//
//    EventDispatcher * _eventDispatcher = cc.director.getEventDispatcher();
//
//    var touchBegan = [](Touch*, Event*){ return true; };
//    var touchMoved = [sprite](Event*event)mutable
//    {
//        var scene = sprite->getScene();
//        var run = cc.director.getRunningScene();
//        if (scene != run && run)
//        {
//            sprite->removeFromParent();
//            run->addChild(sprite);
//        }
//        EventMouse* em = (EventMouse*)event;
//        var pos = Point(em->getCursorX(), em->getCursorY());
//        sprite->setPosition(pos);
//    };
//    var touchEnded = [](Touch*, Event*){; };
//
//    var touchListener = EventListenerMouse.create();
//    touchListener->onMouseMove = std.bind(touchMoved, std.placeholders._1);
//    _eventDispatcher->addEventListenerWithFixedPriority(touchListener,-9999 );
//#endif
//}
