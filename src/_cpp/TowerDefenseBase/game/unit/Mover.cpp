//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "Mover.h"
#include "ml/common.h"
NS_CC_BEGIN


Mover::Mover()
: _route()
, _position()
, _currentDirection()
, _truncatedDirection()
, _currentAngle( 0 )
, _velocity( 0 )
, _onChangePosition()
, _onFinish()
{}

void Mover::load( const pugi::xml_node & xmlnode )
{
	auto xmlparams = xmlnode.child( "params" );
	auto xmlangles = xmlparams.child( "allowangles" );
	auto xmlthresold = xmlparams.child( "thresold" );

	std::list<std::string> angles;
	split( angles, xmlangles.attribute( "value" ).as_string() );
	for( auto angle : angles )
	{
		_allowAngles.push_back( strToInt( angle ) );
	}
	_thresold = xmlthresold.attribute( "value" ).as_float();
}

void Mover::update( float dt )
{
	if( _route.empty() )
		return;
	Point direction;

	float moveVelocity = _velocity;
	while( _route.empty() == false )
	{
		direction = _route.front() - getPosition();
		float T = direction.getDistance( Point::ZERO ) / (moveVelocity*dt);
		if( T < 1 )
			_route.erase( _route.begin() );
		else
			break;
	}

	direction.normalize();

	float isometric = (1 + fabs( direction.x )) / 2;
	Point shift = direction * moveVelocity * dt * isometric;

	setLocation( _position + shift );


	if( _route.empty() )
	{
		onFinish();
	}
}

void Mover::setRoute( const std::vector<Point> & route )
{
	_route = route;

	if( _route.empty() )
	{
		onFinish();
	}
	else
	{
		Vec2 direction = _route.size() > 1 ? _route[1] - _route[0] : Vec2( 1, 0 );
		direction.normalize();
		setDirection( direction );
		setLocation( _route[0] );
	}
}

const std::vector<Point>& Mover::getRoute( )const
{
	return _route;
};

Point Mover::getPosition()const
{
	return _position;
}

void Mover::onFinish()
{
	if( _onFinish )
		_onFinish();
}

void Mover::setLocation( const Point & position )
{
	Vec2 direction = (position - _position).getNormalized();
	_position = position;
	setDirection( direction );

	if( _onChangePosition )
	{
		_onChangePosition( _position, _truncatedDirection );
	}
}


const Vec2& Mover::setDirection( const Vec2 & direction )
{
	auto as = [this]( float dir, float a )
	{
		auto ra = []( float a ){ while( a < 0 ) a += 360; return a; };
		bool A = ra( a ) < dir + _thresold;
		bool B = ra( a ) > ra( dir - _thresold );
		if( (dir - _thresold) < 0 ) return A || B;
		else return A && B;
	};

	float a = getDirectionByVector( direction );

	for( auto angle : _allowAngles )
	{
		if( as( angle, a ) )
		{
			_currentAngle = angle;
			break;
		}
	}

	return _truncatedDirection;
}

const Vec2& Mover::getDirection()const
{
	return _truncatedDirection;
}

const float Mover::getRandomAngle( )const
{
	if( _allowAngles.size() == 0 )return 0;
	
	int index = rand() % _allowAngles.size();
	return _allowAngles[index];
}



NS_CC_END