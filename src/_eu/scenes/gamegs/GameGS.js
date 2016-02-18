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

EU.TouchInfo = cc.Class.extend({
    nodeBegin: null,
    nodeEnd: null,
    touch: null,
    id: null,
    ctor: function (node, touch) {
        this.nodeBegin = node;
        this.id = touch.__instanceId;
    },
});

EU.HeroIcon = cc.Node.extend({});

EU.Skill = {
    desant : 0,
    bomb : 1,
    heroskill : 2
};

zOrderOfArriavalCounter = 0;
zOrderInterfaceMenu = 99;
zOrderInterfaceWaveIcon = 100;

EU.GameGS = EU.LayerExt.extend({

    /** For Test instanceof */
    __GameGS : true,

    /** @type{EU.GameBoard} */ board: null,
    /** @type{cc.Node} */  mainlayer: null,
    /** @type{cc.Sprite} */  bg: null,
    /** @type{cc.Node} */  objects: null,
    /** @type{cc.Node} */  interface: null,
    /** @type{Array<EU.TowerPlace>} */ towerPlaces: null,
    /** @type{EU.TowerPlace} */  selectedPlace: null,
    /** @type{EU.Unit} */  selectedUnit: null,
    /** @type{Array<cc.Node>} */ fragments: null,
    /** @type{Array<string>} */  excludedTowers: null,
    /** @type{Number} */  dalayWaveIcon: null,
    /** @type{bool} */  isIntteruptHeroMoving: null,
    /** @type{Integer} */  scoresForStartWave: null,
    /** @type{Integer} */  boughtScoresForSession: null,
    /** @type{EU.MenuCreateTower} */  menuCreateTower: null,
    /** @type{EU.MenuTower} */  menuTower: null,
    /** @type{EU.MenuDig} */  menuDig: null,
    /** @type{EU.ScoreNode} */  scoreNode: null,
    /** @type{Object<Integer, EU.TouchInfo>} */  touches: null,
    /** @type{EU.ScrollTouchInfo} */  scrollInfo: null,
    /** @type{bool} */  enabled: null,
    /** @type{EU.MenuItemImageWithText} */  interface_rateNormal: null,
    /** @type{EU.MenuItemImageWithText} */ interface_rateFast: null,
    /** @type{EU.MenuItemImageWithText} */ interface_pause: null,
    /** @type{EU.MenuItemImageWithText} */ interface_shop: null,
    /** @type{EU.MenuItemCooldown} */ interface_desant: null,
    /** @type{EU.MenuItemCooldown} */ interface_bomb: null,
    /** @type{EU.MenuItemCooldown} */ interface_heroSkill: null,
    /** @type{EU.HeroIcon} */  interface_hero: null,
    /** @type{cc.Menu} */  interface_menu: null,
    /** @type{EU.BoxMenu} */  box: null,
    /** @type{Array<EU.WaveIcon>} */  waveIcons: null,
    /** @type{bool} */  runFlyCamera: null,
    /** @type{bool} */  skillModeActive: null,
    /** @type{EU.MenuItemCooldown} */ selectedSkill: null,
    /** @type{cc.EventListener} */ touchListenerNormal: null,
    /** @type{cc.EventListener} */ touchListenerDesant: null,
    /** @type{cc.EventListener} */ touchListenerBomb: null,
    /** @type{cc.EventListener} */ touchListenerHero: null,
    /** @type{cc.EventListener} */ touchListenerHeroSkill: null,


    //TODO: ~GameGS()
    //{
    //    MouseHoverScroll.setNode( null );
    //    MouseHoverScroll.setScroller( null );
    //    __push_auto_check( "~GameGS" );
    //    gameGSInstance = null;
    //    this.board.clear();
    //    ShootsEffectsClear();
    //
    //    cc.director.getScheduler().setTimeScale( 1 );
    //    EU.ScoreCounter.observer( EU.kScoreLevel ).remove( _ID );
    //
    //    if( this.scoreNode )
    //        this.scoreNode.removeFromParent();
    //},

    ctor: function () {
        cc.director.getScheduler().setTimeScale( 10 );
        this._super();
        this.board = new EU.GameBoard();
        this.enabled = true;
        this.dalayWaveIcon = 0;
        this.scoresForStartWave = 0;
        this.boughtScoresForSession = 0;
        this.runFlyCamera = true;
        this.skillModeActive = false;
        this.enabled = false;
        this.towerPlaces = [];
        this.waveIcons = [];
        this.scrollInfo = new EU.ScrollTouchInfo();
        this.touches = {};

        this.interface_menu = null;

        var desSize = cc.view.getDesignResolutionSize();
        var sizeMap = EU.k.LevelMapSize;

        this.mainlayer = new cc.Node();
        this.mainlayer.setName("mainlayer");
        this.addChild(this.mainlayer);
        var sx = desSize.width / sizeMap.width;
        var sy = desSize.height / sizeMap.height;
        var scale = Math.max(sx, sy);
        this.mainlayer.setScale(scale);

        this.objects = new cc.Node();
        this.objects.setName("objects");
        this.mainlayer.addChild(this.objects, 1);

        EU.assert(this.bg == null);

        this.mainlayer.setContentSize(sizeMap);
        this.mainlayer.setAnchorPoint(cc.p(0,0));

        this.setName("gamelayer");
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyReleased: function( keyCode, event )
            {
                self.onKeyReleased(keyCode, event);
            }
        }, this);
        
        EU.GameGSInstance = this;
    },
    getGameBoard: function () {
        return this.board;
    },

    init: function () {
        this.touchListenerNormal = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            swallowTouches: false,
            onTouchesBegan: this.onTouchesBegan,
            onTouchesMoved: this.onTouchesMoved,
            onTouchesEnded: this.onTouchesEnded,
            onTouchesCancelled: this.onTouchesCancelled
        });
        this.touchListenerDesant = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchSkillBegan,
            onTouchMoved: null,
            onTouchEnded: this.onTouchSkillEnded.bind(this, EU.Skill.desant),
            onTouchCancelled: this.onTouchSkillCanceled
        });
        this.touchListenerBomb = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchSkillBegan,
            onTouchMoved: null,
            onTouchEnded: this.onTouchSkillEnded.bind(this, EU.Skill.bomb),
            onTouchCancelled: this.onTouchSkillCanceled
        });
        this.touchListenerHeroSkill = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchSkillBegan,
            onTouchMoved: null,
            onTouchEnded: this.onTouchSkillEnded.bind(this, EU.Skill.heroskill),
            onTouchCancelled: this.onTouchSkillCanceled
        });
        this.touchListenerHero = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchHeroBegan,
            onTouchMoved: this.onTouchHeroMoved,
            onTouchEnded: this.onTouchHeroEnded,
            onTouchCancelled: this.onTouchHeroCanceled
        });

        this.scrollInfo = new EU.ScrollTouchInfo();

        this.createInterface();

        //TODO:Achievements.setCallbackOnAchievementObtained( std.bind( &achievementsObtained, this, std.placeholders._1 ) );

        this.load_str("ini/gamescene/scene.xml");

        if (EU.k.useInapps == false) {
            this.interface_shop.setPositionY(-9999);
        }

        this.runEvent("oncreate");

        EU.UserData.write(EU.k.LastGameResult, EU.k.GameResultValueNone);

        return true;
    },
    createInterface: function () {
        var desSize = cc.view.getDesignResolutionSize();

        this.interface = new cc.Node();
        this.interface.setName("interface");
        this.addChild(this.interface, 9);


        var cb0 = this.menuShop.bind(this, true);
        var cb1 = this.menuPause;
        var cb2 = this.menuSkill.bind(this, EU.Skill.desant);
        var cb3 = this.menuSkill.bind(this, EU.Skill.bomb);
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
        var cdd = this.board.getSkillParams().cooldownDesant;
        var cda = this.board.getSkillParams().cooldownAirplane;
        this.interface_shop = new EU.MenuItemImageWithText(kPathButtonShop, cb0, this);
        this.interface_pause = new EU.MenuItemImageWithText(kPathButtonPauseNormal, kPathButtonPauseNormal, kPathButtonPauseNormal, "", "", cb1, this);
        this.interface_desant = new EU.MenuItemCooldown(kPathButtonDesantBack, kPathButtonDesantForward, cdd, cb2, this, kPathButtonDesantCancel);
        this.interface_bomb = new EU.MenuItemCooldown(kPathButtonBombBack, kPathButtonBombForward, cda, cb3, this, kPathButtonBombCancel);
        this.interface_heroSkill = new EU.MenuItemCooldown("", "", 0, null, cancel);
        //TODO:this.interface_hero = new EU.HeroIcon("hero" + (EU.UserData.hero_getCurrent() + 1), cb5);
        //TODO:this.interface_hero.setEnabled(true);
        this.interface_desant.setAnimationOnFull("airstike_animation1");
        this.interface_bomb.setAnimationOnFull("airstike_animation2");

        this.interface_shop.setName("shop");
        this.interface_pause.setName("pause");
        this.interface_desant.setName("desant");
        this.interface_bomb.setName("bomb");
        //TODO:this.interface_heroSkill.setName("heroskill");
        //TODO:this.interface_hero.setName("hero");

        this.interface_desant.setSound("##sound_button##");
        this.interface_bomb.setSound("##sound_button##");
        //TODO:this.interface_heroSkill.setSound("##sound_button##");

        this.interface_menu = new cc.Menu();
        this.interface_menu.setName("menu");
        this.interface_menu.addChild(this.interface_shop);
        this.interface_menu.addChild(this.interface_pause);
        this.interface_menu.addChild(this.interface_desant);
        this.interface_menu.addChild(this.interface_bomb);
        //TODO:this.interface_menu.addChild(this.interface_heroSkill);
        //TODO:this.interface_menu.addChild(this.interface_hero);
        this.interface_menu.setEnabled(false);

        //TODO:this.interface_hero.setVisible(false);

        this.interface_menu.setPosition(cc.p(0,0));
        this.interface.addChild(this.interface_menu, 99);

        this.menuCreateTower = new EU.MenuCreateTower();
        this.menuTower = new EU.MenuTower();
        this.menuDig = new EU.MenuDig();

        this.interface.addChild(this.menuCreateTower, 999999);
        this.interface.addChild(this.menuTower, 999999);
        this.interface.addChild(this.menuDig, 999999);
        this.menuCreateTower.setGlobalZOrder(99999);
        this.menuTower.setGlobalZOrder(99999);
        this.menuDig.setGlobalZOrder(99999);

        this.menuCreateTower.setPosition(cc.p(0,0));
        this.menuCreateTower.disappearance();
        this.menuTower.disappearance();
        this.menuDig.disappearance();

        this.box = new EU.BoxMenu("ini/gamescene/boxmenu.xml");
        this.addChild(this.box);
        //TODO: this.createDevMenu();
    },

    createHeroMenu: function () {
        var hero = this.board.getHero();
        if (hero) {
            var skill = hero.getSkill();
            this.interface_hero.setVisible(true);
            this.interface_hero.setHero(hero);

            var back = EU.k.resourceGameSceneFolder + "button_" + skill + "_2.png";
            var forward = EU.k.resourceGameSceneFolder + "button_" + skill + "_1.png";
            var cancel = EU.k.resourceGameSceneFolder + "button_" + skill + "_3.png";

            var skills = EU.HeroExp.skills(this.board.getHero().getName());
            var level = skills[4];

            var duration = 0;
            if (skill == "landmine") {
                duration = this.board.getSkillParams().cooldownLandmine;
                duration *= this.board.getSkillParams().landmineLevels[level].rateCooldown;
            }
            else if (skill == "swat") {
                duration = this.board.getSkillParams().cooldownSwat;
                duration *= this.board.getSkillParams().swatLevels[level].rateCooldown;
            }
            else if (skill == "hero3_bot") {
                duration = this.board.getSkillParams().cooldownHero3Bot;
                duration *= this.board.getSkillParams().hero3BotLevels[level].rateCooldown;
            }
            else
                EU.assert(0);

            var callback = this.menuSkill.bind(this, EU.Skill.heroskill);
            this.interface_heroSkill.init(back, forward, duration, callback, cancel);
            this.interface_heroSkill.setAnimationOnFull(skill);
        }
    },
    //TODO: createDevMenu()
    //{
    //    if( isTestDevice() && isTestModeActive() )
    //    {
    //        var item = [this]( Menu * menu, var text, EventKeyboard.KeyCode key, Point pos )
    //        {
    //            var sendKey = [this]( Ref* sender, EventKeyboard.KeyCode key )mutable
    //            {
    //                this.onKeyReleased( key, null );
    //            };
    //
    //            var i = new EU.MenuItemTextBG( text, Color4F.GRAY, Color3B.BLACK, std.bind( sendKey, std.placeholders._1, key ) );
    //            menu.addChild( i );
    //            i.setPosition( pos );
    //            i.setScale( 1.5f );
    //        };
    //
    //        var menu = new cc.Menu();
    //        menu.setPosition( 0, 0 );
    //        addChild( menu );
    //        Point pos( 25, 100 );
    //        float Y( 45 );
    //        item( menu, "R 1", cc.KEY.KEY_1, pos ); pos.y += Y;
    //        item( menu, "R 2", cc.KEY.KEY_2, pos ); pos.y += Y;
    //        item( menu, "R 3", cc.KEY.KEY_3, pos ); pos.y += Y;
    //        item( menu, "R 4", cc.KEY.KEY_4, pos ); pos.y += Y;
    //        item( menu, "R 5", cc.KEY.KEY_5, pos ); pos.y += Y;
    //        item( menu, "R 6", cc.KEY.KEY_6, pos ); pos.y += Y;
    //        item( menu, "R 7", cc.KEY.KEY_7, pos ); pos.y += Y;
    //        item( menu, "R 8", cc.KEY.KEY_8, pos ); pos.y += Y;
    //        item( menu, "R 9", cc.KEY.KEY_9, pos ); pos.y += Y;
    //        item( menu, "R 0", cc.KEY.KEY_0, pos ); pos.y += Y;
    //        item( menu, "R 99", cc.KEY.KEY_F9, pos ); pos.y += Y;
    //        item( menu, "WIN", cc.KEY.KEY_F1, pos ); pos.y += Y;
    //    }
    //},

    clear: function () {
        //TODO: Achievements.setCallbackOnAchievementObtained( null );
        EU.ShootsEffects.ShootsEffectsClear();

        if (this.bg)
            this.bg.removeFromParent();
        this.bg = null;
        this.objects.removeAllChildren();
        this.objects = null;
        this.fragments.clear();
        this.menuTower.setUnit(null);
        this.menuTower.disappearance();

        this.menuFastModeEnabled(false);
        this.unscheduleUpdate();
        true.removeAllChildrenWithCleanup(true);
    },
    startGame: function () {
        //EU.AudioEngine.playEffect( EU.kSoundGameStart );
        this.setEnabled(true);
        this.scheduleUpdate();
    },

    loadLevel: function (index, xmlroot) {
        this.bg = EU.ImageManager.sprite("images/maps/map" + ( index + 1 ) + ".jpg");
        this.bg.setAnchorPoint(cc.p(0,0));
        this.mainlayer.addChild(this.bg, -1);
        this.bg.setGlobalZOrder(-2);

        var mode = this.board.getGameMode();
        var decorations = xmlroot.getElementsByTagName("decorations")[0];
        var xmlparams = xmlroot.getElementsByTagName(mode == EU.GameMode.normal ? EU.k.LevelParams : EU.k.LevelParamsHard)[0];
        if (!xmlparams)
            xmlparams = xmlroot;

        if( decorations )
        for (var i = 0; i < decorations.children.length; ++i) {
            var child = decorations.children[i];
            var object = this.createDecorFromXmlNode(child);
            if (object) {
                var z = object.getLocalZOrder();
                this.addObject(object, object.getLocalZOrder());
                if (z != 0) {
                    object.setLocalZOrder(z);
                }
            }
        }

        this.dalayWaveIcon = parseFloat( xmlparams.getAttribute("wave_cooldown") );

        this.updateWaveCounter();

        {
            //TODO: load game params
            //var doc = EU.pugixml.readXml( "ini/gameparams.xml" )
            //var root = doc.root();
            //for( var& xml : root )
            //{
            //    var name = xml.getAttribute( "name" ).as_string();
            //    var value = xml.getAttribute( "value" );
            //    if( name == "max_score_for_start_wave" )
            //        this.scoresForStartWave = value.as_int();
            //}
            this.scoresForStartWave = 10;
        }

        this.board.startGame();

        //TODO: MouseHoverScroll.setScroller(this.scrollInfo);
        //TODO: MouseHoverScroll.setNode( this.mainlayer );
    },
    excludeTower: function (towername) {
        this.menuCreateTower.addExludedTower(towername);
    },
    onEnter: function () {
        this._super();
        //TODO: setKeyboardEnabled( true );
        //TODO: MouseHoverScroll.enable();

        //cc.director.getTextureCache().removeUnusedTextures();
        //TODO: EU.AdMob.hide();

        var music = this.board.isGameStarted() ? EU.kMusicGameBattle : EU.kMusicGamePeace;
        //EU.AudioEngine.playMusic( music );
        //EU.AudioEngine.resumeAllEffects( );

        for (var i = 0; i < this.children.length; ++i) {
            var child = this.children[i];
            if (child.__Unit) {
                var unit = child;
                var fire = unit.getChildByName("fire");
                if (fire) fire.setVisible(true);
            }
        }
    },
    onExit: function () {
        this._super();
        //TODO: setKeyboardEnabled( false );
        //TODO: MouseHoverScroll.disable();
        //TODO: AdMob.show();
        if (this.objects) {
            for (var i = 0; i < this.children.length; ++i) {
                var child = this.children[i];
                if (child.__Unit) {
                    var unit = child;
                    var fire = unit.getChildByName("fire");
                    if (fire) fire.setVisible(false);
                }
            }
        }
    },
    //TODO: setProperty_str: function( stringproperty, value )
    //{
    //    if( stringproperty == "shake" )
    //        this.shake( parseFloat(value) );
    //    else
    //        return NodeExt.setProperty( stringproperty, value );
    //    return true;
    //},
    addTowerPlace: function (def) {
        if (this.getTowerPlaceInLocation(def.position))
            return null;
        var place = new EU.TowerPlace(def);
        this.towerPlaces.push(place);
        this.addObject(place);
        return place;
    },
    getTowerPlaceInLocation: function (location) {
        var index = this.getTowerPlaceIndex(location);
        if (index != -1) {
            return this.towerPlaces[index];
        }
        return null;
    },
    getTowerPlaceIndex: function (location) {
        var result = -1;
        var mind = 999999;
        for (var i = 0; i < this.towerPlaces.length; ++i) {
            var p = this.towerPlaces[i];
            var c = p.checkClick(location);
            if (c.clicked && c.distance < mind) {
                result = i;
                mind = c.distance;
            }
        }
        return result;
    },
    eraseTowerPlace: function (place) {
        for (var i = 0; i < this.towerPlaces.length; ++i) {
            if (this.towerPlaces[i] == place) {
                this.towerPlaces.splice(i, 1);
                this.removeObject(place);
                this.selectedPlace = null;
            }
        }
        this.markTowerPlaceOnLocation(cc.p(-9999, -9999));
    },
    setSelectedTowerPlaces: function (place) {
        this.selectedPlace = place;
    },
    getSelectedTowerPlaces: function () {
        return this.selectedPlace;
    },
    getTowerPlaces: function () {
        return this.towerPlaces;
    },
    resetSelectedPlace: function () {
        this.selectedPlace = null;
    },
    getDecorations: function (name) {
        var result = []
        for (var i = 0; i < this.objects.children.length; ++i) {
            var object = this.objects.children[i];
            if (object.getName() == name) {
                if (object.__Decoration)
                    result.push(decor);
            }
        }
        return result;
    },
    createDecorFromXmlNode: function (xmlnode) {
        var name = xmlnode.tagName;
        var actiondesc = xmlnode.getAttribute("action");
        var x = parseFloat(xmlnode.getAttribute("x"));
        var y = parseFloat(xmlnode.getAttribute("y"));
        //float z = xmlnode.getAttribute( "z" ).as_float();

        var pathToXml = "ini/maps/animations/" + name + ".xml";
        var doc = null;
        EU.pugixml.readXml(pathToXml, function(error, data) {
            doc = data;
        }, this, true);
        var root = doc.firstElementChild;

        var decoration = new EU.Decoration();
        EU.xmlLoader.load_node_xml_node(decoration, root, false);
        decoration.setName(xmlnode.tagName);
        decoration.setPosition(x, y);
        decoration.setStartPosition(cc.p(x, y));
        //decoration.setLocalZOrder( z == 0 ? -y : z );
        decoration.setActionDescription(actiondesc);

        if (actiondesc.length > 0) {
            var action = EU.xmlLoader.load_action_str(actiondesc);
            decoration.setAction(action);
        }
        return decoration;
    },
    onTouchesBegan: function (touches, event) {
        var self = event.getCurrentTarget();
        if (!self.enabled)
            return;

        for (var i = 0; i < touches.length; ++i) {
            var touch = touches[i];

            var location = touch.getLocation();
            location = self.mainlayer.convertToNodeSpace(location);

            var node = self.getObjectInLocation(location);
            if (node == null) {
                var index = self.getTowerPlaceIndex(location);
                node = (index != -1) ? self.towerPlaces[index] : null;
            }
            if (node) {
                var ti = new EU.TouchInfo(node, touch);
                ti.startLocation = touch.getLocation();
                self.touches[touch.__instanceId] = ti;
            }
            self.scrollInfo.node = self.mainlayer;
            self.scrollInfo.nodeposBegan = self.mainlayer.getPosition();
            self.scrollInfo.touchBegan = touch.getLocation();
            self.scrollInfo.touchID = touch.__instanceId;
        }
    },

    onTouchesMoved: function (touches, event) {
        var self = event.getCurrentTarget();
        if (!self.enabled)
            return;

        //#if PC != 1
        for (var i = 0; i < touches.length; ++i) {
            var touch = touches[i];
            if (self.scrollInfo.touchID == touch.__instanceId) {
                if (self.scrollInfo.node) {
                    var location = touch.getLocation();
                    var shift = EU.Common.pointDiff(location, self.scrollInfo.touchBegan);
                    var pos = EU.Common.pointAdd(self.scrollInfo.nodeposBegan, shift);

                    pos = self.scrollInfo.fitPosition(pos, cc.view.getDesignResolutionSize());

                    self.scrollInfo.lastShift = EU.Common.pointDiff(pos, self.scrollInfo.node.getPosition());
                    self.scrollInfo.node.setPosition(pos);
                }
            }
        }
        //#endif
    },
    onTouchesEnded: function (touches, event) {
        var self = event.getCurrentTarget();
        self.isIntteruptHeroMoving = false;
        if (!self.enabled)
            return;
        for (var i = 0; i < touches.length; ++i) {
            var touch = touches[i];
            if (self.scrollInfo.touchID == touch.__instanceId) {
                if (self.scrollInfo.node) {
                    self.scrollInfo.node = null;
                    self.scrollInfo.touchID = -1;
                }
            }

            var touchEnd = touch;
            var touchBegin = self.touches[touchEnd.__instanceId];
            var location = self.mainlayer.convertToNodeSpace(touchEnd.getLocation());
            var startLocation = self.mainlayer.convertToNodeSpace(self.scrollInfo.touchBegan);

            var node = self.getObjectInLocation(location);
            if ( cc.pDistance(location, startLocation) < 50) {
                var indexTowerPlace = self.getTowerPlaceIndex(location);
                if (indexTowerPlace != -1 && touchBegin.nodeBegin == self.towerPlaces[indexTowerPlace]) {
                    self.isIntteruptHeroMoving = true;
                    self.onClickByTowerPlace(self.towerPlaces[indexTowerPlace]);
                }
                else if (node && node == touchBegin.nodeBegin) {
                    self.isIntteruptHeroMoving = true;
                    self.onClickByObject(node);
                }
                else {
                    self.menuTower.disappearance();
                    self.onEmptyTouch(touchEnd.getLocation());
                }
                self.menuDig.disappearance();
                self.markTowerPlaceOnLocation(location);
            }
            if (node == null) {
                self.selectedUnit = null;
            }
            self.touches.length = 0;
        }
    },

    onTouchesCancelled: function (touches, event) {
        event.target.onTouchesEnded(touches, event);
    },

    onTouchSkillBegan: function (touch, event) {
        return true;
    },
    onTouchSkillEnded: function (skill, touch, event) {
        var self = event.getCurrentTarget();
        var location = touch.getLocation();
        location = self.mainlayer.convertToNodeSpace(location);
        var dispatched = false;

        switch (skill) {
            case EU.Skill.desant:
            {
                if (self.board.createDesant("desant", location, self.board.getSkillParams().lifetimeDesant)) {
                    self.interface_desant.run();
                    dispatched = true;
                    EU.TutorialManager.dispatch("usedesant");
                }
                break;
            }
            case EU.Skill.bomb:
            {
                var bomb = self.board.createBomb(location);
                if (bomb) {
                    self.interface_bomb.run();
                    dispatched = true;
                    EU.TutorialManager.dispatch("useairbomb");
                }
                break;
            }
            case EU.Skill.heroskill:
            {
                var skills = EU.HeroExp.skills(self.board.getHero().getName());
                var level = skills[4];

                var skill = self.board.getHero() ? self.board.getHero().getSkill() : "";
                if (skill == "landmine") {
                    var count = self.board.getSkillParams().landmineLevels[level].count;
                    var landmine = self.board.createLandMine(location, count);
                    if (landmine) {
                        dispatched = true;
                        EU.TutorialManager.dispatch("uselandmine");
                    }
                }
                else if (skill == "swat" || skill == "hero3_bot") {
                    count = 1;
                    var lifetime = 0;
                    var unitName;
                    if (skill == "swat") {
                        count = self.board.getSkillParams().swatCount;
                        lifetime = self.board.getSkillParams().swatLifetime;
                        lifetime *= self.board.getSkillParams().swatLevels[level].rateLifetime;
                        unitName = skill;
                    }
                    else {
                        count = self.board.getSkillParams().hero3BotCount;
                        lifetime = self.board.getSkillParams().hero3BotLifetime;
                        lifetime *= self.board.getSkillParams().hero3BotLevels[level].rateLifetime;
                        unitName = skill;
                    }

                    var points = EU.Common.computePointsByRadius(points, 15, count);
                    for (var i = 0; i < points.length; ++i) {
                        var point = points[i];
                        var pos = EU.Common.pointAdd(point, location);
                        var unit = self.board.createDesant(unitName, pos, lifetime);
                        if (!unit)
                            self.board.createDesant(unitName, location, lifetime);
                        if (unit)
                            dispatched = true;
                    }
                    if (dispatched)
                        EU.TutorialManager.dispatch("use" + skill);
                }
                if (dispatched)
                    self.interface_heroSkill.run();
                break;
            }
        }

        if (dispatched) {
            self.selectedSkill = null;
            self.setTouchNormal();
        }
        else {
            self.onForbiddenTouch(touch.getLocation());
        }
    },
    onTouchSkillCanceled: function () {/*touch, event*/
        this.setTouchNormal();
    },
    onTouchHeroBegan: function (touch, event) {
        var touches = [];
        touches.push(touch);
        event.getCurrentTarget().onTouchesBegan(touches, event);
        return true;
    },
    onTouchHeroMoved: function (touch, event) {
        var touches = [];
        touches.push(touch);
        event.getCurrentTarget().onTouchesMoved(touches, event);
    },
    onTouchHeroEnded: function (touch, event) {
        var self = event.getCurrentTarget();
        var touches = [];
        touches.push(touch);
        self.onTouchesEnded(touches, event);

        //check click on tower or tower place
        if (self.isIntteruptHeroMoving)
            return;

        var location = touch.getLocation();
        if (EU.Common.pointDistance(location, touch.getStartLocation()) > 100)
            return;

        //location = self.mainlayer.convertToNodeSpace(location);
    },
    onTouchHeroCanceled: function (touch, event) {
        event.getCurrentTarget().setTouchNormal();
    },
    onKeyReleased:function( keyCode, event )
    {
        if( keyCode == cc.KEY.back || keyCode == cc.KEY.escape )
            this.menuPause( null );
        if( true || (isTestDevice() && isTestModeActive()) )
        {
            if( keyCode >= 48 && keyCode<=57 ) {
                var scale = keyCode-48;
                cc.director.getScheduler().setTimeScale( scale );
            }
            if( keyCode == cc.KEY.f2 ) {
                EU.ScoreCounter.setMoney( EU.kScoreHealth, 0, false );
                this.board.onFinishGame();
            }
            if( keyCode == cc.KEY.f1 )
                this.board.onFinishGame();
        }
    },
    onClickByObject: function (unit) {
        if (unit._type == EU.UnitType.tower) {
            var showMenu = EU.Common.strToBool(unit.getParamCollection().get("showmenu", "yes"));

            if (showMenu && unit != this.selectedUnit) {
                this.menuTower.setUnit(unit);
                var point = unit.getPosition();
                this.menuTower.setPosition(point);
                this.menuTower.appearance();
                this.selectedUnit = unit;
            }
            else {
                if (this.selectedUnit) {
                    this.selectedUnit.runEvent("ondeselect");
                }
                this.menuTower.disappearance();
                this.selectedUnit = null;
            }
            if (this.touchListenerHero.isEnabled())
                this.setTouchNormal();
        }
        else if (unit._type == EU.UnitType.hero) {
            if (unit.current_state().get_name() != EU.Unit.State.state_death)
                this.setTouchHero();
        }
    },
    onClickByTowerPlace: function (place) {
        //EU.AudioEngine.playEffect( EU.kSoundGameTowerPlaceSelect );

        var event = "level" + this.board.getCurrentLevelIndex() + "_selectplace";
        EU.TutorialManager.dispatch(event);

        if (this.touchListenerHero.isEnabled())
            this.setTouchNormal();
    },
    markTowerPlaceOnLocation: function (position) {
        var hist = this.selectedPlace;
        this.selectedPlace = null;

        var index = this.getTowerPlaceIndex(position);
        if (index != -1) {
            this.selectedPlace = this.towerPlaces[index];
        }

        if ((!this.selectedPlace && hist != this.selectedPlace) || (hist == this.selectedPlace)) {
            this.menuCreateTower.disappearance();
            this.selectedPlace = null;
        }

        if (hist)
            hist.unselected();
        if (this.selectedPlace)
            this.selectedPlace.selected();

        if (this.selectedPlace /*&& hist != this.selectedPlace*/) {
            this.menuTower.disappearance();
            this.menuDig.disappearance();
            if (this.selectedPlace) {
                if (this.selectedPlace.getActive()) {
                    if (!this.box.isItemSelected()) {
                        this.menuCreateTower.appearance();
                        this.menuCreateTower.setClickPoint(this.selectedPlace.getPosition());
                    }
                }
                else {
                    this.menuDig.appearance();
                    this.menuDig.setClickPoint(this.selectedPlace.getPosition());
                    //this.selectedPlace = null;
                }
            }
        }

        this.menuCreateTower.setActived( this.selectedPlace != null );
    },
    onEmptyTouch: function (touchlocation) {
        var sprite = EU.ImageManager.sprite(EU.k.resourceGameSceneFolder + "empty_touch.png");
        if (sprite) {
            this.addChild(sprite, 9);
            sprite.setPosition(touchlocation);
            sprite.setScale(0);
            var duration = 0.5;
            sprite.runAction(new cc.Sequence(
                new cc.ScaleTo(duration, 1),
                new cc.CallFunc(sprite.removeFromParent, sprite))
            );
            sprite.runAction(new cc.FadeTo(duration, 128));
        }
    },
    onForbiddenTouch: function (touchlocation) {
        var sprite = EU.ImageManager.sprite(EU.k.resourceGameSceneFolder + "icon_x.png");
        if (sprite) {
            this.addChild(sprite, 9);
            sprite.setPosition(touchlocation);
            sprite.setScale(0);
            var duration = 0.5;
            sprite.runAction(new cc.Sequence(
                new cc.EaseBounceOut(new cc.ScaleTo(duration, 1)),
                new cc.CallFunc(sprite.removeFromParent, sprite))
            );
            sprite.runAction(new cc.FadeTo(duration, 128));
        }
    },
    onCreateUnit: function (unit) {
        var type = unit._type;
        switch (type) {
            case EU.UnitType.tower:
            {
                var event = "level" + this.board.getCurrentLevelIndex() + "_buildtower";
                EU.TutorialManager.dispatch(event);
                break;
            }
            case EU.UnitType.creep:
            {
                //TODO: Show unit description
                //var isExist = cc.fileUtils.getInstance().isFileExist("ini/tutorial/units/" + unit.getName() + ".xml");
                var isExist = false;
                if (isExist) {
                    var key = "showunitinfo_" + unit.getName();
                    var showed = EU.UserData.get_bool(key);
                    if (!showed) {
                        var info = new cc.UnitInfo(unit.getName());
                        if (info) {
                            EU.UserData.write(key, true);
                            this.interface.addChild(info);
                        }
                    }
                }
                break;
            }
            case EU.UnitType.hero:
            {
                this.createHeroMenu();
                break;
            }

            default:
                break;
        }
    },
    onDeathUnit: function (unit) {
        var type = unit._type;
        switch (type) {
            case EU.UnitType.tower:
                break;
            case EU.UnitType.creep:
                break;
            case EU.UnitType.hero:
                this.interface_heroSkill.stop();
                this.interface_hero.showCancel(false);
                if (this.touchListenerHero.isEnabled())
                    this.setTouchNormal();
                break;
            default:
                break;
        }
    },
    onDeathCanceled: function (unit) {
        var type = unit._type;
        switch (type) {
            case EU.UnitType.tower:
                break;
            case EU.UnitType.creep:
                break;
            case EU.UnitType.hero:
                this.interface_heroSkill.run();
                break;
            default:
                break;
        }
    },
    onStartWave: function (wave) {
        var event = "level" + this.board.getCurrentLevelIndex() + "_startwave" + wave.index;
        EU.TutorialManager.dispatch(event);
    },
    onWaveFinished: function () {
        for (var i = 0; i < this.waveIcons.length; ++i) {
            this.waveIcons[i].setActive(true);
        }
    },
    onFinishGame: function (params) {
        var call = new cc.CallFunc(this.openStatisticWindow.bind(this, params));
        var delay = new cc.DelayTime(1);
        this.runAction(new cc.Sequence(delay, call));

        var success = params.livecurrent > 0;
        this.menuCreateTower.disappearance();
        this.menuTower.disappearance();
        this.menuDig.disappearance();
        this.setTouchDisabled();
        this.menuFastModeEnabled(false);
        this.interface_menu.setEnabled(false);
        //EU.AudioEngine.playEffect( success ? EU.kSoundGameFinishSuccess : EU.kSoundGameFinishFailed );

        EU.UserData.write(
            EU.k.LastGameResult,
            success ? EU.k.GameResultValueWin : EU.k.GameResultValueFail);

        if (success) {
            var wincounter = EU.UserData.get_int(EU.k.GameWinCounter);
            ++wincounter;
            EU.UserData.write(EU.k.GameWinCounter, wincounter);
        }
    },
    buyLevelsMoney: function (count) {
        this.boughtScoresForSession += count;
    },
    shake: function (value) {
        //var x = 2.0 * value;
        //var t = 0.05 * value;
        //
        //var action = new cc.Sequence(
        //    new cc.MoveBy(t, cc.p(0, +1 * x)),
        //    new cc.MoveBy(t, cc.p(0, -2 * x)),
        //    new cc.MoveBy(t, cc.p(0, +1 * x)),
        //    new cc.MoveBy(t, cc.p(-0.5 * x, 0)),
        //    new cc.MoveBy(t, cc.p(x, 0)),
        //    new cc.MoveBy(t, cc.p(-0.5 * x, 0)),
        //    new cc.MoveBy(t, cc.p(0, 2 * x)),
        //    new cc.MoveBy(t, cc.p(0, -4 * x)),
        //    new cc.MoveBy(t, cc.p(0, 2 * x)),
        //    new cc.MoveBy(t, cc.p(-0.75 * x, 0)),
        //    new cc.MoveBy(t, cc.p(1.5 * x, 0)),
        //    new cc.MoveBy(t, cc.p(-0.75 * x, 0)),
        //    new cc.MoveBy(t, cc.p(0, -2 * x)),
        //    new cc.MoveBy(t, cc.p(0, 4 * x)),
        //    new cc.MoveBy(t, cc.p(0, -2 * x)));
        //this.runAction(action);
    },

    openStatisticWindow: function (params) {
        EU.assert(this.getChildByName("win") == null);

        this.unschedule(this.update);

        var win = params.livecurrent > 0;
        var level = this.board.getCurrentLevelIndex();
        var stars = params.stars;
        var award = EU.LevelParams.getAwardGold(level, stars, this.board.getGameMode() == EU.GameMode.hard);

        var window = new EU.VictoryMenu(win, award, stars);
        this.addChild(window, 99999);

        var showad = EU.UserData.get_int(EU.k.UnShowAd) == 0;
        if (showad && EU.k.useAds) {
            var showAd = function () {
                //TODO: AdsPlugin.showInterstitialBanner();
            };
            var delay = new cc.DelayTime(1);
            var call = cc.CallFunc(showAd);
            var action = new cc.Sequence(delay, call);
            this.runAction(action);
        }

        var music = win ? EU.kMusicVictory : EU.kMusicDefeat;
        //EU.AudioEngine.stopMusic();
        //EU.AudioEngine.playEffect( music );

    },
    flyCameraAboveMap: function (wave) {
        //var computePointFinish = [this]( const point & wavebegan )
        //var computePointStart = [this]( const point & finish )
        //var createAction = [this]( const point & start, const point & end )
        //computePointFinish:
        var dessize = cc.view.getDesignResolutionSize();
        var mapsize = this.bg.getContentSize();
        mapsize.width *= this.mainlayer.getScaleX();
        mapsize.height *= this.mainlayer.getScaleY();
        var wavePoint = cc.p(wave[0].x, wave[0].y);
        wavePoint.x /= this.mainlayer.getScaleX();
        wavePoint.y /= this.mainlayer.getScaleY();
        var finish = cc.p(0, 0);
        if (wavePoint.y > dessize.height / 2) {
            finish.x = 0;
            finish.y = dessize.height - mapsize.height;
        }
        //computePointStart:
        mapsize.width *= this.mainlayer.getScaleX();
        mapsize.height *= this.mainlayer.getScaleY();
        var start = cc.p(0, 0);
        if (finish.y >= 0) {
            res.x = 0;
            res.y = dessize.height - mapsize.height;
        }
        //createAction
        this.mainlayer.setPosition(start);
        var preDelay = cc.delayTime(0.5);
        var move2 = (cc.moveTo(0.5, finish)).easing(cc.easeInOut(2));
        var call = cc.callFunc(this.endOfFlyCameraAboveMap, this);
        this.mainlayer.runAction(cc.sequence(preDelay, move2, call));
    },
    endOfFlyCameraAboveMap:function(){
        this.setTouchNormal();
        this.interface_menu.setEnabled(true);
        this.interface_desant.run();
        this.interface_bomb.run();
        //this.interface_heroSkill.run();
    },
    createEffect: function (base, target, effect) {
        var effects = EU.ShootsEffects.ShootsEffectsCreate(base, target, effect);
        for (var i = 0; i < effects.length; ++i) {
            var object = effects[i];
            var z = object.getLocalZOrder();
            this.addObject(object, 0);
            if (z != 0)
                object.setLocalZOrder(z);
        }
    },
    createIconForWave: function (route, waveinfo, unitType, iconlist, delay) {
        var start = route[0];

        var icon = new EU.WaveIcon(start, delay, this.dalayWaveIcon, this.startWave, this, unitType);
        icon.setName("waveicon");
        this.waveIcons.push(icon);
        this.interface.addChild(icon, zOrderInterfaceWaveIcon);
        if (this.runFlyCamera) {
            this.runFlyCamera = false;
            this.flyCameraAboveMap(route);

            //run tutorial
            var index = this.board.getCurrentLevelIndex();
            if (!(index == 1 && !EU.k.useInapps)) {
                var event = "level" + index + "_enter";
                EU.TutorialManager.dispatch(event);
            }
        }

        var event = "level" + this.board.getCurrentLevelIndex() + "_waveicon";
        EU.TutorialManager.dispatch(event);
    },
    removeIconsForWave: function () {
        for (var i = 0; i < this.waveIcons.length; ++i) {
            this.waveIcons[i].removeFromParent();
        }
        this.waveIcons.length = 0;
    },
    startWave: function (waveIcon, elapsed, duration) {
        var percent = 0;
        if (duration > 0.001) {
            percent = elapsed / duration;
            percent = Math.max(0, percent);
            percent = Math.min(1, percent);
            percent = 1 - percent;
            var score = this.scoresForStartWave * percent;
            if (score > 0) {
                EU.ScoreCounter.addMoney(EU.kScoreLevel, score, false);
                this.createAddMoneyNodeForWave(score, waveIcon.getPosition());
            }
        }

        EU.WaveGenerator.resume();
        this.removeIconsForWave();
        EU.AudioEngine.playMusic( EU.kMusicGameBattle );

        var event = "level" + this.board.getCurrentLevelIndex() + "_startwave";
        EU.TutorialManager.dispatch(event);

    },
    createAddMoneyNodeForWave: function (count, position) {
        if (count > 0) {
            EU.xmlLoader.macros.set("scores", count);
            EU.xmlLoader.macros.set("position", EU.Common.pointToStr(position));
            var node = EU.xmlLoader.load_node_from_file("ini/gamescene/gearforwave.xml");
            EU.xmlLoader.macros.erase("scores");
            EU.xmlLoader.macros.erase("position");
            this.interface.addChild(node);
        }
    },
    updateWaveCounter: function () {
        this.scoreNode.updateWaves();
    },
    menuFastModeEnabled: function (enabled) {
        if (this.interface_rateFast) this.interface_rateFast.setVisible(!enabled);
        if (this.interface_rateNormal) this.interface_rateNormal.setVisible(enabled);
    },
    menuRestart: function () {
        //Old functional
    },
    menuSkill: function (skill, sender) {
        this.box.close();
        var item = sender;

        if (this.selectedSkill && item == this.selectedSkill) {
            item.showCancel(false);
            this.setTouchNormal();
        }
        else if (item != this.selectedSkill) {
            this.setTouchSkill(skill);
            item.showCancel(true);
            this.selectedSkill = item;
        }

        EU.TutorialManager.dispatch("clickskillbutton");
    },
    resetSkillButtons: function () {
        this.selectedSkill = null;
        this.interface_bomb.showCancel(false);
        this.interface_desant.showCancel(false);
        //TODO:this.interface_heroSkill.showCancel(false);
    },

    setTouchDisabled: function () {
        this.touchListenerDesant.setEnabled(false);
        this.touchListenerBomb.setEnabled(false);
        this.touchListenerNormal.setEnabled(false);
        this.touchListenerHero.setEnabled(false);
        this.touchListenerHeroSkill.setEnabled(false);
        cc.eventManager.removeListener(this.touchListenerDesant);
        cc.eventManager.removeListener(this.touchListenerBomb);
        cc.eventManager.removeListener(this.touchListenerNormal);
        cc.eventManager.removeListener(this.touchListenerHero);
        cc.eventManager.removeListener(this.touchListenerHeroSkill);
    },
    setTouchNormal: function () {
        this.setTouchDisabled();
        cc.eventManager.addListener(this.touchListenerNormal, this);
        this.touchListenerNormal.setEnabled(true);
        this.skillModeActive = false;
        this.resetSkillButtons();

        //TODO:this.interface_hero.showCancel(false);
    },
    setTouchSkill: function (skill) {
        this.setTouchDisabled();
        switch (skill) {
            case EU.Skill.desant:
                cc.eventManager.addListener(this.touchListenerDesant, this);
                this.touchListenerDesant.setEnabled(true);
                break;
            case EU.Skill.bomb:
                cc.eventManager.addListener(this.touchListenerBomb, this);
                this.touchListenerBomb.setEnabled(true);
                break;
            case EU.Skill.heroskill:
                cc.eventManager.addListener(this.touchListenerHeroSkill, this);
                this.touchListenerHeroSkill.setEnabled(true);
                break;
        }
        this.skillModeActive = true;
    },
    setTouchHero: function () {
        this.setTouchDisabled();
        cc.eventManager.addListener(this.touchListenerHero, this);
        this.touchListenerHero.setEnabled(true);
        this.resetSkillButtons();
        this.skillModeActive = false;

        this.interface_hero.showCancel(true);
    },

    menuPause: function () {
        //EU.AudioEngine.pauseAllEffects( );
        var scene = EU.Common.getSceneOfNode(this);
        var pause = new EU.GamePauseLayer("ini/gamescene/pause.xml");
        scene.pushLayer(pause, true);
        pause.setGlobalZOrder(2);
    },
    listenPurchases: function (typeScore, value) {
        this.buyLevelsMoney(value);
    },
    menuShop: function (sender, gears) {
        //#if PC != 1
        var shop = gears ?
            new EU.ShopLayer(false, false, true, true) :
            new EU.ShopLayer(false, true, false, true);

        if (shop) {
            //EU.AudioEngine.pauseAllEffects( );
            var scene = EU.Common.getSceneOfNode(this);
            scene.pushLayer(shop, true);
            shop.setGlobalZOrder(2);

            shop.observerOnPurchase().add(__instanceId, this.listenPurchases, this);
            EU.TutorialManager.dispatch("level_openshop");
        }
        //#endif
    },

    menuHero: function () {
        if (this.touchListenerHero.isEnabled() == false)
            this.setTouchHero();
        else
            this.setTouchNormal();
    },

    addObject: function (object, zOrder) {
        this.objects.addChild(object, -object.getPositionY());
    },
    removeObject: function (object) {
        if (this.objects && object){
            this.objects.removeChild(object);
            object.removeFromParent();
        }
    },
    update: function (dt) {
        this.board.update(dt);
        //#if PC == 1
        //TODO: MouseHoverScroll.update( dt );
        //#endif
    },
    getObjectInLocation: function (location) {
        var objects = this.objects.getChildren();

        var distance = 2048 * 2048;
        var result = null;
        for (var i = 0; i < objects.length; ++i) {
            var object = objects[i];
            if (!object.__Unit)
                continue;
            var d = EU.Common.pointDistance(object.getPosition(), location);
            if (d < 50 && d < distance) {
                result = object;
                distance = d;
            }
        }
        return result;
    },
    setEnabled: function( mode ){this.enabled = mode;},
    getMainLayer: function(){return this.mainlayer; }
});

EU.GameGSInstance = null;

EU.GameGS.restartLevel = function () {
    var game = EU.GameGSInstance;
    EU.assert(game);
    var levelindex = game.board.getCurrentLevelIndex();
    var gamemode = game.board.getGameMode();

    var scene = EU.Common.getSceneOfNode(game);
    scene.resetMainLayer(null);

    var dessize = cc.view.getDesignResolutionSize();
    var layer = new EU.GameGS();
    layer.scoreNode = new EU.ScoreNode();
    layer.scoreNode.setPosition(0, dessize.height);
    var result = layer.init();
    EU.assert(result);
    scene.resetMainLayer(layer);
    scene.addChild(layer.scoreNode, 9);
    EU.GameGSInstance.board.loadLevel(levelindex, gamemode);

    if (EU.k.useBoughtLevelScoresOnlyRestartLevel) {
        var boughtScores = game.this.boughtScoresForSession;
        EU.GameGSInstance.this.boughtScoresForSession = boughtScores;
        EU.ScoreCounter.addMoney(EU.kScoreLevel, boughtScores, false);
    }
};

EU.GameGS.createScene = function () {
    var layer = new EU.GameGS();
    var result = layer.init();
    EU.assert(result);
    var scene = new EU.SmartScene(layer);
    scene.setName("gameScene");

    var dessize = cc.view.getDesignResolutionSize();
    layer.scoreNode = new EU.ScoreNode();
    layer.scoreNode.setPosition(0, dessize.height);
    scene.addChild(layer.scoreNode, 9);

    return scene;
};