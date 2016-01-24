//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __ml_SUPPORT__
#define __ml_SUPPORT__
#pragma warning (disable : 4996)
#include "cocos2d.h"
#include "ml/pugixml/pugixml.hpp"
#include "ml/common.h"
#include "ml/Singlton.h"
#include "ml/Animation.h"
#include "ml/types.h"
#include "ml/macroses.h"
#include "NodeExt.h"

#define DESSIZE Director::getInstance()->getOpenGLView()->getDesignResolutionSize()

NS_CC_BEGIN


typedef std::vector<Point> Route;

enum class UnitLayer
{
	earth = 0,
	sky,
	sea,
	any,
};

enum class UnitType
{
	creep = 0,
	tower,
	desant,
	hero,
	other,
};

enum class RouteSubType
{
	defaultvalue = -1,
	random = defaultvalue,
	main = 0,
	left0 = 1,
	right0 = 2,
	max = 3,
};

struct TripleRoute
{
	UnitLayer type;
	Route main;
	Route left;
	Route right;
};

enum class BodyType
{
	defaultvalue = 0,
	equipment = defaultvalue,
	meat = 1,
};



void showRadius( const Point & position, float radius );
void hideRadius( );
bool radiusTowerIsHiden();

bool checkRadiusByEllipse( const Point & a, const Point & b, float radius );


class ActionText : public ActionInterval
{
	DECLARE_BUILDER( ActionText );
	bool init( float duration, float endValue, bool floatTruncation = true );
public:
	void startWithTarget( Node *target );
	void update( float t );
	virtual ActionInterval* reverse() const override;
	virtual ActionInterval *clone() const override;
private:
	bool _floatTruncation;
	float _startValue;
	float _endValue;
};

struct ScrollTouchInfo : public Ref
{
	Point touchBegan;
	Point nodeposBegan;
	Point lastShift;
	NodePointer node;
	unsigned touchID;

	Point fitPosition( const Point & position, const Size & winsize )
	{
		assert( node );
		Point pos = position;
		if( node )
		{
			auto size = node->getContentSize( ) * node->getScale( );
			pos.x = std::min<float>( pos.x, 0 );
			pos.x = std::max<float>( pos.x, winsize.width - size.width );
			pos.y = std::min<float>( pos.y, 0 );
			pos.y = std::max<float>( pos.y, winsize.height - size.height );
		}
		return pos;
	}
};

class MouseHoverScroll : public Singlton<MouseHoverScroll>
{
public:
	MouseHoverScroll();
	~MouseHoverScroll();
	void update(float dt);
public:
	void enable();
	void disable();
	void mouseHover(Event*event);
	void disable_schedule( float );
private:
	float _scrollMouseHoverX;
	float _scrollMouseHoverY;
	Size _winSize;
	EventListenerMouse* _touchListener;
	CC_SYNTHESIZE( IntrusivePtr< ScrollTouchInfo >, _scroller, Scroller );
	CC_SYNTHESIZE(NodePointer, _node, Node);
	CC_SYNTHESIZE(float, _velocity, Velocity);
	CC_SYNTHESIZE(float, _border, Border);
};

template <class T>
T compute_bezier( const T & a, const T &  b, const T &  c, const T &  d, float  t )
{
	return (powf( 1 - t, 3 ) * a + 3 * t*(powf( 1 - t, 2 ))*b + 3 * powf( t, 2 )*(1 - t)*c + powf( t, 3 )*d);
}

bool checkPointOnRoute( const cocos2d::Point & point, float maxDistanceToRoad, UnitLayer allowLayer, float * distance = nullptr );
bool checkPointOnRoute( const cocos2d::Point & point, const TripleRoute & route, float maxDistanceToRoad, float * distance = nullptr );

int getElapsedTimeFromPreviosLaunch( const std::string & timeId );

UnitLayer strToUnitLayer( const std::string & value );
std::string unitLayerToStr( UnitLayer unitLayer );
UnitType strToUnitType( const std::string & value );
std::string unitTypeToStr( UnitType unittype );
RouteSubType strToRouteSubType( const std::string & value );
BodyType strToBodyType( const std::string & value );

void openUrl(const std::string & url);


inline void setKeyDispatcherBackButton( LayerExt* layer )
{
	EventListenerKeyboard * event = EventListenerKeyboard::create();

	auto lambda = [layer]( EventKeyboard::KeyCode key, Event* )mutable
	{
		if( key == EventKeyboard::KeyCode::KEY_BACK )
			layer->runEvent( "onexit" );
	};
	event->onKeyReleased = std::bind( lambda, std::placeholders::_1, std::placeholders::_2);
	
	layer->getEventDispatcher()->addEventListenerWithSceneGraphPriority(event, layer);
};

std::string getDeviceID();
void setDeviceID( const std::string& deviceID );
void addTestDevice( const std::string& deviceID );
bool isTestDevice();
void setTestModeActive( bool active );
bool isTestModeActive();


NS_CC_END
#endif
