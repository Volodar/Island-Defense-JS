//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __Common_h__
#define __Common_h__
#include "cocos2d.h"
#include "stdio.h"

#define FOR_EACHXML(_node, _child) for( auto _child = _node.first_child(); _child; _child = _child.next_sibling() )
#define FOR_EACHXML_BYTAG(_node, _child, _tag) for( auto _child = _node.child(_tag); _child; _child = _child.next_sibling(_tag) ) 

#define sizearray(arr) sizeof(route) / sizeof ( route[0] )


class TimeCounter
{
public:
	TimeCounter() :m_counter( 0 ), m_timer( 0 ) {}
	void set( float time ) { m_timer = time; reset(); }
	void reset() { m_counter = m_timer; }
	void tick( float elapsetime ) { m_counter -= elapsetime; }
	float value()const { return m_timer; }
	operator bool() const { return m_counter <= 0; }

private:
	operator float() const { return m_timer; }
private:
	float m_counter;
	float m_timer;
};

void log_once( const char * format, ... );

float getAngle( const cocos2d::Point & a, const cocos2d::Point & b );

float getDirectionByVector( const cocos2d::Point & radius );

float getDistance( const cocos2d::Point & point, const cocos2d::Point & A, const cocos2d::Point & B );

float distanse_pointToLineSegment(
	const cocos2d::Point & segmentA,
	const cocos2d::Point & segmentB,
	const cocos2d::Point & point );


cocos2d::FiniteTimeAction * createRouteAction( const std::vector<cocos2d::Point> route, float objectSpeed );

bool checkPointInNode( const cocos2d::Node * node, const cocos2d::Point & pointInParentSpace, int depth = -1 );

void split( std::list<std::string> & out, const std::string & values, const char delimiter = ',' );
void split( std::vector<std::string> & out, const std::string & values, const char delimiter = ',' );

std::string boolToStr( bool value );

std::string intToStr( int value );

std::string floatToStr( float value );

std::string floatToStr2( float value );

bool strToBool( const std::string & value );

int strToInt( const std::string & value );

float strToFloat( const std::string & value );

cocos2d::Point strToPoint( const std::string & value );
const std::string pointToStr( const cocos2d::Point & point );

cocos2d::Size strToSize( const std::string & value );
const std::string sizeToStr( const cocos2d::Size & size );

cocos2d::Rect strToRect( const std::string & value );
const std::string rectToStr( const cocos2d::Rect & rect );

cocos2d::Color3B strToColor3B( const std::string & value );

cocos2d::BlendFunc strToBlendFunc( const std::string & value );
std::string blendFuncToStr( const cocos2d::BlendFunc & blendFunc );

void fileLog( const std::string & s );

cocos2d::Point getRandPointInPlace( const cocos2d::Point & center, float radius );

std::string m_image_directory( const std::string & source, int posFromEnd, unsigned randomDiapason );
void computePointsByRadius( std::vector<cocos2d::Point> & out, float radius, size_t countPoints, float startAngleInDegree = 0 );

cocos2d::Node * getNodeByTagsPath( cocos2d::Node * root, const std::list<int> & tagspath );
cocos2d::Node * getNodeByPath( cocos2d::Node * root, const std::string & path_names );

template <class T>
T * getNodeByTagsPath( cocos2d::Node * root, const std::list<int> & tagspath )
{
	auto node = getNodeByTagsPath( root, tagspath );
	return dynamic_cast<T*>(node);
}

template <class T>
T * getNodeByPath( cocos2d::Node * root, const std::string & path_names )
{
	auto node = getNodeByPath( root, path_names );
	return dynamic_cast<T*>(node);
}
#endif