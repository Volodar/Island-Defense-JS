//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __Mover_h__
#define __Mover_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/pugixml/pugixml.hpp"
NS_CC_BEGIN

class Mover
{
public:
	Mover();
	void load( const pugi::xml_node & xmlnode );

	void update(float dt);
	void setRoute( const std::vector<Point>& route );
	const std::vector<Point>& getRoute()const;

	Point getPosition()const;

	/*
	use truncationg for direction, using previos directions
	*/
	const Vec2& setDirection( const Vec2 & direction );
	const Vec2& getDirection( )const;
	const float getRandomAngle( )const;
	void setLocation( const Point & position );
protected:
	void onFinish();
private:
	std::vector<Point> _route;
	Point _position;
	Vec2 _currentDirection;
	Vec2 _truncatedDirection;

	CC_SYNTHESIZE( float, _velocity, Velocity );
	CC_SYNTHESIZE( float, _defaultvelocity, DefaultVelocity );
	CC_SYNTHESIZE_PASS_BY_REF( std::vector<unsigned>, _allowAngles, AllowAngles );
	CC_SYNTHESIZE( unsigned, _thresold, AngleThresold );
	CC_SYNTHESIZE( unsigned, _currentAngle, CurrentAngle );
	CC_SYNTHESIZE( std::function<void( const Point&, const Vec2& )>, _onChangePosition, OnChangePosition );
	CC_SYNTHESIZE( std::function<void( )>, _onFinish, OnFinish);
};




NS_CC_END
#endif // #ifndef Mover