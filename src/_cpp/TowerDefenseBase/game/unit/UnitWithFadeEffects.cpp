//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "UnitWithFadeEffects.h"
#include "consts.h"
#include "GameGS.h"
#include "tower.h"
#include "UserData.h"
NS_CC_BEGIN


namespace
{
	const float duration = 0.5f;
};

UnitWithFadeEffects::UnitWithFadeEffects()
: _time_ice( 0 )
, _time_fire( 0 )
, _time_electro( 0 )
, _fire( false )
, _ice( false )
, _electro( false )
{}

UnitWithFadeEffects::~UnitWithFadeEffects()
{}

bool UnitWithFadeEffects::init( const std::string & path, const std::string & xmlFile )
{
	do
	{
		CC_BREAK_IF( !Unit::init( path, xmlFile ) );

		setCascadeColorEnabled( true );
		return true;
	}
	while( false );
	return false;
}

void UnitWithFadeEffects::load( const pugi::xml_node & root )
{
	Unit::load( root );

}

bool UnitWithFadeEffects::setProperty( const std::string & name, const std::string & value )
{
	if( name == "color_fire" )
		_color_fire = strToColor3B( value.empty() ? "FF0000" : value );
	else if( name == "color_ice" )
		_color_ice = strToColor3B( value.empty() ? "00FFFF" : value );
	else if( name == "color_electro" )
		_color_electro = strToColor3B( value.empty() ? "FFFF00" : value );
	else
		return Unit::setProperty(name, value);
	return true;
		
}


void UnitWithFadeEffects::update( float dt )
{
	Unit::update( dt );

	Color3B color = Color3B::WHITE;
	
	mlEffect & effect = getEffect( );
	if( effect.negative.fire.damageTime > 0 ||
	    effect.negative.ice.damageTime > 0 ||
	    effect.negative.electro.damageTime > 0
	   )
	{
		bool F = effect.negative.referentialExtendedDamageFire > 0 &&
			effect.positive.fireResist == 1;
		bool I = effect.negative.referentialExtendedDamageIce > 0 &&
			effect.positive.iceResist == 1;
		bool E = effect.negative.referentialExtendedDamageElectro > 0 &&
			effect.positive.electroResist == 1;
		int count = F + I + E;
		
		if( count == 1 )
		{
			_fire = F;
			_ice = I;
			_electro = E;
		}
		else if ( count > 1 )
		{
			if( F && _time_fire < duration * 2 ) { _fire = true; _ice = false; _electro = false; }
			else if( F && _fire && (_time_fire > duration * 2) ) _fire = false;
			if( I && !_fire && _time_ice < duration * 2 ) { _fire = false; _ice = true; _electro = false; }
			else if( I && !_fire && _ice && (_time_ice > duration * 2) ) _ice = false;
			if( E && !_fire && !_ice && _time_electro < duration * 2 ) { _fire = false; _ice = false; _electro = true; }
			else if( E && !_fire && !_ice && _electro && (_time_electro > duration * 2) ) _electro = false;

			assert( (_fire + _ice + _electro) == 1 );
		}
		else
		{
			_fire = false;
			_ice = false;
			_electro = false;
		}


		if( _fire )
		{
			if( _time_fire > duration * 2 ) _time_fire -= duration * 2;
			_time_fire += dt;			
			float t = _time_fire / duration;
			if( t > 1 ) t = 2 - t;

			Vec3 a( 1, 1, 1 );
			Vec3 b = Vec3( _color_fire.r, _color_fire.g, _color_fire.b ) / 255;
			Vec3 c = (a + (b - a) * t) * 255;
			color = Color3B( c.x, c.y, c.z );
		}
		else if( _ice )
		{
			_time_electro += dt;
			if( _time_electro > duration * 2 ) _time_electro -= duration * 2;
			float t = _time_electro / duration;
			if( t > 1 ) t = 2 - t;

			Vec3 a( 1, 1, 1 );
			Vec3 b = Vec3( _color_ice.r, _color_ice.g, _color_ice.b ) / 255;
			Vec3 c = (a + (b - a) * t) * 255;
			color = Color3B( c.x, c.y, c.z );
		}
		else if( _electro )
		{
			_time_electro += dt;
			if( _time_electro > duration * 2 ) _time_electro -= duration * 2;
			float t = _time_electro / duration;
			if( t > 1 ) t = 2 - t;

			Vec3 a( 1, 1, 1 );
			Vec3 b = Vec3( _color_electro.r, _color_electro.g, _color_electro.b ) / 255;
			Vec3 c = (a + (b - a) * t) * 255;
			color = Color3B( c.x, c.y, c.z );
		}

	}

	setColor( color );
}

NS_CC_END