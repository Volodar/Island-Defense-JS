//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "effects.h"
#include "unit/unit.h"
NS_CC_BEGIN;

mlEffect::mlEffect( Unit * selfObject )
: m_unit( selfObject )
{
	negative.velocityMoveRate = 1.f;
	negative.velocityMoveTimeLeft = 0.f;
	negative.armorLowRate = 0.f;
	negative.armorLowTimeLeft = 0.f;
	negative.fire.damageRate = 0.f;
	negative.fire.damageTime = 0.f;
	negative.ice.damageRate = 0.f;
	negative.ice.damageTime = 0.f;
	negative.electro.damageRate = 0.f;
	negative.electro.damageTime = 0.f;
	negative.referentialExtendedDamageIce = 0.f;
	negative.referentialExtendedDamageFire = 0.f;
	negative.referentialExtendedDamageElectro = 0.f;

	positive.damage = 0.f;
	positive.fireRate = 0.f;
	positive.iceRate = 0.f;
	positive.electroRate = 0.f;
	positive.velocityRate = 1.f;
	positive.fireTime = 0.f;
	positive.iceTime = 0.f;
	positive.electroTime = 0.f;
	positive.velocityTime = 1.f;
	positive.isCanStoppedMove = false;
	positive.armor = 0.f;
	positive.fireResist = 1.f;
	positive.electroResist = 1.f;
	positive.iceResist = 1.f;
}

void mlEffect::setUnit( Unit * selfObject )
{
	m_unit = selfObject;
}

void mlEffect::clear()
{
	negative.velocityMoveRate = 1.f;
	negative.velocityMoveTimeLeft = 0.f;
	negative.armorLowRate = 0.f;
	negative.armorLowTimeLeft = 0.f;
	negative.fire.damageRate = 0.f;
	negative.fire.damageTime = 0.f;
	negative.ice.damageRate = 0.f;
	negative.ice.damageTime = 0.f;
	negative.electro.damageRate = 0.f;
}

void mlEffect::copyFrom( mlEffect & source )
{
	negative = source.negative;
	positive = source.positive;
}

void mlEffect::load( const pugi::xml_node & node )
{
	pugi::xml_node p = node.child( "positive" );
	pugi::xml_node n = node.child( "negative" );

	negative.velocityMoveRate = n.attribute( "velocityMoveRate" ).as_float( 1.f );
	negative.velocityMoveTimeLeft = n.attribute( "velocityMoveTimeLeft" ).as_float( 0.f );
	negative.armorLowRate = n.attribute( "armorLowRate" ).as_float( 0.f );
	negative.armorLowTimeLeft = n.attribute( "armorLowTimeLeft" ).as_float( 0.f );

	positive.damage = p.attribute( "damage" ).as_float( 0.f );
	positive.fireRate = p.attribute( "fireRate" ).as_float( 0.f );
	positive.iceRate = p.attribute( "iceRate" ).as_float( 0.f );
	positive.electroRate = p.attribute( "electroRate" ).as_float( 0.f );
	positive.velocityRate = p.attribute( "velocityRate" ).as_float( 1.f );

	positive.fireTime = p.attribute( "fireTime" ).as_float( 0.f );
	positive.iceTime = p.attribute( "iceTime" ).as_float( 0.f );
	positive.electroTime = p.attribute( "electroTime" ).as_float( 0.f );
	positive.velocityTime = p.attribute( "velocityTime" ).as_float( 0.f );

	positive.isCanStoppedMove = p.attribute( "isCanStoppedMove" ).as_bool( false );
	positive.armor = p.attribute( "armor" ).as_float( 0.f );
	positive.fireResist = p.attribute( "fireResist" ).as_float( 1.f );
	positive.electroResist = p.attribute( "electroResist" ).as_float( 1.f );
	positive.iceResist = p.attribute( "iceResist" ).as_float( 1.f );
}

void mlEffect::update( float dt )
{
	negative.fire.damageTime = std::max( negative.fire.damageTime - dt, 0.f );
	negative.ice.damageTime = std::max( negative.ice.damageTime - dt, 0.f );
	negative.electro.damageTime = std::max( negative.electro.damageTime - dt, 0.f );
	negative.velocityMoveTimeLeft = std::max( negative.velocityMoveTimeLeft - dt, 0.f );
	negative.armorLowTimeLeft = std::max( negative.armorLowTimeLeft - dt, 0.f );
	
	if( negative.fire.damageTime <= 0.f )
		negative.referentialExtendedDamageFire = 0.f;
	if( negative.ice.damageTime <= 0.f )
		negative.referentialExtendedDamageIce = 0.f;
	if( negative.electro.damageTime <= 0.f )
		negative.referentialExtendedDamageElectro = 0.f;
}

void  mlEffect::applyEffects( const Unit * damager )
{
	assert( damager );
	const mlEffect & effect = damager->getEffect();

	negative.referentialExtendedDamageIce += std::max( 0.f, effect.positive.iceRate * effect.positive.iceTime / positive.iceResist );
	negative.referentialExtendedDamageFire += std::max( 0.f, effect.positive.fireRate * effect.positive.fireTime / positive.fireResist );
	negative.referentialExtendedDamageElectro += std::max( 0.f, effect.positive.electroRate * effect.positive.electroTime / positive.electroResist );

	negative.fire.damageTime = std::max(negative.fire.damageTime, effect.positive.fireTime);
	negative.fire.damageRate = std::max(negative.fire.damageRate, effect.positive.fireRate / positive.fireResist );
	negative.ice.damageTime = std::max(negative.ice.damageTime, effect.positive.iceTime);
	negative.ice.damageRate = std::max(negative.ice.damageRate, effect.positive.iceRate / positive.iceResist );
	negative.electro.damageTime = std::max(negative.electro.damageTime, effect.positive.electroTime);
	negative.electro.damageRate = std::max(negative.electro.damageRate, effect.positive.electroRate / positive.electroResist );
	negative.fire.damageTime = std::max(negative.fire.damageTime, 0.f );
	negative.fire.damageRate = std::max(negative.fire.damageRate, 0.f );
	negative.ice.damageTime = std::max(negative.ice.damageTime, 0.f );
	negative.ice.damageRate = std::max(negative.ice.damageRate, 0.f );
	negative.electro.damageTime = std::max(negative.electro.damageTime, 0.f );
	negative.electro.damageRate = std::max(negative.electro.damageRate, 0.f );
	
	negative.velocityMoveTimeLeft = std::max( negative.velocityMoveTimeLeft, effect.positive.velocityTime );
	negative.velocityMoveRate = std::max( 0.f, std::min( negative.velocityMoveRate, effect.positive.velocityRate ) );
}

float mlEffect::computeDamage( const Unit * damager )
{
	assert( damager );
	float damage( 0.f );
	const mlEffect & effect = damager->getEffect();
	damage = std::max( 0.f, effect.positive.damage - positive.armor );

	return damage;
}

float mlEffect::computeMoveVelocityRate()
{
	float velocity = 1;
	if( negative.velocityMoveTimeLeft > 0 )
		velocity = std::max( 0.f, negative.velocityMoveRate * velocity );
	return velocity;
}

float mlEffect::computeExtendedDamage( float dt )
{
	float extendedDamage = 0.f;
	auto compute = [dt]( Negative::Damage p )
	{
		float time = std::max(0.f, std::min( dt, p.damageTime ));
		return p.damageRate * time;
	};
	extendedDamage += compute( negative.fire );
	extendedDamage += compute( negative.ice );
	extendedDamage += compute( negative.electro );

	extendedDamage = std::max( 0.f, extendedDamage );
	return extendedDamage;
}


NS_CC_END;