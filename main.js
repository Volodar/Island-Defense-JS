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

        EU.xmlLoader.macros.set( "USE_HEROROOM", "yes" );
        EU.xmlLoader.macros.set( "PLATFORM_MOBILE", "no" );

        cc.director.runScene( EU.MainGS.scene() );//run the GameScene
    }, this);
};
cc.game.run();