//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "Animation.h"
#include <stdio.h>
#include "cocos2d.h"
#include <stdarg.h>
#include "ImageManager.h"
#include "ml/common.h"
using namespace cocos2d;


static void _log( const char *format, va_list args )
{
	char buf[MAX_LOG_LENGTH];

	vsnprintf( buf, MAX_LOG_LENGTH - 3, format, args );
	strcat( buf, "\n" );

#if CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID
//	__android_log_print( ANDROID_LOG_DEBUG, "cocos2d-x debug info", "%s", buf );

#elif CC_TARGET_PLATFORM ==  CC_PLATFORM_WIN32 || CC_TARGET_PLATFORM == CC_PLATFORM_WINRT || CC_TARGET_PLATFORM == CC_PLATFORM_WP8
	WCHAR wszBuf[MAX_LOG_LENGTH] = { 0 };
	MultiByteToWideChar( CP_UTF8, 0, buf, -1, wszBuf, sizeof(wszBuf) );
	OutputDebugStringW( wszBuf );
	WideCharToMultiByte( CP_ACP, 0, wszBuf, -1, buf, sizeof(buf), nullptr, FALSE );
	printf( "%s", buf );
	fflush( stdout );
#else
	// Linux, Mac, iOS, etc
	fprintf( stdout, "cocos2d: %s", buf );
	fflush( stdout );
#endif

#if (CC_TARGET_PLATFORM != CC_PLATFORM_WINRT)
	Director::getInstance( )->getConsole( )->log( buf );
#endif

}

void log_once( const char * format, ... )
{
	static std::set<std::string> _history;

	va_list args;
	va_start( args, format );

	char buf[MAX_LOG_LENGTH];
	vsnprintf( buf, MAX_LOG_LENGTH - 3, format, args );

	if( _history.find( buf ) == _history.end( ) )
	{
		_history.insert( buf );
		_log( format, args );
	}
	va_end( args );
}

float getAngle( const cocos2d::Point & a, const cocos2d::Point & b )
{
	return -atan2( a.x*b.y - b.x*a.y, a.x*b.x + a.y*b.y ) * 180.f / float( M_PI );
}

float getDirectionByVector( const cocos2d::Point & radius )
{
	cocos2d::Point axis( 1, 0 );
	return getAngle( axis, radius );
}

float getDistance( const cocos2d::Point & point, const cocos2d::Point & A, const cocos2d::Point & B )
{
	float x = point.x;
	float y = point.y;
	float x1 = A.x;
	float y1 = A.y;
	float x2 = B.x;
	float y2 = B.y;
	return std::abs( (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1) ) / sqrt( (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) );
}

float distanse_pointToLineSegment(
	const cocos2d::Point & segmentA,
	const cocos2d::Point & segmentB,
	const cocos2d::Point & point )
{
	const cocos2d::Point P0 = point;
	const cocos2d::Point P1 = segmentA;
	const cocos2d::Point P2 = segmentB;

	const cocos2d::Point p01 = P0 - P1;
	const cocos2d::Point p21 = P2 - P1;

	const float T = p21.dot( p01 ) / p21.lengthSquared( );

	if( T < 0 || T > 1 )
		return (float)1E+37;

	const cocos2d::Point P = P1 + p21 * T;
	const float distance = P.getDistance( point );
	return distance;
}


cocos2d::FiniteTimeAction * createRouteAction( const std::vector<cocos2d::Point> route, float objectSpeed )
{
	cocos2d::Vector<cocos2d::FiniteTimeAction*> actions;
	for( unsigned i = 1; i < route.size( ); ++i )
	{
		float duration( 0 );
		duration = route[i - 1].getDistance( route[i] ) / objectSpeed;
		actions.pushBack( cocos2d::MoveTo::create( duration, route[i] ) );
	}
	return cocos2d::Sequence::create( actions );
};

bool checkPointInNode( const cocos2d::Node * node, const cocos2d::Point & pointInParentSpace, int depth );

void split( std::list<std::string> & out, const std::string & values, const char delimiter )
{
	if( values.empty( ) )
		return;
	std::string string = values;
	do
	{
		size_t k = string.find_first_of( delimiter );
		if( k == -1 )
		{
			out.push_back( string );
			break;
		}

		out.push_back( string.substr( 0, k ) );
		string = string.substr( k + 1 );
		if( string.empty( ) )break;
	}
	while( true );
}

void split( std::vector<std::string> & out, const std::string & values, const char delimiter )
{
	std::list<std::string> list;
	split( list, values, delimiter );
	for( auto i : list ) out.push_back( i );
}

std::string boolToStr( bool value )
{
	return value ? "yes" : "no";
};

std::string intToStr( int value )
{
	static char buffer[32];
	buffer[0] = 0x0;
	sprintf( buffer, "%d", value );
	return buffer;
};

std::string floatToStr( float value )
{
	static char buffer[32];
	buffer[0] = 0x0;
	sprintf( buffer, "%.2f", value );
	return buffer;
};

std::string floatToStr2( float value )
{
	static char buffer[32];
	buffer[0] = 0x0;
	sprintf( buffer, "%f", value );
	return buffer;
};

bool strToBool( const std::string & value )
{
	if( value.empty( ) )
		return false;
	bool result( false );
	result = result || value == "yes";
	result = result || value == "Yes";
	result = result || value == "true";
	result = result || value == "True";
	return result;
}

int strToInt( const std::string & value )
{
	return value.empty( ) ? 0 :
		atoi( value.c_str( ) );
}

float strToFloat( const std::string & value )
{
	return value.empty( ) ? 0.f :
		static_cast<float> (atof( value.c_str( ) ));
}

void computePointsByRadius(std::vector<Point> & out, float radius, size_t countPoints, float startAngleInDegree)
{
	float delta = static_cast<float>(M_PI) * 2.0f / countPoints;
	float startAngleInRadian = startAngleInDegree * static_cast<float>(M_PI) / 180.f;
	out.resize(countPoints);
	for( size_t i=0; i<countPoints; ++i )
	{
		float angle = startAngleInRadian + delta * i;
		out[i].x = radius * cos(angle);
		out[i].y = radius * sin(angle);
	}
}

Node * getNodeByTagsPath( Node * root, const std::list<int> & tagspath )
{
	std::list<int> tags = tagspath;
	Node * node( root );
	
	while( node && tags.empty() == false )
	{
		node = node->getChildByTag( tags.front() );
		tags.pop_front();
	}

	return node;
}

Node * getNodeByPath( Node * root, const std::string & path_names )
{
	std::list<std::string> names;
	split( names, path_names, '/' );
	Node * node( root );

	while( node && names.empty( ) == false )
	{
		std::string name = names.front();
		if( name == ".." )
			node = node->getParent();
		else if( name == "." )
			node = node;
		else if( name.empty() && path_names[0] == '/' )
		{
			node = node->getScene();
			if( node == nullptr )
				node = Director::getInstance()->getRunningScene();
		}
		else 
			node = node->getChildByName( name );

		names.pop_front( );
	}

	return node;
}

bool checkPointInNode( const cocos2d::Node * node, const cocos2d::Point & pointInParentSpace, int depth )
{
	if( !node )
		return false;
	cocos2d::Rect bb = node->getBoundingBox( );
	cocos2d::Point point = pointInParentSpace;
	
	Node const* parent = node;
	while( parent )
	{
		if( parent->isVisible( ) == false )
			return false;
		parent = parent->getParent( );
	}
	if( point.x > bb.origin.x &&
		point.x < bb.origin.x + bb.size.width &&
		point.y > bb.origin.y &&
		point.y < bb.origin.y + bb.size.height )
	{
		return true;
	}

	//if( depth == 0 )return nullptr;
	//
	//cocos2d::Vector<cocos2d::Node*> children = node->getChildren( );
	//
	//for( int i = 0; i < children.size( ); ++i )
	//{
	//	const cocos2d::Node * child = dynamic_cast<cocos2d::Node*>(children.at( i ));
	//	assert( child );
	//	if( checkPointInNode( child, point, depth - 1 ) )
	//		return true;
	//}

	return false;
};


cocos2d::Point strToPoint( const std::string & value )
{
	static Size frame = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
	std::string string = value;

	size_t framek = string.find( "frame:" );
	if( framek == 0 )
	{
		string = string.substr( framek + 6 );
		Point point = strToPoint( string );
		point.x *= frame.width;
		point.y *= frame.height;
		return point;
	}

	size_t rb = string.find( "right:" );
	if( rb == 0 )
	{
		string = string.substr( rb + 6 );
		Point point = strToPoint( string );
		point.x = frame.width + point.x;
		return point;
	}
	size_t lt = string.find( "top:" );
	if( lt == 0 )
	{
		string = string.substr( lt + 4 );
		Point point = strToPoint( string );
		point.y = frame.height + point.y;
		return point;
	}
	size_t rt = string.find( "righttop:" );
	if( rt == 0 )
	{
		string = string.substr( rt + 9 );
		Point point = strToPoint( string );
		point.x = frame.width + point.x;
		point.y = frame.height + point.y;
		return point;
	}
	size_t hb = string.find( "halfbottom:" );
	if( hb == 0 )
	{
		string = string.substr( hb + 11 );
		Point point = strToPoint( string );
		point.x = frame.width / 2 + point.x;
		return point;
	}
	size_t ht = string.find( "halftop:" );
	if( ht == 0 )
	{
		string = string.substr( ht + 8 );
		Point point = strToPoint( string );
		point.x = frame.width / 2 + point.x;
		point.y = frame.height + point.y;
		return point;
	}
	size_t lh = string.find( "lefthalf:" );
	if( lh == 0 )
	{
		string = string.substr( lh + 9 );
		Point point = strToPoint( string );
		point.y = frame.height / 2 + point.y;
		return point;
	}
	size_t rh = string.find( "righthalf:" );
	if( rh == 0 )
	{
		string = string.substr( rh + 10 );
		Point point = strToPoint( string );
		point.x = frame.width + point.x;
		point.y = frame.height / 2 + point.y;
		return point;
	}

	size_t k = string.find( "x" );
	if( k == std::string::npos )
		return cocos2d::Point( 0, 0 );

	cocos2d::Point p;
	p.x = strToFloat( string.substr( 0, k ) );
	p.y = strToFloat( string.substr( k + 1 ) );
	
	return p;
}

const std::string pointToStr( const Point & point )
{
	return floatToStr( point.x ) + "x" + floatToStr( point.y );
}

cocos2d::Size strToSize( const std::string & value )
{
	Point p = strToPoint( value );
	return Size( p );
}

const std::string sizeToStr( const cocos2d::Size & size )
{
	return floatToStr( size.width ) + "x" + floatToStr( size.height );
}

cocos2d::Rect strToRect( const std::string & value )
{
	Rect rect;
	std::list<std::string> list;
	split( list, value );
	rect.origin = strToPoint( (list.size() > 0) ? list.front() : "" );
	rect.size = Size( strToPoint( (list.size() > 1) ? *(++list.begin()) : "" ) );
	return rect;
}

const std::string rectToStr( const cocos2d::Rect & rect )
{
	std::string result = pointToStr( rect.origin ) + "," + pointToStr( Point( rect.size.width, rect.size.height ) );
	return result;
}

cocos2d::Color3B strToColor3B( const std::string & value )
{
	assert( value.empty( ) || value.size( ) == 6 );
	if( value.empty( ) ) return cocos2d::Color3B::WHITE;

	const std::string r = value.substr( 0, 2 );
	const std::string g = value.substr( 2, 2 );
	const std::string b = value.substr( 4, 2 );
	int R, G, B;
	sscanf( r.c_str( ), "%x", &R );
	sscanf( g.c_str( ), "%x", &G );
	sscanf( b.c_str( ), "%x", &B );

	return cocos2d::Color3B( GLubyte( R ), GLubyte( G ), GLubyte( B ) );
}

cocos2d::BlendFunc strToBlendFunc( const std::string & value )
{
	if( 0 );
	else if( value == "additive" )return BlendFunc::ADDITIVE;
	else if( value == "disable" )return BlendFunc::DISABLE;
	else if( value == "alphapremultiplied" )return BlendFunc::ALPHA_PREMULTIPLIED;
	else if( value == "alphanonpremultiplied" )return BlendFunc::ALPHA_NON_PREMULTIPLIED;
	else log( "Warning: strToBlendFunc not know blending by string [%s]", value.c_str() );
	return BlendFunc::DISABLE;
}

std::string blendFuncToStr( const cocos2d::BlendFunc & blendFunc )
{
	if( 0 );
	else if( blendFunc == BlendFunc::ADDITIVE ) return "additive";
	else if( blendFunc == BlendFunc::DISABLE ) return "disable";
	else if( blendFunc == BlendFunc::ALPHA_PREMULTIPLIED ) return "alphapremultiplied";
	else if( blendFunc == BlendFunc::ALPHA_NON_PREMULTIPLIED ) return "alphanonpremultiplied";
	return "";
}

void fileLog( const std::string & s )
{
	FILE * file = fopen( "log.txt", "a+" );
	if( !file )
	{
		file = fopen( "log.txt", "w+" );
	}
	if( !file ) return;
	fputs( s.c_str( ), file );
	fclose( file );
};

cocos2d::Point getRandPointInPlace( const cocos2d::Point & center, float radius )
{
	cocos2d::Point r;
	float angle = CCRANDOM_0_1( ) * float( M_PI ) * 2;
	float ca = cos( angle );
	float sa = sin( angle );
	r.x = center.x + ca * radius;
	r.y = center.y + sa * radius;

	return r;
}