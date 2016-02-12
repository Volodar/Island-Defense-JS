//Define namespace
var EU = EU || {};

EU.DesignScale = 1;
EU.iPad = true;
EU.iPhone = false;

EU.k =
{
    LevelWave : "wave",
    LevelWaves : "waves",
    LevelWavesHard : "waves_hard",
    LevelParams : "normal",
    LevelParamsHard : "hard",
    LevelRoute : "route",
    LevelRoutes : "routes",
    LevelTowerPlaces : "towerplaces",

    StartState : "start_state",
    MachineUnit : "machine_unit",
    MachineUnitStateTransitions : "transitions",
    MachineUnitParams : "params",
    MachineUnitStates : "states",
    MachineUnitEvents : "events",
    MachineUnitStateFire : "state_readyfire",
    MachineUnitStateWait : "state_waittarget",
    MachineUnitStateCocking : "state_cocking",
    MachineUnitStateCharging : "state_charging",
    MachineUnitStateRelaxation : "state_relaxation",
    MachineUnitDie : "state_death",
    MachineUnitEnter : "state_enter",
    UnitSkill : "skill",
    UnitSkills : "skills",

    Effects : "effects",
    Mover : "mover",
    ExtraProperties : "extraproperties",

    LevelStartScore : "startscore",
    LevelHealth : "healths",
    LevelStartStar1 : "star1",
    LevelStartStar2 : "star2",
    LevelStartStar3 : "star3",
    LevelExcludeTowers : "exclude",

    MachineUnitFireReadyPreDelay : "predelay",
    MachineUnitFireReadyPostDelay : "postdelay",
    MachineUnitFireReadyChargeVolume : "charge_volume",
    MachineUnitDuration : "duration",

    BoughtScores : "bought_scores",
    MaxFuelValue : "max_fuel_value",
    DesantLifeTime : "desant_lifetime",
    DesantCooldown : "desant_cooldown",
    AirplaneCooldown : "airplane_cooldown",
    LandmineCooldown : "landmine_cooldown",
    SwatCooldown : "swat_cooldown",
    SwatCount : "swat_count",
    SwatLifetime : "swat_lifetime",
    Hero3BotCooldown : "hero3bot_cooldown",
    Hero3BotCount : "hero3bot_count",
    Hero3BotLifetime : "hero3bot_lifetime",
    UnShowAd : "unshowad",
    UseTitorial : "usetutorial",
    ShopGift : "shopgift",
    LevelStars : "levelstars_",
    LevelStarsHard : "levelstarsh_",
    LevelUnlocked : "level_unlocked",
    PurchaseSavedValue : "purchased_value",
    BonuseItem : "bonusitem",
    HeroCurrent : "hero_current",
    HeroExp : "hero_exp",
    HeroSkillPoints : "hero_points",
    HeroBought : "hero_bought",

    LastGameResult : "lastgameresult",
    GameWinCounter : "gamewincounter",
    GameResultValueNone : 0 ,
    GameResultValueFail : 1 ,
    GameResultValueWin : 2 ,

    resourceGameSceneFolder : "gamescene::",
    IsometricValue : 1.5,
    kGameName : "IslandDefense",
    useInapps : false,
    useFuel : false,
    useFreeFuel : false,
    useFreeGold : false,
    useStarsForUnlock : false,
    useBoughtLevelScoresOnEveryLevel : false,
    useBoughtLevelScoresOnlyRestartLevel : false,
    useAds : false,
    useLeaderboards : false,

    useHero : false,
    minLevelHero : 0,
    useHeroRoom : false,
    useHeroesPromo : false,
    hideMainLogo : false,
    desertBuild : true,


    hideMoreButton : true,
    useRateMe : false,
    LinkToStore : "",
    LinkToStorePaidVersion : "",
    iconForPaidGame : false,
    useLinkToPaidVersion : false,

    InterstitialAdmob : 0x1,
    InterstitialChartboost : 0x2,
    InterstitialSupersonic : 0x3,
    InterstitialFyber : 0x4,
    InterstitialDeltaDNA : 0x5,

    RewardVideoVungle : 0x10,
    RewardVideoSupersonic : 0x11,
    RewardVideoFyber : 0x12,
    RewardVideoDeltaDNA : 0x13,

    OfferWallSupersonic : 0x20,

    AdsTypeRewardVideo : null,
    AdsTypeInterstitial : null,
    AdsTypeOfferWall : null,

    kInappPackage : "",
    kInappGold1 : "",
    kInappGold2 : "",
    kInappGold3 : "",
    kInappGold4 : "",
    kInappGold5 : "",
    kInappGear1 : "",
    kInappGear2 : "",
    kInappGear3 : "",
    kInappFuel1 : "",
    kInappHero2 : "",
    kInappHero3 : "",
    kInappAllHeroes : "",
    //GameScene
    LevelMapSize : cc.size(1024, 768),
};

EU.kUser_Level_prefix = "level_"; //level::index::someinfo( complite, scores )
EU.kUser_Complite_suffix = "complite_";
EU.kUser_Scores_suffix = "scores_";
EU.kUser_passedLevels = "level_passed";
EU.kUserValue_CompliteYes = "complite_yes";
EU.kUserValue_CompliteNo = "complite_no";
EU.kUserSoundEnabled = "sound_enabled";
EU.kUserMusicEnabled = "music_enabled";

EU.kUserTowerUpgradeLevel = "tower_upgrade_level";
EU.kUserTowerUpgradeDamage = "tower_upgrade_dmg";
EU.kUserTowerUpgradeRadius = "tower_upgrade_rng";
EU.kUserTowerUpgradeRateShoot = "tower_upgrade_spd";
