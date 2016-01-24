//
//  Skills.h
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 26.11.14.
//
//

#ifndef __IslandDefense__Skills__
#define __IslandDefense__Skills__

#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/pugixml/pugixml.hpp"
#include "ml/Events.h"

NS_CC_BEGIN;

class Unit;

class UnitSkill : public Ref
{
	DECLARE_BUILDER(UnitSkill);
	bool init( const pugi::xml_node & xmlNode, Unit* unit );
public:
	virtual void update( float dt, Unit* context )=0;
	virtual void onDamage( float damage ) {}
	virtual bool execution() { return false; }

	Unit* getUnit() { return _unit; }
private:
	Unit* _unit;
	CC_SYNTHESIZE_READONLY( std::string, _onlyState, OnlyState );
	CC_SYNTHESIZE_READONLY( std::string, _needUnitSkill, NeedUnitSkill );
	CC_SYNTHESIZE_READONLY( unsigned, _needUnitSkillLevel, NeedUnitSkillLevel );
};

class UnitSkillMedic : public UnitSkill
{
	DECLARE_BUILDER(UnitSkillMedic);
	bool init( const pugi::xml_node & xmlNode, Unit* unit );
public:
	virtual void update( float dt, Unit* context )override;
	virtual bool execution() override;
protected:
	void execute( Unit* context );
	void stop( Unit* context );
private:
	float _radius;
	float _frequence;
	float _health;
	float _duration;
	float _timer;
	float _timerDuration;
	unsigned _maxTargets;
	std::string _effectDescription;
	std::set<std::string> _allowUnits;
	bool _execution;
};

class UnitSkillRunTasksByTime : public UnitSkill
{
	DECLARE_BUILDER( UnitSkillRunTasksByTime );
	bool init( const pugi::xml_node & xmlNode, Unit* unit );
public:
	virtual void update( float dt, Unit* context );
protected:
	void execute( Unit* context );
	void stop( Unit* context );
private:
	float _timer;
	float _timerDuration;
	float _frequence;
	bool _stopedUnit;
	bool _resumeMoving;
	float _stopDuration;
	unsigned _count;
	EventsList _events;
};

class UnitSkillCounter : public UnitSkill
{
	DECLARE_BUILDER( UnitSkillCounter );
	bool init( const pugi::xml_node & xmlNode, Unit* unit );
public:
	virtual void update( float dt, Unit* context );
	virtual void onDamage( float damage );
protected:
	void execute();
	void executeBack();
private:
	template <class T>
	struct Counter
	{
		bool active;
		T def;
		T left;
		bool action( T decrement )
		{
			if( !active ) return false;
			left -= decrement;
			if( left <= 0 )
			{
				left = def;
				return true;
			}
			return false;
		}
	};
	bool _isActive;
	Counter<int> _damageCounter;
	Counter<float> _timeCounter;
	Counter<int> _damageCounterActive;
	Counter<float> _timeCounterActive;
	
	CC_SYNTHESIZE_READONLY( float, _value, Value );
	CC_SYNTHESIZE_READONLY_PASS_BY_REF( std::string, _type, Type );
};

class UnitSkillRateParameter : public UnitSkill
{
	DECLARE_BUILDER( UnitSkillRateParameter );
	bool init( const pugi::xml_node & xmlNode, Unit* unit );
public:
	virtual void update( float dt, Unit* context );
private:
	CC_SYNTHESIZE_READONLY( float, _rate, Rate );
	CC_SYNTHESIZE_READONLY( std::string, _parameter, Parameter );
};


NS_CC_END;

#endif /* defined(__IslandDefense__Skills__) */
