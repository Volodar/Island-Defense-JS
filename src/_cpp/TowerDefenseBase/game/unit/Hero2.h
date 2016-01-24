#ifndef __Hero2_h__
#define __Hero2_h__
#include "cocos2d.h"
#include "macroses.h"
#include "Hero.h"
NS_CC_BEGIN

class UnitSniper : public UnitSkill
{
	DECLARE_BUILDER( UnitSniper );
	bool init( const pugi::xml_node & xmlNode, Unit* unit );
public:
	virtual void update( float dt, Unit* context );
	virtual bool execution();
protected:
	void shoot();
	void captureTarget();
	void releaseTarget();
private:
	enum class State { wait, prepare, colling, };
	Unit::Pointer _target;
	ActionPointer _aimAnimation;
	NodePointer _aim;
	State _state;
	float _timer;
	float _delay;
	float _prepare;
	float _colling;
	float _radius;
	mlEffect _effect;
};


class Hero2 : public Hero
{
	DECLARE_BUILDER( Hero2 );
	bool init( const std::string & path="", const std::string & xmlFile="" );
public:
	virtual void update( float dt );
protected:
	virtual UnitSkill::Pointer loadXmlSkill( const pugi::xml_node & xmlnode );
private:
	UnitSkill::Pointer _activeSkill;
};




NS_CC_END
#endif // #ifndef Hero