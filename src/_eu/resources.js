//Define namespace
var EU = EU || {};

EU.kPathSpriteSquare = "images/square.png";
EU.kFont =  "fonts/whitefont1.fnt" ;
EU.kFontStroke =  "fonts/mdefensefont2.fnt" ;
EU.kFontHelvetica =  "fonts/helvetica.fnt" ;
EU.kFontHelveticaStroke =  "fonts/helveticastoke.fnt" ;

if(EU._DEBUG) {
    if (EU.CC_TARGET_PLATFORM == EU.CC_PLATFORM_WIN32)
        EU.kDirectoryToMaps =  "ini/maps/map" ;
    else
        EU.kDirectoryToMaps =  "ini/maps/map" ;
}
else {
    EU.kDirectoryToMaps =  "ini/maps/map" ;
}

//
//		Sounds
//
if (EU.CC_TARGET_PLATFORM == EU.CC_PLATFORM_IOS){
    EU.kPathSound =  "audio/sound/" ;
    EU.kPathMusic =  "audio/music/" ;
    EU.kSoundsEXT =  ".m4a" ;
    EU.kMusicEXT =  ".m4a" ;
}
if (EU.CC_TARGET_PLATFORM == EU.CC_PLATFORM_ANDROID){

    EU.kPathSound =  "audio/sound_ogg/" ;
    EU.kPathMusic =  "audio/music_ogg/" ;
    EU.kSoundsEXT =  ".ogg" ;
    EU.kMusicEXT =  ".ogg" ;
}
if (EU.CC_TARGET_PLATFORM == EU.CC_PLATFORM_WIN32){

    EU.kPathSound =  "../Resources.win/audio/sound/" ;
    EU.kPathMusic =  "../Resources.win/audio/music/" ;
    EU.kSoundsEXT =  ".wav" ;
    EU.kMusicEXT =  ".wav" ;
}
if (EU.CC_TARGET_PLATFORM == EU.CC_PLATFORM_MAC){
    EU.kPathSound =  "audio/sound/" ;
    EU.kPathMusic =  "audio/music/" ;
    EU.kSoundsEXT =  ".m4a" ;
    EU.kMusicEXT =  ".wav" ;
}


//const std::string EU.kMusicInterface = EU.kPathMusic + "track0" + EU.kMusicEXT;
//const std::string EU.kMusicGame0 = EU.kPathMusic + "game0" + EU.kMusicEXT;
EU.kMusicMainMenu =  "##music_mainmenu##" ;
EU.kMusicMap =  "##music_map##" ;
EU.kMusicGamePeace =  "##music_gamepeace##" ;
EU.kMusicGameBattle =  "##music_gamebattle##" ;
EU.kMusicVictory =  "##music_victory##" ;
EU.kMusicDefeat =  "##music_defeat##" ;

EU.kSoundGameTowerBuy =  EU.kPathSound + "Building" + EU.kSoundsEXT ;
EU.kSoundGameTowerUpgrade =  EU.kPathSound + "Building" + EU.kSoundsEXT ;
EU.kSoundGameTowerPlaceActivate =  EU.kPathSound + "Clearing" + EU.kSoundsEXT ;
EU.kSoundGameTowerPlaceSelect =  EU.kPathSound + "Click_2" + EU.kSoundsEXT ;
EU.kSoundGameWaveIcon =  EU.kPathSound + "Click" + EU.kSoundsEXT ;
EU.kSoundShopShow =  EU.kPathSound + "Shop_Open" + EU.kSoundsEXT ;
EU.kSoundShopHide =  EU.kPathSound + "Shop_Close" + EU.kSoundsEXT ;
EU.kSoundShopPurchase =  EU.kPathSound + "Buying" + EU.kSoundsEXT ;
EU.kSoundLabUpgrade =  EU.kPathSound + "Upgrade_01" + EU.kSoundsEXT ;

EU.kSoundGamePauseOn =  EU.kPathSound + "game_pause_on" + EU.kSoundsEXT ;
EU.kSoundGamePauseOff =  EU.kPathSound + "game_pause_off" + EU.kSoundsEXT ;
EU.kSoundGameFastModeOn =  EU.kPathSound + "game_fastmode_on" + EU.kSoundsEXT ;
EU.kSoundGameFastModeOff =  EU.kPathSound + "game_fastmode_off" + EU.kSoundsEXT ;
EU.kSoundGameTowerSelect =  EU.kPathSound + "game_select_tower" + EU.kSoundsEXT ;
EU.kSoundGameTowerBuyCancel =  EU.kPathSound + "" + EU.kSoundsEXT ;
EU.kSoundGameTowerSelling =  EU.kPathSound + "game_tower_selling" + EU.kSoundsEXT ;
EU.kSoundGameTowerUpgradeCancel =  EU.kPathSound + "game_tower_upgrade_cancel" + EU.kSoundsEXT ;
EU.kSoundGameMoneyAdd =  EU.kPathSound + "game_money_add" + EU.kSoundsEXT ;
EU.kSoundGameCrystalAdd =  EU.kPathSound + "game_crystal_add" + EU.kSoundsEXT ;
EU.kSoundGameFinishSuccess =  EU.kPathSound + "game_win" + EU.kSoundsEXT ;
EU.kSoundGameFinishFailed =  EU.kPathSound + "game_fail" + EU.kSoundsEXT ;
EU.kSoundStatisticAppearance =  EU.kPathSound + "statistic_appearance" + EU.kSoundsEXT ;
EU.kSoundAppearanceText =  EU.kPathSound + "appearance_text" + EU.kSoundsEXT ;
EU.kSoundAppearanceImage =  EU.kPathSound + "appearance_image" + EU.kSoundsEXT ;
EU.kSoundGameStart =  EU.kPathSound + "game_start" + EU.kSoundsEXT ;
EU.kSoundGarageUpgradeYes =  EU.kPathSound + "garage_upgrade_yes" + EU.kSoundsEXT ;
EU.kSoundGarageUpgradeCancel =  EU.kPathSound + "garage_upgrade_cancel" + EU.kSoundsEXT ;

EU.kSoundTowerAckAckShoot =  EU.kPathSound + "ackack_shoot" + EU.kSoundsEXT ;
EU.kSoundTowerAckAckBulletHit =  EU.kPathSound + "ackack_bullet_hit" + EU.kSoundsEXT ;
EU.kSoundTowerFlaregunShoot =  EU.kPathSound + "flaregun_shoot" + EU.kSoundsEXT ;
EU.kSoundTowerFlaregunRacketHit =  EU.kPathSound + "flaregun_racket_hit" + EU.kSoundsEXT ;
EU.kSoundTowerFlaregunCocking =  EU.kPathSound + "flaregun_cocking" + EU.kSoundsEXT ;
EU.kSoundTowerFlaregunRelax =  EU.kPathSound + "flaregun_relax" + EU.kSoundsEXT ;
EU.kSoundTowerFiregunShoot =  EU.kPathSound + "firegun_shoot" + EU.kSoundsEXT ;
EU.kSoundTowerTeslaShoot =  EU.kPathSound + "tesla_shoot" + EU.kSoundsEXT ;
EU.kSoundTowerTeslaRelax =  EU.kPathSound + "tesla_relax" + EU.kSoundsEXT ;
EU.kSoundTowerLaserShoot =  EU.kPathSound + "laser_shoot" + EU.kSoundsEXT ;
EU.kSoundTowerLaserCharge =  EU.kPathSound + "laser_charge" + EU.kSoundsEXT ;
EU.kSoundTowerLaserCocking =  EU.kPathSound + "laser_cocking" + EU.kSoundsEXT ;
EU.kSoundTowerLaserRelax =  EU.kPathSound + "laser_relax" + EU.kSoundsEXT ;
EU.kSoundTowerNitrogenShoot =  EU.kPathSound + "nitrogen_shoot" + EU.kSoundsEXT ;
EU.kSoundTowerHowitzerShoot =  EU.kPathSound + "howitzer_shoot" + EU.kSoundsEXT ;
