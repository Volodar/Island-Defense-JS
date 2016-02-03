/**
 *
 */
//Define namespace
var EU = EU || {};

EU.zorder =
{
    bg: -1000,
    earth: -999,
    creep_default: 10,
    creep_earth: 10,
    tower: 20,
    tower_cariage: 19,
    tower_turret: 25,
    bullet: 30,
    tree: 40,
    creep_sky: 99998,
    bullet_sky: 99997,
    sky: 99999,
    creep_indicator: 100000
};

EU.touchInfo = (function(){

    /**
     *  static variable @type {Integer} _id
     *  closure return inner function that operate with its outer scope chain
     */
    var _id = 0;

    return cc.Class.extend(
        {
            /** For Test Instance of */
            __touchInfo : true,

            ctor: function(_nodeBegan, _touch) {
                this.nodeBegin = _nodeBegan;
                this.nodeEnd = null;
                this.touch = _touch;
                this.id = _id++;
            },
            isLessThan : function (src)
            {
                return this.id < src.id;
            },

            /** @type {cc.Node} */  nodeBegin : null,
            /** @type {cc.Node} */  nodeEnd : null,
            /** @type {Touch} */  touch : null,
            /** @type {Integer} */  id : null
        });
})();

EU.Skill = cc.Class.extend(
{

    /** For Test Instance of */
    __Skill : true,

    desant : null,
    bomb : null,
    heroskill : null
});

EU.ScoresNode = cc.Node.extend(
{
    /** For Test Instance of */
    __ScoresNode : true,

    m_scores: {},
    /** @type {ccui.Text} m_heaths */
    m_healths : null,
    /** @type {ccui.Text} m_golds */
    m_golds : null,
    /** @type {ccui.Text} m_waves */
    m_waves : null,
    /** @type {cc.Sprite} m_healthsIcon */
    m_healthsIcon : null
});

EU.GameGS = (function(){

    var zOrderOfArriavalCounter = 0 ;
    var zOrderInterfaceMenu = 99;
    var zOrderInterfaceWaveIcon = 100;

    var gameGSInstance = null;

    var kExt_png = ".png" ;
    var kSuffixUn = "_un" ;

    var gameGS = cc.Layer.extend();
    cc.extend(gameGS, cc.NodeExt);
    return gameGS.extend(
    {

        /** TODO: @type {EU.GameBoard} */ m_board: null,
        /** @type {cc.Node} */  m_mainlayer: null,
        /** @type {cc.Sprite} */  m_bg: null,
        /** @type {cc.Node} */  m_objects: null,
        /** @type {cc.Node} */  m_interface: null,
        /** TODO: @type {Array<EU.TowerPlace>} */ m_towerPlaces: [],
        /** TODO: @type {EU.TowerPlace} */  m_selectedPlace: null,
        /** TODO: @type {EU.Unit} */ _selectedUnit: null,
        /** @type {Array<Node>} */ m_fragments: [],
        /** @type {Array<String>} */ m_excludedTowers: [],

        /** @type {Number} */ m_dalayWaveIcon: null,

        /** @type {Integer} */ _scoresForStartWave: null,
        /** @type {Integer} */ _boughtScoresForSession: null,

        /** TODO: @type {EU.MenuCreateTower} */ m_menuCreateTower: null,
        /** TODO: @type {EU.MenuTower} */ m_menuTower: null,
        /** TODO: @type {EU.MenuDig} */ m_menuDig: null,
        /** @type {ScoresNode} */ m_scoresNode: null,

        /** @type {Object<Integer, EU.touchInfo>} */ m_touches: {},
        /** @type {EU.ScrollTouchInfo} */ _scrollInfo: null,

        getInterfaceNode: function() { return this.m_interface; },
        //void shake(var value = 1.f);
        getMainLayer: function ( ) { return this.m_mainlayer;},
        getMenuCreateTower: function( ) { return this.m_menuCreateTower; },
        
        m_interfaceMenu: {
            /** @type {EU.MenuItemImageWithText} */ rateNormal: null,
            /** @type {EU.MenuItemImageWithText} */ rateFast: null,
            /** @type {EU.MenuItemImageWithText} */ pause: null,
            /** @type {EU.MenuItemImageWithText} */ shop: null,
            /** @type {EU.MenuItemCooldown} */ desant: null,
            /** @type {EU.MenuItemCooldown} */ bomb: null,
            /** @type {EU.MenuItemCooldown} */ heroSkill: null,
            /** @type {EU.HeroIcon} */ hero: null,
            /** @type {cc.Menu} */  menu: null
        },
        //IDialog * m_dialog: null,
        /** @type {BoxMenu} */ m_box: null,

        /** @type {Array<WaveIcon>} */ _waveIcons: [],
        /** @type {bool} */  _runFlyCamera: null,

        /** @type {bool} */  _skillModeActived: null,
        /** @type {EU.MenuItemCooldown} */ _selectedSkill: null,
        /** @type {EventListener} */ _touchListenerNormal: null,
        /** @type {EventListener} */ _touchListenerDesant: null,
        /** @type {EventListener} */ _touchListenerBomb: null,
        /** @type {EventListener} */ _touchListenerHero: null,
        /** @type {EventListener} */ _touchListenerHeroSkill: null,

        restartLevel: function()
        {
            /**
             * @type {EU.GameGS} game
             */
            var game = this.getInstance();
            EU.assert( game );
            var levelindex = game.getGameBoard().getCurrentLevelIndex();
            var gamemode = game.getGameBoard().getGameMode();
            game.clear();

            /**
             * TODO: @type {EU.SmartScene} scene
             */
            var scene = game.getScene();
            scene.resetMainLayer( null );
            EU.assert( this.instanceIsCreate() == false );

            var dessize = cc.director.getOpenGLView().getDesignResolutionSize();
            var layer = new GameGS();
            layer.m_scoresNode = ScoresNode.create();
            layer.m_scoresNode.setPosition( 0, dessize.height );
            var result = layer.init();
            EU.assert( result );
            scene.resetMainLayer( layer );
            scene.addChild( layer.m_scoresNode, 9 );
            GameGS.getInstance().getGameBoard().loadLevel( levelindex, gamemode );

            if( EU.k.useBoughtLevelScoresOnlyRestartLevel )
            {
                var boughtScores = game._boughtScoresForSession;
                GameGS.getInstance()._boughtScoresForSession = boughtScores;
                ScoreCounter.shared().addMoney( EU.kScoreLevel, boughtScores, false );
            }

            layer.release();
        },
        ctor: function(){
            this._super();
            this.m_board = null;
            this.m_bg = null;
            this.m_objects = null;
            this.m_interface = null;
            this.m_selectedPlace = null;
            this.m_enabled = true;
            this.m_scoresNode = null;
            this.m_dalayWaveIcon = 0;
            this._scoresForStartWave = 0;
            this._boughtScoresForSession = 0;
            this._runFlyCamera = true;
            this._skillModeActived = false;

            cc.log( "GameGS.GameGS" );
            this.m_interfaceMenu.menu = null;
            EU.assert( !gameGSInstance );

            var desSize = cc.EGLView.getDesignResolutionSize();
            var winSize = cc.winSize;
            var sizeMap = EU.k.LevelMapSize;

            this.m_mainlayer = new cc.Node();
            this.m_mainlayer.setName( "mainlayer" );
            this.addChild( this.m_mainlayer );
            var sx = winSize.width / sizeMap.width;
            var sy = winSize.height / sizeMap.height;
            var scale = Math.max( sx, sy );
            this.m_mainlayer.setScale( scale );

            this.m_objects = new cc.Node();
            this.m_objects.setName( "objects" );
            this.m_mainlayer.addChild( this.m_objects, 1 );

            EU.assert( this.m_bg == null );

            this.m_mainlayer.setContentSize( sizeMap );
            this.m_mainlayer.setAnchorPoint( cc.POINT_ZERO );

            gameGSInstance = this;

            this.setName( "gamelayer" );
        },
        onExit: function()
        {
            //TODO: MouseHoverScroll
            EU.MouseHoverScroll.shared().setNode( null );
            EU.MouseHoverScroll.shared().setScroller( null );
            gameGSInstance = null;
            this.m_board.clear();
            //TODO: ShootsEffectsClear
            EU.ShootsEffectsClear();

            cc.director.getScheduler().setTimeScale( 1 );
            //TODO: ScoreCounter
            EU.ScoreCounter.shared().observer( EU.kScoreLevel ).remove(_ID );

            if( this.m_scoresNode )
                this.m_scoresNode.removeFromParent();
        },
        /**
         * @returns {EU.SmartScene}
         */
        createScene: function()
        {
            cc.log( "GameGS.createScene" );
            EU.assert( gameGSInstance == null );
            var layer = new GameGS();
            var result = layer.init();
            cc.assert(result);
            /**
             * @type {EU.SmartScene}
             */
            var scene = EU.SmartScene.create( layer );
            scene.setName( "gameScene" );

            var dessize = cc.director.getOpenGLView().getDesignResolutionSize();
            layer.m_scoresNode = EU.ScoresNode.create();
            layer.m_scoresNode.setPosition( 0, dessize.height );
            scene.addChild( layer.m_scoresNode, 9 );

            layer.release();
            return scene;
        },
        instanceIsCreate: function()
        {
            return gameGSInstance != null;
        },
        getInstance: function()
        {
            if( gameGSInstance == null ) cc.log( "gameGSInstance == null" );
            return gameGSInstance;
        },
        getGameBoard: function()
        {
            return this.m_board;
        },
        init: function()
        {
            cc.log( "GameGS.init" );
            //if( !cc.Layer.init() ) // CALLED IN ctor FUNCTION
            //{
            //    return false;
            //}

            var touchListenerN = cc._EventListenerTouchAllAtOnce.create();
            touchListenerN.onTouchesBegan = this.onTouchesBegan;
            touchListenerN.onTouchesMoved = this.onTouchesMoved;
            touchListenerN.onTouchesEnded = this.onTouchesEnded;
            touchListenerN.onTouchesCancelled = this.onTouchesCancelled;

            var touchListenerSD = cc._EventListenerTouchOneByOne.create();
            touchListenerSD.onTouchBegan = this.onTouchSkillBegan;
            var self = this;
            touchListenerSD.onTouchEnded = function(touch, event) { return self.onTouchSkillEnded(touch, event, EU.Skill.desant)};
            touchListenerSD.onTouchCancelled = this.onTouchSkillCanceled;
            touchListenerSD.setSwallowTouches( true );

            var touchListenerSB = cc._EventListenerTouchOneByOne.create();
            touchListenerSB.onTouchBegan = this.onTouchSkillBegan;
            touchListenerSB.onTouchEnded = function(touch, event) { return self.onTouchSkillEnded(touch, event, EU.Skill.bomb)};
            touchListenerSB.onTouchCancelled = this.onTouchSkillCanceled;
            touchListenerSB.setSwallowTouches( true );

            var touchListenerSH = cc._EventListenerTouchOneByOne.create();
            touchListenerSH.onTouchBegan = this.onTouchSkillBegan;
            touchListenerSH.onTouchEnded = function(touch, event) { return self.onTouchSkillEnded(touch, event, EU.Skill.heroskill)};
            touchListenerSH.onTouchCancelled = this.onTouchSkillCanceled;
            touchListenerSH.setSwallowTouches( true );

            var touchListenerH = cc._EventListenerTouchOneByOne.create();
            touchListenerH.onTouchBegan = this.onTouchHeroBegan;
            touchListenerH.onTouchMoved = this.onTouchHeroMoved;
            touchListenerH.onTouchEnded = this.onTouchHeroEnded;
            touchListenerH.onTouchCancelled = this.onTouchHeroCanceled;

            //TODO: should destroy old listeners which are not equal to the new listeners
            this._touchListenerNormal = touchListenerN ;
            this._touchListenerDesant = touchListenerSD ;
            this._touchListenerBomb = touchListenerSB ;
            this._touchListenerHeroSkill = touchListenerSH ;
            this._touchListenerHero = touchListenerH ;

            this._scrollInfo = EU.ScrollTouchInfo();

            this.createInterface();

            //TODO: EU.Achievements
            EU.Achievements.shared().setCallbackOnAchievementObtained( this.achievementsObtained, this, std.placeholders._1 );

            this.load( "ini/gamescene", "scene.xml" );

            if(k.configuration.useInapps == false ) {
                //hide "shop" button
                this.m_interfaceMenu.shop.setPositionY(-9999.0);
            }


            this.runEvent( "oncreate" );

            //if( k.configuration.interstitialBanerByTime )
            //{
            //	var callfunc = CallFunc.create( std.bind( [](){
            //		AdsPlugin.shared().showInterstitial();
            //	}));
            //	var delay = DelayTime.create(k.configuration.interstitialBanerByTimeDelay);
            //	var action1 = Sequence.create(callfunc, DelayTime.create(2), null);
            //	var action2 = RepeatForever.create(Sequence.create(delay, callfunc, null));
            //	runAction(action1);
            //	runAction(action2);
            //}

            //TODO: EU.consts
            UserData.shared().write( EU.k.user.LastGameResult, EU.k.user.GameResultValueNone );

            return true;
        },
        createInterface: function()
        {
            cc.log( "GameGS.createInterface" );
            var dessize = cc.director.getOpenGLView().getDesignResolutionSize();

            this.m_interface = new cc.Node();
            this.m_interface.setName( "interface" );
            this.addChild( this.m_interface, 9 );


            var self = this;
            var cb0 = function(obj) { return self.menuShop(obj, true)};
            var cb1 = this.menuPause;
            var cb2 = function(obj) { return self.menuSkill(obj, EU.Skill.desant)};
            var cb3 = function(obj) { return self.menuSkill(obj, EU.Skill.bomb)};
            var cb5 = this.menuHero;

            var kPathButtonShop = EU.k.resourceGameSceneFolder + "button_shop.png";
            var kPathButtonPauseNormal = EU.k.resourceGameSceneFolder + "icon_pause.png";
            var kPathButtonDesantBack = EU.k.resourceGameSceneFolder + "button_desant_2_1.png";
            var kPathButtonDesantForward = EU.k.resourceGameSceneFolder + "button_desant_2.png";
            var kPathButtonDesantCancel = EU.k.resourceGameSceneFolder + "button_desant_2_3.png";
            var kPathButtonBombBack = EU.k.resourceGameSceneFolder + "button_desant_1_1.png";
            var kPathButtonBombForward = EU.k.resourceGameSceneFolder + "button_desant_1.png";
            var kPathButtonBombCancel = EU.k.resourceGameSceneFolder + "button_desant_1_3.png";

            var cancel = EU.k.resourceGameSceneFolder + "icon_x_10.png";
            var cdd = this.m_board.getSkillParams( ).cooldownDesant;
            var cda = this.m_board.getSkillParams( ).cooldownAirplane;
            this.m_interfaceMenu.shop = EU.MenuItemImageWithText.create( kPathButtonShop, cb0 );
            this.m_interfaceMenu.pause = EU.MenuItemImageWithText.create( kPathButtonPauseNormal, cb1 );
            this.m_interfaceMenu.desant = EU.MenuItemCooldown.create(kPathButtonDesantBack, kPathButtonDesantForward, cdd, cb2, kPathButtonDesantCancel);
            this.m_interfaceMenu.bomb = EU.MenuItemCooldown.create(kPathButtonBombBack, kPathButtonBombForward, cda, cb3, kPathButtonBombCancel);
            this.m_interfaceMenu.heroSkill = EU.MenuItemCooldown.create( "", "", 0, null, cancel );
            this.m_interfaceMenu.hero = HeroIcon.create( "hero" + (UserData.shared().hero_getCurrent() + 1), cb5 );
            this.m_interfaceMenu.hero.setEnabled( true );

            this.m_interfaceMenu.desant.setAnimationOnFull( "airstike_animation1" );
            this.m_interfaceMenu.bomb.setAnimationOnFull( "airstike_animation2" );

            this.m_interfaceMenu.shop.setName( "shop" );
            this.m_interfaceMenu.pause.setName( "pause" );
            this.m_interfaceMenu.desant.setName( "desant" );
            this.m_interfaceMenu.bomb.setName( "bomb" );
            this.m_interfaceMenu.heroSkill.setName( "heroskill" );
            this.m_interfaceMenu.hero.setName( "hero" );

            this.m_interfaceMenu.desant.setSound( "##sound_button##" );
            this.m_interfaceMenu.bomb.setSound( "##sound_button##" );
            this.m_interfaceMenu.heroSkill.setSound( "##sound_button##" );

            this.m_interfaceMenu.menu = Menu.create();
            this.m_interfaceMenu.menu.setName( "menu" );
            this.m_interfaceMenu.menu.addChild( this.m_interfaceMenu.shop );
            this.m_interfaceMenu.menu.addChild( this.m_interfaceMenu.pause );
            this.m_interfaceMenu.menu.addChild( this.m_interfaceMenu.desant );
            this.m_interfaceMenu.menu.addChild( this.m_interfaceMenu.bomb );
            this.m_interfaceMenu.menu.addChild( this.m_interfaceMenu.heroSkill );
            this.m_interfaceMenu.menu.addChild( this.m_interfaceMenu.hero );
            this.m_interfaceMenu.menu.setEnabled( false );

            this.m_interfaceMenu.hero.setVisible( false );

            this.m_interfaceMenu.menu.setPosition( cc.POINT_ZERO );
            this.m_interface.addChild( this.m_interfaceMenu.menu, zOrderInterfaceMenu );

            this.m_menuCreateTower = EU.MenuCreateTower.create();
            this.m_menuTower = EU.MenuTower.create();
            this.m_menuDig = EU.MenuDig.create();

            this.m_interface.addChild( this.m_menuCreateTower, 999999 );
            this.m_interface.addChild( this.m_menuTower, 999999 );
            this.m_interface.addChild( this.m_menuDig, 999999 );
            this.m_menuCreateTower.setGlobalZOrder( 99999 );
            this.m_menuTower.setGlobalZOrder( 99999 );
            this.m_menuDig.setGlobalZOrder( 99999 );

            this.m_menuCreateTower.setPosition( Point( 0, 0 ) );
            this.m_menuCreateTower.disappearance();
            this.m_menuTower.disappearance();
            this.m_menuDig.disappearance();

            //m_interfaceMenu.menu.setEnabled( false );

            //TODO: EU.BoxMenu
            this.m_box = EU.BoxMenu.create( "ini/gamescene/boxmenu.xml" );
            this.addChild( this.m_box );


            this.createDevMenu();
        },
        createHeroMenu: function()
        {
            var hero = this.m_board.getHero();
            if( hero )
            {
                var skill = hero.getSkill();
                this.m_interfaceMenu.hero.setVisible( true );
                this.m_interfaceMenu.hero.setHero( hero );

                var back = EU.k.resourceGameSceneFolder + "button_" + skill + "_2.png" ;
                var forward = EU.k.resourceGameSceneFolder + "button_" + skill + "_1.png" ;
                var cancel = EU.k.resourceGameSceneFolder + "button_" + skill + "_3.png";

                //std.vector<unsigned>
                var skills = [];
                HeroExp.shared().skills( this.m_board.getHero().getName(), skills );
                var level = skills[4];

                var duration = 0.0;
                if( skill == "landmine" )
                {
                    duration = this.m_board.getSkillParams().cooldownLandmine;
                    duration *= this.m_board.getSkillParams().landmineLevels[level].rateCooldown;
                }
                else if( skill == "swat" )
                {
                    duration = this.m_board.getSkillParams().cooldownSwat;
                    duration *= this.m_board.getSkillParams().swatLevels[level].rateCooldown;
                }
                else if( skill == "hero3_bot" )
                {
                    duration = this.m_board.getSkillParams().cooldownHero3Bot;
                    duration *= this.m_board.getSkillParams().hero3BotLevels[level].rateCooldown;
                }
                else
                    EU.assert( 0 );

                var self = this;
                var callback = function(obj) { return self.menuSkill(obj, EU.Skill.heroskill)};
                this.m_interfaceMenu.heroSkill.init( back, forward, duration, callback, cancel );
                this.m_interfaceMenu.heroSkill.setAnimationOnFull( skill );
            }
        },

        createDevMenu: function()
        {
            //TODO: EU.suport
            if( EU.support.isTestDevice() && EU.support.isTestModeActive() )
            {
                var item = function( menu, text, key, pos )
                {
                    var sendKey = function( sender,  key )
                    {
                        this.onKeyReleased( key, null );
                    };

                    var self = this;
                    var sendKeybind = function(obj) { return self.sendKey(obj, true)};
                    var i = EU.MenuItemTextBG.create( text, Color4F.GRAY, Color3B.BLACK, sendKeybind );
                    menu.addChild( i );
                    i.setPosition( pos );
                    i.setScale( 1.5);
                };
    
                var menu = new cc.Menu();
                menu.setPosition( 0, 0 );
                this.addChild( menu );
                var pos = cc.Point( 25, 100 );
                var Y = 45;
                item( menu, "R 1", cc.KEY.num1, pos ); pos.y += Y;
                item( menu, "R 2", cc.KEY.num2, pos ); pos.y += Y;
                item( menu, "R 3", cc.KEY.num3, pos ); pos.y += Y;
                item( menu, "R 4", cc.KEY.num4, pos ); pos.y += Y;
                item( menu, "R 5", cc.KEY.num5, pos ); pos.y += Y;
                item( menu, "R 6", cc.KEY.num6, pos ); pos.y += Y;
                item( menu, "R 7", cc.KEY.num7, pos ); pos.y += Y;
                item( menu, "R 8", cc.KEY.num8, pos ); pos.y += Y;
                item( menu, "R 9", cc.KEY.num9, pos ); pos.y += Y;
                item( menu, "R 0", cc.KEY.num0, pos ); pos.y += Y;
                item( menu, "R 99", cc.KEY.f9, pos ); pos.y += Y;
                item( menu, "WIN", cc.KEY.f1, pos ); pos.y += Y;
            }
        },

        clear: function()
        {
            cc.log( "GameGS.clear" );
            EU.Achievements.shared().setCallbackOnAchievementObtained( null );
            EU.ShootsEffectsClear();
    
            if( this.m_bg )
                this.m_bg.removeFromParent();
            this.m_bg = null;
            this.m_objects.removeAllChildren();
            this.m_objects = null;
            for (var i = 0; i < this.m_towerPlaces.length; i++) {
                var obj = this.m_towerPlaces[i];
                this.removeChild( obj )
            }
            this.m_towerPlaces.clear();
    
            this.m_fragments.clear();
    
            this.m_menuTower.setUnit( null );
            this.m_menuTower.disappearance();
    
            this.menuFastModeEnabled( false );
            this.unschedule( this.schedule_selector( GameGS.update ) );
    
            zOrderOfArriavalCounter = 0;
    
            //Node * tapLabel = this.m_interface.getChildByTag( kTagTapToContinueLabel );
            //if( tapLabel ) tapLabel.removeFromParent();
    
            this.removeAllChildrenWithCleanup( true );
        },
        startGame: function()
        {
            cc.log( "GameGS.startGame" );
            cc.audioEngine.playEffect( EU.kSoundGameStart );
            this.setEnabled( true );

            schedule( this.schedule_selector( GameGS.update ) );
        },
        createPredelayLabel: function()
        {
            //__push_auto_check( "GameGS.createPredelayLabel" );
            //var label = Label.create( WORD( kTextIdTapToContinue ), kFontArialBig );
            //var action = RepeatForever.create( Sequence.create( ScaleTo.create( 0.5f, 1.2f ), ScaleTo.create( 0.5f, 1.0f ), null ) );
            //
            //m_interface.addChild( label, 1, kTagTapToContinueLabel );
            //label.runAction( action );
            //label.setPosition( 512, 384 );
        },

        /**
         *
         * @param {Integer} index
         * @param {Element} root
         */
        loadLevel: function( index, root )
        {
            cc.log( "GameGS.loadLevel" );

            var dessize = cc.director.getOpenGLView().getDesignResolutionSize();

            this.m_bg = EU.ImageManager.sprite( ("images/maps/map" + ( index + 1 ) + ".jpg") );
            this.m_bg.setAnchorPoint( cc.Point( 0, 0 ) );
            this.m_mainlayer.addChild( this.m_bg, -1 );
            this.m_bg.setGlobalZOrder( -2 );

            var mode = this.m_board.getGameMode();
            var decorations = root.getElementsByTagName( "decorations" );
            var xmlparams = root.getElementsByTagName( mode == EU.GameMode.normal ? EU.LevelParams : EU.LevelParamsHard );
            if( !xmlparams )
                xmlparams = root;

            for(var i=0; i < decorations.children.length; i++){
                var child = decorations.children[i];
                var object = null;
                this.createDecorFromXmlNode( child, object );
                if( object )
                {
                    var z = object.getLocalZOrder();
                    this.addObject( object, object.getLocalZOrder() );
                    if( z != 0 )
                    {
                        object.setLocalZOrder( z );
                    }
                }
            }

            this.m_dalayWaveIcon = xmlparams.getAttribute( "wave_cooldown" );

            this.updateWaveCounter();

            {
                var doc = new EU.pugixml.readXml( "ini/gameparams.xml");
                var root = doc.firstElementChild;
                for(var i=0; i < root.children.length; i++){
                    var xml = root.children[i];
                    var name = xml.getAttribute( "name" );
                    var value = xml.getAttribute( "value" );
                    if( name == "max_score_for_start_wave" )
                        this._scoresForStartWave = parseInt(value);
                }
            }

            this.m_board.startGame();

            //TODO: EU.support EU.PC and EU.MouseHoverScroll
            if (EU.PC !== undefined && EU.PC == 1) {
                EU.MouseHoverScroll.shared().setScroller(_scrollInfo);
                EU.MouseHoverScroll.shared().setNode( this.m_mainlayer );
            }
        },

        excludeTower: function(towername )
        {
            this.m_menuCreateTower.addExludedTower( towername );
        },
        onEnter: function()
        {
            cc.Layer.prototype.onEnter.call(this);
            this.setKeyboardEnabled( true );
            if (EU.PC !== undefined && EU.PC == 1) {
                EU.MouseHoverScroll.shared().enable();
            }

            //Director.getInstance().getTextureCache().removeUnusedTextures();
            //AdMob.hide();

            var music = this.m_board.isGameStarted() ? EU.kMusicGameBattle : EU.kMusicGamePeace;
            cc.audioEngine.playMusic( music );
            cc.audioEngine.resumeAllEffects( );

            for(var i=0; i < this.m_objects.length; i++){
                /**
                 * @type {EU.Unit} unit
                 */
                var unit = this.m_objects.children[i];
                if( unit.__Unit)
                {
                    var fire = unit.getChildByName( "fire" );
                    if( fire ) fire.setVisible( true );
                }
            }
        },

        onExit: function()
        {
            cc.Layer.prototype.onExit.call(this);
            this.setKeyboardEnabled( false );

            if (EU.PC !== undefined && EU.PC == 1) {
                EU.MouseHoverScroll.shared().disable();
            }

            //AdMob.show();
            if( this.m_objects )
            {
                for(var i=0; i < this.m_objects.length; i++){
                    /**
                     * @type {EU.Unit} unit
                     */
                    var unit = this.m_objects.children[i];
                    if( unit.__Unit)
                    {
                        var fire = unit.getChildByName( "fire" );
                        if( fire ) fire.setVisible( false );
                    }
                }
            }
        },
        /**
         *
         * @param {String} stringproperty
         * @param {String} value
         * @returns {Boolean}
         */
        setProperty: function( stringproperty, value )
        {
            if( stringproperty == "shake" )
                this.shake( parseFloat(value) );
            else
                return EU.NodeExt.prototype.setProperty.call( this, stringproperty, value );
            return true;
        },
        /**
         * @param {TowerPlaceDef} def
         * @returns {TowerPlace}
         */
        addTowerPlace: function( def )
        {
            if( this.getTowerPlaceInLocation( def.position ) )
                return null;
            /**
             * @type {TowerPlace} place
             */
            var place = EU.TowerPlace.create( def );
            this.m_towerPlaces.push( place );
            this.addObject( place, zorder.earth + 1 );
            return place;
        },
        /**
         * @param {cc.Point} location
         * @returns {TowerPlace}
         */
        getTowerPlaceInLocation: function(location )
        {
            var index = this.getTowerPlaceIndex( location );
            if( index != -1 )
            {
                return this.m_towerPlaces[index];
            }
            return null;
        },
        /**
         * @param {cc.Point} location
         * @returns {int}
         */
        getTowerPlaceIndex: function(location )
        {
            var result = -1 , index = 0 ;
            var mind = 999999 ;
            var distance = 0 ;
            for(var i=0; i < this.m_towerPlaces.length; i++){
                /**
                 * @type {EU.TowerPlace} unit
                 */
                var p = this.m_towerPlaces.children[i];
                var c = p.checkClick( location, distance );
                if( c && distance < mind )
                {
                    result = index;
                    mind = distance;
                }
                ++index;
            }
            return result;
        },
        /**
         * @param {EU.TowerPlace} place
         * @returns {}
         */
        eraseTowerPlace: function(  place )
        {
            var iplace = this.m_towerPlaces.indexOf(place);
            if( iplace >= 0)
            {
                //TODO: easier to use cc.pool
                this.removeObject( place );
                this.m_towerPlaces.splice(iplace,1);
                this.m_selectedPlace = null;
            }
            this.markTowerPlaceOnLocation( cc.Point( -9999, -9999 ) );
        },
        /**
         * @param {EU.TowerPlace} place
         */
        setSelectedTowerPlaces: function( place )
        {
            this.m_selectedPlace = place;
        },
        /**
         * @return {EU.TowerPlace}
         */
        getSelectedTowerPlaces: function()
        {
            return this.m_selectedPlace;
        },
        getTowerPlaces: function()
        {
                return this.m_towerPlaces;
        },
        resetSelectedPlace: function()
        {
            this.m_selectedPlace.reset( null );
        },
        createTree: function( index )
        {
            EU.assert( 0 );
            return null;
        },
        onTouchesBegan: function(touches, event )
        {
            if( !this.m_enabled )
                return;

            for (var i = 0; i < touches.length; i++) {
                /**
                 * @type {cc.Touch} touch
                 */
                var touch = touches[i];

                var location = touch.getLocation();
                location = this.m_mainlayer.convertToNodeSpace( location );

                node = this.getObjectInLocation( location );
                if( node == null )
                {
                    var index = this.getTowerPlaceIndex( location );
                    node = (index != -1) ? this.m_towerPlaces[index] : null;
                }
                if( node )
                {
                    var ti = new EU.touchInfo( node, touch );
                    this.m_touches[touch.getID()] = ti;
                }
                //else
                {
                    this._scrollInfo.node = this.m_mainlayer;
                    this._scrollInfo.nodeposBegan = this.m_mainlayer.getPosition();
                    this._scrollInfo.touchBegan = touch.getLocation();
                    this._scrollInfo.touchID = touch.getID();
                }
            }
        },
        onTouchesMoved: function( touches, event )
        {

        },

        onTouchesEnded: function( touches, event )
        {
            if( !this.m_enabled )
                return;
            for (var i = 0; i < touches.length; i++) {
                /**
                 * @type {cc.Touch} touch
                 */
                var touch = touches[i];

                if( _scrollInfo.touchID == touch.getID() )
                {
                    if( _scrollInfo.node )
                    {
                        _scrollInfo.node.reset( null );
                        _scrollInfo.touchID = -1;
                    }
                }

                var touchEnd = touch;
                var touchBegin = this.m_touches[touchEnd.getID()];
                var location = this.m_mainlayer.convertToNodeSpace( touchEnd.getLocation() );
                var startLocation = this.m_mainlayer.convertToNodeSpace( touchEnd.getStartLocation() );

                var node = this.getObjectInLocation( location );
                if( location.getDistance( startLocation ) < 50 )
                {
                    var indexTowerPlace = this.getTowerPlaceIndex( location );
                    if( indexTowerPlace != -1 && touchBegin.nodeBegin == this.m_towerPlaces[indexTowerPlace] )
                    {
                        this.onClickByTowerPlace( this.m_towerPlaces[indexTowerPlace] );
                    }
                    else if( node && node == touchBegin.nodeBegin )
                    {
                        this.onClickByObject( node );
                    }
                    else
                    {
                        this.m_menuTower.disappearance();
                        this.onEmptyTouch( touchEnd.getLocation() );
                    }
                    this.m_menuDig.disappearance();
                    this.markTowerPlaceOnLocation( location );
                }
                if( node == null )
                {
                    this._selectedUnit.reset( null );
                }
                this.m_touches.erase( this.m_touches.find( touchEnd.getID() ) );

            }
        },

        onTouchesCancelled: function( touches, event )
        {
            this.onTouchesEnded( touches, event );
        },
        onKeyReleased: function(keyCode, event )
        {
            if( keyCode == cc.KEY.back )
                this.menuPause( null );
            if( EU.isTestDevice() && EU.isTestModeActive() )
            {
                if( keyCode == cc.KEY.num0 )  cc.scheduler.setTimeScale( 0 );
                if( keyCode == cc.KEY.num1 )  cc.scheduler.setTimeScale( 1 );
                if( keyCode == cc.KEY.num2 )  cc.scheduler.setTimeScale( 2 );
                if( keyCode == cc.KEY.num3 )  cc.scheduler.setTimeScale( 3 );
                if( keyCode == cc.KEY.num4 )  cc.scheduler.setTimeScale( 4 );
                if( keyCode == cc.KEY.num5 )  cc.scheduler.setTimeScale( 5 );
                if( keyCode == cc.KEY.num6 )  cc.scheduler.setTimeScale( 6 );
                if( keyCode == cc.KEY.num7 )  cc.scheduler.setTimeScale( 7 );
                if( keyCode == cc.KEY.num8 )  cc.scheduler.setTimeScale( 8 );
                if( keyCode == cc.KEY.num9 )  cc.scheduler.setTimeScale( 9 );
                if( keyCode == cc.KEY.f9 ) cc.scheduler.setTimeScale( 99 );
                if( keyCode == cc.KEY.f1 ) this.m_board.onFinishGame();
            }
        },
        /**
         * @param {EU.Unit} unit
         */
        onClickByObject: function( unit )
        {
            if( unit.getType() == EU.UnitType.tower )
            {
                var showMenu = EU.strToBool( unit.getParamCollection().get( "showmenu", "yes" ) );

                if( showMenu && unit != this._selectedUnit )
                {
                    this.m_menuTower.setUnit( unit );

                    var point = unit.getPosition();
                    this.m_menuTower.setPosition( point );
                    this.m_menuTower.appearance();
                    this._selectedUnit.reset( unit );
                }
                else
                {
                    if( this._selectedUnit )
                    {
                        this._selectedUnit.runEvent( "ondeselect" );
                    }
                    this.m_menuTower.disappearance();
                    this._selectedUnit.reset( null );
                }

            }
        },
        onClickByTowerPlace: function( place )
        {

            cc.audioEngine.playEffect( EU.kSoundGameTowerPlaceSelect );
            var event = "level" + this.m_board.getCurrentLevelIndex() + "_selectplace";
            EU.TutorialManager.shared().dispatch( event );
        },
        markTowerPlaceOnLocation: function(position )
        {
            var hist = this.m_selectedPlace;
            this.m_selectedPlace = null;

            var index = this.getTowerPlaceIndex( position );
            if( index != -1 )
            {
                this.m_selectedPlace = this.m_towerPlaces[index];
            }

            if( (!this.m_selectedPlace && hist != this.m_selectedPlace) || (hist == this.m_selectedPlace) )
            {
                this.m_menuCreateTower.disappearance();
                this.m_selectedPlace = null;
            }
            if( hist )
                hist.unselected();
            if( this.m_selectedPlace )
                this.m_selectedPlace.selected();

            if( this.m_selectedPlace /*&& hist != this.m_selectedPlace*/ )
            {
                this.m_menuTower.disappearance();
                this.m_menuDig.disappearance();
                if( this.m_selectedPlace )
                {
                    if( this.m_selectedPlace.getActive() )
                    {
                        if( !this.m_box.isItemSelected() )
                        {
                            this.m_menuCreateTower.appearance();
                            this.m_menuCreateTower.setClickPoint( this.m_selectedPlace.getPosition() );
                        }
                    }
                    else
                    {
                        this.m_menuDig.appearance();
                        this.m_menuDig.setClickPoint( this.m_selectedPlace.getPosition() );
                        //m_selectedPlace = null;
                    }
                }
            }
            //	m_menuCreateTower.setActived( this.m_selectedPlace != null );
        },
        onEmptyTouch: function(touchlocation )
        {
            var sprite = EU.ImageManager.sprite( EU.k.resourceGameSceneFolder + "empty_touch.png" );
            if( sprite )
            {
                this.addChild( sprite, 9 );
                sprite.setPosition( touchlocation );
                sprite.setScale( 0 );
                var duration = 0.5 ;
                sprite.runAction( cc.Sequence._actionOneTwo(
                    new cc.ScaleTo( duration, 1 ),
                    new cc.CallFunc( Node.removeFromParent, sprite ) )
                ) ;
                sprite.runAction( new cc.FadeTo( duration, 128 ) );
            }
        },
        onForbiddenTouch:function (touchlocation )
        {
            var sprite = EU.ImageManager.sprite( EU.k.resourceGameSceneFolder + "icon_x.png" );
            if( sprite )
            {
                this.addChild( sprite, 9 );
                sprite.setPosition( touchlocation );
                sprite.setScale( 0 );
                var duration = 0.5 ;
                sprite.runAction( cc.Sequence._actionOneTwo(
                    (new cc.ScaleTo( duration, 1 )).easing(cc.easeBounceOut() ),
                    new cc.CallFunc( Node.removeFromParent, sprite ) )
                ) ;
                sprite.runAction( new cc.FadeTo( duration, 128 ) );
            }
        },
        onCreateUnit: function( unit )
        {
            var type = unit.getType();
            switch( type )
            {
                case EU.UnitType.tower:
                {
                    var event = "level" + ( this.m_board.getCurrentLevelIndex() ) + "_buildtower";
                    EU.TutorialManager.shared().dispatch( event );
                    break;
                }
                case EU.UnitType.creep:
                {
                    // TODO: isFileExist is not implemented
                    var isExist = cc.fileUtils.isFileExist( "ini/tutorial/units/" + unit.getName() + ".xml" );
                    if( isExist )
                    {
                        var key = "showunitinfo_" + unit.getName();
                        var showed = EU.UserData.shared().get_bool( key );
                        if( !showed )
                        {
                            var info = EU.UnitInfo.create( unit.getName() );
                            if( info )
                            {
                                EU.UserData.shared().write( key, true );
                                this.m_interface.addChild( info );
                            }
                        }
                    }
                    break;
                }

                default:
                    break;
            }
        },
        onDeathUnit: function( unit )
        {
            var type = unit.getType();
            switch( type )
            {
                case EU.UnitType.tower:
                    break;
                case EU.UnitType.creep:
                    break;
                default:
                    break;
            }
        },

        onDeathCanceled: function( unit )
        {
            var type = unit.getType();
            switch( type )
            {
                case EU.UnitType.tower:
                    break;
                case EU.UnitType.creep:
                    break;
                default:
                    break;
            }
        },
        /**
         * @param {EU.WaveInfo} wave
         */
        onStartWave: function( wave )
        {
            var event = "level" + m_board.getCurrentLevelIndex() + "_startwave" + wave.index;
            EU.TutorialManager.shared().dispatch( event );
        },
        markPriorityTarget: function()
        {
        },
        unmarkPriorityTarget: function()
        {
        },
        onWaveFinished: function()
        {
            for (var i = 0; i < this._waveIcons.length; i++) {
                /**
                 * @type {EU.WaveIcon} icon
                 */
                var icon = this._waveIcons[i];
                icon.setActive( true );
            }
        },

        onFinishGame( FinishLevelParams* params )
        {
            var call = CallFunc.create( [this, params](){this.openStatisticWindow( params ); } );
            var delay = DelayTime.create( 1 );
            runAction( Sequence.createWithTwoActions( delay, call ) );

            bool success = params.livecurrent > 0;
            this.m_menuCreateTower.disappearance();
            this.m_menuTower.disappearance();
            this.m_menuDig.disappearance();
            setTouchDisabled();
            menuFastModeEnabled( false );
            this.m_interfaceMenu.menu.setEnabled( false );
            AudioEngine.shared().playEffect( success ? kSoundGameFinishSuccess : kSoundGameFinishFailed );

            UserData.shared().write(
                EU.k.user.LastGameResult,
                success ? EU.k.user.GameResultValueWin : EU.k.user.GameResultValueFail );

            if( success )
            {
                int wincounter = UserData.shared().get_int(EU.k.user.GameWinCounter);
                ++wincounter;
                UserData.shared().write(EU.k.user.GameWinCounter, wincounter);
            }
        }

        buyLevelsMoney( int count )
        {
            _boughtScoresForSession += count;
        }

        shake(var value)
        {
            const var x = 2.0f * value;
            const var t = 0.05f * value;

            Vector<FiniteTimeAction*> actions;
            actions.pushBack( MoveBy.create( t, Point( 0, +1 * x ) ) );
            actions.pushBack( MoveBy.create( t, Point( 0, -2 * x ) ) );
            actions.pushBack( MoveBy.create( t, Point( 0, +1 * x ) ) );
            actions.pushBack( MoveBy.create( t, Point( -0.5*x, 0 ) ) );
            actions.pushBack( MoveBy.create( t, Point( 1 * x, 0 ) ) );
            actions.pushBack( MoveBy.create( t, Point( -0.5*x, 0 ) ) );
            actions.pushBack( MoveBy.create( t, Point( 0, 2 * x ) ) );
            actions.pushBack( MoveBy.create( t, Point( 0, -4 * x ) ) );
            actions.pushBack( MoveBy.create( t, Point( 0, 2 * x ) ) );
            actions.pushBack( MoveBy.create( t, Point( -0.75*x, 0 ) ) );
            actions.pushBack( MoveBy.create( t, Point( 1.5*x, 0 ) ) );
            actions.pushBack( MoveBy.create( t, Point( -0.75*x, 0 ) ) );
            actions.pushBack( MoveBy.create( t, Point( 0, -2 * x ) ) );
            actions.pushBack( MoveBy.create( t, Point( 0, 4 * x ) ) );
            actions.pushBack( MoveBy.create( t, Point( 0, -2 * x ) ) );
            runAction( Sequence.create( actions ) );
        }

        openStatisticWindow( FinishLevelParams* params )
        {
            EU.assert( getChildByName( "win" ) == null );

            unschedule( schedule_selector( GameGS.update ) );
    //	AdMob.show();

            bool win = params.livecurrent > 0;
            int level = this.m_board.getCurrentLevelIndex();
            int stars = params.stars;
            int award = LevelParams.shared().getAwardGold( level, stars, this.m_board.getGameMode() == GameMode.hard );

            var window = VictoryMenu.create( win, award, stars );
            this.addChild( window, 99999 );

            bool showad = UserData.shared().get_int( EU.k.user.UnShowAd ) == 0;
            if( showad && EU.k.useAds )
            {
                var showAd = []()
                {
                    AdsPlugin.shared().showInterstitialBanner();
                };
                var delay = DelayTime.create( 1 );
                var call = CallFunc.create( std.bind( showAd ) );
                var action = Sequence.createWithTwoActions( delay, call );
                runAction( action );
            }

            var music = win ? kMusicVictory : kMusicDefeat;
            AudioEngine.shared().stopMusic();
            AudioEngine.shared().playEffect( music );

        }

        flyCameraAboveMap( const Point & wave )
        {
            var computePointFinish = [this]( const Point & wavebegan )
            {
                var dessize = cc.director.getOpenGLView().getDesignResolutionSize();
                var mapsize = this.m_bg.getContentSize();
                mapsize.width *= this.m_mainlayer.getScaleX();
                mapsize.height *= this.m_mainlayer.getScaleY();
                Point wave = wavebegan;
                wave.x /= this.m_mainlayer.getScaleX();
                wave.y /= this.m_mainlayer.getScaleY();
                Point res;
                if( wave.y > dessize.height / 2 )
                {
                    res.x = 0;
                    res.y = dessize.height - mapsize.height;
                }
                else
                {
                    res = Point( 0, 0 );
                }
                return res;
            };
            var computePointStart = [this]( const Point & finish )
            {
                var dessize = cc.director.getOpenGLView().getDesignResolutionSize();
                var mapsize = this.m_bg.getContentSize();
                mapsize.width *= this.m_mainlayer.getScaleX();
                mapsize.height *= this.m_mainlayer.getScaleY();
                Point res;

                if( finish.y < 0 )
                {
                    res = Point( 0, 0 );
                }
                else
                {
                    res.x = 0;
                    res.y = dessize.height - mapsize.height;
                }

                return res;
            };
            var createAction = [this]( const Point & start, const Point & end )
            {
                this.m_mainlayer.setPosition( start );

                var predelay = DelayTime.create( 1.f );
                var move2 = EaseInOut.create( MoveTo.create( 1.5f, end ), 2 );
                var call = CallFunc.create( [this]()
                {
                    this.setTouchNormal();
                    this.m_interfaceMenu.menu.setEnabled( true );
                } );

                return Sequence.create( predelay, move2, call, null );
            };

            Point finish = computePointFinish( wave );
            Point start = computePointStart( finish );
            this.m_mainlayer.runAction( createAction( start, finish ) );
        }

        createExplosion( const Point& position )
        {


        }

        createExplosionWave( const Point& position )
        {

        }

        createFragments( const Point& position )
        {

        }

        createExplosionSpot( const Point& position )
        {

        }

        createEffect( Unit*base, Unit*target, const var & effect )
        {
            var effects = ShootsEffectsCreate( base, target, effect );
            for( auto& effect : effects )
            {
                int z = effect.getLocalZOrder();
                addObject( effect, 0 );
                if( z != 0 )
                    effect.setLocalZOrder( z );
            }
        }


        createCloud( const Point& position )
        {

        }

        createRoutesMarkers( const Route & route, UnitLayer type )
        {

        }

        createIconForWave( const Route & route, const WaveInfo & wave, UnitLayer type, const std.list<std.string> & icons, var delay )
        {
            Point start = route.front();
            var callback = std.bind( &GameGS.startWave, this,
            std.placeholders._1,
            std.placeholders._2,
            std.placeholders._3
        );

            var icon = WaveIcon.create( start, delay, this.m_dalayWaveIcon, callback, type );
            icon.setName( "waveicon" );
            _waveIcons.push_back( icon );
            this.m_interface.addChild( icon, zOrderInterfaceWaveIcon );
            if( _runFlyCamera )
            {
                _runFlyCamera = false;
                flyCameraAboveMap( route.front() );

                //run tutorial
                int index = this.m_board.getCurrentLevelIndex( );
                if (!(index == 1 && !EU.k.useInapps)) {
                    var event = "level" + intToStr(index) + "_enter";
                    TutorialManager.shared().dispatch(event);
                }
            }

            var event = "level" + intToStr( this.m_board.getCurrentLevelIndex() ) + "_waveicon";
            TutorialManager.shared().dispatch( event );
        }

        removeIconsForWave()
        {
            for( auto& icon : _waveIcons )
            {
                icon.removeFromParent();
            }
            _waveIcons.clear();
        }

        startWave( WaveIcon* icon, var elapsed, var duration )
        {
            var percent( 0 );
            if( duration > 0.001f )
            {
                percent = elapsed / duration;
                percent = std.max( 0.f, percent );
                percent = std.min( 1.f, percent );
                percent = 1 - percent;
                var award = static_cast<float>(_scoresForStartWave)* percent;
                int score = static_cast<int>(award);
                if( score > 0 )
                {
                    ScoreCounter.shared().addMoney( kScoreLevel, score, false );
                    createAddMoneyNodeForWave( score, icon.getPosition() );
                }
            }

            WaveGenerator.shared().resume();
            removeIconsForWave();
            AudioEngine.shared().playMusic( kMusicGameBattle );

            var event = "level" + intToStr( this.m_board.getCurrentLevelIndex() ) + "_startwave";
            TutorialManager.shared().dispatch( event );

        }


        createAddCrystalNode( var count, const Point & position )
        {

        }

        updateWaveCounter()
        {
            this.m_scoresNode.updateWaves();
        }

        setOnEnterParam_needExit()
        {}

        menuFastModeEnabled( bool enabled )
        {
        #if (CC_TARGET_PLATFORM == CC_PLATFORM_MAC) || (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
            const var fast = 1.95f;
    #else
            const var fast = 1.95f;
    #endif
            //m_gameRate = enabled ? fast : 1.0f;

            //	var sound = enabled ? kSoundGameFastModeOn : kSoundGameFastModeOff;
            //	AudioEngine.shared().playEffect( sound );

            //cc.director.getScheduler().setTimeScale( this.m_gameRate );

            if( this.m_interfaceMenu.rateFast ) this.m_interfaceMenu.rateFast.setVisible( !enabled );
            if( this.m_interfaceMenu.rateNormal ) this.m_interfaceMenu.rateNormal.setVisible( enabled );
        }

        menuRestart()
        {
            //	closeStatisticWindow( false );
            //	int index = MapLayer.getInstace().getCurrentLevel();
            //	MapLayer.getInstace().fastStartGame( index );
            //	cc.director.popScene();

        }

        void runLayer( LayerPointer layer )
        {
            int zthis = GameGS.getInstance().getLocalZOrder();
            int zshadow = zthis + 1;
            int zlayer = zshadow + 1;

            if( layer )
            {
                GameGS.getInstance().getScene().addChild( layer, zlayer );
                GameGS.getInstance().onExit();
            }
            var shadow = ImageManager.sprite( kPathSpriteSquare );
            if( shadow )
            {
                var dessize = cc.director.getOpenGLView().getDesignResolutionSize();
                shadow.setName( "shadow" );
                shadow.setScaleX( dessize.width );
                shadow.setScaleY( dessize.height );
                shadow.setColor( Color3B( 0, 0, 0 ) );
                shadow.setOpacity( 0 );
                shadow.setPosition( Point( dessize / 2 ) );
                GameGS.getInstance().getScene().addChild( shadow, zshadow );
                shadow.runAction( FadeTo.create( 0.2f, 204 ) );
            }
        }

    menuSkill( Ref * sender, Skill skill )
    {
        //close box menu before using skills
        this.m_box.close();

        EU.MenuItemCooldown * item = dynamic_cast<EU.MenuItemCooldown*>(sender);

        if( _selectedSkill && item == _selectedSkill )
        {
            item.showCancel( false );
            setTouchNormal();
        }
        else if( item != _selectedSkill )
        {
            setTouchNormal();
            setTouchSkill( skill );
            item.showCancel( true );
            _selectedSkill = item;
        }

        TutorialManager.shared().dispatch( "clickskillbutton" );
    }

    resetSkillButtons()
    {
        _selectedSkill = null;
        this.m_interfaceMenu.bomb.showCancel(false);
        this.m_interfaceMenu.desant.showCancel(false);
    }

    setTouchDisabled()
    {
        _touchListenerDesant.setEnabled( false );
        _touchListenerBomb.setEnabled( false );
        _touchListenerNormal.setEnabled( false );
        _eventDispatcher.removeEventListener( _touchListenerDesant );
        _eventDispatcher.removeEventListener( _touchListenerBomb );
        _eventDispatcher.removeEventListener( _touchListenerNormal );
    }

    setTouchNormal()
    {
        setTouchDisabled();
        _eventDispatcher.addEventListenerWithSceneGraphPriority( _touchListenerNormal, this );
        _touchListenerNormal.setEnabled( true );
        _skillModeActived = false;
        resetSkillButtons();

    }

    setTouchSkill( Skill skill )
    {
        setTouchDisabled();
        switch( skill )
        {
            case Skill.desant:
                _eventDispatcher.addEventListenerWithSceneGraphPriority( _touchListenerDesant, this );
                _touchListenerDesant.setEnabled( true );
                break;
            case Skill.bomb:
                _eventDispatcher.addEventListenerWithSceneGraphPriority( _touchListenerBomb, this );
                _touchListenerBomb.setEnabled( true );
                break;
        }
        _skillModeActived = true;
    }

    menuPause( Ref * sender )
    {
        AudioEngine.shared( ).pauseAllEffects( );
        SmartScene * scene = dynamic_cast<SmartScene*>(getScene( ));
        var pause = GamePauseLayer.create( "ini/gamescene/pause.xml" );
        scene.pushLayer( pause, true );
        pause.setGlobalZOrder( 2 );
    }

        menuShop( Ref*sender, bool gears )
        {
        #if PC != 1
            var shop = gears ?
            ShopLayer.create( false, false, true, true ) :
            ShopLayer.create( false, true, false, true );

            if( shop )
            {
                AudioEngine.shared( ).pauseAllEffects( );
                SmartScene * scene = dynamic_cast<SmartScene*>(getScene( ));
                scene.pushLayer( shop, true );
                shop.setGlobalZOrder( 2 );

                var on_purchase = [this]( int type, int value )
                {
                    this.buyLevelsMoney( value );
                };
                shop.observerOnPurchase().add( _ID, std.bind( on_purchase, std.placeholders._1, std.placeholders._2 ) );

                TutorialManager.shared().dispatch( "level_openshop" );
            }
    #endif
        }

        menuPauseOff()
        {
            onEnter();

            var scene = getScene();
            var shadow = scene.getChildByName( "shadow" );
            if( shadow )
            {
                var a0 = FadeTo.create( 0.2f, 0 );
                var a1 = CallFunc.create( std.bind( &Node.removeFromParent, shadow ) );
                shadow.runAction( Sequence.createWithTwoActions( a0, a1 ) );
            }
        }

        addObject( Node * object, int zOrder )
        {
            this.m_objects.addChild( object, -object.getPositionY() );
        }

        removeObject( Node * object )
        {
            if( this.m_objects )
                this.m_objects.removeChild( object );
        }

        update( var dt )
        {
    //#ifdef _DEBUG
    //	dt = std.min<float>(dt, 1.f / 20);
    //#endif
            //dt *= this.m_gameRate;
            this.m_board.update( dt );

    #if PC == 1
            MouseHoverScroll.shared().update( dt );
    #endif
        }

        Unit * GameGS.getObjectInLocation( const Point & location )
        {
            Vector<Node*> objects = this.m_objects.getChildren();

            var distance( 2048 * 2048 );
            Unit * result( NULL );
            for( int i = 0; i < objects.size(); ++i )
            {
                Unit * object = dynamic_cast<Unit*>(objects.at( i ));
                if( !object )
                    continue;
                var d = object.getPosition().getDistance( location );
                if( d < 50 && d < distance )
                {
                    result = object;
                    distance = d;
                }
            }
            return result;
        }

        achievementsObtained( const var & nameachiv )
        {
            return;
        }

        achievementsWindowClose( Ref * ref )
        {
            var scene = cc.director.getRunningScene();
            var node = scene.getChildByTag( 1 );

            var a1 = EaseBackIn.create( ScaleTo.create( 0.5f, 0 ) );
            var a2 = CallFunc.create( std.bind( &Director.popScene, cc.director ) );
            node.runAction( Sequence.create( a1, a2, null ) );
        }

        ScoresNode.ScoresNode()
        : this.m_scores()
            , this.m_healths( null )
            , this.m_golds( null )
            , this.m_waves( null )
        {
            __push_auto_check( "ScoresNode.ScoresNode" );
            Node.init();
            this.m_healths = Label.createWithBMFont(  kFontStroke, "" );
            this.m_golds = Label.createWithBMFont( kFontStroke, "" );
            this.m_waves = Label.createWithBMFont( kFontStroke, "" );

            this.addChild( this.m_healths, 1 );
            this.addChild( this.m_golds, 1 );
            this.addChild( this.m_waves, 1 );

            this.m_healths.setAnchorPoint( Point( 0, 0.5f ) );
            this.m_golds.setAnchorPoint( Point( 0, 0.5f ) );
            this.m_waves.setAnchorPoint( Point( 0, 0.5f ) );

            this.m_healths.setPosition( Point( 85, -25 ) );
            this.m_golds.setPosition( Point( 190, -25 ) );
            this.m_waves.setPosition( Point( 85, -70 ) );

            this.m_healths.setScale( 0.5f );
            this.m_golds.setScale( 0.5f );
            this.m_waves.setScale( 0.5f );

            this.m_healthsIcon = ImageManager.sprite( EU.k.resourceGameSceneFolder + "icon_lifes.png" );
            this.m_healthsIcon.setPosition( 62, -30 );
            this.addChild( this.m_healthsIcon );
            var icon = ImageManager.sprite( EU.k.resourceGameSceneFolder + "icon_gold1.png" );
            icon.setPosition( 162, -30 );
            this.addChild( icon );
            icon = ImageManager.sprite( EU.k.resourceGameSceneFolder + "icon_wave1.png" );
            icon.setPosition( 62, -75 );
            this.addChild( icon );

            ScoreCounter.shared().observer( kScoreLevel ).add( _ID, std.bind( &ScoresNode.on_change_money, this, std.placeholders._1 ) );
            ScoreCounter.shared().observer( kScoreHealth ).add( _ID, std.bind( &ScoresNode.on_change_lifes, this, std.placeholders._1 ) );
        }

        ScoresNode.~ScoresNode()
        {
            ScoreCounter.shared().observer( kScoreLevel ).remove( _ID );
            ScoreCounter.shared().observer( kScoreHealth ).remove( _ID );
        }

        ScoresNode* ScoresNode.create()
        {
            ScoresNode* p = new ScoresNode;
            p.autorelease();
            return p;
        }

        void ScoresNode.updateWaves()
        {
            int wave = WaveGenerator.shared().getWaveIndex();
            int count = WaveGenerator.shared().getWavesCount();
            var text = intToStr( wave ) + "/" + intToStr( count );
            this.m_waves.setString( text.c_str() );
        }

        void ScoresNode.on_change_lifes( int score )
        {
            int health = std.max<int>( 0, ScoreCounter.shared().getMoney( kScoreHealth ) );
            this.m_healths.setString( intToStr( health ) );

            var run = []( Node*node )
            {
                var s = node.getScale();
                if( node.getActionByTag( 0x12 ) )
                    return;

                var action = EaseBackInOut.create( Sequence.create(
                ScaleTo.create( 0.5f, s * 1.5f ),
                ScaleTo.create( 0.5f, s * 1.0f ),
                null ) );
                action.setTag( 0x12 );
                node.runAction( action );
            };

            run( this.m_healths );
            run( this.m_healthsIcon );
        }

        void ScoresNode.on_change_money( int score )
        {
            int prev = this.m_scores[kScoreLevel];
            int curr = ScoreCounter.shared().getMoney( kScoreLevel );
            if( prev != curr )
            {
                curr = std.max<int>( 0, curr );
                this.m_scores[kScoreLevel] = curr;
                var action = ActionText.create( 0.2f, curr, true );
                action.setTag( 1 );
                this.m_golds.stopActionByTag( 1 );
                this.m_golds.runAction( action );
            }
        }

        Icon.Icon()
        : this.m_label( null )
            , this.m_bg( null )
        {}

        bool Icon.init( const var & bgResource, const var & text )
        {
            this.m_bg = ImageManager.sprite( bgResource.c_str() );
            if( !m_bg ) return false;
            this.m_label = Label.createWithBMFont( kFontStroke, text );
            if( !m_label ) return false;
            this.addChild( this.m_label );
            this.addChild( this.m_bg );
            this.m_label.setAnchorPoint( Point( 1, 0.5 ) );
            this.m_bg.setAnchorPoint( Point( 0, 0.5 ) );
            return true;
        }

        Icon.~Icon()
        {}

        Icon * Icon.create( const var & bgResource, const var & text )
        {
            Icon * ptr = new Icon;
            if( ptr && ptr.init( bgResource, text ) )
                ptr.autorelease();
            return ptr;
        }

        FiniteTimeAction * Icon.createAndRunAppearanceEffect( var duration, FiniteTimeAction * extraAction )
        {
            Vector<FiniteTimeAction*>actions;
            actions.pushBack( EaseOut.create( MoveBy.create( duration * 0.30f, Point( 0, 35 ) ), 1 ) );
            actions.pushBack( EaseIn.create( MoveBy.create( duration * 0.25f, Point( 0, -35 ) ), 1 ) );
            actions.pushBack( EaseOut.create( MoveBy.create( duration * 0.20f, Point( 0, 25 ) ), 1 ) );
            actions.pushBack( EaseIn.create( MoveBy.create( duration * 0.15f, Point( 0, -25 ) ), 1 ) );
            actions.pushBack( EaseOut.create( MoveBy.create( duration * 0.10f, Point( 0, 10 ) ), 1 ) );
            actions.pushBack( EaseIn.create( MoveBy.create( duration * 0.05f, Point( 0, -10 ) ), 1 ) );
            actions.pushBack( DelayTime.create( duration ) );

            if( extraAction )
                actions.pushBack( extraAction );

            Sequence * action = Sequence.create( actions );

            runAction( action );
            this.m_label.runAction( Sequence.create( DelayTime.create( duration ), FadeTo.create( 1, 128 ), null ) );
            this.m_bg.runAction( Sequence.create( DelayTime.create( duration ), FadeTo.create( 1, 128 ), null ) );
            return action;
        }

        FiniteTimeAction * Icon.createAndRunDisappearanceEffect( var duration, FiniteTimeAction * extraAction )
        {
            FiniteTimeAction * a0 = MoveBy.create( duration, Point( 15, 100 ) );
            FiniteTimeAction * a1 = FadeTo.create( duration, 128 );
            FiniteTimeAction * a2 = FadeTo.create( duration, 128 );

            FiniteTimeAction * action( null );
            if( extraAction )
            {
                Vector<FiniteTimeAction*>arr;
                arr.pushBack( a0 );
                arr.pushBack( extraAction );
                action = Sequence.create( arr );
            }
            else
            {
                action = a0;
            }
            EU.assert( action );
            runAction( action );
            this.m_label.runAction( a1 );
            this.m_bg.runAction( a2 );
            return action;
        }

        void Icon.setIntegerValue( var value )
        {
            var s = intToStr( value );
            const char * c = s.c_str();
            this.m_label.setString( c );
        }



        });
});

EU.Icon = cc.Node.extend(
{
});

