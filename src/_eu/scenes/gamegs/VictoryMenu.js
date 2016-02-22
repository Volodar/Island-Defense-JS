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


EU.VictoryMenu = cc.Node.extend(
{
    /** For Test Instance of */
    __VictoryMenu : true,

    ctor: function( victory, scores, stars )
    {
        this._super();
        this.initExt();

        //if ( EU.NodeExt.prototype.init.call(this) ) return false;
        var self = this;

        var listener = cc._EventListenerKeyboard.create();
        listener.onKeyReleased = function() { self.onKeyReleased.call(self)};
        cc.eventManager.addListener(listener, this);

        var ini = victory ? "victory.xml" : "defeat.xml";
        this.load_str_n_str(  "ini/gamescene", ini );

        var menu = this.getChildByPath_str( "menu" );
        var close = menu ? menu.getChildByName( "close" ) : null;
        var restart = menu ? menu.getChildByName( "restart" ) : null;
        var cost = restart ? restart.getChildByName( "normal" ) : null;
        cost = cost ? cost.getChildByName( "cost" ) : null;


        if( menu )
        {
            if( close ) close.setCallback( function() { self.cb_close.call(self)} );
            if( restart ) restart.setCallback( function() {self.cb_restart.call(self)} );
        }
        if( cost )
        {
            var index = EU.GameGSInstance.getGameBoard().getCurrentLevelIndex( );
            var mode = EU.GameGSInstance.getGameBoard().getGameMode();
            var value = EU.LevelParams.getFuel( index, EU.GameMode.hard == mode );
            cost.setString( value );
        }

        var starnode = this.getChildByName( "star" + stars );
        if( starnode ) starnode.setVisible( true );

        var label = this.getChildByPath_str( "score/value" );
        if( label instanceof cc.LabelTTF)
        {
            label.setString( "0" );
            //var action = new cc.ActionText( 1, scores );
            label.setString(scores);
            //label.runAction( action );
        }

        var dessize = cc.view.getDesignResolutionSize();
        var size = this.getContentSize();
        var sx = Math.min( 1, dessize.width / size.width );
        var sy = Math.min( 1, dessize.height / size.height );
        var s = Math.min( sx, sy );
        this.setScale( s );

        this.runEvent( "run" );

        var scene = cc.director.getRunningScene();
        var scores = scene.getChildByName("scoreslayer");
        if(!scores)
        {
            var scores = new EU.ScoreLayer();
            scores.setName("scoreslayer");
            scene.addChild(scores, 999);
        }

        if (EU.k.useFuel) {
            var restart_text = this.getChildByPath_str("menu/restart/normal/restart_text");
            if (restart_text) {
                restart_text.setPositionY(restart_text.getPositionY() + 14);
            }
            var restart_fuel_icon = this.getChildByPath_str("menu/restart/normal/icon");
            if (restart_fuel_icon) restart_fuel_icon.setVisible(true);
            var restart_fuel_cost = this.getChildByPath_str("menu/restart/normal/cost");
            if (restart_fuel_cost) restart_fuel_cost.setVisible(true);
        }
        return true;
    },

    cb_restart: function() {
        var index = EU.GameGSInstance.getGameBoard( ).getCurrentLevelIndex( );
        var mode = EU.GameGSInstance.getGameBoard().getGameMode();
        var cost = EU.LevelParams.getFuel( index, EU.GameMode.hard == mode );
        var fuel = EU.ScoreCounter.getMoney( EU.kScoreFuel );
        if( cost <= fuel )
        {
            this.restart();
        }
        else {
            if (EU.PC != 1) {
                var shop = EU.ShopLayer.create(EU.k.useFreeFuel, false, false, false);
                if (shop) {
                    var scene = cc.director.getRunningScene();
                    /**@type {EU.SmartScene} smartscene */
                    var smartscene = scene;
                    EU.assert(smartscene.__SmartScene);
                    smartscene.pushLayer(shop, true);
                }
            }
        }
    },
    cb_close: function()
    {
        this.close();
    },
    restart: function()
    {
        var scene = cc.director.getRunningScene();
        var scores = scene.getChildByName("scoreslayer");
        if(scores)
        {
            EU.removeFromParent(scores, true);
        }

        EU.removeFromParent(this, true);
        EU.GameGS.restartLevel( );
    },
    close: function()
    {
        var scene = cc.director.getRunningScene();
        var scores = scene.getChildByName("scoreslayer");
        if(scores)
        {
            EU.removeFromParent(scores, true);
        }
    
        cc.director.popScene();
    },
    onKeyReleased: function( keyCode, event )
    {
        if( keyCode == cc.KEY.back ) this.close();
    }
});

EU.NodeExt.call(EU.VictoryMenu.prototype);
