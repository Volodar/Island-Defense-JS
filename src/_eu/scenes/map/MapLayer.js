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
    velocity: null,
    unfilteredVelocity: null,
    isTouching:null,
    locations: [],
    updateLocations: true,
    showLaboratoryOnEnter: false,
    curveMarkers: [],
    scrollInfo: null,
    selectedLevelIndex: -1,

    ctor: function(){
        this._super();
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
        //this.activateLocations();

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
    
        var leaderboards = getNodeByPath( node, pathToLeaderboards );
        if( leaderboards )
            leaderboards.setVisible( EU.k.configuration.useLeaderboards );
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
            //if( paid && EU.k.configuration.useLinkToPaidVersion == false )
            //    paid.setVisible( false );
            //if( shop && EU.k.configuration.useInapps == false ) {
            //    shop.setVisible( false );
            //    var ishop = menu.getChildByName("itemshop");
            //    ishop.setPosition(shop.getPosition());
            //}
            //if (heroes && EU.k.configuration.useHero == false)
            //    heroes.setVisible(false);
        }
    },

    //onEnter: function()
    //{
    //    cc.Layer.prototype.onEnter.call(this);
    //
    //    this.scheduleUpdate();
    //    //MouseHoverScroll.shared().enable();
    //
    //    AudioEngine.shared().playMusic( kMusicMap );
    //
    //    if (k.configuration.useInapps == false) {
    //        var scene = getSceneOfNode(this);
    //        var scores = scene.getChildByName("scorelayer");
    //        if(scores)
    //        {
    //            var menu = scores.getChildByName("menu");
    //            var shop = menu.getChildByName("shop");
    //            if (shop) {
    //                shop.setVisible(false);
    //                shop.setPositionY(-9999);
    //            }
    //        }
    //    }
    //
    //    var result = EU.UserData.get_int( EU.k.user.LastGameResult, EU.k.user.GameResultValueNone );
    //    if( result == EU.k.user.GameResultValueWin )
    //        activateLocations();
    //
    //    if( this.menuLocations )
    //        this.menuLocations.setEnabled( true );
    //
    //
    //    var notifyOnEnter = function(){
    //        EU.TutorialManager.dispatch( "map_onenter" );
    //    };
    //    var notifyGameResult = function(maplayer){
    //
    //        var dispatched = false;
    //
    //        var countlose = EU.UserData.get_int( "lose_counter", 0 );
    //        var result = EU.UserData.get_int( EU.k.user.LastGameResult, EU.k.user.GameResultValueNone );
    //
    //        if( result == EU.k.user.GameResultValueWin )
    //        {
    //            countlose = 0;
    //
    //            towers = [];
    //            EU.mlTowersInfo.fetch( towers );
    //            var towername = towers.front();
    //            var level = EU.UserData.tower_upgradeLevel( towername );
    //            var scores = EU.ScoreCounter.getMoney( kScoreCrystals );
    //            var cost = mlTowersInfo.getCostLab( towername, level + 1 );
    //            if(level < 3 && cost <= scores )
    //            {
    //                dispatched = EU.TutorialManager.dispatch( "map_afterwin" );
    //            }
    //            if( dispatched == false )
    //            {
    //                dispatched = EU.TutorialManager.dispatch( "map_showheroroom" );
    //            }
    //            if( dispatched == false ) {
    //                if (k.configuration.useInapps) {
    //                    //prevent showing lab when shop is not able
    //                    dispatched = EU.TutorialManager.dispatch( "map_afterwin_force" );
    //                } else {
    //                    dispatched = true;
    //                }
    //            }
    //        }
    //        if( result == EU.k.user.GameResultValueFail )
    //        {
    //            countlose++;
    //            dispatched = EU.TutorialManager.dispatch( "map_afterlose" );
    //        }
    //        if( countlose > 0 )
    //        {
    //            if( EU.TutorialManager.dispatch( "map_losenumber" + intToStr( countlose ) ) )
    //            {
    //                dispatched = true;
    //                countlose = 0;
    //            }
    //            EU.UserData.write( "lose_counter", countlose );
    //        }
    //        EU.UserData.write( EU.k.user.LastGameResult, EU.k.user.GameResultValueNone );
    //
    //
    //        if( !dispatched && maplayer.showLaboratoryOnEnter )
    //        {
    //            maplayer.showLaboratoryOnEnter = false;
    //            var run = function(maplayer)
    //            {
    //                var maxlevel = true;
    //                var towers = []
    //                mlTowersInfo.fetch( towers );
    //                for( var tower in towers )
    //                maxlevel = maxlevel && EU.UserData.tower_upgradeLevel(tower) == 5;
    //                if( !maxlevel )
    //                {
    //                    maplayer.cb_lab( null );
    //                }
    //            };
    //            maplayer.runAction( new cc.CallFunc( run, maplayer ) )
    //        }
    //
    //    };
    //
    //    this.runAction( new cc.CallFunc( notifyOnEnter, this ) );
    //
    //    var levelResult = EU.UserData.get_int( EU.k.user.LastGameResult, EU.k.user.GameResultValueNone );
    //    var leveFinished =
    //        levelResult == EU.k.user.GameResultValueWin ||
    //        levelResult == EU.k.user.GameResultValueFail;
    //    if( leveFinished )
    //    {
    //        this.runAction( new cc.CallFunc( notifyGameResult, this, this ) );
    //    }
    //
    //    if (levelResult == EU.k.user.GameResultValueWin) {
    //        this.openRateMeWindowIfNeeded();
    //    }
    //
    //    this.displayLeaderboardScore();
    //    //this.createPromoMenu();
    //},
    onExit: function()
    {
        cc.Layer.prototype.onExit.call(this);
        this.unscheduleUpdate();
        //MouseHoverScroll.shared().disable();
    },
    load_xmlnode: function( root )
    {
        EU.NodeExt.prototype.load_xmlnode.call( this, root );

        var xmlLocations = root.child( "locations" );
        for(var i=0; i < xmlLocations.children.length; i++)
        {
            var xmlLocation = xmlLocations[i];
            var loc = new EU.MapLayerLocation;
            loc.pos = strTovar( xmlLocation.attribute( "pos" ).value );
            loc.posLock = strTovar( xmlLocation.attribute( "poslock" ).value );
            loc.a = strTovar( xmlLocation.attribute( "controlA" ).value );
            loc.b = strTovar( xmlLocation.attribute( "controlB" ).value );
            loc.starsForUnlock = strToInt( xmlLocation.attribute( "stars" ).value );

            this.locations[i]= loc;
        }
    },

    get_callback_by_description: function( name )
    {
        if( name == "back" ) return this.cb_back
        else if( name == "laboratory" ) return this.cb_lab;
        else if( name == "itemshop" )return this.cb_itemshop;
        else if( name == "shop" )return this.cb_shop;
        else if( name == "heroes" )return this.cb_heroroom;
        //TODO: move to cb_herorrom
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
            var winsize = cc.director.getOpenGLView().getDesignResolutionvar();

            if (this.velocity.getLength() > 0.01)
            {
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

        var scene = getSceneOfNode(this)
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

        var scene = getSceneOfNode();
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
        if (!k.configuration.useRateMe)
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
        var scene = getSceneOfNode()
        var layer = EU.RateMeLayer.create();
        if (layer) {
            scene.pushLayer(layer, true);
        }
    },
    cb_back: function()
    {
        cc.director.popScene();
    }
    //
    //void cb_shop( Ref*sender )
    //{
    //#if PC != 1
    //    var shop = ShopLayer.create(k.configuration.useFreeFuel, true, false, false);
    //    if( shop )
    //    {
    //        SmartScene * scene = dynamic_cast<SmartScene*>(getScene());
    //        scene.pushLayer( shop, true );
    //
    //        EU.TutorialManager.dispatch( "map_openshop" );
    //    }
    //#endif
    //}
    //
    //void cb_paidversion( Ref*sender )
    //{
    //    //openUrl( EU.k.configuration.paidVersionUrl );
    //    var layer = BuyHeroes.create();
    //    var scene = dynamic_cast<SmartScene*>(getScene());
    //    if( scene && layer )
    //        scene.pushLayer( layer, true );
    //}
    //
    //void cb_lab( Ref*sender )
    //{
    //    SmartScene * scene = dynamic_cast<SmartScene*>(getScene());
    //    var layer = Laboratory.create();
    //    scene.pushLayer( layer, true );
    //
    //    EU.TutorialManager.dispatch( "map_openlab" );
    //}
    //
    //void cb_itemshop( Ref*sender )
    //{
    //    SmartScene * scene = dynamic_cast<SmartScene*>(getScene());
    //    var layer = ItemShop.create();
    //    scene.pushLayer( layer, true );
    //
    //    EU.TutorialManager.dispatch( "map_openitemshop" );
    //}
    //
    //void cb_game( Ref*sender, GameMode mode )
    //{
    //    var choose = getScene().getChildByName<LayerExt*>( "choose" );
    //
    //    if( this.menuLocations )
    //        this.menuLocations.setEnabled( false );
    //
    //    int cost = LevelParams.shared().getFuel( _selectedLevelIndex, false );
    //    int fuel = EU.ScoreCounter.getMoney( kScoreFuel );
    //    if( fuel < cost )
    //    {
    //        if(!k.configuration.useInapps || !EU.TutorialManager.dispatch( "map_haventfuel" ) )
    //        {
    //            cb_shop( sender );
    //            if( EU.k.configuration.useInapps == false )
    //            {
    //                this.menuLocations.setEnabled( true );
    //            }
    //        }
    //        if( choose )
    //            choose.runEvent( "onexit" );
    //    }
    //    else
    //    {
    //        EU.TutorialManager.dispatch( "map_rungame" );
    //        _updateLocations = true;
    //
    //        //var game = GameGS.createScene();
    //        //GameGS.getInstance().getGameBoard().loadLevel( _selectedLevelIndex, mode );
    //        //cc.director.pushScene( game );
    //
    //        runLevel( _selectedLevelIndex, mode );
    //
    //        if( choose )
    //            choose.removeFromParent();
    //
    //        _showLaboratoryOnEnter = true;
    //    }
    //
    //}
    //
    //void cb_gamelock( Ref*sender, int index )
    //{
    //    _selectedLevelIndex = index;
    //
    //    var layer = buildUnlockWindow( index );
    //    SmartScene * scene = static_cast<SmartScene*>(getScene());
    //    assert( scene );
    //    scene.pushLayer( layer, true );
    //}
    //
    //void cb_showChoose( Ref*sender, int index )
    //{
    //    _selectedLevelIndex = index;
    //
    //    var layer = buildChooseWindow( index );
    //    if( layer )
    //    {
    //        SmartScene * scene = static_cast<SmartScene*>(getScene());
    //        assert( scene );
    //        scene.pushLayer( layer, true );
    //
    //        EU.TutorialManager.dispatch( "map_onchoose" );
    //    }
    //    else
    //    {
    //        cb_game( sender, GameMode.normal );
    //    }
    //}
    //
    //void cb_unlock( Ref*sender )
    //{
    //    EU.UserData.write( EU.k.user.LevelUnlocked + intToStr( _selectedLevelIndex ), true );
    //    EU.ScoreCounter.subMoney( kScoreStars, _locations[_selectedLevelIndex].starsForUnlock, true );
    //    activateLocations();
    //    var choose = getScene().getChildByName<LayerExt*>( "choose" );
    //    if( choose )
    //    {
    //        choose.runEvent( "onexit" );
    //    }
    //}
    //
    //void runLevel( int levelIndex, GameMode mode )
    //{
    //    if( levelIndex < static_cast<int>(_locations.size()) )
    //    {
    //        var loadScene = LoadLevelScene.create( levelIndex, mode );
    //        cc.director.pushScene( loadScene );
    //    }
    //    else
    //    {
    //        var player = AutoPlayer.getInstance();
    //        if( player )
    //        {
    //            cc.director.getScheduler().unscheduleAllForTarget( player );
    //            player.release();
    //        }
    //    }
    //    EU.UserData.save();
    //}
    //
    //void activateLocations()
    //{
    //    for( var node : this.curveMarkers )
    //    {
    //        node.removeFromParent();
    //    }
    //    this.curveMarkers.clear();
    //
    //    unsigned passed = EU.UserData.level_getCountPassed();
    //    this.menuLocations.removeAllItems();
    //
    //    bool showpath( false );
    //    std.string key = "map_level_" + intToStr( passed ) + "_pathshowed";
    //    showpath = EU.UserData.get_int( key ) == 0;
    //
    //    float predelayLastFlagAppearance = (showpath && passed > 0) ? 4 : 0.5f;
    //    xmlLoader.macros.set( "flag_delay_appearance", floatToStr( predelayLastFlagAppearance ) );
    //
    //    for( unsigned i = 0; i < _locations.size() && i <= passed; ++i )
    //    {
    //        int fuel = LevelParams.shared().getFuel( i, false );
    //        xmlLoader.macros.set( "fuel_for_level", intToStr( fuel ) );
    //        var flag = createFlag( i );
    //        this.menuLocations.addItem( flag );
    //        buildCurve( i, showpath && i == passed );
    //
    //        if( _locations[i].starsForUnlock > 0 )
    //        {
    //            EU.TutorialManager.dispatch( "unlocked_location" );
    //        }
    //    }
    //
    //    xmlLoader.macros.erase( "flag_delay_appearance" );
    //    EU.UserData.write( key, 1 );
    //
    //    _updateLocations = false;
    //}
    //
    //std.vector<var> buildvars( var a, var b, var c, var d )
    //{
    //    std.vector<var> points;
    //    std.vector<float> times;
    //    var push = [&points, &times]( float time, var point )mutable
    //    {
    //        points.push_back( point );
    //        times.push_back( time );
    //    };
    //    var insert = [&points, &times]( int pos, float time, var point )mutable
    //    {
    //        points.insert( points.begin() + pos, point );
    //        times.insert( times.begin() + pos, time );
    //    };
    //    var K = []( var L, var R, var S )
    //    {
    //        var d0 = S - L;
    //        var d1 = R - S;
    //        if( d0.length() < 5 )
    //            return false;
    //        float k0 = d0.y == 0 ? 0 : d0.x / d0.y;
    //        float k1 = d1.y == 0 ? 0 : d1.x / d1.y;
    //        return fabs( k0 - k1 ) > 0.2f;
    //    };
    //    push( 0.00, compute_bezier( a, b, c, d, 0.00 ) );
    //    push( 0.25, compute_bezier( a, b, c, d, 0.25 ) );
    //    push( 0.50, compute_bezier( a, b, c, d, 0.50 ) );
    //    push( 0.75, compute_bezier( a, b, c, d, 0.75 ) );
    //    push( 1.00, compute_bezier( a, b, c, d, 1.00 ) );
    //
    //    bool exit2( false );
    //    unsigned currentIndex( 0 );
    //    while( currentIndex < points.size() - 1 )
    //    {
    //        exit2 = true;
    //        var L = points[currentIndex];
    //        var R = points[currentIndex + 1];
    //        float Ltime = times[currentIndex];
    //        float Rtime = times[currentIndex + 1];
    //        do
    //        {
    //            float t = (Ltime + Rtime) / 2.f;
    //            var p = compute_bezier( a, b, c, d, t );
    //            if( K( L, R, p ) )
    //            {
    //                insert( currentIndex + 1, t, p );
    //                exit2 = false;
    //            }
    //            else
    //            {
    //                exit2 = true;
    //            }
    //            Rtime = t;
    //            R = p;
    //        }
    //        while( !exit2 );
    //        ++currentIndex;
    //    }
    //
    //    std.vector<var> points2;
    //    var P = points[0];
    //    unsigned index = 1;
    //    float D = 18;
    //    float E = 0;
    //    for( ; index < points.size(); ++index )
    //    {
    //        var r = points[index] - P;
    //        while( r.getLength() > D - E )
    //        {
    //            var rn = r.getNormalized();
    //            P = P + rn * (D);
    //            points2.push_back( P );
    //            E = 0;
    //            r = points[index] - P;
    //        }
    //        E += r.getLength();
    //    }
    //
    //    return points2;
    //}
    //
    //void buildCurve( int index, bool showpath )
    //{
    //    int passed = EU.UserData.level_getCountPassed();
    //    bool availabled = index <= passed;
    //    if( index == 0 ) return;
    //    if( availabled == false ) return;
    //    var a = _locations[index - 1].pos;
    //    var b = _locations[index - 1].a;
    //    var c = _locations[index - 1].b;
    //    var d = _locations[index].pos;
    //
    //
    //    var points = buildvars( a, b, c, d );
    //    int iteration( 0 );
    //    float kdelay = 2.f / points.size();
    //    for( var point : points )
    //    {
    //        var pointSprite = ImageManager.sprite( "images/map/point.png" );
    //        pointSprite.setPosition( point );
    //        this.map.addChild( pointSprite );
    //        this.curveMarkers.push_back( pointSprite );
    //
    //        if( showpath )
    //        {
    //            var delay = DelayTime.create( static_cast<float>(iteration)* kdelay + 2 );
    //            var scale = EaseBackOut.create( ScaleTo.create( 0.2f, 1 ) );
    //            var action = Sequence.createWithTwoActions( delay, scale );
    //
    //            pointSprite.setScale( 0 );
    //            pointSprite.runAction( action );
    //        }
    //        ++iteration;
    //    }
    //
    //}
    //
    //MenuItemImageWithText.varer createFlag( int index )
    //{
    //    const var& location = _locations[index];
    //    var position = location.pos;
    //    int passed = EU.UserData.level_getCountPassed();
    //    int levelStars = EU.UserData.level_getScoresByIndex( index );
    //    int levelStartIncludeHardMode = EU.UserData.get_int( EU.k.user.LevelStars + intToStr( index ) );
    //    bool levelLocked = location.starsForUnlock > 0;
    //    levelLocked = levelLocked && (EU.UserData.get_bool( EU.k.user.LevelUnlocked + intToStr( index ) ) == false);
    //    if( EU.k.configuration.useStarsForUnlock == false )
    //    {
    //        levelLocked = false;
    //    }
    //
    //    std.string path;
    //    ccMenuCallback callback;
    //    bool buildIndicator( false );
    //    std.string flagResource;
    //    flagResource = "flag_" + (levelStartIncludeHardMode <= 3 ? intToStr( levelStartIncludeHardMode ) : std.string( "hard" ));
    //    if( index < passed )
    //    {
    //        path = "ini/map/flag.xml";
    //    }
    //    else if( levelLocked )
    //    {
    //        buildIndicator = true;
    //        path = "ini/map/flag_locked.xml";
    //        position = location.posLock;
    //    }
    //    else
    //    {
    //        path = "ini/map/flag2.xml";
    //    }
    //
    //    if( levelLocked == false )
    //    {
    //        callback = std.bind( &cb_showChoose, this, std.placeholders._1, index );
    //    }
    //    else
    //    {
    //        callback = std.bind( &cb_gamelock, this, std.placeholders._1, index );
    //    }
    //
    //    xmlLoader.macros.set( "flag_position", pointToStr( position ) );
    //    xmlLoader.macros.set( "flag_image", flagResource );
    //    var flagnode = xmlLoader.load_node( path );
    //    xmlLoader.macros.erase( "flag_position" );
    //    xmlLoader.macros.erase( "flag_image" );
    //
    //    flagnode.setName( "flag" + intToStr( index ) );
    //    MenuItemImageWithText.varer flag;
    //    flag.reset( static_cast<MenuItemImageWithText*>(flagnode.ptr()) );
    //    flag.setCallback( callback );
    //
    //    if( EU.UserData.get_int( "map_level_appearance" + intToStr( index ) + "_" + intToStr( levelStars ) ) == 0 )
    //    {
    //        if( index != passed )
    //        {
    //            EU.UserData.write( "map_level_appearance" + intToStr( index ) + "_" + intToStr( levelStars ), 1 );
    //        }
    //        flag.runEvent( "star" + intToStr( levelStars ) + "_show" );
    //    }
    //    else
    //    {
    //        flag.runEvent( "star" + intToStr( levelStars ) );
    //    }
    //
    //    flag.setPosition( position );
    //
    //    return flag;
    //}
    //
    //Layervarer buildChooseWindow( int level )
    //{
    //    var load = [this]()
    //    {
    //        xmlLoader.bookDirectory( this );
    //        var layer = xmlLoader.load_node<LayerExt>( "ini/map/choose.xml" );
    //        xmlLoader.unbookDirectory();
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
    //        std.string excludeNorm = "";
    //        std.string excludeHard = LevelParams.shared().getExclude(level, true);
    //        std.string caption = WORD("gamechoose_level") + intToStr( level + 1 );
    //        xmlLoader.macros.set( "cost_normalmode", intToStr( costNormal ) );
    //        xmlLoader.macros.set( "cost_hardmode", intToStr( costHard ) );
    //        xmlLoader.macros.set( "gold_normalmode", intToStr( goldNorm ) );
    //        xmlLoader.macros.set( "gold_hardmode", intToStr( goldHard ) );
    //        xmlLoader.macros.set( "gear_normalmode", intToStr( gearNorm ) );
    //        xmlLoader.macros.set( "gear_hardmode", intToStr( gearHard ) );
    //        xmlLoader.macros.set( "waves_normalmode", intToStr( wavesNorm ) );
    //        xmlLoader.macros.set( "waves_hardmode", intToStr( wavesHard ) );
    //        xmlLoader.macros.set( "lives_normalmode", intToStr( livesNorm ) );
    //        xmlLoader.macros.set( "lives_hardmode", intToStr( livesHard ) );
    //        xmlLoader.macros.set( "exclude_normalmode", excludeNorm );
    //        xmlLoader.macros.set( "exclude_hardmode", excludeHard );
    //        xmlLoader.macros.set( "preview_caption", caption );
    //        xmlLoader.macros.set( "use_fuel", boolToStr( EU.k.configuration.useFuel ) );
    //        xmlLoader.macros.set( "unuse_fuel", boolToStr( !k.configuration.useFuel ) );
    //    };
    //
    //    var unsetMacroses = [level]()
    //    {
    //        xmlLoader.macros.erase( "cost_hardmode" );
    //        xmlLoader.macros.erase( "cost_normalmode" );
    //        xmlLoader.macros.erase( "gold_hardmode" );
    //        xmlLoader.macros.erase( "gold_normalmode" );
    //        xmlLoader.macros.erase( "gear_normalmode" );
    //        xmlLoader.macros.erase( "gear_hardmode" );
    //        xmlLoader.macros.erase( "waves_normalmode" );
    //        xmlLoader.macros.erase( "waves_hardmode" );
    //        xmlLoader.macros.erase( "lives_normalmode" );
    //        xmlLoader.macros.erase( "lives_hardmode" );
    //        xmlLoader.macros.erase( "exclude_normalmode" );
    //        xmlLoader.macros.erase( "exclude_hardmode" );
    //        xmlLoader.macros.erase( "preview_caption" );
    //    };
    //
    //    var buldStars = [level]( Layer * layer )
    //    {
    //        int starsN = 3;
    //        int starsH = LevelParams.shared().getMaxStars( level, true );
    //        std.list< std.string > normal;
    //        std.list< std.string > hard;
    //        var pNormal = dynamic_cast<NodeExt*>(layer.getChildByName( "normal" ));
    //        var pHard = dynamic_cast<NodeExt*>(layer.getChildByName( "hard" ));
    //        std.string image = pNormal.getParamCollection().at( "starimage" );
    //        split( normal, pNormal.getParamCollection().at( "star" + intToStr( starsN ) ) );
    //        split( hard, pHard.getParamCollection().at( "star" + intToStr( starsH ) ) );
    //        assert( normal.size() == starsN );
    //        assert( hard.size() == starsH );
    //        var it = normal.begin();
    //        for( int i = 0; i < starsN; ++i )
    //        {
    //            var pos = strTovar( *(it++) );
    //            Sprite * star = ImageManager.sprite( image );
    //            assert( star );
    //            star.setPosition( pos );
    //            pNormal.getChildByPath( "stars" ).addChild( star );
    //        }
    //        it = hard.begin();
    //        for( int i = 0; i < starsH; ++i )
    //        {
    //            var pos = strTovar( *(it++) );
    //            Sprite * star = ImageManager.sprite( image );
    //            assert( star );
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
    //        xmlLoader.bookDirectory( this );
    //        var layer = xmlLoader.load_node<LayerExt>( "ini/map/unlock.xml" );
    //        xmlLoader.unbookDirectory();
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
    //        assert( indicator );
    //        Rect rect = indicator.getTextureRect();
    //        float defaultWidth = rect.size.width;
    //        int needStar = _locations[level].starsForUnlock;
    //        int stars = EU.ScoreCounter.getMoney( kScoreStars );
    //        float progress = std.min( 1.f, float( stars ) / float( needStar ) );
    //        float width = defaultWidth * progress;
    //        rect.size.width = width;
    //        indicator.setTextureRect( rect );
    //
    //        var label = layer.getChildByName<Label*>( "progress_text" );
    //        assert( label );
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
    //        xmlLoader.macros.set( "unlock_image", this._locations[level].unlockFrame );
    //        xmlLoader.macros.set( "unlock_text", this._locations[level].unlockText );
    //    };
    //
    //    var unsetMacroses = [level]()
    //    {
    //        xmlLoader.macros.erase( "unlock_image" );
    //        xmlLoader.macros.erase( "unlock_text" );
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
    //            if( pass < _locations.size() )
    //            {
    //                pass = _locations.size();
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
    //        var item = [this]( Menu * menu, std.string text, EventKeyboard.KeyCode key, var pos )
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
    scene.addChild( layer );
    return scene;
};
