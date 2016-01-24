//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __ParamCollection_h__
#define __ParamCollection_h__
#include <map>
#include <string>
#include "cocos2d.h"

class ParamCollection : public std::map<std::string, std::string>
{
	static const char delimiter_pair = ':';
	static const char delimiter = ',';
	static const char delimiter_invalue = static_cast<char>(0x1);

public:
	ParamCollection( const std::string & string = "" )
	{
		parse( string );
	}
	
	void parse( const std::string & string )
	{
		size_type l = 0;
		do
		{
			size_type k = string.find( delimiter, l );
			if( k == std::string::npos ) k = string.size( );
			std::string s = string.substr( l, k - l );
			l = k + 1;
			
			size_type d = s.find( delimiter_pair );
			bool value = d != std::string::npos;
			std::string n = value ? s.substr( 0, d ) : s;
			std::string v = value ? s.substr( d + 1 ) : std::string();
			std::string::size_type l(0);
			while(true)
			{
				std::string::size_type k = v.find( delimiter_invalue, l);
				if( k == std::string::npos )
					break;
				v[k] = delimiter;
				l = k + 1;
			}
			if( n.empty( ) == false )
				operator[]( n ) = v;
		}
		while( l<string.size( ) );
	}
	
	std::string string( )const
	{
		std::string result;
		for( auto &iter : *this )
		{
			if( result.empty( ) == false ) result += delimiter;
			
			std::string name = iter.first;
			std::string value = iter.second;
			std::string::size_type l(0);
			do
			{
				std::string::size_type k = value.find(delimiter, l);
				if( k == std::string::npos )
					break;
				value[k] = delimiter_invalue;
				l = k+1;
			}
			while(true);
			result += name + (value.empty( ) ? value : (delimiter_pair + value));
		}
		return result;
	}

	const std::string& get( const std::string & name, const std::string & defaultValue )
	{
		auto iter = find( name );
		return iter != end() ? iter->second : defaultValue;
	}

	const void set( const std::string & name, const std::string & value, bool rewrite = true )
	{
		auto pair = insert( std::pair<std::string, std::string>( name, value ) );
		if( pair.second == false && rewrite )
			pair.first->second = value;
	}

	void tolog()const
	{
		cocos2d::log("ParamCollection::tolog begin:");
		for(auto &iter : *this )
		{
			cocos2d::log( "%s=[%s]", iter.first.c_str(), iter.second.c_str() );
		}
		cocos2d::log("ParamCollection::tolog end:");
	}
};


#endif