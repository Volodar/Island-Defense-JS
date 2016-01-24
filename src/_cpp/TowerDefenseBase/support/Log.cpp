//
//  Log.cpp
//  TowerDefence
//
//  Created by Vladimir Tolmachev on 09.02.14.
//
//

#include "Log.h"
#include "cocos2d.h"
USING_NS_CC;

mlLog::mlLog()
{
}

mlLog::~mlLog()
{
	say( "log destroyed" );
}

void mlLog::push(const std::string & message)
{
	m_stack.push( message );
	say( message + ": pushed" );
}

void mlLog::pop()
{
	say( m_stack.top() + ": poped" );
	m_stack.pop();
}

void mlLog::say(const std::string & message)
{
	std::string s(": ");
	for( unsigned i=0; i<m_stack.size(); ++i) s += "| ";
	log( "%s", (s + message).c_str() );
}

