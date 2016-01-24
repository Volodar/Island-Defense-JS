//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __Achievements_h__
#define __Achievements_h__
#include "cocos2d.h"
#include "support.h"

NS_CC_BEGIN;

class Achievements : public Singlton<Achievements>
{
	friend class Singlton<Achievements>;
private:
	Achievements();
	~Achievements();
public:
	struct Info
	{
		Info();
		bool obtained()const { return obtained_value >= value; }
		
		std::string event;
		int value;
		int obtained_value;
	};
public:
	void process( const std::string & eventName, int value );
	void fetch( std::set<std::string> & all );
	Info info( const std::string & name );
	
	void setCallbackOnAchievementObtained( const std::function< void ( const std::string& ) > & cb ){ m_callback_achievementObtained = cb; }
protected:
	void update( float dt );
	void load();
private:
	std::map< std::string, Info > m_list;
	std::function< void ( const std::string& ) > m_callback_achievementObtained;
};

void steam_clearAchievements();

NS_CC_END;

#endif