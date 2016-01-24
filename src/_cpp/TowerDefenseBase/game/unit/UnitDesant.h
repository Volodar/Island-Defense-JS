#ifndef __UnitDesant_h__
#define __UnitDesant_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "Unit.h"
NS_CC_BEGIN


/*
1. remove on_mover
2. uncomment block if(result)... in method isNearestTarget
*/


class UnitDesant : public Unit
{
	DECLARE_BUILDER( UnitDesant );
	bool init( const std::string & path, const std::string & xmlFile );
public:
	virtual bool checkTargetByRadius( const Unit * target )const;
	virtual void capture_targets( const std::vector<Unit::Pointer> & targets ) override;

protected:
	virtual bool setProperty( const std::string & stringproperty, const std::string & value )override;
	virtual void on_die() override;
	//virtual void on_mover( const Point & position, const Vec2 & direction )override;

	void buildRouteToBase( std::vector<Point> & route );
	void buildRouteToTarget( std::vector<Point> & route );
	bool isNearestTarget( );
	bool isNearestBase( );
private:
	float _handRadius;
	float _handRadiusSector;
	std::vector<Unit::Pointer> _targets;
	CC_SYNTHESIZE_PASS_BY_REF( Point, _basePosition, BasePosition );
};




NS_CC_END
#endif // #ifndef UnitDesant