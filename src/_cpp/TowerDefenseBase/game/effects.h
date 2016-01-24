//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __EFFECTS__
#define __EFFECTS__
#include "cocos2d.h"
#include "ml/pugixml/pugixml.hpp"

NS_CC_BEGIN;

class Unit;

class mlEffect
{
public:
	mlEffect( Unit * selfObject );

	void setUnit( Unit * selfObject );
	void clear();
	void copyFrom(mlEffect & source);
	void load(const pugi::xml_node & node);

	void  update(float dt);
	void  applyEffects( const Unit * damager );
	float computeDamage( const Unit * damager );
	float computeMoveVelocityRate( );
	float computeExtendedDamage(float dt);

public:
	struct Negative {
		struct Damage
		{
			Damage():damageTime(0),damageRate(0){}
			float damageTime;
			float damageRate;
		};
		float velocityMoveRate;
		float velocityMoveTimeLeft;
		float armorLowRate;
		float armorLowTimeLeft;
		
		Damage fire;
		Damage ice;
		Damage electro;

		float referentialExtendedDamageFire;
		float referentialExtendedDamageIce;
		float referentialExtendedDamageElectro;
	}
	negative;
	
	struct {
		/*
		total damage = damage - armor + fire/resist + ice/resist + electro/resist;
		*/
		float damage; 
		float armor;
		bool  isCanStoppedMove;
		
		float fireRate;
		float iceRate;
		float electroRate;
		float velocityRate;
		float fireTime;
		float iceTime;
		float electroTime;
		float velocityTime;

		float fireResist;
		float electroResist;
		float iceResist;
	}
	positive;
protected:
	Unit * m_unit;
};

NS_CC_END;
#endif
