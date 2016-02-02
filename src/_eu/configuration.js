//Define namespace
var EU = EU || {};

EU.GAME_ISLANDDEFENSE = 0;
EU.GAME_STEAMPUNK = 1;
EU.GAME_STEAMPUNKPRO = 2;
EU.GAME_ISLANDDEFENSE_THUMPSTAR = 3;
EU.GAME_STEAM = 4;

EU.k = {
    resourceGameSceneFolder : EU.xmlLoader.resourcesRoot + "images/gamescene/",
    IsometricValue : null,
    configuration : {
        kGameName : null,
        useInapps : null,
        useFuel : null,
        useFreeFuel : null,
        useFreeGold : null,
        useStarsForUnlock : null,
        useBoughtLevelScoresOnEveryLevel : null,
        useBoughtLevelScoresOnlyRestartLevel : null,
        useAds : null,
        useLeaderboards : null,

        useHero : null,
         minLevelHero : null,
        useHeroRoom : null,
        useHeroesPromo : null,
        hideMainLogo : null,
        desertBuild : null,


        hideMoreButton : null,
        useRateMe : null,
        LinkToStore : null,
        LinkToStorePaidVersion : null,
        iconForPaidGame : null,
        useLinkToPaidVersion : null,

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

        kInappPackage : null,
        kInappGold1 : null,
        kInappGold2 : null,
        kInappGold3 : null,
        kInappGold4 : null,
        kInappGold5 : null,
        kInappGear1 : null,
        kInappGear2 : null,
        kInappGear3 : null,
        kInappFuel1 : null,
        kInappHero2 : null,
        kInappHero3 : null,
        kInappAllHeroes : null,
        //GameScene
        LevelMapSize : null,
    }
};

