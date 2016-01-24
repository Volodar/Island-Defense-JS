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

#ifndef __Bullet_h__
#define __Bullet_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "Unit.h"
NS_CC_BEGIN





class Bullet : public Unit
{
	enum class Trajectory
	{
		line,
		parabolic,
	};

	DECLARE_BUILDER( Bullet );
	bool init( const std::string& path, Unit::Pointer base, Unit::Pointer target,
		float startAngle, Point startPosition);
public:
	virtual bool setProperty( const std::string & stringproperty, const std::string & value )override;
	virtual void update( float dt )override;
	virtual void clear()override;
protected:
	virtual void readyfire_update( float dt )override;
	virtual void on_die()override;
	void turn( const Point& newPos );

	void prepare();
	Point updateTargetPoint();
	Point computePosition( float dt );
	Point computePositionLine( float dt );
	Point computePositionParabolic( float dt );
private:
	std::string _bopyPart;
	Trajectory _trajectory;
	Unit::Pointer _base;
	Unit::Pointer _target;
	Point _startPoint;
	Point _targetPoint;
	Point _targetPointOffset;
	bool _steering;
	bool _isStuck;

	struct
	{
		float H;
		float timer;
		float duration;
	}_parabolicParams;

};




NS_CC_END
#endif // #ifndef Bullet