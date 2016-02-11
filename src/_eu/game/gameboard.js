/******************************************************************************
 * Copyright 2014-2016 Vladimir Tolmachev
 * Copyright 2016 Visionarity AG
 * Vladimir Tolmachev and Visionarity AG have unlimited commercial
 * licenses for commercial use and customization
 *
 * Author: Vladimir Tolmachev (tolvl@hotmail.com)
 * Ported C++ to Javascript: Visionarity AG / Vladimir Tolmachev
 * Project: Island Defense (JS)
 * If you received the code not from the author, please contact us
 ******************************************************************************/

//Define namespace
var EU = EU || {};

EU.GameMode =
{
    normal : 1,
    hard : 2,
    _default : 1
};

EU.FinishLevelParams = cc.Class.extend({
    crystalscount : 0,
    scores : 0,
    spentscores : 0,
    livecurrent : 0,
    livetotal : 0,
    stars : 0,
    ctor: function() {
    }
});

EU.SkillParams = cc.Class.extend({
    wat : {
        rateCooldown : 0,
        rateLifetime : 0
    },
    Hero3Bot : {
        rateCooldown : 0,
        rateLifetime : 0
    },
    Landmine : {
        rateCooldown : 0,
        count : 0
    },
    cooldownDesant : 0,
    cooldownAirplane : 0,
    cooldownLandmine : 0,
    cooldownSwat : 0,
    cooldownHero3Bot : 0,
    lifetimeDesant : 0,
    distanceToRoute : 0,
    swatCount : 0,
    swatLifetime : 0,
    hero3BotCount : 0,
    hero3BotLifetime : 0,
    /** Type {Array<Swat>}*/ swatLevels : [],
    /** Type {Array<Hero3Bot>*/ hero3BotLevels : [],
    /** Type {Array<Landmine>*/ landmineLevels : []
});

EU.GameBoard = cc.Class.extend({
    /** Type{Array<EU.Unit>}*/ units : null,
    /** Type{Array<EU.Unit>}*/ death : null,
    /** Type{Array<EU.Unit>}*/ reserve : null,
    /** Type{EU.Hero}*/ hero : null,
    /** Type{Object[EU.Unit, Float}*/ damagers : null,
    /** Type{Object{EU.Unit, Array<EU.Unit>}*/ killers : null,
    /** Type{EU.FinishLevelParams}*/ statisticsParams : null,
    /** Type{Array<TripleRoute>}*/ creepsRoutes : null,
    /** Type{EU.GameMode}*/ gameMode : null,
    /** Type{Integer}*/ levelIndex : null,
    /** Type{EU.SkillParams}*/ skillParams : null,
    /** Type{bool}*/ isStarted : null,
    /** Type{bool}*/ isFinihedWaves : null,
    /** Type{bool}*/ isFinihedGame : null,
    /** Type{bool}*/ isFinishedWave : null,
    /** Type{Integer}*/ heartsForStar1 : null,
    /** Type{Integer}*/ heartsForStar2 : null,
    /** Type{Integer}*/ heartsForStar3 : null,
    /** Type{Integer}*/ leaderboardScore : null,
    /** Type{Array< Object{ EU.Unit, Float} >}*/ desants : null,

    setCreepsRoutes: function(routes){this.creepsRoutes = routes;},
    getCreepsRoutes: function(){return this.creepsRoutes;},
    setGameMode: function(mode){this.gameMode = mode;},
    getGameMode: function(){return this.gameMode;},
    setCurrentLevelIndex: function(index){this.levelIndex = index;},
    getCurrentLevelIndex: function(){return this.levelIndex;},
    setSkillParams: function(params){this.skillParams = params;},
    getSkillParams: function(){return this.skillParams;},

    ctor: function()
    {
        this.units = [];
        this.death = [];
        this.damagers = {};
        this.creepsRoutes = [];
        this.statisticsParams = new EU.FinishLevelParams();
        this.gameMode = EU.GameMode.normal;
        this.levelIndex = 0;
        this.isStarted = false;
        this.isFinihedWaves = false;
        this.isFinihedGame = false;
        this.isFinishedWave = false;
        this.heartsForStar1 = 0;
        this.heartsForStar2 = 0;
        this.heartsForStar3 = 0;
        this.leaderboardScore = 0;
        this.desants = {};
        this.skillParams = {};

        this.loadSkillsParams();
        this.checkDefaultBonusesItems();
    },
    //~GameBoard(){},
    loadSkillsParams: function(){
        var doc = EU.pugixml.readXml( "ini/skills.xml" );
        var root = doc.firstElementChild;

        this.skillParams.cooldownDesant = parseFloat(root.getElementsByTagName( "desant_colldown" )[0].getAttribute( "value" ));
        this.skillParams.lifetimeDesant = parseFloat(root.getElementsByTagName( "desant_lifetime" )[0].getAttribute( "value" ));
        this.skillParams.cooldownAirplane = parseFloat(root.getElementsByTagName( "airplane_colldown" )[0].getAttribute( "value" ));
        this.skillParams.distanceToRoute = parseFloat(root.getElementsByTagName( "distance_to_road" )[0].getAttribute( "value" ));

        this.skillParams.cooldownLandmine = parseFloat(root.getElementsByTagName( "landmine_colldown" )[0].getAttribute( "value" ));
        this.skillParams.cooldownSwat = parseFloat(root.getElementsByTagName( "swat_colldown" )[0].getAttribute( "value" ));
        this.skillParams.cooldownHero3Bot = parseFloat(root.getElementsByTagName( "hero3bot_colldown" )[0].getAttribute( "value" ));
        this.skillParams.swatCount = parseFloat(root.getElementsByTagName( "swat_count" )[0].getAttribute( "value" ));
        this.skillParams.swatLifetime = parseFloat(root.getElementsByTagName( "swat_lifetime" )[0].getAttribute( "value" ));
        this.skillParams.hero3BotCount = parseFloat(root.getElementsByTagName( "hero3bot_count" )[0].getAttribute( "value" ));
        this.skillParams.hero3BotLifetime = parseFloat(root.getElementsByTagName( "hero3bot_lifetime" )[0].getAttribute( "value" ));

        this.skillParams.cooldownDesant = EU.UserData.get_float( EU.k.DesantCooldown, this.skillParams.cooldownDesant );
        this.skillParams.lifetimeDesant = EU.UserData.get_float( EU.k.DesantLifeTime, this.skillParams.lifetimeDesant );
        this.skillParams.cooldownAirplane = EU.UserData.get_float( EU.k.AirplaneCooldown, this.skillParams.cooldownAirplane );
        this.skillParams.cooldownLandmine = EU.UserData.get_float( EU.k.LandmineCooldown, this.skillParams.cooldownLandmine );
        this.skillParams.cooldownSwat = EU.UserData.get_float( EU.k.SwatCooldown, this.skillParams.cooldownSwat );
        this.skillParams.swatCount = EU.UserData.get_int( EU.k.SwatCount, this.skillParams.swatCount );
        this.skillParams.swatLifetime = EU.UserData.get_int( EU.k.SwatLifetime, this.skillParams.swatLifetime );
        this.skillParams.cooldownHero3Bot = EU.UserData.get_float( EU.k.Hero3BotCooldown, this.skillParams.cooldownHero3Bot );
        this.skillParams.hero3BotCount = EU.UserData.get_int( EU.k.Hero3BotCount, this.skillParams.hero3BotCount );
        this.skillParams.hero3BotLifetime = EU.UserData.get_int( EU.k.Hero3BotLifetime, this.skillParams.hero3BotLifetime );

        this.skillParams.swatLevels = [];
        this.skillParams.hero3BotLevels = [];
        this.skillParams.landmineLevels = [];

        for( var i = 0; i < 4; ++i )
        {
            this.skillParams.swatLevels[i] = {};
            this.skillParams.swatLevels[i].rateCooldown = parseFloat(root.getElementsByTagName( "swat" )[0].getElementsByTagName( "level" + i )[0].getAttribute( "cooldownrate" ));
            this.skillParams.swatLevels[i].rateLifetime = parseFloat(root.getElementsByTagName( "swat" )[0].getElementsByTagName( "level" + i )[0].getAttribute( "lifitimerate" ));

            this.skillParams.hero3BotLevels[i] = {};
            this.skillParams.hero3BotLevels[i].rateCooldown = parseFloat(root.getElementsByTagName( "hero3bot" )[0].getElementsByTagName( "level" + i )[0].getAttribute( "cooldownrate" ));
            this.skillParams.hero3BotLevels[i].rateLifetime = parseFloat(root.getElementsByTagName( "hero3bot" )[0].getElementsByTagName( "level" + i )[0].getAttribute( "lifitimerate" ));

            this.skillParams.landmineLevels[i] = {};
            this.skillParams.landmineLevels[i].rateCooldown = parseFloat(root.getElementsByTagName( "landmine" )[0].getElementsByTagName( "level" + i )[0].getAttribute( "cooldownrate" ));
            this.skillParams.landmineLevels[i].count = parseInt(root.getElementsByTagName( "landmine" )[0].getElementsByTagName( "level" + i )[0].getAttribute( "count" ));
        }

    },
    checkDefaultBonusesItems:function(){
        var id = "bonusitemdefaultgetted";
        if( EU.UserData.get_bool( id, true ) )
        {
            var doc = EU.pugixml.readXml( "ini/bonusitems.xml" );
            var root = doc.firstElementChild;

            EU.UserData.bonusitem_add( 3, parseInt(root.getElementsByTagName( "bonusitem_dynamit" )[0].getAttribute( "default" )) );
            EU.UserData.bonusitem_add( 2, parseInt(root.getElementsByTagName( "bonusitem_ice" )[0].getAttribute( "default" )) );
            EU.UserData.bonusitem_add( 1, parseInt(root.getElementsByTagName( "bonusitem_laser" )[0].getAttribute( "default" )) );
            EU.UserData.write( id, false );
        }
    },
    loadLevel: function( index, gamemode ){
        this.levelIndex = index;
        this.gameMode = gamemode;

        var pathToFile = EU.kDirectoryToMaps + this.levelIndex + ".xml";
        var doc = EU.pugixml.readXml( pathToFile );
        var root = doc.firstElementChild;
        if( !root )
            cc.log( "cannot parce file" );

        var xmlTagWaves = "";
        var xmlTagParams = "";
        switch( gamemode )
        {
            case EU.GameMode.normal:
                xmlTagParams = EU.k.LevelParams;
                xmlTagWaves = EU.k.LevelWaves;
                break;
            case EU.GameMode.hard:
                xmlTagParams = EU.k.LevelParamsHard;
                xmlTagWaves = EU.k.LevelWavesHard;
                break;
        }

        var routesXml = root.getElementsByTagName( EU.k.LevelRoutes )[0];
        var placesXml = root.getElementsByTagName( EU.k.LevelTowerPlaces )[0];
        var wavesXml = root.getElementsByTagName( xmlTagWaves )[0];
        var paramsXml = root.getElementsByTagName( xmlTagParams )[0];
        if( !paramsXml ) paramsXml = root;

        if( !routesXml )cc.log( "routesXml Node not found" );
        if( !placesXml )cc.log( "placesXml Node not found" );
        if( !wavesXml ) cc.log( "wavesXml Node not found" );

        var routes = [];

        this.loadLevelParams(paramsXml);
        var routesload = this.loadRoutes( routesXml );
        var places = this.loadTowerPlaces( placesXml );
        EU.WaveGenerator.load( wavesXml );
        EU.GameGSInstance.loadLevel( index, root );

        for( var i=0; i<routesload.length; ++i )
            routes.push( routesload[i] );
        this.setCreepsRoutes( routes );

        for( i=0; i<places.length; ++i )
            EU.GameGSInstance.addTowerPlace( places[i] );

        var minlevel = EU.k.minLevelHero;
        if( minlevel <= index )
            this.createHero();
    },
    loadLevelParams: function( xmlnode ){
        var startscore = parseInt( xmlnode.getAttribute( EU.k.LevelStartScore ));
        var healths = parseInt( xmlnode.getAttribute( EU.k.LevelHealth ));
        this.heartsForStar1 = parseInt( xmlnode.getAttribute( EU.k.LevelStartStar1 ));
        this.heartsForStar2 = parseInt( xmlnode.getAttribute( EU.k.LevelStartStar2 ));
        this.heartsForStar3 = parseInt( xmlnode.getAttribute( EU.k.LevelStartStar3 ));
        var exclude = xmlnode.getAttribute( "exclude" );
        if( exclude && exclude.length > 0 ) {
            exclude = exclude.split(",");
            for( var i=0; i<exclude.length; ++i )
                EU.GameGSInstance.excludeTower( exclude[i] );
        }
    
        if( EU.k.useBoughtLevelScoresOnEveryLevel )
        {
            var key = EU.k.BoughtScores + EU.kScoreLevel;
            var boughtScores = EU.UserData.get_int( key, 0 );
            startscore += boughtScores;
        }
    

        EU.ScoreCounter.setMoney( EU.kScoreLevel, startscore, false );
        EU.ScoreCounter.setMoney( EU.kScoreHealth, healths, false );
        this.statisticsParams.livetotal = healths;
    },
    update: function( dt ){
        this.updateSkills( dt );
        EU.WaveGenerator.update( dt );

        if( !this.isFinihedGame )
            this.refreshTargetsForTowers();

        var units = [];
        var death = [];
        var removed = [];
        units.concat( this.units );
        units.concat( this.death );
        for( var i=0; i<units.length; ++i )
        {
            var unit = units[i];
            unit.update( dt );

            if( (unit.getCurrentHealth() <= 0) && (this.death.indexOf( unit ) == -1) )
                death.push( i );
            else if( unit.getMoveFinished() == true && unit._type == EU.UnitType.creep )
                removed.push( i );
        }

        for( i=0; i<death.length; ++i )
        {
            var index = this.units.indexOf(death[i]);
            if( index != -1 )
            {
                this.units.splice( index, 1 );
                this.preDeath( death[i] );
            }
        }

        for( i=0; i<this.death.length; ++i )
        {
            unit = this.death[i];
            if( unit.getCurrentHealth() > 0 )
            {
                EU.GameGSInstance.onDeathCanceled( unit );
                this.units.push( unit );
                this.death.splice( i, 1 );
                i--;
            }
        }

        for( i=0; i<removed.length; ++i )
        {
            index = this.units.indexOf( removed[i] );
            if( index != -1 )
            {
                this.units.splice( i );
                remove( removed[i] );
            }
        }

        this.checkWaveFinished();
        this.checkGameFinished();
    },
    updateSkills: function( dt ){
        for( var desant in this.desants )
        {
            this.desants[desant] -= dt;
            if( this.desants[desant] <= 0 )
            {
                var index = this.units.indexOf( desant );
                EU.assert( index != -1 );
                if( index != -1 )
                    this.units.splice( index, 1 );
                remove( desant );
                this.desants[desant] = undefined;
            }
        }
    },
    clear: function(){
        var desSize = cc.view.getDesignResolutionSize();

        EU.WaveGenerator.clear();
        this.units.length = 0;
        this.creepsRoutes.length = 0;
        this.statisticsParams.crystalscount = 0;
        this.statisticsParams.scores = 0;
        this.statisticsParams.spentscores = 0;
        this.statisticsParams.livecurrent = 0;
        this.statisticsParams.livetotal = 0;
        this.levelIndex = -1;
        this.isFinihedWaves = false;
        this.isFinihedGame = false;
        this.isFinishedWave = false;
        this.heartsForStar1 = 1;
        this.heartsForStar2 = 1;
        this.heartsForStar3 = 1;
        this.damagers.length = 0;
    },
    loadRoute: function( xmlnode ){
        var route = [];
        for( var i=0; i<xmlnode.children.length; ++i )
        {
            var child = xmlnode.children[i];
            var point = cc.p(0,0);
            point.x = parseFloat(child.getAttribute( "x" ));
            point.y = parseFloat(child.getAttribute( "y" ));
            route.push( point );
        }
        return route;
    },
    loadRoutes: function( xmlnode ){
        var routes = [];
        for( var i=0; i<xmlnode.children.length; ++i )
        {
            var child = xmlnode.children[i];
            var index = parseInt(child.getAttribute( "name" ));
            var unitLayer = EU.strToUnitLayer( child.getAttribute( EU.k.type ) );
            routes[index] = new EU.TripleRoute();
            var main = child.getElementsByTagName( "main" )[0];
            var left = child.getElementsByTagName( "left" )[0];
            var right = child.getElementsByTagName( "right" )[0];
            routes[index].main = this.loadRoute( main );
            routes[index].left = this.loadRoute( left );
            routes[index].right = this.loadRoute( right );
            routes[index].type = unitLayer;
        }
        return routes;
    },
    loadTowerPlaces: function( xmlnode ){
        var places = [];
        for( var i=0; i<xmlnode.children.length; ++i )
        {
            var child = xmlnode.children[i];
            var def = new EU.TowerPlaceDef();
            def.position.x = parseFloat(child.getAttribute( "x" ));
            def.position.y = parseFloat(child.getAttribute( "y" ));
            def.isActive = EU.Common.strToBool( child.getAttribute( "active" ));
            places.push( def );
        }
        return places;
    },
    startGame: function(){
        EU.WaveGenerator.start();
        EU.GameGSInstance.startGame();
        EU.LevelParams.onLevelStarted( this.levelIndex );
    },
    onPredelayWave: function( waveInfo, delay ){
        //for( var i=0; i<this.creepsRoutes.length; ++i )
        //{
        //    if( this.creepsRoutes[i].type == waveInfo.type )
        //    {
        //        EU.GameGSInstance.createRoutesMarkers( this.creepsRoutes[i].main, this.creepsRoutes[i].type );
        //    }
        //}
    
        for( var i = 0; i < this.creepsRoutes.length; ++i )
        {
            var route = this.creepsRoutes[i];
            var create = false;
            for( var j=0; j < waveInfo.routeIndex.length; ++j )
            {
                var routeindex = waveInfo.routeIndex[j];
                var creep = waveInfo.creeps[j];
                if( routeindex == i )
                {
                    if( EU.mlUnitInfo.info( creep ).layer == route.type )
                    {
                        create = true;
                    }
                }
            }
            if( create )
            {
                EU.GameGSInstance.createIconForWave( route.main, waveInfo, route.type, null, delay );
            }
        }
        EU.WaveGenerator.pause();
    },
    onStartWave: function( waveInfo ){
        this.isStarted = true;
        EU.GameGSInstance.updateWaveCounter();
        EU.GameGSInstance.onStartWave( waveInfo );
        //var sound = EU.xmlLoader.macros.parse( "##sound_wavestart##" );
        //TODO: AudioEngine.playEffect( sound, false, 0 );
        var index = EU.WaveGenerator.getWaveIndex();
        this.event_startwave( index );
    },
    onFinishWave: function(){
        this.isFinishedWave = true;
    },
    onFinishWaves: function(){
        this.isFinihedWaves = true;
    },
    onFinishGame: function(){
        if( this.isFinihedGame )
            return;
        for( var i=0; i<this.units.length; ++i ) {
            this.units[i].stop();
        }

        this.dispatchKillers();

        if( this.hero )
        {
            //var exp = EU.HeroExp.getEXP( this.hero.getName() );
            //exp += EU.HeroExp.getExpOnLevelFinished( this.levelIndex );
            //EU.HeroExp.setEXP( this.hero.getName(), exp );
        }

        this.isFinihedGame = true;
        this.statisticsParams.livecurrent = EU.ScoreCounter.getMoney( EU.kScoreHealth );
        this.statisticsParams.stars = 0;
        if( this.statisticsParams.livecurrent >= this.heartsForStar1 ) this.statisticsParams.stars = 1;
        if( this.statisticsParams.livecurrent >= this.heartsForStar2 ) this.statisticsParams.stars = 2;
        if( this.statisticsParams.livecurrent >= this.heartsForStar3 ) this.statisticsParams.stars = 3;

        if( this.statisticsParams.livecurrent > 0 )
        {
            EU.UserData.level_complite( this.levelIndex );
            EU.UserData.level_getScoresByIndex( this.levelIndex );
            EU.UserData.level_setScoresByIndex( this.levelIndex, this.statisticsParams.stars );

            if( this.gameMode == EU.GameMode.normal  )
            {
                if( EU.UserData.get_bool( "level_successfull" + this.levelIndex ) == false )
                {
                    //TODO: EU.Achievements.process( "level_successfull", 1 );
                    EU.UserData.write( "level_successfull" + this.levelIndex, true );
                }
                if( this.statisticsParams.stars >= 3 && EU.UserData.get_bool( "level_star3normal" + this.levelIndex ) == false )
                {
                    //TODO: EU.Achievements.process( "level_star3normal", 1 );
                    EU.UserData.write( "level_star3normal" + this.levelIndex, true );
                }
            }
            else
            {
                if( EU.UserData.get_bool( "level_successfull_hard" + this.levelIndex ) == false )
                {
                    //TODO: EU.Achievements.process( "level_successfull_hard", 1 );
                    EU.UserData.write( "level_successfull_hard" + this.levelIndex, true );
                }
                if( this.statisticsParams.stars >= 3 && EU.UserData.get_bool( "level_star3hard" + this.levelIndex ) == false )
                {
                    //TODO: EU.Achievements.process( "level_star3hard", 1 );
                    EU.UserData.write( "level_star3hard" + this.levelIndex, true );
                }
            }

            if( this.statisticsParams.stars >= 3 && EU.UserData.get_bool( "level_3star" + this.levelIndex ) == false )
            {
                //TODO: EU.Achievements.process( "level_3star", 1 );
                EU.UserData.write( "level_3star" + this.levelIndex, true );
            }
        }
        else
        {
            //TODO: EU.Achievements.process( "level_failed", 1 );
        }
        this.event_levelFinished();

        EU.GameGSInstance.onFinishGame( this.statisticsParams );
        EU.LevelParams.onLevelFinished( this.levelIndex, this.statisticsParams.stars );
        EU.mlTowersInfo.checkAvailabledTowers();
        //EU.HeroExp.checkUnlockedHeroes();
        //EU.Leaderboard.fix( this.levelIndex, this.leaderboardScore * this.statisticsParams.livecurrent );
    },
    isGameStarted: function(){
        return this.isStarted;
    },
    onDamage: function( damager, target, damage ){
        this.damagers[damager] += damage;
    },
    onKill: function( damager, target ){
        this.killers[damager].push( target );
    },
    isTowerPlace: function( location ){
        var index = EU.GameGSInstance.getTowerPlaceIndex( location );
        return index != -1;
    },
    buildTower: function( name, level, unit ){
        var resource = name + level;
        //TODO: load reource
        //if( EU.LoadLevelScene.getInstance() )
        //    EU.LoadLevelScene.loadInGameResources(resource);

        var xmlfile = name + level + ".xml";
        var tower = new EU.Unit( "ini/units", xmlfile, unit );
        EU.assert( tower );
        return tower;
    },
    buildCreep: function( name ){
        var creep = new EU.UnitWithFadeEffects( "ini/units", name + ".xml" );
        EU.assert( creep );
        creep.setName( name );
        return creep;
    },
    createCreep: function( name, route, position ){
        var creep = this.buildCreep( name );
        creep.getMover().setRoute( route );
        creep.move();
        creep.getMover().setLocation( position );

        this.units.push( creep );
        EU.GameGSInstance.onCreateUnit( creep );
        EU.GameGSInstance.addObject( creep, creep.getLocalZOrder( ) );
        return creep;
    },
    createCreep: function( name, routeSubType, routeIndex ){
        var creep = this.buildCreep( name );
        var layer = creep._unitLayer;
        creep.getMover().setRoute( this.getRandomRoute( layer, routeIndex, routeSubType ) );
        creep.move( );
        this.units.push( creep );
        EU.GameGSInstance.onCreateUnit( creep );
        EU.GameGSInstance.addObject( creep, creep.getLocalZOrder() );
        return creep;
    },
    createTower: function( name ){
        var place = EU.GameGSInstance.getSelectedTowerPlaces();
        if( !place )
        {
            return null;
        }
    
        var cost = EU.mlTowersInfo.getCost( name, 1 );
        if( cost > EU.ScoreCounter.getMoney( EU.kScoreLevel ) )
        {
            //TODO: AudioEngine.playEffect( kSoundGameTowerBuyCancel );
            return null;
        }
    
        var tower = this.buildTower( name, 1, null );
        tower.setPosition( place.getPosition() );
        tower.setCurrentHealth( 100 );
    
        this.addUnit( tower );
    
        //TODO: AudioEngine.playEffect( kSoundGameTowerBuy );
        EU.ScoreCounter.subMoney( EU.kScoreLevel, cost, false );
        EU.GameGSInstance.eraseTowerPlace( place );
        EU.GameGSInstance.onCreateUnit( tower );
        //TODO: EU.Achievements.shared( ).process( "spend_gold", cost );
        //TODO: EU.Achievements.process( "build_tower", 1 );
        this.statisticsParams.spentscores += cost;
        this.event_towerBuild( place, tower );
        return tower;
    },
    createDesant: function( name, position, lifetime ){
        var xmlfile = name + ".xml";
        var unit = null;
        var dummy = 0;
        if( EU.checkPointOnRoute( position, this.skillParams.distanceToRoute, EU.UnitLayer.earth, dummy ) )
            unit = UnitDesant.create( "ini/units", xmlfile );
        if( unit )
        {
            unit.setBasePosition( position );
            unit.setPosition( position );
            this.addUnit( unit );
            this.desants[unit] = lifetime;
        }
        return unit;
    },
    createBomb: function( position ){
        var name = "";
        var dist_water = 9999;
        var dist_earth = 9999;
    
        if( EU.checkPointOnRoute( position, this.skillParams.distanceToRoute, EU.UnitLayer.sea, dist_water ) )
            name = "airplane_water.xml";
        else if( EU.checkPointOnRoute( position, this.skillParams.distanceToRoute, EU.UnitLayer.earth, dist_earth ) )
            name = "airplane_earth.xml";
    
        if( name == "airplane_water.xml" && dist_earth < dist_water )
            name = "airplane_earth.xml";
        if( name == "airplane_earth.xml" && dist_water < dist_earth )
            name = "airplane_water.xml";
    
        if( name.empty() == false )
        {
            var bomb = EU.Airbomb.create( "ini/units", name, position );
            EU.GameGSInstance.addObject( bomb, 9999 );
            return bomb;
        }
    
        return null;
    },
    createLandMine: function( position, count ){
        var dist_earth = 9999;
        if( !EU.checkPointOnRoute( position, this.skillParams.distanceToRoute, EU.UnitLayer.earth, dist_earth ) )
            return null;
    
        var result = null;
        for (var i = 0; i < count; ++i)
        {
            var pos = EU.Common.getRandPointInPlace( position, EU.mlUnitInfo.info("landmine").radius / 2 );
            var mine = new EU.LandMine.create( "ini/units", "landmine.xml" );
            mine.setPosition( pos );
            this.addUnit( mine );
            result = mine;
        }
    
        return result;
    },
    createBonusItem: function( position, name ){
        var dist = 9999;
        var layer = EU.mlUnitInfo.info( name ).layer;
        if( !EU.checkPointOnRoute( position, this.skillParams.distanceToRoute, layer, dist ) )
            return null;

        var item = Unit.create( "ini/units", name + ".xml" );
        item.setPosition( position );
        this.addUnit( item );

        return item;
    },
    createHero: function(){
        var decorations = EU.GameGSInstance.getDecorations( "base_point" );
        var min = -1;
        var dist_min = 99999999;
        var index = 0;
        for( var i=0; i<decorations.length; ++i )
        {
            var decor = decorations[i];
            var dist = 9999;
            EU.checkPointOnRoute( decor.getPosition(), dist_min, EU.UnitLayer.earth, dist );
            if( dist < dist_min )
            {
                min = index;
                dist_min = dist;
            }
            ++index;
        }
        if( min != -1 )
        {
            var index = EU.UserData.hero_getCurrent() + 1;
            var decor = decorations[min];
            this.hero = EU.xmlLoader.load_node_from_file( "ini/units/hero/hero" + index + ".xml" );
            this.hero.initSkills();
            this.hero.setPosition( decor.getPosition() );
            this.hero.moveTo( decor.getPosition() );
            this.addUnit( this.hero );
            EU.GameGSInstance.onCreateUnit( this.hero );
        }

        return this.hero;
    },
    addUnit: function( tower ){
        this.units.push( tower );
        EU.GameGSInstance.addObject( tower );
    },
    upgradeTower: function( tower ){
        if( tower == null )
            return null;
        var name = tower.getName();
        var level = tower.getLevel();
        var maxlevel = tower.getMaxLevel();
        var maxlevel2 = tower.getMaxLevelForLevel();
        if( level >= maxlevel )
            return null;
        if( level >= maxlevel2 )
            return null;
        var cost = EU.mlTowersInfo.getCost( name, level + 1 );
        var score = EU.ScoreCounter.getMoney( EU.kScoreLevel );
        if( score < cost )
            return null;

        var index = -1;
        for( var i=0; i< this.units.length; ++i ){
            if( this.units[i] == tower ) {
                index = i;
                break;
            }
        }

        //TODO: load reource
        //var resource = name + (level+1);
        //if( LoadLevelScene.getInstance() )
        //    LoadLevelScene.loadInGameResources(resource);

        var newTower = this.buildTower( name, level + 1, tower );
        newTower.setLevel( level + 1 );
        newTower.setMaxLevel( maxlevel );
        newTower.setMaxLevelForLevel( maxlevel2 );
        newTower.setPosition( tower.getPosition() );
        this.units[index] = newTower;

        //TODO: AudioEngine.playEffect( kSoundGameTowerUpgrade );
        EU.GameGSInstance.removeObject( tower );
        EU.GameGSInstance.addObject( newTower, zorder.tower );
        EU.ScoreCounter.subMoney( EU.kScoreLevel, cost, false );

        if( (level + 1) == maxlevel )
            //TODO: EU.Achievements.process( "upgrade_towermax", 1 );
        this.statisticsParams.spentscores += cost;

        this.event_towerUpgrade( tower );

        var nameevent = "tower_upgrade_" + newTower.getName() + newTower.getLevel();
        //TODO: EU.Achievements.process( nameevent, 1 );
        return newTower;
    },
    removeTower: function( tower ){
        var index = -1;
        for( var i=0; i< this.units.length; ++i ){
            if( this.units[i] == tower ) {
                index = i;
                break;
            }
        }
        if( index != -1 )
        {
            var costSell = EU.mlTowersInfo.getSellCost( tower.getName(), tower.getLevel() );
            this.units.erase( i );
            var def = new EU.TowerPlaceDef;
            def.position = tower.getPosition();
            def.isActive = true;
            tower.stopAllLoopedSounds();
            EU.ScoreCounter.addMoney( EU.kScoreLevel, costSell, false );
            EU.GameGSInstance.addTowerPlace( def );
            EU.GameGSInstance.removeObject( tower );
            this.statisticsParams.spentscores -= costSell;
            //TODO: EU.Achievements.process( "collect_gold", costSell );
            //TODO: EU.Achievements.process( "sell_tower", 1 );
            this.event_towerSell( tower );
        }
    },
    getHero: function(){
        return this.hero;
    },
    remove: function( unit ){
        unit.stopAllLoopedSounds();
        var cost = unit.getLifeCost();
        if( cost > 0 )
        {
            //var sound = EU.xmlLoader.macros.parse( "##sound_gameplayerdamage##" );
            //TODO: AudioEngine.playEffect( sound, false, 0 );
            EU.ScoreCounter.subMoney( EU.kScoreHealth, cost, false );
            //TODO: EU.Achievements.process( "skip_enemies", 1 );
        }
        EU.GameGSInstance.removeObject( unit );

        for( var i=0; i<this.units.length; ++i )
        {
            var base = this.units[i];
            var targets = [];
            base.get_targets( targets );
            for( var j=0; j<targets.length; ++j )
            {
                if( target == unit )
                {
                    base.capture_targets( null );
                    break;
                }
            }
        }
    },
    preDeath: function( unit ){
        var cost = unit.getCost();
        EU.ScoreCounter.addMoney( EU.kScoreLevel, cost, false );
        //TODO: EU.Achievements.process( "collect_gold", cost );
        //TODO: EU.Achievements.process( "kill_enemies", 1 );
        EU.GameGSInstance.onDeathUnit( unit );
        this.statisticsParams.scores += cost;

        for( var i=0; i<this.units.length; ++i )
        {
            if( this.units[i].get_target() == unit )
                this.units[i].capture_target( null );
        }
        for( var desant in this.desants )
        {
            if( desant == unit )
            {
                this.desants[desant] = undefined;
                break;
            }
        }
        unit.capture_targets( null );
        unit.stop();
        unit.die();
        this.death.insert( unit );
    },
    deathUnit: function( creep ){
        var index = -1;
        for( var i=0; i<this.death.length; ++i ){
            if( this.death[i] == creep ){
                index = i;
                break;
            }
        }
        if( index != -1 )
        {
            var damager = creep.getCurrentDamager();
            var scores = creep.getHealth() * creep.getRate();
            if( damager )
                scores = scores / ( damager.getLevel() + 1 ) * 3;
            this.leaderboardScore += scores;
            creep.stopAllLoopedSounds();
            EU.GameGSInstance.removeObject( creep );
            creep.removeFromParent();
            this.death.splice( i, 1 );
        }
    },
    checkWaveFinished: function(){
        var result = this.isFinishedWave && this.isExistCreep( this.units ) == false;
        if( result )
            EU.GameGSInstance.onWaveFinished();
        return result;
    },
    checkGameFinished: function(){
        var finishGame = false;
        var byHealth = (EU.ScoreCounter.getMoney( EU.kScoreHealth ) <= 0);
        var isExistCreep = this.isExistCreep( this.units )
        var byEndOfWaves = (isExistCreep == false && this.isFinihedWaves == true);
        finishGame = finishGame || byHealth;
        finishGame = finishGame || byEndOfWaves;
        if( finishGame )
            this.onFinishGame();

        return finishGame;
    },
    activateTowerPlace: function( place ){
        if( !place ) return;
        if( place.getActive() ) return;
        var cost = EU.mlTowersInfo.getCostFotDig();
        EU.ScoreCounter.subMoney( EU.kScoreLevel, cost, false );
        EU.GameGSInstance.createSubMoneyNode( cost, place.getPosition() );
        place.setActive( true );
        //TODO: AudioEngine.playEffect( kSoundGameTowerPlaceActivate );
    },
    getRoutesCount: function(){
        return creepsRoutes.length;
    },
    /** routeSubType = EU.RouteSubType.random*/
    getRandomRoute: function( unitLayer, index, routeSubType ){
        if( routeSubType == undefined )
            routeSubType = EU.RouteSubType.random;

        var routes = [];
        if( index < this.creepsRoutes.length && this.creepsRoutes[index].type == unitLayer )
        {
            routes.push( this.creepsRoutes[index] );
        }
        else
        {
            for( var i = 0; i < this.creepsRoutes.length; ++i )
            {
                if( unitLayer == this.creepsRoutes[i].routeSubType )
                {
                    routes.push( this.creepsRoutes[i] );
                }
            }
        }
        var random = Math.floor(Math.random()*100) % EU.RouteSubType.max;
        var nindex = index % routes.length;
        EU.assert( nindex < routes.length );
        switch( routeSubType )
        {
            case EU.RouteSubType.random:    return this.getRandomRoute( unitLayer, index, random );
            case EU.RouteSubType.main:      return routes[nindex].main;
            case EU.RouteSubType.left0:     return routes[nindex].left;
            case EU.RouteSubType.right0:    return routes[nindex].right;
            case EU.RouteSubType.max:       EU.assert( 0 );
        }
        EU.assert( 0 );
        return routes[index].main;
    },
    getRoute: function( unitLayer, position, distance ){
        var result = null;
        for( var i=0; i<this.creepsRoutes.length; ++i)
        {
            var route = this.creepsRoutes[i];
            var check = EU.checkPointOnRoute( position, route, distance, distance );
            if( check )
            {
                result = route;
            }
        }
        if( result )
            return result;
        return new EU.TripleRoute();
    },
    getTargetsByRadius: function( out, center, radius ){
        for( var i=0; i<this.units.length; ++i )
        {
            var checked = true;
            checked = checked && this.checkTargetByRadius(this.units[i], center, radius);
            if( checked )
                out.push(this.units[i]);
        }
        return out;
    },
    applyDamageBySector: function( base ){
        EU.assert( base );
        for( var i=0; i<this.units.length; ++i )
        {
            var result = true;
            result = result && this.checkTargetByUnitType( target, base );
            result = result && this.checkTargetByUnitLayer( target, base );
            result = result && this.checkTargetByRadius( target, base.getPosition(), base.getRadius() );
            result = result && this.checkTargetBySector( target, base );
            if( result )
            {
                target.applyDamage( base );
                EU.GameGSInstance.createEffect( base, target, base.getEffectOnShoot() );
            }
        }
    },
    refreshTargetsForTowers: function(){
        for( var i=0; i<this.units.length; ++i )
        {
            var tower = this.units[i];
            var max = tower._maxTargets;
            var targets = [];
            tower.get_targets( targets );
            for( var j = 0; j < targets.length; )
            {
                assert( targets[i] );
                if( this.checkAvailableTarget( targets[i], tower ) )
                    ++j;
                else
                    targets.splice( i, 1 );
            }
            for( j = 0; j < this.units.length && targets.length < max; ++j )
            {
                var creep = this.units[j];
                if( targets.indexOf( creep ) != -1 )
                    continue;
                var availabled = this.checkAvailableTarget( creep, tower );
                if( availabled )
                    targets.push( creep );
            }
            tower.capture_targets( targets );
        }
    },
    checkAvailableTarget: function( target, base ){
        var result = target != base;
        result = result && base != null;
        result = result && target != null;
        result = result && target.getCurrentHealth() > 0;
        result = result && target.current_state().get_name() != EU.MachineUnit.State.state_enter;
        result = result && this.checkTargetByArea( target );
        result = result && this.checkTargetByUnitType( target, base );
        result = result && this.checkTargetByEU.UnitLayer( target, base );
        result = result && base.checkTargetByRadius( target );
        result = result && this.checkTargetByRadius( target, base.getPosition(), base.getRadius() );
        //result = result && checkTargetBySector( target, base );
        return result;
    },
    checkTargetByArea: function( target ){
        //TODO: Its size game map
        var size = EU.k.LevelMapSize;
        var border = 30;
        var lx = border;
        var rx = size.width - border;
        var ty = size.height - border;
        var by = border;
        var pos = target.getPosition();
        var result = true;
        result = result && pos.x > lx;
        result = result && pos.y > by;
        result = result && pos.x < rx;
        result = result && pos.y < ty;
        return result;
    },
    checkTargetByUnitType: function( target, base ){
        var targetType = target._type;
        var baseType = base._type;
        if( baseType == EU.UnitType.creep && targetType == EU.UnitType.desant ) return true;
        if( baseType == EU.UnitType.creep && targetType == EU.UnitType.hero ) return true;
        if( baseType == EU.UnitType.tower && targetType == EU.UnitType.creep ) return true;
        if( baseType == EU.UnitType.desant && targetType == EU.UnitType.creep ) return true;
        if( baseType == EU.UnitType.hero && targetType == EU.UnitType.creep ) return true;
        if( baseType == EU.UnitType.other && targetType == EU.UnitType.other ) return true;
        return false;
    },
    checkTargetByUnitLayer: function( target, base ){
        var target_layer = target._unitLayer;
        var allow_targets = base._allowTargets;
        if( allow_targets.indexOf(target_layer) != -1 || allow_targets.indexOf(-1) != -1 )
            return true;
        return false;
    },
    checkTargetByRadius: function( target, center, radius ){
        var a = center;
        var b = target.getPosition();
        var result = EU.checkRadiusByEllipse( a, b, radius );
        return result;
    },
    checkTargetBySector: function( target,  base ){
        var result = true;
        if( base.getDamageBySector() )
        {
            var direction = base.getDirection();
            var radius = EU.Common.getDirectionByVector( target.getPosition() - base.getPosition() );
            var sector = base.getDamageBySectorAngle();
            while( direction < 0 ) direction += 360;
            while( radius < 0 ) radius += 360;
            result = Math.abs( direction - radius ) <= sector;
        }
        return result;
    },
    dispatchKillers: function(){
        if( this.hero )
        {
            var index = this.killers.indexOf( this.hero );
            if( index != -1 )
            {
                //var exp = EU.HeroExp.getEXP( this.hero.getName() );
                //for( var i=0; i<this.killers[index].length; ++i )
                //    exp += this.killers[index][i].getExp();
                //EU.HeroExp.setEXP( this.hero.getName(), exp );
            }
        }
    },
    isExistCreep: function( units )
    {
        if( !units )
            return false;
        for( var i=0; i<units.length; ++i )
        {
            if( units[i]._type == EU.UnitType.creep )
                return true;
        }
        return false;
    },
    event_towerBuild: function( place, unit ){
        //ParamCollection p;
        //p["event"] = "TurretAtPlace";
        //p["tower"] = unit.getName();
        //p["level"] = intToStr( unit.getLevel() );
        //p["mode"] = this.gameMode == GameMode.hard?"hard" : "normal";
        //TODO: flurry.logEvent( p );

    },
    event_towerUpgrade: function( unit ){
        //ParamCollection p;
        //p["event"] = "TurretUpgrade";
        //p["tower"] = unit.getName();
        //p["level"] = intToStr( unit.getLevel() );
        //p["mode"] = this.gameMode == GameMode.hard?"hard" : "normal";
        //TODO: flurry.logEvent( p );
    },
    event_towerSell: function( unit ){
        //ParamCollection p;
        //p["event"] = "TurretSell";
        //p["tower"] = unit.getName();
        //p["level"] = intToStr( unit.getLevel() );
        //p["mode"] = this.gameMode == GameMode.hard?"hard" : "normal";
        //TODO: flurry.logEvent( p );
    },
    event_levelFinished: function(){
        //ParamCollection p;
        //if( EU.ScoreCounter.getMoney( EU.kScoreHealth ) > 1 )
        //    p["event"] = "LevelComplete";
        //else
        //    p["event"] = "LevelFailed";
        //
        //p["level"] = intToStr( this.levelIndex );
        //p["mode"] = this.gameMode == GameMode.hard?"hard" : "normal";
        //p["stars"] = intToStr( this.statisticsParams.stars );
        //p["health"] = intToStr( EU.ScoreCounter.getMoney( EU.kScoreHealth ) );
        //p["gear"] = intToStr( EU.ScoreCounter.getMoney( EU.kScoreLevel ) );
        //TODO: flurry.logEvent( p );
    },
    event_startwave: function( index ){
        //ParamCollection p;
        //p["event"] = "WaveStart";
        //p["level"] = intToStr( this.levelIndex );
        //p["mode"] = this.gameMode == GameMode.hard?"hard" : "normal";
        //p["waveindex"] = intToStr( index );
        //TODO: flurry.logEvent( p );
    },
});
