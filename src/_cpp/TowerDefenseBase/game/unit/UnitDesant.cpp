#include "UnitDesant.h"
#include "ml/common.h"
NS_CC_BEGIN





UnitDesant::UnitDesant()
: _handRadius( 60 )
, _handRadiusSector(30)
{}

UnitDesant::~UnitDesant()
{}

bool UnitDesant::init( const std::string & path, const std::string & xmlFile )
{
	return Unit::init( path, xmlFile );
}

bool UnitDesant::checkTargetByRadius( const Unit * target )const
{
	assert( target );
	Point a = _basePosition;
	Point b = target->getPosition( );
	bool byradius = checkRadiusByEllipse( a, b, getRadius( ) );
	return byradius;
}

void UnitDesant::capture_targets( const std::vector<Unit::Pointer> & targets )
{
	for( size_t i = 0; i < _targets.size(); )
	{
		auto& target = _targets[i];
		bool release = false;
		release = release || target->getMoveFinished();
		release = release || target->getCurrentHealth() <= 0;
		release = release || std::find( targets.begin(), targets.end(), target ) == targets.end();
		if( release )
			_targets.erase( _targets.begin() + i );
		else
			++i;
	}
	
	if( _targets.size() < _maxTargets )
	{
		for( auto target : targets )
		{
			auto iter = std::find( _targets.begin(), _targets.end(), target );
			if( iter == _targets.end() )
			{
				_targets.push_back( target );
			}
		}
	}
	for( auto target : _targets )
	{
		target->stop();
	}
	
	if( _targets.empty() == false )
	{
		if( current_state( ).get_name( ) != state_move &&
			isNearestTarget() == false )
		{
			Route route;
			buildRouteToTarget( route );
			getMover().setRoute( route );
			move();
		}
		else
		{
			std::vector<Unit::Pointer> t;
			t.push_back( _targets.front() );
			Unit::capture_targets( t );
		}
	}
	else
	{
		Unit::capture_targets( _targets );
		if( isNearestBase() == false )
		{
			if( current_state().get_name() != state_move )
			{
				Route route;
				buildRouteToBase( route );
				getMover().setRoute( route );
				move();
			}
		}
	}
}

bool UnitDesant::setProperty( const std::string & stringproperty, const std::string & value )
{
	if( stringproperty == "handradius" )
		_handRadius = strToFloat( value );
	else if( stringproperty == "handradiussector" )
		_handRadiusSector = strToFloat( value );
	else
		return Unit::setProperty( stringproperty, value );
	return true;
}

void UnitDesant::on_die()
{
	Unit::on_die();
	for( auto target : _targets )
	{
		target->capture_targets(std::vector<Unit::Pointer>());
		target->move();
	}
}

//void UnitDesant::on_mover( const Point & position, const Vec2 & direction )
//{
//	if( current_state().get_name() != State::state_readyfire )
//		Unit::on_mover( position, direction );
//}

void UnitDesant::buildRouteToBase( std::vector<Point> & route )
{
	route.resize( 2 );
	route[0] = getPosition();
	route[1] = _basePosition;
}

void UnitDesant::buildRouteToTarget( std::vector<Point> & route )
{
	auto target = _targets.empty() ? nullptr : _targets.front();
	if( !target )
		return;

	Point radius = target->getPosition() - getPosition();

	Point add = Point( (_handRadius - 1) * (radius.x < 0 ? 1 : -1), 0 );


	Point a = getPosition();
	Point b = target->getPosition( );
	b += add;

	route.resize( 2 );
	route[0] = a;
	route[1] = b;
}

bool UnitDesant::isNearestTarget()
{
	auto target = _targets.empty() ? nullptr : _targets.front();
	if( !target )
		return false;
	bool result;
	Vec2 radius = getPosition() - target->getPosition();
	float dist = radius.length();
	result = dist <= _handRadius;

	if( result )
	{
		float angle = getDirectionByVector( radius );
		while( angle < 0 ) angle += 360;
		
		bool r = false;
		r = r || (angle <= 0 + _handRadiusSector || angle >= 360 - _handRadiusSector);
		r = r || (angle <= 180 + _handRadiusSector || angle >= 180 - _handRadiusSector);;
		result = result && r;
	}

	return result;
}

bool UnitDesant::isNearestBase( )
{
	bool result = getPosition().getDistance( _basePosition ) < 10;
	return result;
}

NS_CC_END