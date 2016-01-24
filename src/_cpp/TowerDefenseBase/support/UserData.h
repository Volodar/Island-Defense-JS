//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __USER_DATA__
#define __USER_DATA__

#include "cocos2d.h"
#include "support.h"
NS_CC_BEGIN;

class UserData : public Singlton<UserData>
{
public:
	UserData();
	virtual ~UserData();
	void clear( );
	void save();
public:
	void level_complite( unsigned index );
	int level_incrementPassed();
	int level_getCountPassed();
	int level_getScoresByIndex(int levelIndex);
	void level_setCountPassed(int value);
	void level_setScoresByIndex(int levelIndex, int value);

	int tower_upgradeLevel( const std::string & name );
	void tower_upgradeLevel( const std::string & name, int level );
	float tower_damage( const std::string & name );
	float tower_radius( const std::string & name );
	float tower_rateshoot( const std::string & name );
	void tower_damage( const std::string & name, float value );
	void tower_radius( const std::string & name, float value );
	void tower_rateshoot( const std::string & name, float value );

	int bonusitem_add( unsigned index, int count );
	int bonusitem_sub( unsigned index, int count = 1 );
	int bonusitem_count( unsigned index );
	
	void hero_setCurrent( unsigned index );
	unsigned hero_getCurrent();
public:
	void write( const std::string & key, int value );
	void write( const std::string & key, bool value );
	void write( const std::string & key, float value );
	void write( const std::string & key, const std::string & value );

	int get_int( const std::string & key, int defaultvalue = 0 );
	bool get_bool( const std::string & key, bool defaultvalue = false );
	float get_float( const std::string & key, float defaultvalue = 0 );
	std::string get_str( const std::string & key, const std::string & defaultvalue = "" );
private:
	void write( const std::string & key, const char * value );
};

NS_CC_END;
#endif