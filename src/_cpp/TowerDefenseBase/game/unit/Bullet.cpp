/****************************************************************************
Copyright (c) 2014-2015 Vladimir Tolmachev (Volodar)

This file is part of game Greeco Defense

Greeco Defense is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Greeco Defense is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Greeco Defense.  If not, see <http://www.gnu.org/licenses/>.
****************************************************************************/

#include "Bullet.h"
NS_CC_BEGIN


Bullet::Bullet()
: _steering( false )
, _isStuck(false)
, _trajectory( Trajectory::line )
{
	_parabolicParams.H = 0;
	_parabolicParams.timer = 0;
	_parabolicParams.duration = CCRANDOM_MINUS1_1() * 0.2f + 0.5f;
}

Bullet::~Bullet( )
{
}

bool Bullet::init( const std::string& path, Unit::Pointer base, Unit::Pointer target, float startAngle, Point startPosition )
{
	do
	{
		CC_BREAK_IF( !Unit::init( "", path ) );
		_base = base;
		_target = target;

		setDamageBySector( base->getDamageBySector() );
		setAllowTargets( base->getAllowTargets() );
		setType( UnitType::tower );

		auto part = _target->getParamCollection().get( _bopyPart, "" );
		auto rand = _target->getParamCollection().get( "random_bullet", "" );
		_targetPointOffset = strToPoint( part );
		if( rand.empty() == false )
		{
			auto point = strToPoint( rand );
			_targetPointOffset.x += CCRANDOM_MINUS1_1() * point.x / 2;
			_targetPointOffset.y += CCRANDOM_MINUS1_1() * point.y / 2;
		}

		_startPoint = startPosition;
		updateTargetPoint();
		prepare();

		setPosition( startPosition );
		setRotation( startAngle );
		float z = _unitLayer == UnitLayer::sky ? 9000 : -startPosition.y;
		setLocalZOrder( z + _additionalZorder );
		return true;
	}
	while( false );
	return false;
}

bool Bullet::setProperty( const std::string & stringproperty, const std::string & value )
{
	if( stringproperty == "trajectory" )
	{
		if( value == "line" )
			_trajectory = Trajectory::line;
		else if( value == "parabolic" )
			_trajectory = Trajectory::parabolic;
		else
			assert( 0 );
	}
	else if( stringproperty == "parabolicheight" )
		_parabolicParams.H = strToFloat( value );
	else if( stringproperty == "steering" )
		_steering = strToBool( value );
	else if( stringproperty == "bodypart" )
		_bopyPart = value;
	else if( stringproperty == "parabolic_duration" )
		_parabolicParams.duration = CCRANDOM_MINUS1_1() * 0.2f + strToFloat( value );
	else if( stringproperty == "stuck" )
		_isStuck = strToBool( value );
	else 
		return Unit::setProperty( stringproperty, value );
	return true;
}

void Bullet::update( float dt )
{
	Unit::update( dt );
}

void Bullet::clear()
{
	_base.reset( nullptr );
	_target.reset( nullptr );
}

void Bullet::readyfire_update( float dt )
{
	Unit::readyfire_update( dt );

	Point pos = computePosition( dt );
	turn( pos );
	setPosition( pos );
	float z = _unitLayer == UnitLayer::sky ? 9000 : -pos.y;
	setLocalZOrder( z + _additionalZorder );

}

void Bullet::on_die()
{
	if( _base && _target )
	{
		Point p0 = getPosition();
		Point p1 = _target->getPosition() + strToPoint( _target->getParamCollection().get( _bopyPart, "" ) );
		float distance = p0.getDistance( p1 );
		float radius = getRadius();

		getEffect().copyFrom( _base->getEffect() );
		bool applyDamage( false );
		applyDamage = applyDamage || (distance < radius);
		applyDamage = applyDamage || getDamageBySector();
		if( applyDamage )
		{
			setType( _base->getType() );
			applyDamageToTarget( _target );

			Unit::on_die();
			
			if( _isStuck )
			{
				auto newParent = _target->getChildByName( "bullet_node" );
				if( !newParent )newParent = _target;

				auto pos = getPosition();
				pos = convertToWorldSpace( Point::ZERO );
				pos = newParent->convertToNodeSpace( pos );
				setPosition( pos );
				retain();
				removeFromParent();
				newParent->addChild( this, -10 );
				release();
			}

			_base.reset( nullptr );
			_target.reset( nullptr );
		}
	}
}

void Bullet::turn( const Point& newPos )
{
	if( _target )
	{
		switch( _trajectory )
		{
			case Trajectory::line:
			{
				Point p0 = newPos;
				Point p1 = _target->getPosition();
				float angle = getDirectionByVector( p1 - p0 );
				setRotation( angle );
				break;
			}
			case Trajectory::parabolic:
			{
				Point p0 = getPosition();
				Point p1 = newPos;
				float angle = getDirectionByVector( p1 - p0 );
				setRotation( angle );
				break;
			}
			default:
				assert( 0 );
		}
	}
}

void Bullet::prepare()
{
	switch( _trajectory )
	{
		case Trajectory::line:
			break;
		case Trajectory::parabolic:
			if( _parabolicParams.H == 0 )
				_parabolicParams.H = 200;
			_parabolicParams.timer = 0;
			break;
	}
}

Point Bullet::updateTargetPoint()
{
	if( _targetPoint.equals( Point::ZERO ) || _steering )
	{
		_targetPoint = _target->getPosition() + _targetPointOffset;
	}
	return _targetPoint;
}

Point Bullet::computePosition( float dt )
{
	updateTargetPoint();

	switch( _trajectory )
	{
		case Trajectory::line:
			return computePositionLine( dt );
		case Trajectory::parabolic:
			return computePositionParabolic( dt );
		default:
			assert( 0 );
	}
	return getPosition();
}

Point Bullet::computePositionLine( float dt )
{
	Point p0 = getPosition();
	Point p1 = _targetPoint;
	float distance = p0.getDistance( p1 );
	float velocity = getMover().getVelocity();
	float t = dt*velocity;
	t = std::min( t, (p1 - p0).getLength() );
	Point p = p0 + (p1 - p0).getNormalized() * t;

	
	if( checkRadiusByEllipse( p, _targetPoint, getRadius() ) )
		push_event( event_die );

	return p;
}

Point Bullet::computePositionParabolic( float dt )
{
	/* t = [0;1] */
	auto parabolic = [this]( float t )
	{ return -(2 * t - 1)*(2 * t - 1) + 1; };
	auto line = [this]( float t )
	{ return _startPoint + (_targetPoint - _startPoint) * t; };

	_parabolicParams.timer += dt;
	float t = _parabolicParams.timer / _parabolicParams.duration; // 1 - duration;
	t = std::min( t, 1.f );
	Point pos = line( t );
	pos.y += parabolic( t ) * _parabolicParams.H;

	if( t >= 0.999f )
		push_event( event_die );

	return pos;
}


NS_CC_END