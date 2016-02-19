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
//Define namespace
var EU = EU || {};

EU.MapLayerLocation = cc.Class.extend({
    pos: null,
    posLock: null,
    a: null,
    b: null,
    starsForUnlock: 0,
    ctor: function () {
        "use strict";
        this.pos = cc.p(0, 0);
        this.posLock = cc.p(0, 0);
        this.a = cc.p(0, 0);
        this.b = cc.p(0, 0);
    }
});

EU.MapLayer = cc.Layer.extend({

    /** Test instance of */
    __MapLayer: true,

    self: null,
    map: null,
    menuLocations: null,
    velocity: null,
    unfilteredVelocity: null,
    isTouching: null,
    locations: null,
    updateLocations: null,
    showLaboratoryOnEnter: null,
    curveMarkers: null,
    scrollInfo: null,
    selectedLevelIndex: null,
    touchListener: null,

    /**
     *
     */
    ctor: function () {
        this._super();
        this.initExt();
        this.self = this;
        this.velocity = cc.p(0, 0);
        this.locations = [];
        this.curveMarkers = [];
    },
    /**
     *
     */
    init: function () {
        this.setName("maplayer");

        //TODO: dispatch keyboard
        //this.setKeyboardEnabled( true );

        this.load_str("ini/map/maplayer.xml");
        this.prepairNodeByConfiguration(this);

        this.map = this.getChildByName("map");

        this.scrollInfo = new EU.ScrollTouchInfo();
        this.scrollInfo.node = this.map;

        this.menuLocations = cc.Menu.create();
        this.menuLocations.setName("locations");
        this.menuLocations.setPosition(0, 0);
        this.map.addChild(this.menuLocations, 1);

        var scale = cc.view.getDesignResolutionSize().height / this.map.getContentSize().height;
        this.map.setScale(scale);

        this.removeUnUsedButtons();
        this.activateLocations();

        this.touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            swallowTouches: false,
            onTouchesBegan: this.scrollBegan,
            onTouchesMoved: this.scrollMoved,
            onTouchesEnded: this.scrollEnded,
            onTouchesCancelled: this.scrollCancelled
        });
        cc.eventManager.addListener(this.touchListener, this);


        //createDevMenu();

        EU.MouseHoverScroll.setScroller( this.scrollInfo );
        EU.MouseHoverScroll.setNode( this.map );
    },
    /**
     *
     * @param nodeext
     */
    prepairNodeByConfiguration: function (nodeext) {
        if (nodeext == null)
            return;
        var node = nodeext.as_node_ref();
        var pathToLeaderboards = nodeext.getParamCollection().get("pathto_leaderboards", "unknowpath");

        var leaderboards = EU.Common.getNodeByPath(node, pathToLeaderboards);
        if (leaderboards)
            leaderboards.setVisible(EU.k.useLeaderboards);
    },
    /**
     *
     */
    displayLeaderboardScore: function () {
        //TODO: leaderboards
        //var pathto_score = this.getParamCollection().get( "pathto_leaderboardsscore", "unknowpath" );
        //var scoreNode = getNodeByPath( this, pathto_score );
        //if( scoreNode )
        //{
        //    var score = EU.Leaderboard.getScoreGlobal();
        //    var string = intToStr( score );
        //    var k = string.length;
        //    while( k > 3 )
        //    {
        //        k -= 3;
        //        string.insert( k, " " );
        //    }
        //
        //    scoreNode.setString( cc.Language.word("leaderboard_score") + string );
        //}
    },
    /**
     *
     */
    removeUnUsedButtons: function () {
        var menu = this.getChildByName("menu");
        if (menu) {
            var shop = menu.getChildByName("shop");
            var paid = menu.getChildByName("paid");
            var heroes = menu.getChildByName("heroes");

            if (paid && EU.k.useLinkToPaidVersion == false)
                paid.setVisible(false);
            if (shop && EU.k.useInapps == false) {
                shop.setVisible(false);
                var itemShop = menu.getChildByName("itemshop");
                itemShop.setPosition(shop.getPosition());
            }
            if (heroes && EU.k.useHero == false)
                heroes.setVisible(false);
        }
    },
    /**
     *
     */
    onEnter: function () {
        cc.Layer.prototype.onEnter.call(this);

        this.scheduleUpdate();
        EU.MouseHoverScroll.enable();

        //TODO: audio
        EU.AudioEngine.playMusic( EU.kMusicMap );

        if (EU.k.useInapps == false) {
            var scene = EU.Common.getSceneOfNode(this);
            var scores = scene.getChildByName("scorelayer");
            if (scores) {
                var menu = scores.getChildByName("menu");
                var shop = menu.getChildByName("shop");
                if (shop) {
                    shop.setVisible(false);
                    shop.setPositionY(-9999);
                }
            }
        }

        var result = EU.UserData.get_int(EU.k.LastGameResult, EU.k.GameResultValueNone);
        if (result == EU.k.GameResultValueWin)
            this.activateLocations();

        if (this.menuLocations)
            this.menuLocations.setEnabled(true);

        var notifyOnEnter = function () {
            EU.TutorialManager.dispatch("map_onenter");
        };
        var notifyGameResult = function (mapLayer) {

            var dispatched = false;

            var countlose = EU.UserData.get_int("lose_counter", 0);
            var result = EU.UserData.get_int(EU.k.LastGameResult, EU.k.GameResultValueNone);

            if (result == EU.k.GameResultValueWin) {
                countlose = 0;

                var towers = [];
                EU.mlTowersInfo.fetch(towers);
                var towername = towers[0];
                var level = EU.UserData.tower_getUpgradeLevel(towername);
                var scores = EU.ScoreCounter.getMoney(EU.kScoreCrystals);
                var cost = EU.mlTowersInfo.getCostLab(towername, level + 1);
                if (level < 3 && cost <= scores) {
                    dispatched = EU.TutorialManager.dispatch("map_afterwin");
                }
                if (dispatched == false) {
                    dispatched = EU.TutorialManager.dispatch("map_showheroroom");
                }
                if (dispatched == false) {
                    if (EU.k.useInapps) {
                        //prevent showing lab when shop is not able
                        dispatched = EU.TutorialManager.dispatch("map_afterwin_force");
                    } else {
                        dispatched = true;
                    }
                }
            }
            if (result == EU.k.GameResultValueFail) {
                countlose++;
                dispatched = EU.TutorialManager.dispatch("map_afterlose");
            }
            if (countlose > 0) {
                if (EU.TutorialManager.dispatch("map_losenumber" + countlose.toString())) {
                    dispatched = true;
                    countlose = 0;
                }
                EU.UserData.write("lose_counter", countlose);
            }
            EU.UserData.write(EU.k.LastGameResult, EU.k.GameResultValueNone);


            if (!dispatched && mapLayer.showLaboratoryOnEnter) {
                mapLayer.showLaboratoryOnEnter = false;
                var run = function (mapLayer) {
                    var maxlevel = true;
                    var towers = []
                    EU.mlTowersInfo.fetch(towers);
                    for (var tower in towers)
                        maxlevel = maxlevel && EU.UserData.tower_getUpgradeLevel(tower) == 5;
                    if (!maxlevel) {
                        mapLayer.cb_lab(null);
                    }
                };
                mapLayer.runAction(cc.callFunc(run, mapLayer))
            }

        };

        this.runAction(cc.callFunc(notifyOnEnter, this));

        var levelResult = EU.UserData.get_int(EU.k.LastGameResult, EU.k.GameResultValueNone);
        var leveFinished =
            levelResult == EU.k.GameResultValueWin ||
            levelResult == EU.k.GameResultValueFail;
        if (leveFinished) {
            this.runAction(cc.callFunc(notifyGameResult, this, this));
        }

        if (levelResult == EU.k.GameResultValueWin) {
            this.openRateMeWindowIfNeeded();
        }

        this.displayLeaderboardScore();
        //this.createPromoMenu();
    },
    /**
     *
     */
    onExit: function () {
        cc.Layer.prototype.onExit.call(this);
        this.unscheduleUpdate();
        EU.MouseHoverScroll.disable();
    },
    /**
     *
     * @param root
     */
    load_xmlnode2: function (root) {
        this.load_xmlnode(root);

        var xmlnode = root.getElementsByTagName("locations");
        var xmlentity = (xmlnode && xmlnode.length > 0) ? xmlnode[0] : null;
        if (xmlentity)
            for (var i = 0; i < xmlentity.children.length; i++) {
                var xmlLocation = xmlentity.children[i];
                var loc = new EU.MapLayerLocation;
                loc.pos = EU.Common.strToPoint(xmlLocation.getAttribute("pos"));
                loc.posLock = EU.Common.strToPoint(xmlLocation.getAttribute("poslock"));
                loc.a = EU.Common.strToPoint(xmlLocation.getAttribute("controlA"));
                loc.b = EU.Common.strToPoint(xmlLocation.getAttribute("controlB"));
                this.locations[i] = loc;
            }
    },
    /**
     *
     * @param name
     * @returns {*}
     */
    get_callback_by_description: function (name) {
        if (name == "back") return this.cb_back
        else if (name == "laboratory") return this.cb_lab;
        else if (name == "itemshop")return this.cb_itemshop;
        else if (name == "shop")return this.cb_shop;
        else if (name == "heroes")return this.cb_heroroom;
        else if (name == "paidversion") return this.cb_paidversion;
        else if (name == "pushgame_normalmode") return this.cb_gameNormalMode;
        else if (name == "pushgame_hardmode") return this.cb_gameHardMode;
        else if (name == "unlock") return this.cb_unlock;
        //TODO: leaderboard
        //else if( name == "leaderboard" ) this.leaderboardOpenGLobal,
        return null;
    },
    /**
     *
     * @param touches
     * @param event
     */
    scrollBegan: function (touches, event) {
        var target = event.getCurrentTarget();
        target.scrollInfo.touchBegan = touches[0].getLocation();
        target.scrollInfo.touchID = touches[0].getID();
        target.scrollInfo.node = target.map;
        target.scrollInfo.nodeposBegan = target.map.getPosition();
        target.isTouching = true;
    },
    /**
     *
     * @param touches
     * @param event
     */
    scrollMoved: function (touches, event) {
        var touch = touches[0];
        var target = event.getCurrentTarget();
        if (touch && target.scrollInfo.node) {
            var location = touch.getLocation();
            var shift = EU.Common.pointDiff(location, target.scrollInfo.touchBegan);
            var pos = EU.Common.pointAdd(target.scrollInfo.nodeposBegan, shift);
            var winsize = cc.view.getDesignResolutionSize();
            var fitpos = target.scrollInfo.fitPosition(pos, winsize);

            target.scrollInfo.lastShift = cc.p(0, 0);
            target.scrollInfo.node.setPosition(fitpos);

            target.unfilteredVelocity = shift;
        }
    },
    /**
     *
     * @param touches
     * @param event
     */
    scrollEnded: function (touches, event) {
        var target = event.getCurrentTarget();
        target.isTouching = false;
        target.velocity *= 0.2;
    },
    /**
     *
     * @param touch
     * @param event
     */
    scrollCancelled: function (touch, event) {
        var target = event.getCurrentTarget();
        target.isTouching = false;
        target.velocity *= 0.2;
    },
    /**
     *
     * @param event
     */
    mouseHover: function (event) {
    },
    /**
     *
     * @param delta
     */
    update: function (delta) {
        if (this.isTouching) {
            var kFilterAmount = 0.25;
            this.velocity = (this.velocity * kFilterAmount) + (this.unfilteredVelocity * (1.0 - kFilterAmount));
            this.unfilteredVelocity = cc.p(0, 0);
        }
        else {
            if (!this.scrollInfo.node) return;
            this.velocity *= 0.95;

            if (EU.Common.pointLength(this.velocity) > 0.01) {
                var winsize = cc.view.getDesignResolutionSize();
                var pos = this.scrollInfo.node.getPosition() + this.velocity;
                var fitpos = this.scrollInfo.fitPosition(pos, winsize);
                this.scrollInfo.node.setPosition(fitpos);
            }
        }
        EU.MouseHoverScroll.update( delta );
    },
    /**
     *
     */
    openRateMeWindowIfNeeded: function () {
        if (!EU.k.useRateMe)
            return;

        var wincounter = EU.UserData.get_int(k.user.GameWinCounter);
        if (wincounter % 3)
            return;

        //open RateMe with delay
        var call = cc.callFunc(this.openRateMe, this);
        var delay = DelayTime.create(0.3);
        this.runAction(cc.sequence(delay, call));
    },
    /**
     *
     */
    openRateMe: function () {
        var scene = EU.Common.getSceneOfNode()
        var layer = EU.RateMeLayer.create();
        if (layer) {
            scene.pushLayer(layer, true);
        }
    },
    /**
     *
     */
    cb_back: function () {
        cc.director.popScene();
    },
    /**
     *
     */
    cb_shop: function () {
        //TODO: iap shop
    },
    /**
     *
     */
    cb_paidversion: function () {
        //TODO: open url to paid version
        //openUrl( EU.k.paidVersionUrl );
    },
    /**
     *
     */
    cb_lab: function () {
        var scene = EU.Common.getSceneOfNode(this);
        var layer = new EU.Laboratory();
        scene.pushLayer(layer, true);
        EU.TutorialManager.dispatch("map_openlab");
    },
    /**
     *
     */
    cb_itemshop: function () {
        var scene = EU.Common.getSceneOfNode(this);
        var layer = new EU.ItemShop();
        scene.pushLayer(layer, true);
        EU.TutorialManager.dispatch("map_openitemshop");
    },
    /**
     *
     * @param mode
     */
    cb_game: function (mode) {
        var choose = EU.Common.getSceneOfNode(this).getChildByName("choose");
        if (this.menuLocations)
            this.menuLocations.setEnabled(false);

        var cost = EU.LevelParams.getFuel(this.selectedLevelIndex, false);
        var fuel = EU.ScoreCounter.getMoney(EU.kScoreFuel);
        if (fuel < cost) {
            if (!EU.k.useInapps || !EU.TutorialManager.dispatch("map_haventfuel")) {
                this.cb_shop();
                if (EU.k.useInapps == false) {
                    this.menuLocations.setEnabled(true);
                }
            }
            if (choose)
                choose.runEvent("onexit");
        }
        else {
            EU.TutorialManager.dispatch("map_rungame");
            this.updateLocations = true;
            this.runLevel(this.selectedLevelIndex, mode);
            if (choose)
                choose.removeFromParent(true);
            this.showLaboratoryOnEnter = true;
        }
    },
    /**
     *
     */
    cb_gameNormalMode: function () {
        this.cb_game(EU.GameMode.normal);
    },
    /**
     *
     */
    cb_gameHardMode: function () {
        this.cb_game(EU.GameMode.hard);
    },
    /**
     *
     * @param menuItem
     */
    cb_showChoose: function (menuItem) {
        var name = menuItem.getName();
        var index = parseInt(name.substr(4));//"flag[0..24]"
        this.selectedLevelIndex = index;

        var layer = this.buildChooseWindow(index);
        if (layer) {
            var scene = EU.Common.getSceneOfNode(this);
            EU.assert(scene);
            scene.pushLayer( layer, true );
            EU.TutorialManager.dispatch("map_onchoose");
        }
        else {
            this.cb_gameNormalMode();
        }
    },
    /**
     *
     * @param menuitem
     */
    cb_heroroom: function (menuitem) {
        var window = new EU.SelectHero();
        if (window) {
            var scene = EU.Common.getSceneOfNode(this);
            scene.pushLayer(window, true);
            EU.TutorialManager.dispatch("map_openheroes");
        }
    },
    /**
     *
     * @param levelIndex
     * @param mode
     */
    runLevel: function (levelIndex, mode) {
        if (levelIndex < this.locations.length) {
            //var scene = new EU.LoadLevelScene(levelIndex, mode);
            var scene = EU.GameGS.createScene();
            EU.GameGSInstance.getGameBoard().loadLevel( levelIndex, mode );
            cc.director.pushScene(scene);
        }
        else {
            //TODO: AutoPlayer
            //var player = AutoPlayer.getInstance();
            //if( player )
            //{
            //    cc.director.getScheduler().unscheduleAllForTarget( player );
            //    player.release();
            //}
        }
        //EU.UserData.save();
    },
    /**
     *
     */
    activateLocations: function () {
        for (var i = 0; i < this.curveMarkers; ++i) {
            var node = this.curveMarkers
            node.removeFromParent(true);
        }
        this.curveMarkers.length = 0;

        var passed = EU.UserData.level_getCountPassed();
        this.menuLocations.removeAllChildren();

        var showpath = false;
        var key = "map_level_" + passed.toString() + "_pathshowed";
        showpath = EU.UserData.get_int(key) == 0;

        var predelayLastFlagAppearance = (showpath && passed > 0) ? 4 : 0.5;
        EU.xmlLoader.macros.set("flag_delay_appearance", predelayLastFlagAppearance.toString());

        for (var i = 0; i < this.locations.length && i <= passed; ++i) {
            var flag = this.createFlag(i);
            this.menuLocations.addChild(flag);
            this.buildCurve(i, showpath && i == passed);

            if (this.locations[i].starsForUnlock > 0) {
                EU.TutorialManager.dispatch("unlocked_location");
            }
        }
        EU.xmlLoader.macros.erase("flag_delay_appearance");
        EU.UserData.write(key, 1);
        this.updateLocations = false;
    },
    /**
     *
     * @param a
     * @param b
     * @param c
     * @param d
     * @returns {Array}
     */
    buildPoints: function (a, b, c, d) {
        var points = [];
        var times = []

        function push(time, point) {
            points.push(point);
            times.push(time);
        };
        function insert(pos, time, point) {
            points.splice(pos, point);
            times.splice(pos, time);
        };
        function K(L, R, S) {
            var d0 = EU.Common.pointDiff(S, L);
            var d1 = EU.Common.pointDiff(R, S);
            if (EU.Common.pointLength(d0) < 5)
                return false;
            var k0 = d0.y == 0 ? 0 : d0.x / d0.y;
            var k1 = d1.y == 0 ? 0 : d1.x / d1.y;
            return Math.abs(k0 - k1) > 0.2;
        };

        push(0.00, EU.compute_bezier(a, b, c, d, 0.00));
        push(0.25, EU.compute_bezier(a, b, c, d, 0.25));
        push(0.50, EU.compute_bezier(a, b, c, d, 0.50));
        push(0.75, EU.compute_bezier(a, b, c, d, 0.75));
        push(1.00, EU.compute_bezier(a, b, c, d, 1.00));

        var exit2 = false;
        var currentIndex = 0;
        while (currentIndex < points.length - 1) {
            exit2 = true;
            var L = points[currentIndex];
            var R = points[currentIndex + 1];
            var Ltime = times[currentIndex];
            var Rtime = times[currentIndex + 1];
            do
            {
                var t = (Ltime + Rtime) / 2;
                var p = EU.compute_bezier(a, b, c, d, t);
                if (K(L, R, p)) {
                    insert(currentIndex + 1, t, p);
                    exit2 = false;
                }
                else {
                    exit2 = true;
                }
                Rtime = t;
                R = p;
            }
            while (!exit2);
            ++currentIndex;
        }

        var points2 = [];
        var P = points[0];
        var index = 1;
        var D = 18;
        var E = 0;
        for (; index < points.length; ++index) {
            var r = EU.Common.pointDiff(points[index], P);
            while (EU.Common.pointLength(r) > D - E) {
                var rn = EU.Common.pointNormalized(r);
                P = cc.p(P.x + rn.x * D, P.y + rn.y * D);
                points2.push(P);
                E = 0;
                r = EU.Common.pointDiff(points[index], P);
            }
            E += EU.Common.pointLength(r);
        }

        return points2;
    },
    /**
     *
     * @param index
     * @param showpath
     */
    buildCurve: function (index, showpath) {
        var passed = EU.UserData.level_getCountPassed();
        var availabled = index <= passed;
        if (index == 0) return;
        if (availabled == false) return;
        var a = this.locations[index - 1].pos;
        var b = this.locations[index - 1].a;
        var c = this.locations[index - 1].b;
        var d = this.locations[index].pos;


        var points = this.buildPoints(a, b, c, d);
        var iteration = 0;
        var kdelay = 2 / points.length;
        for (var i = 0; i < points.length; ++i) {
            var point = points[i];
            var pointSprite = EU.ImageManager.sprite("images/map/point.png");
            pointSprite.setName("point");
            pointSprite.setPosition(point);
            this.map.addChild(pointSprite);
            this.curveMarkers.push(pointSprite);

            if (showpath) {
                var delay = cc.delayTime(iteration * kdelay + 2);
                var scale = cc.scaleTo(0.2, 1).easing(cc.easeBackOut());
                var action = cc.sequence(delay, scale);

                pointSprite.setScale(0);
                pointSprite.runAction(action);
            }
            ++iteration;
        }

    },
    /**
     *
     * @param index
     * @returns {*}
     */
    createFlag: function (index) {
        var location = this.locations[index];
        var position = location.pos;
        var passed = EU.UserData.level_getCountPassed();
        var levelStars = EU.UserData.level_getScoresByIndex(index);
        var levelStartIncludeHardMode = EU.UserData.get_int(EU.k.LevelStars + index.toString());
        var levelLocked = location.starsForUnlock > 0;
        levelLocked = levelLocked && (EU.UserData.get_bool(EU.k.LevelUnlocked + index.toString()) == false);
        if (EU.k.useStarsForUnlock == false) {
            levelLocked = false;
        }

        var path;
        var callback = null;
        var flagResource;
        flagResource = "flag_" + (levelStartIncludeHardMode <= 3 ? levelStartIncludeHardMode.toString() : "hard" );
        if (index < passed) {
            path = "ini/map/flag.xml";
        }
        else if (levelLocked) {
            path = "ini/map/flag_locked.xml";
            position = location.posLock;
        }
        else {
            path = "ini/map/flag2.xml";
        }

        if (levelLocked == false) {
            callback = this.cb_showChoose;
        }

        EU.xmlLoader.macros.set("flag_position", EU.Common.pointToStr(position));
        EU.xmlLoader.macros.set("flag_image", flagResource);
        var flag = EU.xmlLoader.load_node_from_file(path);
        EU.xmlLoader.macros.erase("flag_position");
        EU.xmlLoader.macros.erase("flag_image");

        flag.setName("flag" + index.toString());
        flag.setCallback(callback, this);

        if (EU.UserData.get_int("map_level_appearance" + index.toString() + "_" + levelStars.toString()) == 0) {
            if (index != passed) {
                EU.UserData.write("map_level_appearance" + index.toString() + "_" + levelStars.toString(), 1);
            }
            flag.runEvent("star" + levelStars.toString() + "_show");
        }
        else {
            flag.runEvent("star" + levelStars.toString());
        }

        flag.setPosition(position);

        return flag;
    },
    /**
     *
     * @param level
     * @returns {*}
     */
    buildChooseWindow: function (level) {
        function load() {
            var layer = EU.xmlLoader.load_node_from_file("ini/map/choose.xml");
            return layer;
        }

        function buildCloseMenu(layer) {
            var item = cc.MenuItemSprite.create(EU.ImageManager.sprite("images/square.png"),
                EU.ImageManager.sprite("images/square.png"), layer.removeFromParent.bind(layer, true), layer);
            item.getNormalImage().setOpacity(1);
            item.getSelectedImage().setOpacity(1);
            item.setScale(9999);
            var menu = cc.Menu.create(item);
            layer.addChild(menu, -9999);
        }

        function buildPreviewLevel(layer) {
            var kWidthPreview = 280;
            var kHeightPreview = 270;
            var levelindex = level + 1;
            var image = "images/maps/map" + levelindex + ".jpg";
            var sprite = EU.ImageManager.sprite(image);
            var sx = kWidthPreview / sprite.getContentSize().width;
            var sy = kHeightPreview / sprite.getContentSize().height;
            sprite.setScale(sx, sy);
            var preview = EU.Common.getNodeByPath(layer, "preview");
            preview.addChild(sprite, -1);
        }

        function setMacroses() {
            var costNormal = EU.LevelParams.getFuel(level, false);
            var costHard = EU.LevelParams.getFuel(level, true);
            var goldNorm = EU.LevelParams.getAwardGold(level, 3, false);
            var goldHard = EU.LevelParams.getAwardGold(level, 1, true);
            var gearNorm = EU.LevelParams.getStartGear(level, false);
            var gearHard = EU.LevelParams.getStartGear(level, true);
            var wavesNorm = EU.LevelParams.getWaveCount(level, false);
            var wavesHard = EU.LevelParams.getWaveCount(level, true);
            var livesNorm = EU.LevelParams.getLives(level, false);
            var livesHard = EU.LevelParams.getLives(level, true);
            var excludeNorm = "";
            var excludeHard = EU.LevelParams.getExclude(level, true);
            var caption = EU.Language.string("gamechoose_level") + ( level + 1 );
            EU.xmlLoader.macros.set("cost_normalmode", costNormal.toString());
            EU.xmlLoader.macros.set("cost_hardmode", costHard.toString());
            EU.xmlLoader.macros.set("gold_normalmode", goldNorm.toString());
            EU.xmlLoader.macros.set("gold_hardmode", goldHard.toString());
            EU.xmlLoader.macros.set("gear_normalmode", gearNorm.toString());
            EU.xmlLoader.macros.set("gear_hardmode", gearHard.toString());
            EU.xmlLoader.macros.set("waves_normalmode", wavesNorm.toString());
            EU.xmlLoader.macros.set("waves_hardmode", wavesHard.toString());
            EU.xmlLoader.macros.set("lives_normalmode", livesNorm.toString());
            EU.xmlLoader.macros.set("lives_hardmode", livesHard.toString());
            EU.xmlLoader.macros.set("exclude_normalmode", excludeNorm);
            EU.xmlLoader.macros.set("exclude_hardmode", excludeHard);
            EU.xmlLoader.macros.set("preview_caption", caption);
            EU.xmlLoader.macros.set("use_fuel", EU.Common.boolToStr(EU.k.useFuel));
            EU.xmlLoader.macros.set("unuse_fuel", EU.Common.boolToStr(!EU.k.useFuel));
        }

        function unsetMacroses() {
            EU.xmlLoader.macros.erase("cost_hardmode");
            EU.xmlLoader.macros.erase("cost_normalmode");
            EU.xmlLoader.macros.erase("gold_hardmode");
            EU.xmlLoader.macros.erase("gold_normalmode");
            EU.xmlLoader.macros.erase("gear_normalmode");
            EU.xmlLoader.macros.erase("gear_hardmode");
            EU.xmlLoader.macros.erase("waves_normalmode");
            EU.xmlLoader.macros.erase("waves_hardmode");
            EU.xmlLoader.macros.erase("lives_normalmode");
            EU.xmlLoader.macros.erase("lives_hardmode");
            EU.xmlLoader.macros.erase("exclude_normalmode");
            EU.xmlLoader.macros.erase("exclude_hardmode");
            EU.xmlLoader.macros.erase("preview_caption");
        }

        function buildStars(layer) {
            var starsN = 3;
            var starsH = EU.LevelParams.getMaxStars(level, true);
            var normalPositions = [];
            var hardPositions = [];
            var pNormal = layer.getChildByName("normal");
            var pHard = layer.getChildByName("hard");
            var image = pNormal.getParamCollection().get("starimage");
            normalPositions = EU.Common.split(normalPositions, pNormal.getParamCollection().get("star" + starsN.toString()));
            hardPositions = EU.Common.split(hardPositions, pHard.getParamCollection().get("star" + starsH.toString()));
            EU.assert(normalPositions.length == starsN);
            EU.assert(hardPositions.length == starsH);
            for (var i = 0; i < starsN; ++i) {
                var pos = EU.Common.strToPoint(normalPositions[i]);
                var star = EU.ImageManager.sprite(image);
                EU.assert(star);
                star.setPosition(pos);
                pNormal.getChildByName("stars").addChild(star);
            }
            for (var i = 0; i < starsH; ++i) {
                var pos = EU.Common.strToPoint(hardPositions[i]);
                var star = EU.ImageManager.sprite(image);
                EU.assert(star);
                star.setPosition(pos);
                pHard.getChildByName("stars").addChild(star);
            }
        }

        function checkHardMode(layer) {
            var pass = EU.UserData.level_getCountPassed();
            var locked = pass <= level;
            var hard = layer.getChildByName("hard");
            var hardlock = layer.getChildByName("hard_lock");
            hard.setVisible(!locked);
            hardlock.setVisible(locked);
        }

        setMacroses();
        EU.xmlLoader.bookDirectory(this);
        var layer = load();
        EU.xmlLoader.unbookDirectory();
        unsetMacroses();
        if (layer) {
            this.prepairNodeByConfiguration(layer);
            buildCloseMenu(layer);
            buildPreviewLevel(layer);
            buildStars(layer);
            checkHardMode(layer);
            //TODO: this.setKeyDispatcher(layer);
            layer.runEvent("onenter");
        }
        return layer;
    },
    //TODO: dispatch keyboard
    //void onKeyReleased( EventKeyboard.KeyCode keyCode, Event* event )
    //{
    //    if( keyCode == EventKeyboard.KeyCode.KEY_BACK )
    //        cc.director.popScene();
    //
    //    if( isTestDevice() && isTestModeActive() )
    //    {
    //        if( keyCode == EventKeyboard.KeyCode.KEY_F1 )
    //        {
    //            size_t pass = static_cast<size_t>(EU.UserData.level_getCountPassed());
    //            if( pass < this.locations.length )
    //            {
    //                pass = this.locations.length;
    //                EU.UserData.level_setCountPassed( pass );
    //                for( size_t i = 0; i < pass; ++i )
    //                {
    //                    EU.UserData.level_setScoresByIndex( i, 1 );
    //                }
    //                activateLocations();
    //            }
    //        }
    //        if( keyCode == EventKeyboard.KeyCode.KEY_F2 )
    //        {
    //            EU.ScoreCounter.addMoney( EU.kScoreCrystals, 1000, true );
    //        }
    //        if( keyCode == EventKeyboard.KeyCode.KEY_F3 )
    //        {
    //            EU.ScoreCounter.addMoney( EU.kScoreFuel, 50, true );
    //        }
    //        if( keyCode == EventKeyboard.KeyCode.KEY_1 ) { var player = AutoPlayer.create( true, true, 1, false ); player.retain(); }
    //        if( keyCode == EventKeyboard.KeyCode.KEY_2 ) { var player = AutoPlayer.create( true, false, 3, false ); player.retain(); }
    //        if( keyCode == EventKeyboard.KeyCode.KEY_3 ) { var player = AutoPlayer.create( false, false, 99, true ); player.retain(); }
    //        if( keyCode == EventKeyboard.KeyCode.KEY_4 ) { var player = AutoPlayer.create( false, false, 99, true ); player.retain(); player.setGameMode( EU.GameMode.hard ); }
    //    }
    //}
    //

    /**
     * Unused functions
     */
    //void createPromoMenu()
    //{
    //    var menu = getChildByName( "promomenu" );
    //    if( menu == null && BuyHeroMenu.isShow() )
    //    {
    //        var menu = BuyHeroMenu.create();
    //        if( menu )
    //            addChild( menu, 999 );
    //    }
    //    else if( menu && BuyHeroMenu.isShow() == false )
    //    {
    //        menu.removeFromParent(true);
    //    }
    //}
    //
    //void createDevMenu()
    //{
    //    if( isTestDevice() && isTestModeActive() )
    //    {
    //        var item = [this]( Menu * menu, var text, EventKeyboard.KeyCode key, var pos )
    //        {
    //            var sendKey = [this]( Ref* sender, EventKeyboard.KeyCode key )mutable
    //            {
    //                this.onKeyReleased( key, null );
    //            };
    //
    //            var i = MenuItemTextBG.create( text, Color4F.GRAY, Color3B.BLACK, std.bind( sendKey, std.placeholders._1, key ) );
    //            menu.addChild( i );
    //            i.setPosition( pos );
    //            i.setScale( 1.5f );
    //        };
    //
    //        var menu = Menu.create();
    //        menu.setPosition( 0, 0 );
    //        addChild( menu, 9999 );
    //        var pos( 150, 300 );
    //        float Y( 45 );
    //        item( menu, "Open All", EventKeyboard.KeyCode.KEY_F1, pos ); pos.y += Y;
    //        item( menu, "Gold", EventKeyboard.KeyCode.KEY_F2, pos ); pos.y += Y;
    //        item( menu, "Fuel", EventKeyboard.KeyCode.KEY_F3, pos ); pos.y += Y;
    //
    //        item( menu, "play current level", EventKeyboard.KeyCode.KEY_1, pos ); pos.y += Y;
    //        item( menu, "play all game", EventKeyboard.KeyCode.KEY_2, pos ); pos.y += Y;
    //        item( menu, "fast test all levels", EventKeyboard.KeyCode.KEY_3, pos ); pos.y += Y;
    //        item( menu, "fast test all hards", EventKeyboard.KeyCode.KEY_4, pos ); pos.y += Y;
    //    }
    //}
    //Layervarer buildUnlockWindow( var level )
    //{
    //    var load = [this]()
    //    {
    //        EU.xmlLoader.bookDirectory( this );
    //        var layer = EU.xmlLoader.load_node<LayerExt>( "ini/map/unlock.xml" );
    //        EU.xmlLoader.unbookDirectory();
    //        return layer;
    //    };
    //    var buildCloseMenu = [this]( LayerExt * layer )
    //    {
    //        var item = MenuItemImage.create( "images/square.png", "images/square.png", std.bind( [layer]( Ref* )mutable
    //        {
    //            layer.runEvent( "onexit" );
    //        },
    //        std.placeholders._1 ) );
    //        item.getNormalImage().setOpacity( 1 );
    //        item.getSelectedImage().setOpacity( 1 );
    //        item.setScale( 9999 );
    //        var menu = Menu.create( item, null );
    //        layer.addChild( menu, -9999 );
    //    };
    //    var buildIndicator = [this, level]( LayerExt*layer )
    //    {
    //        var indicator = layer.getChildByName<Sprite*>( "progress_frame" );
    //        EU.assert( indicator );
    //        Rect rect = indicator.getTextureRect();
    //        float defaultWidth = rect.size.width;
    //        var needStar = this.locations[level].starsForUnlock;
    //        var stars = EU.ScoreCounter.getMoney( EU.kScoreStars );
    //        float progress = std.min( 1.f, float( stars ) / float( needStar ) );
    //        float width = defaultWidth * progress;
    //        rect.size.width = width;
    //        indicator.setTextureRect( rect );
    //
    //        var label = layer.getChildByName<Label*>( "progress_text" );
    //        EU.assert( label );
    //        label.setString( intToStr( stars ) + "/" + intToStr( needStar ) );
    //
    //        var cost = static_cast<Label*>(layer.getChildByPath( "menu/unlock/normal/text" ));
    //        var cost2 = static_cast<Label*>(layer.getChildByPath( "menu/unlock_gray/normal/text" ));
    //        cost.setString( intToStr( needStar ) );
    //        cost2.setString( intToStr( needStar ) );
    //
    //        var button = static_cast(layer.getChildByPath( "menu/unlock" ));
    //        var button_gray = static_cast(layer.getChildByPath( "menu/unlock_gray" ));
    //        if( stars < needStar )
    //        {
    //            button.setVisible( false );
    //            button_gray.setVisible( true );
    //        }
    //    };
    //    var setMacroses = [level,this]()
    //    {
    //        EU.xmlLoader.macros.set( "unlock_image", this.this.locations[level].unlockFrame );
    //        EU.xmlLoader.macros.set( "unlock_text", this.this.locations[level].unlockText );
    //    };
    //
    //    var unsetMacroses = [level]()
    //    {
    //        EU.xmlLoader.macros.erase( "unlock_image" );
    //        EU.xmlLoader.macros.erase( "unlock_text" );
    //    };
    //
    //    setMacroses();
    //    var layer = load();
    //    unsetMacroses();
    //    if( layer )
    //    {
    //        buildCloseMenu( layer );
    //        buildIndicator( layer );
    //        layer.runEvent( "onenter" );
    //        setKeyDispatcher( layer );
    //    }
    //    return layer;
    //}
});
EU.NodeExt.call(EU.MapLayer.prototype);

/**
 * create scene of the world map
 * @returns {cc.Scene}
 */
EU.MapLayer.scene = function () {
    var layer = new EU.MapLayer();
    layer.init();
    var score = new EU.ScoreLayer();
    var scene = new EU.SmartScene(layer);
    scene.addChild( score, 999 );
    scene.setName( "MapScene" );
    return scene;
};
