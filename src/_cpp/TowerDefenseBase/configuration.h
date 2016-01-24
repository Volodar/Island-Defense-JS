#ifndef __Configuration_h__
#define __Configuration_h__
#include <string>
#include "cocos2d.h"

#define GAME_ISLANDDEFENSE 0 
#define GAME_STEAMPUNK 1 
#define GAME_STEAMPUNKPRO 2
#define GAME_ISLANDDEFENSE_THUMPSTAR 3
#define GAME_STEAM 4

namespace cocos2d
{
namespace k
{
	extern const std::string resourceGameSceneFolder;
	extern const float IsometricValue;

namespace configuration
{

extern const std::string kGameName;
extern const bool useInapps;
extern const bool useFuel;
extern const bool useFreeFuel;
extern const bool useFreeGold;
extern const bool useStarsForUnlock;
extern const bool useBoughtLevelScoresOnEveryLevel;
extern const bool useBoughtLevelScoresOnlyRestartLevel;
extern const bool useAds;
extern const bool useLeaderboards;

extern const bool useHero;
extern const int  minLevelHero;
extern const bool useHeroRoom;
extern const bool useHeroesPromo;
extern const bool hideMainLogo;
extern const bool desertBuild;


extern const bool hideMoreButton;
extern const bool useRateMe;
extern const std::string LinkToStore;
extern const std::string LinkToStorePaidVersion;
extern const std::string iconForPaidGame;
extern const bool useLinkToPaidVersion;

static const int InterstitialAdmob( 0x1 );
static const int InterstitialChartboost( 0x2 );
static const int InterstitialSupersonic( 0x3 );
static const int InterstitialFyber( 0x4 );
static const int InterstitialDeltaDNA( 0x5 );

static const int RewardVideoVungle( 0x10 );
static const int RewardVideoSupersonic( 0x11 );
static const int RewardVideoFyber( 0x12 );
static const int RewardVideoDeltaDNA( 0x13 );

static const int OfferWallSupersonic( 0x20 );

extern const int AdsTypeRewardVideo;
extern const int AdsTypeInterstitial;
extern const int AdsTypeOfferWall;

extern const std::string kInappPackage;
extern const std::string kInappGold1;
extern const std::string kInappGold2;
extern const std::string kInappGold3;
extern const std::string kInappGold4;
extern const std::string kInappGold5;
extern const std::string kInappGear1;
extern const std::string kInappGear2;
extern const std::string kInappGear3;
extern const std::string kInappFuel1;
extern const std::string kInappHero2;
extern const std::string kInappHero3;
extern const std::string kInappAllHeroes;

//GameScene
extern const Size LevelMapSize;
}
}
}

#endif
