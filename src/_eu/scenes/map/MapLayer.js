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

EU.MapLayerLocation = cc.Class.extend({
    pos : new cc.Point(0,0),
    posLock : new cc.Point(0,0),
    a : new cc.Point(0,0),
    b : new cc.Point(0,0),
    starsForUnlock : 0,
    ctor: function(){

    }
});

EU.MapLayerScrollTouchInfo = cc.Class.extend({
    ctor: function(){

    }
});

EU.MapLayer = cc.Layer.extend({
    map: null,
    menuLocations : null,
    velocity: new cc.Point(0,0),
    unfilteredVelocity: null,
    isTouching:null,
    locations: [],
    updateLocations: true,
    showLaboratoryOnEnter: false,
    curveMarkers: [],
    scrollInfo: null,
    selectedLevelIndex: -1,

    ctor: function() {
        this._super();
    },
    init: function(){
        this.setName( "maplayer" );

        //this.setKeyboardEnabled( true );

        this._params = new EU.ParamCollection();
        this.load_str( "ini/map/maplayer.xml" );
        this.prepairNodeByConfiguration( this );

        this.map = this.getChildByName( "map" );

        this.scrollInfo = new EU.MapLayerScrollTouchInfo();
        this.scrollInfo.node = this.map;

        this.menuLocations = cc.Menu.create();
        this.menuLocations.setName( "locations" );
        this.menuLocations.setPosition( 0, 0 );
        this.map.addChild( this.menuLocations, 1 );

        var scale = cc.director.getWinSize().height / this.map.getContentSize().height;
        this.map.setScale( scale );

        this.removeUnUsedButtons();
        this.activateLocations();

        //TODO: touch lostener
        //var touchL = cc.EventListenerTouchAllAtOnce.create();
        //touchL.onTouchesBegan = CC_CALLBACK_2( scrollBegan, this );
        //touchL.onTouchesMoved = CC_CALLBACK_2( scrollMoved, this );
        //touchL.onTouchesEnded = CC_CALLBACK_2( scrollEnded, this );
        //_eventDispatcher.addEventListenerWithSceneGraphPriority( touchL, this );


        //createDevMenu();

        //MouseHoverScroll.shared().setScroller( this.scrollInfo );
        //MouseHoverScroll.shared().setNode( this.map );
    },
    //~MapLayer()
    //{
    //    MouseHoverScroll.shared().setNode( null );
    //    MouseHoverScroll.shared().setScroller( null );
    //}
    prepairNodeByConfiguration: function( nodeext )
    {
        if( nodeext == null )
            return;
        var node = nodeext.as_node_ref();
        var pathToLeaderboards = nodeext.getParamCollection().get( "pathto_leaderboards", "unknowpath" );
    
        var leaderboards = EU.Common.getNodeByPath( node, pathToLeaderboards );
        if( leaderboards )
            leaderboards.setVisible( EU.k.useLeaderboards );
    },
    
    displayLeaderboardScore: function()
    {
        //TODO: leaderboards
        //var pathto_score = this.getParamCollection().get( "pathto_leaderboardsscore", "unknowpath" );
        //var scoreNode = getNodeByPath( this, pathto_score );
        //if( scoreNode )
        //{
        //    var score = EU.Leaderboard.getScoreGlobal();
        //    var string = intToStr( score );
        //    var k = string.size();
        //    while( k > 3 )
        //    {
        //        k -= 3;
        //        string.insert( k, " " );
        //    }
        //
        //    scoreNode.setString( cc.Language.word("leaderboard_score") + string );
        //}
    },
    
    removeUnUsedButtons: function()
    {
        var menu = this.getChildByName( "menu" );
        if( menu )
        {
            var shop = menu.getChildByName( "shop" );
            var paid = menu.getChildByName( "paid" );
            var heroes = menu.getChildByName("heroes");

            //TODO: apply configurations
            //if( paid && EU.k.useLinkToPaidVersion == false )
            //    paid.setVisible( false );
            //if( shop && EU.k.useInapps == false ) {
            //    shop.setVisible( false );
            //    var ishop = menu.getChildByName("itemshop");
            //    ishop.setPosition(shop.getPosition());
            //}
            //if (heroes && EU.k.useHero == false)
            //    heroes.setVisible(false);
        }
    },

    onEnter: function()
    {
        cc.Layer.prototype.onEnter.call(this);

        this.scheduleUpdate();
        //MouseHoverScroll.shared().enable();

        //TODO: audio
        //AudioEngine.shared().playMusic( kMusicMap );

        if (EU.k.useInapps == false) {
            var scene = EU.Common.getSceneOfNode(this);
            var scores = scene.getChildByName("scorelayer");
            if(scores)
            {
                var menu = scores.getChildByName("menu");
                var shop = menu.getChildByName("shop");
                if (shop) {
                    shop.setVisible(false);
                    shop.setPositionY(-9999);
                }
            }
        }

        var result = EU.UserData.get_int( EU.k.LastGameResult, EU.k.GameResultValueNone );
        if( result == EU.k.GameResultValueWin )
            this.activateLocations();

        if( this.menuLocations )
            this.menuLocations.setEnabled( true );


        var notifyOnEnter = function(){
            EU.TutorialManager.dispatch( "map_onenter" );
        };
        var notifyGameResult = function(mapLayer){

            var dispatched = false;

            var countlose = EU.UserData.get_int( "lose_counter", 0 );
            var result = EU.UserData.get_int( EU.k.LastGameResult, EU.k.GameResultValueNone );

            if( result == EU.k.GameResultValueWin )
            {
                countlose = 0;

                var towers = [];
                EU.mlTowersInfo.fetch( towers );
                var towername = towers[0];
                var level = EU.UserData.tower_upgradeLevel( towername );
                var scores = EU.ScoreCounter.getMoney( kScoreCrystals );
                var cost = EU.mlTowersInfo.getCostLab( towername, level + 1 );
                if(level < 3 && cost <= scores )
                {
                    dispatched = EU.TutorialManager.dispatch( "map_afterwin" );
                }
                if( dispatched == false )
                {
                    dispatched = EU.TutorialManager.dispatch( "map_showheroroom" );
                }
                if( dispatched == false ) {
                    if (EU.k.useInapps) {
                        //prevent showing lab when shop is not able
                        dispatched = EU.TutorialManager.dispatch( "map_afterwin_force" );
                    } else {
                        dispatched = true;
                    }
                }
            }
            if( result == EU.k.GameResultValueFail )
            {
                countlose++;
                dispatched = EU.TutorialManager.dispatch( "map_afterlose" );
            }
            if( countlose > 0 )
            {
                if( EU.TutorialManager.dispatch( "map_losenumber" + countlose.toString() ) )
                {
                    dispatched = true;
                    countlose = 0;
                }
                EU.UserData.write( "lose_counter", countlose );
            }
            EU.UserData.write( EU.k.LastGameResult, EU.k.GameResultValueNone );


            if( !dispatched && mapLayer.showLaboratoryOnEnter )
            {
                mapLayer.showLaboratoryOnEnter = false;
                var run = function(mapLayer)
                {
                    var maxlevel = true;
                    var towers = []
                    mlTowersInfo.fetch( towers );
                    for( var tower in towers )
                    maxlevel = maxlevel && EU.UserData.tower_upgradeLevel(tower) == 5;
                    if( !maxlevel )
                    {
                        mapLayer.cb_lab( null );
                    }
                };
                mapLayer.runAction( new cc.CallFunc( run, mapLayer ) )
            }

        };

        this.runAction( new cc.CallFunc( notifyOnEnter, this ) );

        var levelResult = EU.UserData.get_int( EU.k.LastGameResult, EU.k.GameResultValueNone );
        var leveFinished =
            levelResult == EU.k.GameResultValueWin ||
            levelResult == EU.k.GameResultValueFail;
        if( leveFinished )
        {
            this.runAction( new cc.CallFunc( notifyGameResult, this, this ) );
        }

        if (levelResult == EU.k.GameResultValueWin) {
            this.openRateMeWindowIfNeeded();
        }

        this.displayLeaderboardScore();
        //this.createPromoMenu();
    },
    onExit: function()
    {
        cc.Layer.prototype.onExit.call(this);
        this.unscheduleUpdate();
        //MouseHoverScroll.shared().disable();
    },
    load_xmlnode2: function( root )
    {
        this.load_xmlnode( root );

        var xmlnode = root.getElementsByTagName("locations");
        var xmlentity = (xmlnode && xmlnode.length > 0) ? xmlnode[0] : null;
        if(xmlentity)
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

    get_callback_by_description: function( name )
    {
        if( name == "back" ) return this.cb_back
        else if( name == "laboratory" ) return this.cb_lab;
        else if( name == "itemshop" )return this.cb_itemshop;
        else if( name == "shop" )return this.cb_shop;
        else if( name == "heroes" )return this.cb_heroroom;
        //TODO: move to cb_heroroom
        //{
        //    var cb = [this](Ref*)
        //    {
        //        var window = SelectHero.create();
        //        if( window )
        //        {
        //            SmartScene * scene = dynamic_cast<SmartScene*>(getScene());
        //            scene.pushLayer( window, true );
        //            EU.TutorialManager.dispatch( "map_openheroes" );
        //        }
        //    };
        //    return std.bind( cb, std.placeholders._1 );
        //}
        else if( name == "paidversion" ) return this.cb_paidversion;
        else if( name == "pushgame_normalmode" ) return this.cb_gameNormalMode;
        else if( name == "pushgame_hardmode" ) return this.cb_gameHardMode;
        else if( name == "unlock" ) return this.cb_unlock;
        //TODO: leaderboard
        //else if( name == "leaderboard" ) this.leaderboardOpenGLobal,
        return null;
    },
    
    scrollBegan: function( touches, event )
    {
        var touch = touches[0];
        this.scrollInfo.node = this.map;
        this.scrollInfo.nodeposBegan = this.map.getPosition();
        this.scrollInfo.touchBegan = touch.getLocation();
        this.scrollInfo.touchID = touch.getID();
        this.isTouching = true;
    },
    scrollMoved: function( touches, event )
    {
        var touch = touches[0];
        if( touch && this.scrollInfo.node )
        {
            var location = touch.getLocation();
            var shift = location - this.scrollInfo.touchBegan;
            var pos = this.scrollInfo.nodeposBegan + shift;
            var winsize = cc.director.getWinvar();
            var fitpos = this.scrollInfo.fitPosition( pos, winsize );
    
            this.scrollInfo.lastShift = new cc.Point( 0, 0 );
            this.scrollInfo.node.setPosition( fitpos );
    
            this.unfilteredVelocity = shift;
        }
    },
    scrollEnded: function( touches, event )
    {
        this.isTouching = false;
        this.velocity *= 0.2;
    },
    mouseHover: function(event)
    {
    },
    update: function(delta)
    {
        if (this.isTouching)
        {
            var kFilterAmount = 0.25;
            this.velocity = (this.velocity * kFilterAmount) + (this.unfilteredVelocity * (1.0 - kFilterAmount));
            this.unfilteredVelocity = new cc.Point(0,0);
        }
        else
        {
            if (!this.scrollInfo.node) return;
            this.velocity *= 0.95;

            if (EU.Common.pointLength(this.velocity) > 0.01)
            {
                var winsize = cc.director.getWinSize();
                var pos = this.scrollInfo.node.getPosition() + this.velocity;
                var fitpos = this.scrollInfo.fitPosition(pos, winsize);
                this.scrollInfo.node.setPosition(fitpos);
            }
        }
        //MouseHoverScroll.shared().update( delta );
    },
    showWindow: function( window )
    {
        var dessize = cc.director.getWinSize();

        var scene = EU.Common.getSceneOfNode(this)
        scene.addChild( window, this.getLocalZOrder() + 2 );
        onExit();

        var shadow = ImageManager.sprite( kPathSpriteSquare );
        if( shadow )
        {
            shadow.setName( "shadow" );
            shadow.setScaleX( dessize.width );
            shadow.setScaleY( dessize.height );
            shadow.setColor( new cc.Color( 0, 0, 0 ) );
            shadow.setOpacity( 0 );
            shadow.setPosition( dessize.x / 2,dessize.y / 2 );
            scene.addChild( shadow, this.getLocalZOrder() + 1 );
            shadow.runAction( FadeTo.create( 0.2, 204 ) );
        }
    },
    windowDidClosed: function()
    {
        onEnter();

        var scene = EU.Common.getSceneOfNode();
        var shadow = scene.getChildByName( "shadow" );
        if( shadow )
        {
            var a0 = new cc.FadeTo( 0.2, 0 );
            var a1 = new cc.CallFunc( shadow.removeFromParent, shadow );
            shadow.runAction( new cc.Sequence( a0, a1 ) );
        }
    },
    openRateMeWindowIfNeeded: function()
    {
        if (!EU.k.useRateMe)
            return;

        var wincounter = EU.UserData.get_int(k.user.GameWinCounter);
        if (wincounter % 3)
            return;

        //open RateMe with delay
        var call = new cc.CallFunc( this.openRateMe, this );
        var delay = DelayTime.create(0.3);
        this.runAction( new cc.Sequence(delay, call) );
    },
    openRateMe: function()
    {
        var scene = EU.Common.getSceneOfNode()
        var layer = EU.RateMeLayer.create();
        if (layer) {
            scene.pushLayer(layer, true);
        }
    },
    cb_back: function()
    {
        cc.director.popScene();
    },
    cb_shop: function()
    {
        //TODO: iap shop
    },
    cb_paidversion: function()
    {
        //TODO: open url to paid version
        //openUrl( EU.k.paidVersionUrl );
    },
    cb_lab: function()
    {
        var scene = EU.Common.getSceneOfNode(this);
        var layer = new EU.Laboratory();
        scene.pushLayer( layer, true );
        EU.TutorialManager.dispatch( "map_openlab" );
    },
    cb_itemshop: function()
    {
        var scene = EU.Common.getSceneOfNode(this);
        var layer = ItemShop.create();
        scene.pushLayer( layer, true );
        EU.TutorialManager.dispatch( "map_openitemshop" );
    },
    cb_game: function(){
        var choose = EU.Common.getSceneOfNode(this).getChildByName("choose");
        if( this.menuLocations )
            this.menuLocations.setEnabled( false );

        var cost = EU.LevelParams.getFuel( this.selectedLevelIndex, false );
        var fuel = EU.ScoreCounter.getMoney( kScoreFuel );
        if( fuel < cost )
        {
            if(!EU.k.useInapps || !EU.TutorialManager.dispatch( "map_haventfuel" ) )
            {
                this.cb_shop( sender );
                if( EU.k.useInapps == false )
                {
                    this.menuLocations.setEnabled( true );
                }
            }
            if( choose )
                choose.runEvent( "onexit" );
        }
        else
        {
            EU.TutorialManager.dispatch( "map_rungame" );
            this.updateLocations = true;
            this.runLevel( this.selectedLevelIndex, mode );
            if( choose )
                choose.removeFromParent();
            this.showLaboratoryOnEnter = true;
        }
    },
    cb_gameNormalMode: function()
    {
        this.cb_game( EU.GameMode.normal );
    },
    cb_gameHardMode: function()
    {
        this.cb_game( EU.GameMode.hard );
    },
    cb_showChoose: function( menuItem )
    {
        var name = menuItem.getName();
        var index = name.substr( 4 );//"flag[0..24]"
        this.selectedLevelIndex = index;

        var layer = this.buildChooseWindow( index );
        if( layer )
        {
            var scene = EU.Common.getSceneOfNode( this );
            EU.assert( scene );
            scene.pushLayer( layer, true );
            EU.TutorialManager.dispatch( "map_onchoose" );
        }
        else
        {
            this.cb_gameNormalMode();
        }
    },
    runLevel: function( levelIndex, mode )
    {
        if( levelIndex < this.locations.length )
        {
            var loadScene = EU.LoadLevelScene.create( levelIndex, mode );
            cc.director.pushScene( loadScene );
        }
        else
        {
            //TODO: AutoPlayer
            //var player = AutoPlayer.getInstance();
            //if( player )
            //{
            //    cc.director.getScheduler().unscheduleAllForTarget( player );
            //    player.release();
            //}
        }
        EU.UserData.save();
    },
    activateLocations: function()
    {
        for( var i=0; i < this.curveMarkers; ++i )
        {
            var node = this.curveMarkers
            node.removeFromParent();
        }
        this.curveMarkers.length = 0;

        var passed = EU.UserData.level_getCountPassed();
        this.menuLocations.removeAllChildren();

        var showpath = false;
        var key = "map_level_" + passed.toString() + "_pathshowed";
        showpath = EU.UserData.get_int( key ) == 0;

        var predelayLastFlagAppearance = (showpath && passed > 0) ? 4 : 0.5;
        EU.xmlLoader.macros.set( "flag_delay_appearance", predelayLastFlagAppearance.toString() );

        for( var i = 0; i < this.locations.length && i <= passed; ++i )
        {
            var flag = this.createFlag( i );
            this.menuLocations.addChild(flag);
            this.buildCurve( i, showpath && i == passed );

            if( this.locations[i].starsForUnlock > 0 )
            {
                EU.TutorialManager.dispatch( "unlocked_location" );
            }
        }
        EU.xmlLoader.macros.erase( "flag_delay_appearance" );
        EU.UserData.write( key, 1 );
        this.updateLocations = false;
    },
    buildPoints: function( a, b, c, d )
    {
        var points = [];
        var times = []
        function push( time, point )
        {
            points.push( point );
            times.push( time );
        };
        function insert( pos, time, point )
        {
            points.splice( pos, point );
            times.splice( pos, time );
        };
        function K( L, R, S )
        {
            var d0 = EU.Common.pointDiff(S, L);
            var d1 = EU.Common.pointDiff(R, S);
            if( EU.Common.pointLength(d0) < 5 )
                return false;
            var k0 = d0.y == 0 ? 0 : d0.x / d0.y;
            var k1 = d1.y == 0 ? 0 : d1.x / d1.y;
            return Math.abs( k0 - k1 ) > 0.2;
        };

        push( 0.00, EU.compute_bezier( a, b, c, d, 0.00 ) );
        push( 0.25, EU.compute_bezier( a, b, c, d, 0.25 ) );
        push( 0.50, EU.compute_bezier( a, b, c, d, 0.50 ) );
        push( 0.75, EU.compute_bezier( a, b, c, d, 0.75 ) );
        push( 1.00, EU.compute_bezier( a, b, c, d, 1.00 ) );

        var exit2 = false;
        var currentIndex = 0;
        while( currentIndex < points.length - 1 )
        {
            exit2 = true;
            var L = points[currentIndex];
            var R = points[currentIndex + 1];
            var Ltime = times[currentIndex];
            var Rtime = times[currentIndex + 1];
            do
            {
                var t = (Ltime + Rtime) / 2;
                var p = EU.compute_bezier( a, b, c, d, t );
                if( K( L, R, p ) )
                {
                    insert( currentIndex + 1, t, p );
                    exit2 = false;
                }
                else
                {
                    exit2 = true;
                }
                Rtime = t;
                R = p;
            }
            while( !exit2 );
            ++currentIndex;
        }

        var points2 = [];
        var P = points[0];
        var index = 1;
        var D = 18;
        var E = 0;
        for( ; index < points.length; ++index )
        {
            var r = EU.Common.pointDiff(points[index], P);
            while( EU.Common.pointLength(r) > D - E )
            {
                var rn = EU.Common.pointNormalized(r);
                P = new cc.Point(P.x + rn.x * D, P.y + rn.y * D);
                points2.push( P );
                E = 0;
                r = EU.Common.pointDiff(points[index], P);
            }
            E += EU.Common.pointLength(r);
        }

        return points2;
    },
    buildCurve: function( index, showpath )
    {
        var passed = EU.UserData.level_getCountPassed();
        var availabled = index <= passed;
        if( index == 0 ) return;
        if( availabled == false ) return;
        var a = this.locations[index - 1].pos;
        var b = this.locations[index - 1].a;
        var c = this.locations[index - 1].b;
        var d = this.locations[index].pos;


        var points = this.buildPoints( a, b, c, d );
        var iteration = 0;
        var kdelay = 2 / points.length;
        for( var i=0; i < points.length; ++i )
        {
            var point = points[i];
            var pointSprite = EU.ImageManager.sprite( "images/map/point.png" );
            pointSprite.setName("point");
            pointSprite.setPosition( point );
            this.map.addChild( pointSprite );
            this.curveMarkers.push( pointSprite );

            if( showpath )
            {
                var delay = new cc.DelayTime( iteration* kdelay + 2 );
                var scale = new cc.EaseBackOut( new cc.ScaleTo( 0.2, 1 ) );
                var action = new cc.Sequence( delay, scale );

                pointSprite.setScale( 0 );
                pointSprite.runAction( action );
            }
            ++iteration;
        }

    },
    createFlag: function( index )
    {
        var location = this.locations[index];
        var position = location.pos;
        var passed = EU.UserData.level_getCountPassed();
        var levelStars = EU.UserData.level_getScoresByIndex( index );
        var levelStartIncludeHardMode = EU.UserData.get_int( EU.k.LevelStars + index.toString() );
        var levelLocked = location.starsForUnlock > 0;
        levelLocked = levelLocked && (EU.UserData.get_bool( EU.k.LevelUnlocked + index.toString() ) == false);
        if( EU.k.useStarsForUnlock == false )
        {
            levelLocked = false;
        }
    
        var path;
        var callback = null;
        var flagResource;
        flagResource = "flag_" + (levelStartIncludeHardMode <= 3 ? levelStartIncludeHardMode.toString() : "hard" );
        if( index < passed )
        {
            path = "ini/map/flag.xml";
        }
        else if( levelLocked )
        {
            path = "ini/map/flag_locked.xml";
            position = location.posLock;
        }
        else
        {
            path = "ini/map/flag2.xml";
        }
    
        if( levelLocked == false )
        {
            callback = this.cb_showChoose;
        }
    
        EU.xmlLoader.macros.set( "flag_position", EU.Common.pointToStr( position ) );
        EU.xmlLoader.macros.set( "flag_image", flagResource );
        var flag = EU.xmlLoader.load_node_from_file( path );
        EU.xmlLoader.macros.erase( "flag_position" );
        EU.xmlLoader.macros.erase( "flag_image" );

        flag.setName( "flag" + index.toString() );
        flag.setCallback( callback, this );
    
        if( EU.UserData.get_int( "map_level_appearance" + index.toString() + "_" + levelStars.toString() ) == 0 )
        {
            if( index != passed )
            {
                EU.UserData.write( "map_level_appearance" + index.toString() + "_" + levelStars.toString() , 1 );
            }
            flag.runEvent( "star" + levelStars.toString() + "_show" );
        }
        else
        {
            flag.runEvent( "star" + levelStars.toString() );
        }
    
        flag.setPosition( position );
    
        return flag;
    }
    //Layervarer buildChooseWindow( int level )
    //{
    //    var load = [this]()
    //    {
    //        EU.xmlLoader.bookDirectory( this );
    //        var layer = EU.xmlLoader.load_node<LayerExt>( "ini/map/choose.xml" );
    //        EU.xmlLoader.unbookDirectory();
    //        return layer;
    //    };
    //
    //    var buildCloseMenu = [this]( LayerExt * layer )
    //    {
    //        var item = MenuItemImage.create( "images/square.png", "images/square.png",
    //        std.bind( [layer]( Ref* )mutable
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
    //
    //    var buildPreviewLevel = [this, level]( Layer * layer )
    //    {
    //        const float kWidthPreview = 280;
    //        const float kHeightPreview = 270;
    //        var sprite = ImageManager.sprite( "images/maps/map" + intToStr( level + 1 ) + ".jpg" );
    //        var sx = kWidthPreview / sprite.getContentSize().width;
    //        var sy = kHeightPreview / sprite.getContentSize().height;
    //        sprite.setScale( sx, sy );
    //        var preview = getNodeByPath( layer, "preview" );
    //        preview.addChild( sprite, -1 );
    //    };
    //
    //    var setMacroses = [level]()
    //    {
    //        int costNormal = LevelParams.shared().getFuel( level, false );
    //        int costHard = LevelParams.shared().getFuel( level, true );
    //        int goldNorm = LevelParams.shared().getAwardGold( level, 3, false );
    //        int goldHard = LevelParams.shared().getAwardGold( level, 1, true );
    //        int gearNorm = LevelParams.shared().getStartGear( level, false );
    //        int gearHard = LevelParams.shared().getStartGear( level, true );
    //        int wavesNorm = LevelParams.shared().getWaveCount( level, false );
    //        int wavesHard = LevelParams.shared().getWaveCount( level, true );
    //        int livesNorm = LevelParams.shared().getLives( level, false );
    //        int livesHard = LevelParams.shared().getLives( level, true );
    //        var excludeNorm = "";
    //        var excludeHard = LevelParams.shared().getExclude(level, true);
    //        var caption = WORD("gamechoose_level") + intToStr( level + 1 );
    //        EU.xmlLoader.macros.set( "cost_normalmode", intToStr( costNormal ) );
    //        EU.xmlLoader.macros.set( "cost_hardmode", intToStr( costHard ) );
    //        EU.xmlLoader.macros.set( "gold_normalmode", intToStr( goldNorm ) );
    //        EU.xmlLoader.macros.set( "gold_hardmode", intToStr( goldHard ) );
    //        EU.xmlLoader.macros.set( "gear_normalmode", intToStr( gearNorm ) );
    //        EU.xmlLoader.macros.set( "gear_hardmode", intToStr( gearHard ) );
    //        EU.xmlLoader.macros.set( "waves_normalmode", intToStr( wavesNorm ) );
    //        EU.xmlLoader.macros.set( "waves_hardmode", intToStr( wavesHard ) );
    //        EU.xmlLoader.macros.set( "lives_normalmode", intToStr( livesNorm ) );
    //        EU.xmlLoader.macros.set( "lives_hardmode", intToStr( livesHard ) );
    //        EU.xmlLoader.macros.set( "exclude_normalmode", excludeNorm );
    //        EU.xmlLoader.macros.set( "exclude_hardmode", excludeHard );
    //        EU.xmlLoader.macros.set( "preview_caption", caption );
    //        EU.xmlLoader.macros.set( "use_fuel", boolToStr( EU.k.useFuel ) );
    //        EU.xmlLoader.macros.set( "unuse_fuel", boolToStr( !EU.k.useFuel ) );
    //    };
    //
    //    var unsetMacroses = [level]()
    //    {
    //        EU.xmlLoader.macros.erase( "cost_hardmode" );
    //        EU.xmlLoader.macros.erase( "cost_normalmode" );
    //        EU.xmlLoader.macros.erase( "gold_hardmode" );
    //        EU.xmlLoader.macros.erase( "gold_normalmode" );
    //        EU.xmlLoader.macros.erase( "gear_normalmode" );
    //        EU.xmlLoader.macros.erase( "gear_hardmode" );
    //        EU.xmlLoader.macros.erase( "waves_normalmode" );
    //        EU.xmlLoader.macros.erase( "waves_hardmode" );
    //        EU.xmlLoader.macros.erase( "lives_normalmode" );
    //        EU.xmlLoader.macros.erase( "lives_hardmode" );
    //        EU.xmlLoader.macros.erase( "exclude_normalmode" );
    //        EU.xmlLoader.macros.erase( "exclude_hardmode" );
    //        EU.xmlLoader.macros.erase( "preview_caption" );
    //    };
    //
    //    var buldStars = [level]( Layer * layer )
    //    {
    //        int starsN = 3;
    //        int starsH = LevelParams.shared().getMaxStars( level, true );
    //        std.list< var > normal;
    //        std.list< var > hard;
    //        var pNormal = dynamic_cast<NodeExt*>(layer.getChildByName( "normal" ));
    //        var pHard = dynamic_cast<NodeExt*>(layer.getChildByName( "hard" ));
    //        var image = pNormal.getParamCollection().at( "starimage" );
    //        split( normal, pNormal.getParamCollection().at( "star" + intToStr( starsN ) ) );
    //        split( hard, pHard.getParamCollection().at( "star" + intToStr( starsH ) ) );
    //        EU.assert( normal.size() == starsN );
    //        EU.assert( hard.size() == starsH );
    //        var it = normal.begin();
    //        for( int i = 0; i < starsN; ++i )
    //        {
    //            var pos = strTovar( *(it++) );
    //            Sprite * star = ImageManager.sprite( image );
    //            EU.assert( star );
    //            star.setPosition( pos );
    //            pNormal.getChildByPath( "stars" ).addChild( star );
    //        }
    //        it = hard.begin();
    //        for( int i = 0; i < starsH; ++i )
    //        {
    //            var pos = strTovar( *(it++) );
    //            Sprite * star = ImageManager.sprite( image );
    //            EU.assert( star );
    //            star.setPosition( pos );
    //            pHard.getChildByPath( "stars" ).addChild( star );
    //        }
    //    };
    //
    //    var checkHardMode = [level]( LayerExt*layer )
    //    {
    //        int pass = EU.UserData.level_getCountPassed();
    //        bool locked = pass <= level;
    //        var hard = layer.getChildByName( "hard" );
    //        var hardlock = layer.getChildByName( "hard_lock" );
    //        hard.setVisible( !locked );
    //        hardlock.setVisible( locked );
    //
    //    };
    //
    //    setMacroses();
    //    var layer = load();
    //    unsetMacroses();
    //    if( layer )
    //    {
    //        prepairNodeByConfiguration( layer );
    //        buildCloseMenu(layer);
    //        buildPreviewLevel(layer);
    //        buldStars(layer);
    //        checkHardMode(layer);
    //        setKeyDispatcher(layer);
    //        layer.runEvent("onenter");
    //    }
    //    return layer;
    //}
    //
    //Layervarer buildUnlockWindow( int level )
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
    //        int needStar = this.locations[level].starsForUnlock;
    //        int stars = EU.ScoreCounter.getMoney( kScoreStars );
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
    //
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
    //            EU.ScoreCounter.addMoney( kScoreCrystals, 1000, true );
    //        }
    //        if( keyCode == EventKeyboard.KeyCode.KEY_F3 )
    //        {
    //            EU.ScoreCounter.addMoney( kScoreFuel, 50, true );
    //        }
    //        if( keyCode == EventKeyboard.KeyCode.KEY_1 ) { var player = AutoPlayer.create( true, true, 1, false ); player.retain(); }
    //        if( keyCode == EventKeyboard.KeyCode.KEY_2 ) { var player = AutoPlayer.create( true, false, 3, false ); player.retain(); }
    //        if( keyCode == EventKeyboard.KeyCode.KEY_3 ) { var player = AutoPlayer.create( false, false, 99, true ); player.retain(); }
    //        if( keyCode == EventKeyboard.KeyCode.KEY_4 ) { var player = AutoPlayer.create( false, false, 99, true ); player.retain(); player.setGameMode( GameMode.hard ); }
    //    }
    //}
    //
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
    //        menu.removeFromParent();
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
});
EU.NodeExt.call(EU.MapLayer.prototype);

EU.MapLayer.scene = function(){
    var scene = new cc.Scene();
    var layer = new EU.MapLayer();
    layer.init();
    scene.addChild( layer );
    return scene;
};
