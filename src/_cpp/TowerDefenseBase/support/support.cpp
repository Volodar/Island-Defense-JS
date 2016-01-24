//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "support.h"
#include "consts.h"
#include "configuration.h"
#include "ml/ImageManager.h"
#include "GameGS.h"
#include "UserData.h"
#if CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID
#	include <jni.h>
#	include "platform/android/jni/JniHelper.h"
#endif

NS_CC_BEGIN;

namespace
{
	SpritePointer SpriteForRadius;
};

void showRadius( const cocos2d::Point & position, float radius )
{
	if( !SpriteForRadius )
	{
		SpriteForRadius.reset( ImageManager::sprite( k::resourceGameSceneFolder + "circle.png" ) );
	}
	float scalex = radius / (SpriteForRadius->getContentSize( ).width / 2);
	float scaley = radius / (SpriteForRadius->getContentSize( ).height / 2) / k::IsometricValue;
	SpriteForRadius->setScale( scalex, scaley);
	SpriteForRadius->setPosition( position );

 
	if( SpriteForRadius->getParent( ) )
		SpriteForRadius->removeFromParent();
	GameGS::getInstance()->addObject( SpriteForRadius, zorder::sky );
}

void hideRadius()
{
	GameGS::getInstance()->removeObject( SpriteForRadius );
}

bool radiusTowerIsHiden()
{
	return SpriteForRadius->getParent() == nullptr;
}

bool checkRadiusByEllipse( const Point & a, const Point & b, float radius )
{
	float x = fabs( a.x - b.x );
	float y = fabs( a.y - b.y ) * k::IsometricValue;
	float d = sqrt( x*x + y*y );
	return d <= radius;
}


ActionText::ActionText( ) {}
ActionText::~ActionText( ) {}
bool ActionText::init( float duration, float endValue, bool floatTruncation )
{
	if( ActionInterval::initWithDuration( duration ) )
	{
		_floatTruncation = floatTruncation;
		_endValue = endValue;
		return true;
	}
	return false;
}	
void ActionText::startWithTarget( cocos2d::Node *target )
{
	ActionInterval::startWithTarget( target );
	auto label = dynamic_cast<LabelProtocol*>(target);
	assert( label );
	_startValue = strToFloat( label->getString() );
}

void ActionText::update( float t )
{
	auto label = dynamic_cast<LabelProtocol*>(getTarget());
	assert( label );

	float value = _startValue + (_endValue - _startValue) * t;
	if( _floatTruncation )
	{
		label->setString( intToStr( int( value ) ) );
	}
	else
	{
		label->setString( floatToStr( value ) );
	}

}
ActionInterval* ActionText::reverse( ) const
{
	return ActionText::create( getDuration(), _startValue, _floatTruncation );
};

ActionInterval* ActionText::clone( ) const 
{
	return ActionText::create( getDuration( ), _endValue, _floatTruncation );
}

bool checkPointOnRoute( const cocos2d::Point & point, float maxDistanceToRoad, UnitLayer allowLayer, float * distance )
{
	assert( GameGS::getInstance() );
	GameBoard& board = GameGS::getInstance()->getGameBoard();
	const auto& routes = board.getCreepsRoutes();
	for( const auto& route : routes )
	{
		if( (route.type == allowLayer || allowLayer == UnitLayer::any) &&
			checkPointOnRoute( point, route, maxDistanceToRoad, distance ) )
			return true;
	}
	return false;
}

bool checkPointOnRoute( const cocos2d::Point & point, const TripleRoute & route, float maxDistanceToRoad, float * distance )
{
	size_t index_min( -1 );
	float distance_min( (float)2E+36 );

	const Route & road = route.main;
	for( size_t i = 1; i < road.size( ); ++i )
	{
		const Point p0 = road[i - 1];
		const Point p1 = road[i];
		float dist = distanse_pointToLineSegment( p0, p1, point );
		if( dist < distance_min )
		{
			distance_min = dist;
			index_min = i;
		}
	}
	if( distance )
		*distance = distance_min;
	return distance_min < maxDistanceToRoad;
};

int getElapsedTimeFromPreviosLaunch( const std::string & timeId )
{
	int elapsed( 0 );
	auto times = UserData::shared( ).get_str( timeId );
	if( times.empty( ) == false )
	{
		struct tm last;
		sscanf( times.c_str( ), "%d-%d-%d-%d", &last.tm_sec, &last.tm_min, &last.tm_hour, &last.tm_yday );
		time_t time = ::time( 0 );
		struct tm now = *localtime( &time );
		long long last_sec =
			last.tm_sec +
			last.tm_min * 60 +
			last.tm_hour * 60 * 60 +
			last.tm_yday * 60 * 60 * 24;
		long long now_sec =
			now.tm_sec +
			now.tm_min * 60 +
			now.tm_hour * 60 * 60 +
			now.tm_yday * 60 * 60 * 24;
		long long diff = now_sec - last_sec;
		elapsed = static_cast<int>(diff);
	}
	return elapsed;
}


UnitLayer strToUnitLayer( const std::string & value )
{
	if( value == "earth" )return UnitLayer::earth;
	if( value == "sky" )return UnitLayer::sky;
	if( value == "sea" )return UnitLayer::sea;
	if( value == "any" )return UnitLayer::any;
	return UnitLayer::earth;
}

std::string unitLayerToStr( UnitLayer unitLayer )
{
	switch( unitLayer )
	{
		case UnitLayer::earth: return "earth";
		case UnitLayer::sky: return "sky";
		case UnitLayer::sea: return "sea";
		case UnitLayer::any: return "any";
	}
	assert( 0 );
	return "";
}

UnitType strToUnitType( const std::string & value )
{
	if( value == "creep" ) return UnitType::creep;
	if( value == "tower" ) return UnitType::tower;
	if( value == "desant" ) return UnitType::desant;
	if( value == "hero" ) return UnitType::hero;
	return UnitType::other;
}

std::string unitTypeToStr( UnitType unittype )
{
	switch( unittype )
	{
		case UnitType::creep: return "creep";
		case UnitType::tower: return "tower";
		case UnitType::desant: return "desant";
		case UnitType::hero: return "hero";
		case UnitType::other: return "other";
	}
	assert( 0 );
	return "";
}


RouteSubType strToRouteSubType( const std::string & value )
{
	if( value == "random" )return RouteSubType::random;
	if( value == "-1" )return RouteSubType::random;
	if( value == "main" )return RouteSubType::main;
	if( value == "left" )return RouteSubType::left0;
	if( value == "right" )return RouteSubType::right0;
	return RouteSubType::random;
}

BodyType strToBodyType( const std::string & value )
{
	if( value == "equipment" )return BodyType::equipment;
	if( value == "meat" )return BodyType::meat;
	return BodyType::defaultvalue;
}

#if CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID
void openUrl(const std::string & url)
{
	JniMethodInfo t;
	if( JniHelper::getStaticMethodInfo( t, "org.cocos2dx.cpp/AppActivity", "openUrl", "(Ljava/lang/String;)V" ) )
	{
		jstring stringArg = t.env->NewStringUTF( url.c_str() );
		t.env->CallStaticVoidMethod( t.classID, t.methodID, stringArg );
		t.env->DeleteLocalRef( stringArg );
		t.env->DeleteLocalRef( t.classID );
	}
}
#elif CC_TARGET_PLATFORM == CC_PLATFORM_IOS
#else
void openUrl(const std::string & url){}
#endif

MouseHoverScroll::MouseHoverScroll()
	: _scrollMouseHoverX(0)
	, _scrollMouseHoverY(0)
	, _scroller(nullptr)
	, _winSize()
	, _touchListener(nullptr)
	, _node(nullptr)
	, _velocity(300.f)
	, _border(100.f)
{
	_winSize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
	_touchListener = EventListenerMouse::create();
	_touchListener->retain();
	_touchListener->onMouseMove = std::bind( &MouseHoverScroll::mouseHover, this, std::placeholders::_1 );

	auto eventDispatcher = Director::getInstance()->getEventDispatcher();
	eventDispatcher->addEventListenerWithFixedPriority( _touchListener, -9999 );
}

MouseHoverScroll::~MouseHoverScroll()
{
	auto eventDispatcher = Director::getInstance()->getEventDispatcher();
	eventDispatcher->removeEventListener( _touchListener );
	CC_SAFE_RELEASE_NULL( _touchListener );
}

void MouseHoverScroll::update(float dt)
{
	if (!_node || !_scroller)
		return;
	Point pos = _node->getPosition();
	pos.x += _scrollMouseHoverX * dt * _velocity;
	pos.y += _scrollMouseHoverY * dt * _velocity;
	_scroller->node = _node;
	pos = _scroller->fitPosition( pos, _winSize );
	_node->setPosition(pos);
}

void MouseHoverScroll::enable()
{
}

void MouseHoverScroll::disable()
{
}

void MouseHoverScroll::disable_schedule( float )
{
}

void MouseHoverScroll::mouseHover(Event*event)
{
	EventMouse* em = dynamic_cast<EventMouse*>(event);
	assert(em);
	if( !em ) 
		return;

	float border = _border;
	float sx(0.f), sy(0.f);

	if (em->getCursorX() < border)
		sx = +std::fabs( 1 - em->getCursorX() / border);
	else if( em->getCursorX() > (_winSize.width - border) )
		sx = -std::fabs( 1 - (_winSize.width - em->getCursorX()) / border );

	if (em->getCursorY() < border)
		sy = +std::fabs(1 - em->getCursorY() / border);
	else if( em->getCursorY() > (_winSize.height - border) )
		sy = -std::fabs( 1 - (_winSize.height - em->getCursorY()) / border );

	_scrollMouseHoverX = sx;
	_scrollMouseHoverY = sy;

	_scrollMouseHoverX = std::min(_scrollMouseHoverX, _velocity);
	_scrollMouseHoverY = std::min(_scrollMouseHoverY, _velocity);
}

class DebugIDs : public Singlton<DebugIDs>
{
public:
	DebugIDs()
	: _deviceID("__noid1234435641asdfggesrnoid__")
	, _testModeActive( false )
	{
	}
public:
	std::string _deviceID;
	std::set<std::string> _testDevices;
	bool _testModeActive;
};

void setDeviceID( const std::string& deviceID )
{
	DebugIDs::shared()._deviceID = deviceID;
}

std::string getDeviceID()
{
	return DebugIDs::shared()._deviceID;
}

void addTestDevice( const std::string& deviceID )
{
	DebugIDs::shared()._testDevices.insert( deviceID );
}

bool isTestDevice()
{
	return DebugIDs::shared()._deviceID.empty() == false ?
		DebugIDs::shared()._testDevices.find( getDeviceID() ) != DebugIDs::shared()._testDevices.end() :
			false;
}

void setTestModeActive( bool active )
{
	DebugIDs::shared()._testModeActive = active;
}

bool isTestModeActive()
{
	return DebugIDs::shared()._testModeActive;
}

#if CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID
#define JAVA(method)JNIEXPORT void JNICALL  Java_org_cocos2dx_cpp_AppActivity_##method(JNIEnv*  env, jobject thiz, jstring arg0)
extern
"C"
{

	JAVA(nativeSetPhoneID) {
		std::string str = JniHelper::jstring2string(arg0);
		DebugIDs::shared()._deviceID = str;
	}

}
#undef JAVA
#endif

NS_CC_END;
