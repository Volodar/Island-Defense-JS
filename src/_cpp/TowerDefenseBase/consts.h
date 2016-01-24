//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __ml_CONSTS__
#define __ml_CONSTS__
#include <string>
#include "resources.h"

NS_CC_BEGIN
extern float DesignScale;
extern bool iPad;
extern bool iPhone;


namespace k
{
	
	namespace xmlTag
	{
		static const char * LevelWave = "wave";
		static const char * LevelWaves = "waves";
		static const char * LevelWavesHard = "waves_hard";
		static const char * LevelParams = "normal";
		static const char * LevelParamsHard = "hard";
		static const char * LevelRoute = "route";
		static const char * LevelRoutes = "routes";
		static const char * LevelTowerPlaces = "towerplaces";
		
		
		static const char * StartState = "start_state";
		static const char * MachineUnit = "machine_unit";
		static const char * MachineUnitStateTransitions = "transitions";
		static const char * MachineUnitParams = "params";
		static const char * MachineUnitStates = "states";
		static const char * MachineUnitEvents = "events";
		static const char * MachineUnitStateFire = "state_readyfire";
		static const char * MachineUnitStateWait = "state_waittarget";
		static const char * MachineUnitStateCocking = "state_cocking";
		static const char * MachineUnitStateCharging = "state_charging";
		static const char * MachineUnitStateRelaxation = "state_relaxation";
		static const char * MachineUnitDie = "state_death";
		static const char * MachineUnitEnter = "state_enter";
		static const char * UnitSkill = "skill";
		static const char * UnitSkills = "skills";

		static const char * Effects = "effects";
		static const char * Mover = "mover";
		static const char * ExtraProperties = "extraproperties";
	}
	namespace xmlAttr
	{
		static const char * name( "name" );
		static const char * type( "type" );
		static const char * value( "value" );

		static const char * LevelStartScore = "startscore";
		static const char * LevelHealth = "healths";
		static const char * LevelStartStar1 = "star1";
		static const char * LevelStartStar2 = "star2";
		static const char * LevelStartStar3 = "star3";
		static const char * LevelExcludeTowers = "exclude";

		static const char * MachineUnitFireReadyPreDelay = "predelay";
		static const char * MachineUnitFireReadyPostDelay = "postdelay";
		static const char * MachineUnitFireReadyChargeVolume = "charge_volume";
		static const char * MachineUnitDuration = "duration";
	}
	namespace attr
	{
	}
	namespace text
	{
		const std::string pressForClose( "Tap for close" );

		//const std::string Apply( "Apply" );
		//const std::string Exit( "Exit" );
		//const std::string Back( "Back" );
		//const std::string Close( "Close" );
		//const std::string Cancel( "Cancel" );
		//const std::string Buy( "Buy" );
		//const std::string Game( "Game" );
		//const std::string Garage( "Garage" );
		//const std::string Resume( "Resume" );
		//const std::string Restart( "Restart" );
		//const std::string Pause( "Pause" );
		//const std::string TapToContinue( "Tap to continue" );
		//const std::string Congratulations( "Congratulations" );
		//const std::string BadLuck( "Bad luck" );
		//const std::string Scored( "Scored" );
		//const std::string Spent( "Spent" );
		//const std::string GreatestDamage( "Greatest damage" );
		//const std::string GarageTextDesc( "garage_desc" );
		//const std::string MapTextDesc( "map_desc" );
		//const std::string Wave( "Wave" );
		//const std::string Levels( "Levels" );
		//const std::string Island_prefix( "Island" );
		//const std::string Location( "Location" );
		//const std::string Go( "Go" );
		//const std::string Upgrade( "Upgrade" );
		//const std::string RateApp( "Rateme" );
		//const std::string Award( "Award" );
		//const std::string Achievements( "Achievements" );
		//const std::string Obtained( "Obtained" );
		//const std::string Progress( "Progress" );
	}
	namespace user
	{
		const std::string BoughtScores( "bought_scores" );
		const std::string MaxFuelValue( "max_fuel_value" );
		const std::string DesantLifeTime( "desant_lifetime" );
		const std::string DesantCooldown( "desant_cooldown" );
		const std::string AirplaneCooldown( "airplane_cooldown" );
		const std::string LandmineCooldown( "landmine_cooldown" );
		const std::string SwatCooldown( "swat_cooldown" );
		const std::string SwatCount( "swat_count" );
		const std::string SwatLifetime( "swat_lifetime" );
		const std::string Hero3BotCooldown( "hero3bot_cooldown" );
		const std::string Hero3BotCount( "hero3bot_count" );
		const std::string Hero3BotLifetime( "hero3bot_lifetime" );
		const std::string UnShowAd( "unshowad" );
		const std::string UseTitorial( "usetutorial" );
		const std::string ShopGift( "shopgift" );
		const std::string LevelStars( "levelstars_" );
		const std::string LevelStarsHard( "levelstarsh_" );
		const std::string LevelUnlocked( "level_unlocked" );
		const std::string PurchaseSavedValue( "purchased_value" );
		const std::string BonuseItem( "bonusitem" );
		const std::string HeroCurrent( "hero_current" );
		const std::string HeroExp( "hero_exp" );
		const std::string HeroSkillPoints( "hero_points" );
		const std::string HeroBought( "hero_bought" );

		const std::string LastGameResult( "lastgameresult" );
		const std::string GameWinCounter( "gamewincounter" );
		static const int GameResultValueNone( 0 );
		static const int GameResultValueFail( 1 );
		static const int GameResultValueWin( 2 );
	}
//	namespace configuration
//	{
//		extern const bool useBoughtLevelScoresOnEveryLevel;
//		extern const bool useBoughtLevelScoresOnlyRestartLevel;
//	}
};



const std::string kUser_Level_prefix("level_"); //level::index::someinfo( complite, scores )
const std::string kUser_Complite_suffix("complite_");
const std::string kUser_Scores_suffix("scores_");
const std::string kUser_passedLevels("level_passed");
const std::string kUserValue_CompliteYes("complite_yes");
const std::string kUserValue_CompliteNo("complite_no");
const std::string kUserSoundEnabled("sound_enabled");
const std::string kUserMusicEnabled("music_enabled");

const std::string kUserTowerUpgradeLevel("tower_upgrade_level");
const std::string kUserTowerUpgradeDamage("tower_upgrade_dmg");
const std::string kUserTowerUpgradeRadius("tower_upgrade_rng");
const std::string kUserTowerUpgradeRateShoot("tower_upgrade_spd");

NS_CC_END;

#endif