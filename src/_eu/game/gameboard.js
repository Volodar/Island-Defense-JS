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
        this._super();
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
    /** Type{EU.Hero}*/hero : null,
    /** Type{Object[EU.Unit, Float}*/ damagers : null,
    /** Type{Object{EU.Unit, Array<EU.Unit>}*/ killers : null,
    /** Type{EU.FinishLevelParams}*/ statisticsParams : null,
    /** Type{Array<TripleRoute>}*/ creepsRoutes : null,
    /** Type{EU.GameMode}*/ gameMode : null,
    /** Type{Integer}*/ levelIndex : null,
    /** Type{EU.SkillParams}*/ skillParams : null,
    /** Type{bool}*/ isGameStarted : null,
    /** Type{bool}*/ isFinihedWaves : null,
    /** Type{bool}*/ isFinihedGame : null,
    /** Type{bool}*/ isFinishedWave : null,
    /** Type{Integer}*/ heartsForStar1 : null,
    /** Type{Integer}*/ heartsForStar2 : null,
    /** Type{Integer}*/ heartsForStar3 : null,
    /** Type{Integer}*/ leaderboardScore : null,
    /** Type{Array< Object{ EU.Unit, Float} >}*/ desants : null,
    //CC_SYNTHESIZE_PASS_BY_REF( std::vector<TripleRoute>, creepsRoutes, CreepsRoutes ){},
    //CC_SYNTHESIZE_READONLY( GameMode , gameMode, GameMode){},
    //CC_SYNTHESIZE_READONLY( unsigned, levelIndex, CurrentLevelIndex ){},
    //CC_SYNTHESIZE_READONLY( SkillParams, skillParams, SkillParams ){},


    ctor: function(){},
    //~GameBoard(){},
    loadLevel: function( index, gamemode ){},
    loadLevelParams: function( xmlnode ){},
    update: function( dt ){},
    updateSkills: function( dt ){},
    
    clear: function(){},
    
    loadRoute: function( route, xmlnode ){},
    loadRoutes: function( routes, xmlnode ){},
    loadTowerPlaces: function( places, xmlnode ){},
    
    startGame: function(){},
    
    onPredelayWave: function( waveInfo, delay ){},
    onStartWave: function( waveInfo ){},
    onFinishWave: function(){},
    onFinishWaves: function(){},
    onFinishGame: function(){},
    isGameStarted: function(){},
    onDamage: function( damager, target, damage ){},
    onKill: function( damager, target ){},
    isTowerPlace: function( location ){},
    
    createCreep: function( name, route, position ){},
    createCreep: function( name, routeSubType, routeIndex ){},
    
    createTower: function( name ){},
    createDesant: function( name, position, lifetime ){},
    createBomb: function( position ){},
    createLandMine: function( position, count ){},
    createBonusItem: function( position, name ){},
    addUnit: function( tower ){},
    upgradeTower: function( tower ){},
    removeTower: function( tower ){},
    
    getHero: function(){},
    
    remove: function( creep ){},
    preDeath: function( creep ){},
    death: function( creep ){},
    
    checkWaveFinished: function(){},
    checkGameFinished: function(){},
    activateTowerPlace: function( place ){},
    
    getRoutesCount: function(){
        return creepsRoutes.length;
    },
    /** routeSubType = RouteSubType::random*/
    getRandomRoute: function( unitLayer, index, routeSubType ){},
    getRoute: function( unitLayer, position, distance ){},
    
    getTargetsByRadius: function( out, center, radius ){},
    applyDamageBySector: function( base ){},
    createHero: function(){},
    buildTower: function( name, level, unit ){},
    buildCreep: function( name ){},
    creepFromReserve: function( name ){},
    refreshTargetsForTowers: function(){},
    checkAvailableTarget: function( target, base ){},
    checkTargetByArea: function( target ){},
    checkTargetByUnitType: function( target, base ){},
    checkTargetByUnitLayer: function( target, base ){},
    checkTargetByRadius: function( target, center, radius ){},
    checkTargetBySector: function( target,  base ){},
    dispatchDamagers: function(){},
    dispatchKillers: function(){},
    event_towerBuild: function( place, unit ){},
    event_towerUpgrade: function( unit ){},
    event_towerSell: function( unit ){},
    event_levelFinished: function(){},
    event_startwave: function( index ){},
});