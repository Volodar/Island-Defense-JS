//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "resources.h"


//const std::string kPlistGarage( "plist/garage.plist::" );

std::string kFont( "fonts/whitefont1.fnt" );
std::string kFontStroke( "fonts/mdefensefont2.fnt" );
std::string kFontHelvetica( "fonts/helvetica.fnt" );
std::string kFontHelveticaStroke( "fonts/helveticastoke.fnt" );


#ifdef _DEBUG 
#if CC_TARGET_PLATFORM == CC_PLATFORM_WIN32
const std::string kDirectoryToMaps( "ini/maps/map" );
#else
const std::string kDirectoryToMaps( "ini/maps/map" );
#endif
#else
const std::string kDirectoryToMaps( "ini/maps/map" );
#endif

//
//		Sounds
//
#if CC_TARGET_PLATFORM == CC_PLATFORM_IOS
const std::string kPathSound( "audio/sound/" );
const std::string kPathMusic( "audio/music/" );
const std::string kSoundsEXT( ".m4a" );
const std::string kMusicEXT( ".m4a" );
#endif
#if CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID
const std::string kPathSound( "audio/sound_ogg/" );
const std::string kPathMusic( "audio/music_ogg/" );
const std::string kSoundsEXT( ".ogg" );
const std::string kMusicEXT( ".ogg" );
#endif
#if CC_TARGET_PLATFORM == CC_PLATFORM_WIN32
const std::string kPathSound( "../Resources.win/audio/sound/" );
const std::string kPathMusic( "../Resources.win/audio/music/" );
const std::string kSoundsEXT( ".wav" );
const std::string kMusicEXT( ".wav" );
#endif
#if CC_TARGET_PLATFORM == CC_PLATFORM_MAC
const std::string kPathSound( "audio/sound/" );
const std::string kPathMusic( "audio/music/" );
const std::string kSoundsEXT( ".m4a" );
const std::string kMusicEXT( ".wav" );
#endif


//const std::string kMusicInterface = kPathMusic + "track0" + kMusicEXT;
//const std::string kMusicGame0 = kPathMusic + "game0" + kMusicEXT;
const std::string kMusicMainMenu( "##music_mainmenu##" );
const std::string kMusicMap( "##music_map##" );
const std::string kMusicGamePeace( "##music_gamepeace##" );
const std::string kMusicGameBattle( "##music_gamebattle##" );
const std::string kMusicVictory( "##music_victory##" );
const std::string kMusicDefeat( "##music_defeat##" );

const std::string kSoundGameTowerBuy( kPathSound + "Building" + kSoundsEXT );
const std::string kSoundGameTowerUpgrade( kPathSound + "Building" + kSoundsEXT );
const std::string kSoundGameTowerPlaceActivate( kPathSound + "Clearing" + kSoundsEXT );
const std::string kSoundGameTowerPlaceSelect( kPathSound + "Click_2" + kSoundsEXT );
const std::string kSoundGameWaveIcon( kPathSound + "Click" + kSoundsEXT );
const std::string kSoundShopShow( kPathSound + "Shop_Open" + kSoundsEXT );
const std::string kSoundShopHide( kPathSound + "Shop_Close" + kSoundsEXT );
const std::string kSoundShopPurchase( kPathSound + "Buying" + kSoundsEXT );
const std::string kSoundLabUpgrade( kPathSound + "Upgrade_01" + kSoundsEXT );

const std::string kSoundGamePauseOn( kPathSound + "game_pause_on" + kSoundsEXT );
const std::string kSoundGamePauseOff( kPathSound + "game_pause_off" + kSoundsEXT );
const std::string kSoundGameFastModeOn( kPathSound + "game_fastmode_on" + kSoundsEXT );
const std::string kSoundGameFastModeOff( kPathSound + "game_fastmode_off" + kSoundsEXT );
const std::string kSoundGameTowerSelect( kPathSound + "game_select_tower" + kSoundsEXT );
const std::string kSoundGameTowerBuyCancel( kPathSound + "" + kSoundsEXT );
const std::string kSoundGameTowerSelling( kPathSound + "game_tower_selling" + kSoundsEXT );
const std::string kSoundGameTowerUpgradeCancel( kPathSound + "game_tower_upgrade_cancel" + kSoundsEXT );
const std::string kSoundGameMoneyAdd( kPathSound + "game_money_add" + kSoundsEXT );
const std::string kSoundGameCrystalAdd( kPathSound + "game_crystal_add" + kSoundsEXT );
const std::string kSoundGameFinishSuccess( kPathSound + "game_win" + kSoundsEXT );
const std::string kSoundGameFinishFailed( kPathSound + "game_fail" + kSoundsEXT );
const std::string kSoundStatisticAppearance( kPathSound + "statistic_appearance" + kSoundsEXT );
const std::string kSoundAppearanceText( kPathSound + "appearance_text" + kSoundsEXT );
const std::string kSoundAppearanceImage( kPathSound + "appearance_image" + kSoundsEXT );
const std::string kSoundGameStart( kPathSound + "game_start" + kSoundsEXT );
const std::string kSoundGarageUpgradeYes( kPathSound + "garage_upgrade_yes" + kSoundsEXT );
const std::string kSoundGarageUpgradeCancel( kPathSound + "garage_upgrade_cancel" + kSoundsEXT );

const std::string kSoundTowerAckAckShoot( kPathSound + "ackack_shoot" + kSoundsEXT );
const std::string kSoundTowerAckAckBulletHit( kPathSound + "ackack_bullet_hit" + kSoundsEXT );
const std::string kSoundTowerFlaregunShoot( kPathSound + "flaregun_shoot" + kSoundsEXT );
const std::string kSoundTowerFlaregunRacketHit( kPathSound + "flaregun_racket_hit" + kSoundsEXT );
const std::string kSoundTowerFlaregunCocking( kPathSound + "flaregun_cocking" + kSoundsEXT );
const std::string kSoundTowerFlaregunRelax( kPathSound + "flaregun_relax" + kSoundsEXT );
const std::string kSoundTowerFiregunShoot( kPathSound + "firegun_shoot" + kSoundsEXT );
const std::string kSoundTowerTeslaShoot( kPathSound + "tesla_shoot" + kSoundsEXT );
const std::string kSoundTowerTeslaRelax( kPathSound + "tesla_relax" + kSoundsEXT );
const std::string kSoundTowerLaserShoot( kPathSound + "laser_shoot" + kSoundsEXT );
const std::string kSoundTowerLaserCharge( kPathSound + "laser_charge" + kSoundsEXT );
const std::string kSoundTowerLaserCocking( kPathSound + "laser_cocking" + kSoundsEXT );
const std::string kSoundTowerLaserRelax( kPathSound + "laser_relax" + kSoundsEXT );
const std::string kSoundTowerNitrogenShoot( kPathSound + "nitrogen_shoot" + kSoundsEXT );
const std::string kSoundTowerHowitzerShoot( kPathSound + "howitzer_shoot" + kSoundsEXT );
