//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __ShootsEffects_h__
#define __ShootsEffects_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "Unit.h"
NS_CC_BEGIN


std::vector<NodePointer> ShootsEffectsCreate( Unit*base, Unit*target, const std::string & description );

void ShootsEffectsClear();

class ShootsEffectsBullet : public Sprite
{
	DECLARE_BUILDER( ShootsEffectsBullet );
	bool init(const Point & position);
public:
protected:
private:
};

class ShootsEffectsLighting : public Sprite
{
	DECLARE_BUILDER( ShootsEffectsLighting );
	bool init( Unit::Pointer base, Unit::Pointer target, const Point & baseOffset, const std::string& animatepath );
public:
protected:
	void update( float dt );
private:
	Unit::Pointer _base;
	Unit::Pointer _target;
	float _timer;
	Point _baseOffset;
	Point _targetOffset;
};

class ShootsEffectsElectro : public Sprite
{
public:
	enum Size
	{
		Big,
		Small,
	};
protected:
	DECLARE_POINTER( ShootsEffectsElectro );
	bool init( Unit::Pointer target, const Point & position, Size size, float scale );
public:
	static ShootsEffectsElectro::Pointer 
		create( Unit::Pointer target, const Point & position, Size size, float scale );
protected:
	virtual void initWithAnimation(Size size);
	virtual bool checkClean();
	virtual void update( float dt );
	Unit::Pointer getTarget();
private:
	Unit::Pointer _target;
	Point _position;
public:
	static std::set<Unit::Pointer> s_units;
};

class ShootsEffectsFire : public ShootsEffectsElectro
{
	DECLARE_POINTER( ShootsEffectsFire );
public:
	static ShootsEffectsFire::Pointer
		create( Unit::Pointer target, const Point & position, Size size, float scale );
protected:
	bool init( Unit::Pointer target, const Point & position, Size size, float scale );
	virtual void initWithAnimation( Size size );
	virtual bool checkClean( );
	virtual void update( float dt );
private:
	static std::set<Unit::Pointer> s_units;
};

class ShootsEffectsFreezing : public ShootsEffectsElectro
{
	DECLARE_POINTER( ShootsEffectsFreezing );
public:
	static ShootsEffectsFreezing::Pointer
		create( Unit::Pointer target, const Point & position, Size size, float scale );
protected:
	bool init( Unit::Pointer target, const Point & position, Size size, float scale );
	virtual void initWithAnimation( Size size );
	virtual bool checkClean( );
	virtual void update( float dt );
private:
	static std::set<Unit::Pointer> s_units;
};

class ShootsEffectsIce : public Sprite
{
	DECLARE_BUILDER( ShootsEffectsIce );
	bool init( const Point & position, float duration );
public:
	void setDuration( float time );
	static void computePoints( const Point & basePosition, std::vector<Point> & points, float radius, float maxDistanceToRoad );
protected:
	virtual void update( float dt );
	void death();
private:
	float _duration;
	float _elapsed;
};

class ShootsEffectsIce2 : public Sprite
{
	DECLARE_BUILDER( ShootsEffectsIce2 );
	bool init( const Point & position, float duration );
private:
};

class ShootsEffectLaser : public Sprite
{
	DECLARE_BUILDER( ShootsEffectLaser );
	bool init( Unit * base, Unit * target, const Point & addposition, float width, const Color3B& color );
private:
};

class ShootsEffectHealing : public Sprite
{
	DECLARE_BUILDER( ShootsEffectHealing );
	bool init( Unit * target, const std::string & image, const std::string & animation );
private:
};

NS_CC_END
#endif // #ifndef ShootsEffects