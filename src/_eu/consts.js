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
