//Define namespace
var EU = EU || {};

EU.GAME_ISLANDDEFENSE = 0;
EU.GAME_STEAMPUNK = 1;
EU.GAME_STEAMPUNKPRO = 2;
EU.GAME_ISLANDDEFENSE_THUMPSTAR = 3;
EU.GAME_STEAM = 4;

EU.k = {
    resourceGameSceneFolder : null,
    IsometricValue : 1.5,
    configuration : {
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
        LevelMapSize : new cc.Size( 1024, 768 ),
    }
};

