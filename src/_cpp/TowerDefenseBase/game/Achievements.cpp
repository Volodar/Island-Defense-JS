//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "Achievements.h"
#include "ml/pugixml/pugixml.hpp"
#include "UserData.h"

#if STEAMBUILD == 1
#include "st_achievements.h"


namespace steam
{
	CSteamAchievements*	g_SteamAchievements = NULL;

	// Defining our achievements
	enum EAchievements
	{
		ACHIEVEMENT_1_2 = 0,
		ACHIEVEMENT_1_3,
		ACHIEVEMENT_1_4,
		ACHIEVEMENT_1_5,
		ACHIEVEMENT_1_6,
		ACHIEVEMENT_1_7,
		ACHIEVEMENT_1_8,
		ACHIEVEMENT_1_9,
		ACHIEVEMENT_1_10,
		ACHIEVEMENT_1_11,
		ACHIEVEMENT_1_12,
		ACHIEVEMENT_1_13,
		ACHIEVEMENT_1_14,
		ACHIEVEMENT_1_15,
		ACHIEVEMENT_1_16,
		ACHIEVEMENT_1_17,
	};

	const size_t Achievement_count = 16;
	// Achievement array which will hold data about the achievements and their state
	Achievement_t g_Achievements[Achievement_count] =
	{
		_ACH_ID( ACHIEVEMENT_1_2, "ACHIEVEMENT_1_2" ),
		_ACH_ID( ACHIEVEMENT_1_3, "ACHIEVEMENT_1_3" ),
		_ACH_ID( ACHIEVEMENT_1_4, "ACHIEVEMENT_1_4" ),
		_ACH_ID( ACHIEVEMENT_1_5, "ACHIEVEMENT_1_5" ),
		_ACH_ID( ACHIEVEMENT_1_6, "ACHIEVEMENT_1_6" ),
		_ACH_ID( ACHIEVEMENT_1_7, "ACHIEVEMENT_1_7" ),
		_ACH_ID( ACHIEVEMENT_1_8, "ACHIEVEMENT_1_8" ),
		_ACH_ID( ACHIEVEMENT_1_9, "ACHIEVEMENT_1_9" ),
		_ACH_ID( ACHIEVEMENT_1_10, "ACHIEVEMENT_1_10" ),
		_ACH_ID( ACHIEVEMENT_1_11, "ACHIEVEMENT_1_11" ),
		_ACH_ID( ACHIEVEMENT_1_12, "ACHIEVEMENT_1_12" ),
		_ACH_ID( ACHIEVEMENT_1_13, "ACHIEVEMENT_1_13" ),
		_ACH_ID( ACHIEVEMENT_1_14, "ACHIEVEMENT_1_14" ),
		_ACH_ID( ACHIEVEMENT_1_15, "ACHIEVEMENT_1_15" ),
		_ACH_ID( ACHIEVEMENT_1_16, "ACHIEVEMENT_1_16" ),
		_ACH_ID( ACHIEVEMENT_1_17, "ACHIEVEMENT_1_17" ),
	};
}
#endif

NS_CC_BEGIN;

Achievements::Achievements()
{
#if STEAMBUILD == 1
	bool bRet = SteamAPI_Init();
	// Create the SteamAchievements object if Steam was successfully initialized
	if( bRet )
	{
		steam::g_SteamAchievements = new steam::CSteamAchievements( steam::g_Achievements, steam::Achievement_count );

		Director::getInstance()->getScheduler()->schedule( std::bind( &Achievements::update, this, std::placeholders::_1 ), this, 1, false, "achievements" );
	}
	load();
#endif
}

void Achievements::update( float dt )
{
#if STEAMBUILD == 1
	SteamAPI_RunCallbacks();
#endif
}

Achievements::~Achievements()
{
#if STEAMBUILD == 1
	SteamAPI_Shutdown();
	if( steam::g_SteamAchievements )
		delete steam::g_SteamAchievements;
#endif
}


Achievements::Info::Info()
: value(0)
, obtained_value(0)
{}

void Achievements::process( const std::string & eventName, int value )
{
	for( auto iter = m_list.begin(); iter != m_list.end(); ++iter )
	{
		if( iter->second.event != eventName )
			continue;
	
		if( iter->second.obtained() == false )
		{
			iter->second.obtained_value += value;
			UserData::shared().write( iter->first.c_str( ), iter->second.obtained_value );
			if( iter->second.obtained() == true )
			{
#if STEAMBUILD == 1
				if( steam::g_SteamAchievements )
					steam::g_SteamAchievements->SetAchievement( iter->first.c_str() );
				if( m_callback_achievementObtained )
					m_callback_achievementObtained( iter->first );
#endif
			}
		}
	}
}

void Achievements::fetch( std::set<std::string> & all )
{
	for( auto & iter : m_list )
	{
		all.insert(iter.first);
	}
}

Achievements::Info Achievements::info( const std::string & name )
{
	auto iter = m_list.find( name );
	return iter != m_list.end() ? iter->second : Info();
}

void Achievements::load()
{
	pugi::xml_document doc;
	doc.load_file( "ini/achievements.xml" );
	auto root = doc.root().first_child();
	for( auto node = root.first_child(); node; node = node.next_sibling() )
	{
		std::string name = node.attribute( "name" ).as_string();
#if STEAMBUILD == 1
		bool exist( false );
		for( auto steam_ach : steam::g_Achievements )
		{
			if( steam_ach.m_rgchName == name )exist = true;
		}
		if( exist == false )
			continue;
#endif
		Info info;
		info.event = node.attribute("event").as_string();
		info.value = node.attribute("value").as_int();
		info.obtained_value = UserData::shared().get_int(name.c_str());
		m_list[name] = info;
	}
}

void steam_clearAchievements()
{
#if STEAMBUILD == 1
#if USE_CHEATS == 1
	if( steam::g_SteamAchievements )
	{
		for( auto steam_ach : steam::g_Achievements )
			steam::g_SteamAchievements->ClearAchievement( steam_ach.m_pchAchievementID );
	}
#endif
#endif
}


NS_CC_END;
