//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "ShootsEffects.h"
#include "consts.h"
#include "configuration.h"
#include "ml/Animation.h"
#include "ml/common.h"
#include "ml/ParamCollection.h"
#include "ml/ImageManager.h"
#include "ml/loadxml/xmlProperties.h"
#include "GameGS.h"

NS_CC_BEGIN

/*****************************************************************************/
//MARK: class ShootsEffectsCreate 
/*****************************************************************************/

size_t ShootsEffectsLightingCount(0);
size_t ShootsEffectsElectroCount(0);
size_t ShootsEffectsFireCount(0);
size_t ShootsEffectsFreezingCount(0);
size_t ShootsEffectsIceCount(0);
size_t ShootsEffectsIce2Count(0);
std::set<Unit::Pointer> ShootsEffectsElectro::s_units;

namespace
{
	static std::map< Unit::Pointer, std::vector<ShootsEffectsIce::Pointer > > s_IceUnits;
}

std::vector<NodePointer> ShootsEffectsCreate( Unit*base, Unit*target, const std::string & description )
{
	std::vector<NodePointer> result;

	ParamCollection params( description );
	std::string type = params["type"];

	if( type == "bullet" )
	{
		result.push_back( ShootsEffectsBullet::create( target->getPosition( ) ) );
	}
	else if( type == "laser" )
	{
		int index( 0 );
		const int angle = base->getMover( ).getCurrentAngle( );
		switch( angle )
		{
			case 45: index = 0; break;
			case 135: index = 1; break;
			case 225: index = 2; break;
			case 315: index = 3; break;
			default: index = 0;
		}

		Point pos = strToPoint( params["position" + intToStr( index )] );
		float width = strToFloat( params.get( "width", "1" ) );
		auto color = strToColor3B( params.get( "color", "FF0000" ) );

		result.push_back( ShootsEffectLaser::create( base, target, pos, width, color ) );
	}
	else if( type == "lighting" )
	{
		Point offset;
		std::string param = "offset" + intToStr( base->getMover().getCurrentAngle() );
		if( params.find(param) != params.end())
			offset = strToPoint( params[param] );
		else
			offset = strToPoint( params["offset"] );

		std::string animatepath = params["animatepath"];
		ShootsEffectsLighting::Pointer effect = ShootsEffectsLighting::create( base, target, offset, animatepath );
		result.push_back( effect );

		Point position;
		ShootsEffectsElectro::Size size;
		position = target->extra().getPositionElectro();
		float scale = target->extra().getScaleElectro();
		size = target->extra().getSizeElectro() == "big" ?
			ShootsEffectsElectro::Size::Big :
			ShootsEffectsElectro::Size::Small;

		auto electro = ShootsEffectsElectro::create( target, position, size, scale );
		if( electro )
			result.push_back( electro );
	}
	else if( type == "fire" )
	{
		Point position;
		ShootsEffectsElectro::Size size = ShootsEffectsElectro::Size::Small;
		position = target->extra().getPositionFire();
		float scale = target->extra().getScaleFire();
		auto fire = ShootsEffectsFire::create( target, position, size, scale );
		if( fire )
			result.push_back( fire );
	}
	else if( type == "ice" )
	{

		const float maxDistanceToRoad( 20 );
		const float radius = base->getRadius();
		float duration = base->getEffect().positive.velocityTime;

		if( s_IceUnits.find( base ) == s_IceUnits.end( ) )
		{
			std::vector<Point> points;
			ShootsEffectsIce::computePoints( base->getPosition(), points, radius, maxDistanceToRoad );

			for( auto & point : points )
			{
				auto ice = ShootsEffectsIce::create( point, duration );
				result.push_back( ice );
				s_IceUnits[base].push_back( ice );
			}
		}
		else
		{
			auto vector = s_IceUnits[base];
			for( auto& ice : vector )
			{
				ice->setDuration( duration );
			}
		}
	}
	else if( type == "medic" )
	{
		std::string image = params["image"];
		std::string animation = params["animation"];
		auto effect = ShootsEffectHealing::create( target, image, animation );
		if( effect )
			result.push_back( effect );
	}
	else if( type == "freezing" )
	{
		Point position;
		ShootsEffectsElectro::Size size = ShootsEffectsElectro::Size::Small;
		position = target->extra().getPositionFreezing();
		float scale = target->extra().getScaleFreezing();
		auto freez = ShootsEffectsFreezing::create( target, position, size, scale );
		if( freez )
			result.push_back( freez );
	}

	/*
	else if( type == "ice" )
	{
	const float maxDistanceToRoad( 20 );
	const float radius = base->getRadius( );
	float duration = base->getEffect( ).positive.velocityTime;

	result.push_back( ShootsEffectsIce2::create( base->getPosition(), duration ) );
	}
	*/
	return result;
}

void ShootsEffectsClear()
{
	ShootsEffectsElectro::s_units.clear();
	s_IceUnits.clear();
}

/*****************************************************************************/
//MARK: class ShootsEffectsBullet 
/*****************************************************************************/

ShootsEffectsBullet::ShootsEffectsBullet()
{}

ShootsEffectsBullet::~ShootsEffectsBullet()
{}

bool ShootsEffectsBullet::init( const Point & position )
{
	//int correan = rand() % 3;
	//if( correan != 0 )
	//	return false;
	Sprite::init();

	std::vector<std::string> textures;
	textures.push_back( "splash::splash1_0001.png" );
	textures.push_back( "splash::splash1_0002.png" );
	textures.push_back( "splash::splash1_0003.png" );
	textures.push_back( "splash::splash1_0004.png" );
	textures.push_back( "splash::splash1_0005.png" );
	textures.push_back( "splash::splash1_0006.png" );
	textures.push_back( "splash::splash1_0007.png" );
	textures.push_back( "splash::splash1_0008.png" );
	textures.push_back( "splash::splash1_0009.png" );
	textures.push_back( "splash::splash1_0010.png" );
	textures.push_back( "splash::splash1_0011.png" );

	float x = CCRANDOM_MINUS1_1() * 25;
	float y = CCRANDOM_MINUS1_1() * 12;
	Point pos = position;
	pos.x += x;
	pos.y += y / k::IsometricValue;
	setPosition( pos );

	auto animation = createAnimation( textures, 0.5f );
	auto animate = Animate::create( animation );
	auto remover = CallFunc::create( std::bind( &Node::removeFromParent, this ) );
	runAction( Sequence::createWithTwoActions( animate, remover ) );

	return true;
}

/*****************************************************************************/
//MARK: class ShootsEffectsLighting 
/*****************************************************************************/

ShootsEffectsLighting::ShootsEffectsLighting()
:_timer( 0 )
{
	++ShootsEffectsLightingCount;
}

ShootsEffectsLighting::~ShootsEffectsLighting()
{
	--ShootsEffectsLightingCount;
}

bool ShootsEffectsLighting::init( Unit::Pointer base, Unit::Pointer target, const Point & baseOffset, const std::string& animatepath )
{
	Sprite::init();
	_base = base;
	_target = target;
	_baseOffset = baseOffset;

	setPosition( _base->getPosition() + _baseOffset );
	setAnchorPoint( Point( 0, 0.5f ) );

	IntrusivePtr<ActionInterval> action( nullptr );
	if( animatepath.empty() )
	{
		std::vector<std::string> textures;
		textures.push_back( "lighting::lighting0001.png" );
		textures.push_back( "lighting::lighting0002.png" );
		textures.push_back( "lighting::lighting0003.png" );
		textures.push_back( "lighting::lighting0004.png" );
		textures.push_back( "lighting::lighting0005.png" );
		textures.push_back( "lighting::lighting0006.png" );
		xmlLoader::setProperty( this, xmlLoader::kImage, textures[0]);
		auto animation = createAnimation( textures, 0.1f );
		action = Animate::create( animation );
	}
	else
	{
		pugi::xml_document doc;
		doc.load_file( animatepath.c_str() );
		auto node = doc.root().first_child();
		auto loaded = xmlLoader::load_action( node );
		action.reset( dynamic_cast<ActionInterval*>(loaded.ptr()) );
	}
	if( action )
		runAction( RepeatForever::create( action.ptr() ) );

	auto part = _target->getParamCollection().get( "head", "" );
	auto rand = _target->getParamCollection().get( "random_bullet", "" );
	_targetOffset = strToPoint( part );
	if( rand.empty() == false )
	{
		auto point = strToPoint( rand );
		_targetOffset.x += CCRANDOM_MINUS1_1() * point.x / 2;
		_targetOffset.y += CCRANDOM_MINUS1_1() * point.y / 2;
	}

	_timer = 0.5f;
	update( 0 );
	scheduleUpdate();
	setLocalZOrder( 9999 );

	return true;
}

void ShootsEffectsLighting::update( float dt )
{
	_timer -= dt;
	if( _timer <= 0 || _target->getParent() == nullptr || _target->getCurrentHealth() <= 0 )
	{
		removeFromParent();
		return;
	}
	Point a = _base->getPosition() + _baseOffset;
	Point b = _target->getPosition() + _targetOffset;
	Point r = b - a;

	float angle = getDirectionByVector( r );

	setPosition( a );
	setRotation( angle );

	float width = getContentSize().width;
	float scale = r.getLength() / width;
	setScaleX( scale );
}


/*****************************************************************************/
//MARK: class ShootsEffectsElectro 
/*****************************************************************************/

ShootsEffectsElectro::ShootsEffectsElectro()
:_target( nullptr )
, _position()
{
	++ShootsEffectsElectroCount;
}

ShootsEffectsElectro::~ShootsEffectsElectro()
{
	--ShootsEffectsElectroCount;
	auto i = ShootsEffectsElectro::s_units.find( _target );
	if( i != ShootsEffectsElectro::s_units.end() )
		ShootsEffectsElectro::s_units.erase( i );
}

ShootsEffectsElectro::Pointer
ShootsEffectsElectro::create( Unit::Pointer target, const Point & position, Size size, float scale )
{
	if( s_units.find( target ) != s_units.end() ) return nullptr;
	auto pointer = make_intrusive<ShootsEffectsElectro>();
	if( pointer && pointer->init( target, position, size, scale ) )
	{
		s_units.insert( target );
	}
	else
	{
		pointer.reset( nullptr );
	}
	return pointer;
}

bool ShootsEffectsElectro::init( Unit::Pointer target, const Point & position, Size size, float scale )
{
	if( !target ) return false;
	if( !Sprite::init() ) return false;

	_target = target;
	_position = position;
	setPosition( _target->getPosition() + _position );

	if( checkClean() ) return false;

	initWithAnimation( size );

	setLocalZOrder( 9999 );
	setScale( scale );
	scheduleUpdate();

	return true;
}

void ShootsEffectsElectro::initWithAnimation( Size size )
{
	std::string frame = (size == Size::Big) ? "tank" : "man";

	std::vector<std::string> textures;
	textures.push_back( "electro::electro_" + frame + "_0001.png" );
	textures.push_back( "electro::electro_" + frame + "_0002.png" );
	textures.push_back( "electro::electro_" + frame + "_0003.png" );
	textures.push_back( "electro::electro_" + frame + "_0004.png" );

	auto pframe = ImageManager::shared().spriteFrame( textures[0] );
	assert( pframe );
	if( pframe )
	{
		setSpriteFrame( pframe );
	}

	auto animation = createAnimation( textures, 0.1f );
	auto animate = Animate::create( animation );
	runAction( RepeatForever::create( animate ) );

}

Unit::Pointer ShootsEffectsElectro::getTarget()
{
	return _target;
}

void ShootsEffectsElectro::update( float dt )
{
	bool clean = checkClean();
	if( clean )
	{
		removeFromParent();
		return;
	}
	else
	{
		setPosition( _target->getPosition() + _position );
	}
}

bool ShootsEffectsElectro::checkClean()
{
	const mlEffect& effect = _target->getEffect();
	bool clean( false );
	clean = clean || (_target->isRunning() == false);
	clean = clean || (_target->getCurrentHealth() <= 0);
	clean = clean || (effect.positive.electroResist > 1.01);
	clean = clean || (effect.negative.referentialExtendedDamageElectro <= 0.001);
	return clean;
}

/*****************************************************************************/
//MARK: class ShootsEffectsFire 
/*****************************************************************************/
std::set<Unit::Pointer> ShootsEffectsFire::s_units;

ShootsEffectsFire::ShootsEffectsFire()
{
	++ShootsEffectsFireCount;
}

ShootsEffectsFire::~ShootsEffectsFire()
{
	--ShootsEffectsFireCount;
	auto i = ShootsEffectsFire::s_units.find( getTarget() );
	if( i != ShootsEffectsFire::s_units.end() )
		ShootsEffectsFire::s_units.erase( i );
}

ShootsEffectsFire::Pointer
ShootsEffectsFire::create( Unit::Pointer target, const Point & position, Size size, float scale )
{
	if( s_units.find( target ) != ShootsEffectsFire::s_units.end() ) return nullptr;
	auto pointer = make_intrusive<ShootsEffectsFire>();
	if( pointer && pointer->init( target, position, size, scale ) )
	{
		ShootsEffectsFire::s_units.insert( target );
	}
	else
	{
		pointer.reset( nullptr );
	}
	return pointer;
}

bool ShootsEffectsFire::init( Unit::Pointer target, const Point & position, Size size, float scale )
{
	if( ShootsEffectsElectro::init( target, position, size, scale ) == false )
		return false;
	setAnchorPoint( Point::ANCHOR_MIDDLE_BOTTOM );

	return true;
}

void ShootsEffectsFire::initWithAnimation( Size size )
{
	std::vector<std::string> textures;
	textures.push_back( "fire2::fire2_0001.png" );
	textures.push_back( "fire2::fire2_0002.png" );
	textures.push_back( "fire2::fire2_0003.png" );
	textures.push_back( "fire2::fire2_0004.png" );
	textures.push_back( "fire2::fire2_0005.png" );
	textures.push_back( "fire2::fire2_0006.png" );
	textures.push_back( "fire2::fire2_0007.png" );
	textures.push_back( "fire2::fire2_0008.png" );
	textures.push_back( "fire2::fire2_0009.png" );
	textures.push_back( "fire2::fire2_0010.png" );

	auto pframe = ImageManager::shared().spriteFrame( textures[0] );
	assert( pframe );
	if( pframe )
	{
		setSpriteFrame( pframe );
	}

	auto animation = createAnimation( textures, 0.5f );
	auto animate = Animate::create( animation );
	runAction( RepeatForever::create( animate ) );
}

bool ShootsEffectsFire::checkClean()
{
	//setBlendFunc( BlendFunc::ADDITIVE );
	const mlEffect& effect = getTarget()->getEffect();
	bool clean( false );
	clean = clean || (getTarget()->isRunning() == false);
	clean = clean || (getTarget()->getCurrentHealth() <= 0);
	clean = clean || (effect.positive.fireResist > 1.01);
	clean = clean || (effect.negative.referentialExtendedDamageFire <= 0.001);
	return clean;
}

void ShootsEffectsFire::update( float dt )
{
	setLocalZOrder( getTarget()->getLocalZOrder() - 2 );
	ShootsEffectsElectro::update( dt );
}

/*****************************************************************************/
//MARK: class ShootsEffectsFreezing
/*****************************************************************************/

ShootsEffectsFreezing::ShootsEffectsFreezing()
{
	++ShootsEffectsFreezingCount;
}

ShootsEffectsFreezing::~ShootsEffectsFreezing()
{
	--ShootsEffectsFreezingCount;
	if( getTarget() && getTarget()->getChildByName( "skin" ) )
		getTarget()->getChildByName( "skin" )->setVisible( true );
}

ShootsEffectsFreezing::Pointer ShootsEffectsFreezing::create( Unit::Pointer target, const Point & position, Size size, float scale )
{
	auto pointer = make_intrusive<ShootsEffectsFreezing>();
	if( pointer && pointer->init( target, position, size, scale ) )
	{
	}
	else
	{
		pointer.reset( nullptr );
	}
	return pointer;
}

bool ShootsEffectsFreezing::init( Unit::Pointer target, const Point & position, Size size, float scale )
{
	if( ShootsEffectsElectro::init( target, position, size, scale ) == false )
		return false;
	setAnchorPoint( Point::ANCHOR_MIDDLE_BOTTOM );

	if( getTarget() && getTarget()->getChildByName( "skin" ) )
		getTarget()->getChildByName( "skin" )->setVisible( false );

	return true;
}

void ShootsEffectsFreezing::initWithAnimation( Size size )
{
	xmlLoader::setProperty( this, xmlLoader::kImage, "images/effects/ice_block.png");
}

bool ShootsEffectsFreezing::checkClean()
{
	const mlEffect& effect = getTarget()->getEffect();
	bool clean( false );
	clean = clean || (getTarget()->isRunning() == false);
	clean = clean || (getTarget()->getCurrentHealth() <= 0);
	clean = clean || (effect.positive.velocityRate < 0.001);
	clean = clean || (effect.negative.velocityMoveTimeLeft <= 0.001);
	return clean;
}

void ShootsEffectsFreezing::update( float dt )
{
	setLocalZOrder( getTarget()->getLocalZOrder() + 2 );
	ShootsEffectsElectro::update( dt );
}

/*****************************************************************************/
//MARK: class ShootsEffectsIce
/*****************************************************************************/
ShootsEffectsIce::ShootsEffectsIce()
: _duration( 0 )
, _elapsed( 0 )
{
	++ShootsEffectsIceCount;
}

ShootsEffectsIce::~ShootsEffectsIce() 
{
	--ShootsEffectsIceCount;
}

bool ShootsEffectsIce::init( const Point & position, float duration )
{
	if( !Sprite::init() )return false;

	_duration = duration;

	auto fadein = FadeTo::create( 0.2f, 200 );

	int index = rand() % 3 + 1;
	std::string texture = "images/effects/ice" + intToStr( index ) + ".png";

	xmlLoader::setProperty( this, xmlLoader::kImage, texture);
	setLocalZOrder( -9999 );
	setPosition( position );
	setOpacity( 0 );

	runAction( fadein );

	scheduleUpdate();

	return true;
}

void ShootsEffectsIce::setDuration( float time )
{
	_duration = time;
	_elapsed = 0;
}

void ShootsEffectsIce::update( float dt )
{
	_elapsed += dt;
	if( _elapsed > 0.2f )
	{
		float last = _duration - _elapsed;
		last = std::min( last, 1.f );
		int opacity = static_cast<int>(last * 200);
		setOpacity( opacity );

		if( _elapsed > _duration )
			death();
	}
}

void ShootsEffectsIce::death( )
{
	for( auto iter = s_IceUnits.begin(); iter != s_IceUnits.end(); ++iter )
	{
		bool br( false );
		for( auto j = iter->second.begin( ); j != iter->second.end( ); ++j )
		{
			if( j->ptr( ) == this )
			{
				iter->second.erase( j );
				br = true;
				break;
			}
		}
		if( iter->second.empty( ) )
		{
			s_IceUnits.erase( iter );
			break;
		}
		if( br )break;
	}
	removeFromParent();
}

void ShootsEffectsIce::computePoints( const Point & basePosition, std::vector<Point> & points, float radius, float maxDistanceToRoad )
{
	const float startRadius = 0;
	const float distanseByRadius = 30;

	for( float r = startRadius + CCRANDOM_0_1() * distanseByRadius; r < radius; r += distanseByRadius )
	{
		float C = r * float( M_PI ) * 2;
		int count = int( C / distanseByRadius );
		if( count < 2 ) continue;

		std::vector<Point> pointsOnRadius;
		computePointsByRadius( pointsOnRadius, r, count, CCRANDOM_0_1() * (360 / count) );

		for( auto& point : pointsOnRadius )
		{
			float dummy(0);
			point = basePosition + Point( point.x, point.y / 2 );
			if( checkPointOnRoute( point, maxDistanceToRoad, UnitLayer::sea, &dummy ) ||
				checkPointOnRoute( point, maxDistanceToRoad, UnitLayer::earth, &dummy ) )
			{
				points.push_back( point );
			}
		}
	}
}

/*****************************************************************************/
//MARK: class ShootsEffectsIce2
/*****************************************************************************/
ShootsEffectsIce2::ShootsEffectsIce2()
{
	++ShootsEffectsIce2Count;
}
ShootsEffectsIce2::~ShootsEffectsIce2()
{
	--ShootsEffectsIce2Count;
}

bool ShootsEffectsIce2::init( const Point & position, float duration )
{
	initWithFile( "images/effects/ice_texture.png" );

	setScaleY( 1 / k::IsometricValue );

	float dfade = duration * 0.4f;
	float ddelay = duration - 2 * dfade;

	auto fadein = FadeTo::create( dfade, 128 );
	auto delay = DelayTime::create( ddelay );
	auto fade = FadeTo::create( dfade, 0 );
	auto remove = CallFunc::create( std::bind( &Node::removeFromParent, this ) );
	auto action = Sequence::create( fadein, delay, fade, remove, nullptr );

	setOpacity( 0 );
	setPosition( position );
	setLocalZOrder( -9999 );
	runAction( action );

	return true;
}

/*****************************************************************************/
//MARK: class ShootsEffectLaser
/*****************************************************************************/

ShootsEffectLaser::ShootsEffectLaser()
{}

ShootsEffectLaser::~ShootsEffectLaser()
{}

bool ShootsEffectLaser::init( Unit * base, Unit * target, const Point & addposition, float width, const Color3B& color )
{
	Sprite::init();
	Point a = base->getPosition( ) + addposition;
	Point b = target->getPosition( ) + Point( 0, 20 );
	float angle = getDirectionByVector( b-a );

	auto sprite = ImageManager::sprite( "images/square.png" );
	sprite->setScale( b.getDistance( a ), 2 * width );
	sprite->setRotation( angle );
	sprite->setPosition( a );
	sprite->setAnchorPoint( Point( 0, 0.5f ) );
	sprite->setColor( color );
	addChild (sprite);
	sprite->setOpacity( 0 );
	sprite->runAction( Sequence::create( FadeTo::create( 0.1f, 192 ), FadeTo::create( 0.1f, 64 ), nullptr ) );

	auto delay = DelayTime::create( 0.2f );
	auto remover = CallFunc::create( [this](){this->removeFromParent(); } );
	auto action = Sequence::create( delay, remover, nullptr );
	runAction( action );

	return true;
}


/*****************************************************************************/
//MARK: ShootsEffectHealing
/*****************************************************************************/

ShootsEffectHealing::ShootsEffectHealing()
{
}

ShootsEffectHealing::~ShootsEffectHealing()
{
}

bool ShootsEffectHealing::init( Unit * target, const std::string & image, const std::string & animation )
{
	Sprite::init();
	if( image.empty() == false )
	{
		xmlLoader::setProperty( this, xmlLoader::kImage, image);
	}
	if( animation == "blue" )
	{
		auto animation = createAnimation( "healing.blue::hill_blue_00", 1, 19, ".png", 1 );
		auto animate = Animate::create( animation );
		runAction( animate );
		setAnchorPoint( Point( 0.5f, 0 ) );
	}
	if( animation == "red" )
	{
		auto animation = createAnimation( "healing.red::hill_red00", 1, 19, ".png", 1 );
		auto animate = Animate::create( animation );
		runAction( animate );
		setAnchorPoint( Point( 0.5f, 0 ) );
	}

	setPosition(target->getPosition());
	
	auto action1 = Sequence::create( EaseInOut::create(MoveBy::create(1.f, Point(0, 20)), 1), RemoveSelf::create(true), nullptr );
	auto action2 = Sequence::create( FadeIn::create(0.2f), DelayTime::create(0.6f), FadeOut::create(0.2f), nullptr );
	runAction(action1);
	runAction(action2);
	
	setLocalZOrder(999);
	return true;
}


NS_CC_END