#ifndef __Hero_h__
#define __Hero_h__
#include "cocos2d.h"
#include "macroses.h"
#include "UnitDesant.h"
#include "ml/Singlton.h"
#include "inapp/purchase.h"
NS_CC_BEGIN



class HeroExp : public Singlton<HeroExp>
{
public:
	bool isHeroAvailabled( const std::string& name )const;
	bool isHeroAsInapp( const std::string& name );
	unsigned getLevelForUnlockHero( const std::string& name );

	void heroBought( const std::string& name )const;
	inapp::SkuDetails getHeroSkuDetails( const std::string& name );

	void  setEXP( const std::string & name, float exp );
	float getEXP( const std::string & name );

	float getLevel( float exp )const;
	float getExpOnLevelFinished( unsigned level )const;
	float getHeroLevelExtValue( unsigned level )const;
	float getCostLevelup( unsigned level )const;
	unsigned getMaxLevel()const;

	void skills( const std::string& name, std::vector<unsigned> & skills );
	unsigned skillPoints( const std::string& name );
	void setSkills( const std::string& name, const std::vector<unsigned> & skills );

	void checkUnlockedHeroes();

	virtual void onCreate() override;
protected:
private:
	std::vector<float> _heroLevels;
	std::vector<float> _levelAwards;
	std::vector<unsigned> _levelCosts;
	std::map<std::string, unsigned > _levelsForUnclockHeroes;
	std::map<std::string, std::vector<unsigned> > _skills;
	std::map<std::string, inapp::SkuDetails > _heroInappDetails;
};

class Hero : public UnitDesant
{
	enum Event
	{
		live = 100,
	};
	DECLARE_BUILDER( Hero );
	bool init( const std::string & path = "", const std::string & xmlFile = "" );
public:
	void initSkills();
	void die_update( float dt );
	bool moveTo( const Point & position );

	static void checkRoute( const TripleRoute & tripleroute, const Point & A, const Point & B, Route & route );
	void findOneRoute( const Point & position, Route & route );
	void findTwoRoute( const Point & position, Route & route );
	void finalizateRoute( const Point & position, Route & route );

protected:
	virtual bool setProperty( const std::string & stringproperty, const std::string & value )override;
	virtual void on_die() override;
	virtual void on_die_finish() override;
	virtual void stop_update(float dt)override;
private:
	float _dieTimer;
	float _regeneration;
	CC_SYNTHESIZE_READONLY_PASS_BY_REF( std::string, _skill, Skill );
};




NS_CC_END
#endif // #ifndef Hero