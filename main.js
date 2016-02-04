cc.game.onStart = function(){
    cc.view.setDesignResolutionSize(1280, 720, cc.ResolutionPolicy.SHOW_ALL);
    cc.view.resizeWithBrowserSize(true);
    //load resources
    cc.LoaderScene.preload(g_resources, function () {

        EU.xmlLoader.macros.set( "USE_HEROROOM", "yes" );
        EU.xmlLoader.macros.set( "PLATFORM_MOBILE", "no" );

        cc.director.runScene( EU.MainGS.scene() );//run the GameScene
    }, this);
};
cc.game.run();