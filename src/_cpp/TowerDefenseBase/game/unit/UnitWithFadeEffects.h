//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __UnitWithFadeEffects_h__
#define __UnitWithFadeEffects_h__
#include "Unit.h"
NS_CC_BEGIN

class UnitWithFadeEffects : public Unit
{
	DECLARE_BUILDER( UnitWithFadeEffects );
	bool init( const std::string & path, const std::string & xmlFile = "ini.xml" );
public:
	virtual void update( float dt );
protected:
	virtual void load( const pugi::xml_node & root );
	virtual bool setProperty( const std::string & name, const std::string & value );
private:
	float _time_ice;
	float _time_fire;
	float _time_electro;
	bool _fire;
	bool _ice;
	bool _electro;
	Color3B _color_fire;
	Color3B _color_ice;
	Color3B _color_electro;
};

NS_CC_END
#endif // #ifndef Unit