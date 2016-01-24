//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 26.10.2014.
//
//
#ifndef __EventsGame_h__
#define __EventsGame_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/Events.h"
#include "Unit.h"
NS_CC_BEGIN





class EventCreateUnit : public EventBase
{
	DECLARE_BUILDER( EventCreateUnit );
	bool init();
public:
	virtual void execute( NodeExt * context );
	virtual void setParam( const std::string & name, const std::string & value );
	virtual std::string getParam( const std::string & name );
protected:
	std::vector<Unit::Pointer> createUnits( NodeExt * context );
private:
	std::list<std::string> _units;
	float _radius;
	float _lifetime;
	UnitType _unitType;
};

class EventCreateUnitReverseRoute : public EventCreateUnit
{
	DECLARE_BUILDER( EventCreateUnitReverseRoute );
	bool init();
public:
	virtual void execute( NodeExt * context );
};

class EventAreaDamage : public EventBase
{
	DECLARE_BUILDER( EventAreaDamage );
	bool init();
public:
	virtual void execute( NodeExt * context );
	virtual void setParam( const std::string & name, const std::string & value );
	virtual std::string getParam( const std::string & name );
protected:
private:
	float _radius;
	float _sector;
	UnitType _asUnitType;
};




NS_CC_END
#endif // #ifndef EventsGame