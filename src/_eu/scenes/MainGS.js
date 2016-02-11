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
EU.MainGS = cc.Layer.extend({
    m_menuAudio: null,

    ctor: function () {
        this._super();
        this.initExt();

        this.load_str("ini/maings/mainlayer.xml");
        this.runEvent("oncreate");
        //var promo = this.getNodeByPath( this, "menupromo" );
        //if( promo )
        //    promo.setVisible( true );
    },
    load_xmlnode2: function (root) {
        this.load_xmlnode(root);

        var xmlRes = root.getElementsByTagName("resources")[0];
        var xmlAtlases = xmlRes.getElementsByTagName("atlases")[0];
        for (var i = 0; i < xmlAtlases.children.length; ++i) {
            var child = xmlAtlases.children[i];
            var path = child.getAttribute("path");
            var name = child.getAttribute("name");
            EU.ImageManager.load(path, name);
        }

    },
    pushGame: function () {
        var scene = EU.GameGS.createScene();
        EU.GameGSInstance.getGameBoard().loadLevel( 0, EU.GameMode.normal );
        cc.director.pushScene(scene);
        //cc.director.pushScene(EU.MapLayer.scene());
    },
    closeRedeemMsg: function(){},
    exit: function(){
        cc.director.end();
    },
    get_callback_by_description: function (name) {
        if (name == "pushGame") return this.pushGame;
        if (name == "close_redeem_win") return this.closeRedeemMsg;
        if (name == "exit") return this.exit;
        //TODO: settings
        //if( name == "settings" )
        //{
        //    var cb = [this](Ref*)
        //    {
        //        xmlLoader::bookDirectory( this );
        //        var settings = GamePauseLayer::create( "ini/maings/settings.xml", false );
        //        var scene = static_cast<SmartScene*>(getScene());
        //        if( scene && settings )
        //            scene->pushLayer( settings, true );
        //        xmlLoader::unbookDirectory();
        //    };
        //    return std::bind( cb, std::placeholders::_1 );
        //}
        return null;//EU.NodeExt.prototype.get_callback_by_description.call( this, name );
    },

    onEnter: function()
    {
        this._super();
        EU.AudioEngine.playMusic( EU.kMusicMainMenu );
        //this.setKeypadEnabled( true );
    },

    //onKeyReleased: function( EventKeyboard::KeyCode keyCode, Event* event )
    //{
    //    if( keyCode == EventKeyboard::KeyCode::KEY_BACK )
    //        Director::getInstance()->popScene();
    //}

    //void createDevMenu()
    //{
    //    if( isTestDevice() == false )
    //        return;
    //    var menu = Menu::create();
    //    menu->setPosition( 0, 0 );
    //    addChild( menu );
    //
    //    static var activator = []( Ref*sender )
    //    {
    //        static int counter = 0;
    //        if( isTestModeActive() == false )
    //        {
    //            if( ++counter == 10 )
    //            {
    //                counter = 0;
    //                setTestModeActive( true );
    //                static_cast<Node*>(sender)->getParent()->setOpacity( 255 );
    //            }
    //        }
    //        else
    //        {
    //            if( ++counter == 5 )
    //            {
    //                counter = 0;
    //                setTestModeActive( false );
    //                static_cast<Node*>(sender)->getParent()->setOpacity( 0 );
    //            }
    //        }
    //    };
    //    var userdata = [](Ref*)
    //    {
    //        UserData::shared().clear();
    //    };
    //
    //    var i = MenuItemTextBG::create( "++", Color4F::GRAY, Color3B::BLACK, std::bind( activator, std::placeholders::_1 ) );
    //    var user = MenuItemTextBG::create( "clear UD", Color4F::GRAY, Color3B::BLACK, std::bind( userdata, std::placeholders::_1 ) );
    //    i->setScale( 5 );
    //    i->setPosition( 10, 10 );
    //    i->setCascadeOpacityEnabled( true );
    //    menu->addChild( i );
    //
    //    user->setPosition( Point(50, 100) );
    //    user->setCascadeOpacityEnabled( true );
    //    menu->addChild( user );
    //    menu->setCascadeOpacityEnabled(true);
    //    menu->setOpacity(true);
    //}
});
EU.NodeExt.call(EU.MainGS.prototype);

EU.MainGS.scene = function () {
    var layer = new EU.MainGS();
    var scene = new EU.SmartScene(layer);
    return scene;
};
