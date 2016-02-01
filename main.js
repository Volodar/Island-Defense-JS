cc.game.onStart = function(){
    cc.view.setDesignResolutionSize(1280, 720, cc.ResolutionPolicy.SHOW_ALL);
    cc.view.resizeWithBrowserSize(false);
    //load resources
    cc.LoaderScene.preload(g_resources, function () {
        cc.director.runScene( EU.MainGS.scene() );//run the GameScene
    }, this);
};
cc.game.run();