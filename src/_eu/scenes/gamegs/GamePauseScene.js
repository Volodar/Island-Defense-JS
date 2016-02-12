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

EU.GamePauseLayer = cc.Menu.extend(
{
    //bool init(   path, bool showScores = true );
    //Sprite m_shadow;
    /** @type {MenuItem} */ _resume : null ,
    /** @type {MenuItem} */ _restart : null ,
    /** @type {MenuItem} */ _quit : null,
    /** @type {MenuItem} */ _store : null,
    /** @type {MenuItem} */ _music_on : null,
    /** @type {MenuItem} */ _music_off : null,
    /** @type {MenuItem} */ _sound_on : null,
    /** @type {MenuItem} */ _sound_off : null,
    /** @type {bool} */ _showScores : null,
    /** @type {Number} */ _scaleFactor : 1.0,
    /** @type {Number} */ kFadeDuration : 0.2,

    DialogRestartGame : EU.LayerExt.extend(
    {
        ctor: function()
        {
            this._super();
            this.load_str( "ini/maings/dialogclosegame.xml" );
        },
        get_callback_by_description: function( name )
        {
            if( name == "yes" ) return cc.director.end.bind(this);
            if( name == "no" ) return this.removeFromParent.bind(this);
            return null;
        }
    }),

    ctor: function(  path, showScores )
    {
        if (showScores == null || showScores === undefined) showScores = true;

        var desSize = cc.view.getDesignResolutionSize();
        this._super();
        this.setPosition( Point( desSize / 2 ) );
        this.setContentSize( Size.ZERO );
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyReleased: function( keyCode, event )
            {
                if( keyCode == cc.KEY.back)
                    self.cb_resume( null );
            }
        }, this);
        this._showScores = showScores;

        this.load_str( path );

        this._resume = this.getChildByName( "resume" );
        this._restart = this.getChildByName( "restart" );
        this._quit = this.getChildByName( "quit" );
        this._store = this.getChildByName( "store" );
        this._music_on = this.getChildByName( "music_on" );
        this._music_off = this.getChildByName( "music_off" );
        this._sound_on = this.getChildByName( "sound_on" );
        this._sound_off = this.getChildByName( "sound_off" );

//        var bL = this.getChildByName("restart");
//        if (bL) {
//            ((MenuItemImageWithText *)bL).setFont2(kFontStroke);
//            ((MenuItemImageWithText *)bL).setText2(WORD("restart"));
//            var text2 = (Label *)bL.getChildByName("normal").getChildByName("text2");
//            if (text2) {
//                text2.setPositionY( 58.f );
//                text2.setScale( 0.45 );
//            }
//        }

        var cost = this._restart ? this._restart.getChildByName( "normal" ) : null;
        cost = cost ? cost.getChildByName( "cost" ) : null;

        if( cost )
        {
            var index = EU.GameGS.getInstance().getGameBoard().getCurrentLevelIndex();
            var mode = EU.GameGS.getInstance().getGameBoard().getGameMode();
            var value = EU.LevelParams.getFuel( index, mode == EU.GameMode.hard );
            cost.setString((value));
        }


        var bg = this.getChildByName( "bg" );
        if( bg )
        {
            var size = bg.getContentSize();
            var sx = Math.min( 1, desSize.width / size.width );
            var sy = Math.min( 1, desSize.height / size.height );
            var s = Math.min( sx, sy );
            s = Math.min( 1, s );
            this._scaleFactor = s;
        }

        if (EU.k.useFuel) {
            var restart_text = this.getChildByPath_str("restart/normal/restart_text");
            if (restart_text) {
                restart_text.setPositionY(restart_text.getPositionY() + 14);
            }
            var restart_fuel_icon = this.getChildByPath_str("restart/normal/icon");
            if (restart_fuel_icon) restart_fuel_icon.setVisible(true);
            var restart_fuel_cost = this.getChildByPath_str("restart/normal/cost");
            if (restart_fuel_cost) restart_fuel_cost.setVisible(true);
        }

        this.setOpacity( 0 );
        this.fadeenter();
        this.checkAudio();
        this.checkFullscreen();

    },

    onExit: function()
    {
        this.removeAllChildrenWithCleanup( true );
        //cc.director.getTextureCache().removeUnusedTextures();
        this._super();
    },

    onEnter: function()
    {
        this._super();
        //this.setKeyboardEnabled( true );
        EU.AudioEngine.playEffect( EU.kSoundGamePauseOn , false);

        if( this._showScores )
        {
            var scene = cc.director.getRunningScene();
            var scores = scene.getChildByName( "scorelayer" );
            if( !scores )
            {
                var scores = new EU.ScoreLayer();
                scene.addChild( scores, 999 );
            }
        }
        if( this._resume ) this._resume.setEnabled( true );
        if( this._restart ) this._restart.setEnabled( true );
    },

    get_callback_by_description: function( name )
    {
        if( name == "resume" ) return this.cb_resume.bind(this);
        if( name == "restart" ) return this.cb_restart.bind(this);
        if( name == "quit" ) return this.cb_exit.bind(this);
        if( name == "music_on" ) return this.cb_music.bind(this, false );
        if( name == "music_off" ) return this.cb_music.bind(this, true );
        if( name == "sound_on" ) return this.cb_sound.bind(this, false );
        if( name == "sound_off" ) return this.cb_sound.bind(this, true );
        if( name == "fullscreen" )
        {
            var cb = function()
            {
                var fullscreen = !EU.UserData.get_bool( "fullscreen", true );
                EU.UserData.write( "fullscreen", fullscreen );
                this.checkFullscreen();

                var layer = new this.DialogRestartGame();
                var scene = EU.Common.getSceneOfNode(this);
                scene.pushLayer( layer, true );
            };
            return cb.bind(this);
        }
        return null;
    },

    cb_resume: function()
    {
        var func = cc.callFunc( this.gameresume.bind( this ) );
        this.runAction( cc.sequence( cc.delayTime( this.kFadeDuration ), func ) );
        this.fadeexit();
    },

    cb_restart: function( sender )
    {
        var index = EU.GameGS.getInstance().getGameBoard( ).getCurrentLevelIndex( );
        var mode = EU.GameGS.getInstance().getGameBoard().getGameMode();
        var cost = EU.LevelParams.getFuel( index, EU.GameMode.hard == mode );
        var fuel = EU.ScoreCounter.getMoney( kScoreFuel );
        if( cost <= fuel )
        {
            var delay = cc.delayTime( this.kFadeDuration );
            var func = cc.callFunc( this.restart.bind( this ) );
            this.runAction( cc.sequence( delay, func ) );
            this.fadeexit();
        }
        else
        {
            if (EU.PC != 1) {
                var shop = new EU.ShopLayer(EU.k.useFreeFuel, false, false, false);
                if (shop) {
                    var scene = cc.director.getRunningScene();
                    var smartscene = scene;
                    EU.assert(smartscene.__SmartScene);
                    smartscene.pushLayer(shop, true);
                }
            }
        }
        if( this._resume ) this._resume.setEnabled( false );
        if( this._restart ) this._restart.setEnabled( false );
    },

    cb_exit: function( sender )
    {
        var delay = cc.delayTime( this.kFadeDuration );
        var func = cc.callFunc( this.exit.bind( this ) );
        this.runAction( cc.sequence( delay, func, null ) );
        this.fadeexit();

        if( this._resume ) this._resume.setEnabled( false );
        if( this._restart ) this._restart.setEnabled( false );
    },

    cb_sound: function( sender, enabled )
    {
        //TODO: soundEnabled
        EU.AudioEngine.soundEnabled(enabled);
        this.checkAudio();
    },

    cb_music: function( sender, enabled )
    {
        //TODO: soundEnabled
        EU.AudioEngine.soundEnabled(enabled);
        this.checkAudio();
    },

    checkAudio: function()
    {
        //TODO: soundEnabled
        var s = EU.AudioEngine.isSoundEnabled();
        //TODO: soundEnabled
        var m = EU.AudioEngine.isMusicEnabled();
        if( this._sound_off )this._sound_off.setVisible( !s );
        if( this._sound_on  )this._sound_on.setVisible( s );
        if( this._music_off )this._music_off.setVisible( !m );
        if( this._music_on )this._music_on.setVisible( m );
    },

    gameresume: function()
    {
        EU.AudioEngine.resumeAllEffects();
        this.setEnabled( false );
        this.removeFromParent();
    },

    restart: function()
    {
        this.setEnabled( false );
        this.removeFromParent();
        EU.GameGS.restartLevel();
    },

    exit: function()
    {
        this.setEnabled( false );
        cc.director.popScene();
        this.removeFromParent();
    },

    shop_did_closed: function()
    {
        this.setEnabled( true );
    },

    fadeexit: function()
    {
        var scene = cc.director.getRunningScene();
        var scores = scene.getChildByName("scorelayer");
        if(scores)
        {
            scores.removeFromParent();
        }

        this.runAction( cc.scaleTo( this.kFadeDuration, this._scaleFactor * 1.2 ) );
        this.runAction( cc.fadeTo( this.kFadeDuration, 0 ) );
    },

    fadeenter: function()
    {
        this.setScale( this._scaleFactor * 1.2 );
        this.runAction( cc.scaleTo( this.kFadeDuration, this._scaleFactor * 1.0 ) );
        this.runAction( cc.fadeTo( this.kFadeDuration, 255 ) );
    },

    checkFullscreen: function()
    {
        var fullscreen = EU.UserData.get_bool( "fullscreen", true );
        var item = this.getNodeByPath( this, "fullscreen" );
        if( item )
        {
            var on = item.getParamCollection().get( "on", "" );
            var off = item.getParamCollection().get( "off", "" );
            item.setImageNormal( fullscreen ? on : off );
        }
    }

});

EU.NodeExt.call(EU.GamePauseLayer.prototype);
