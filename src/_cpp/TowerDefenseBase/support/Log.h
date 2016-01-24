//
//  Log.h
//  TowerDefence
//
//  Created by Vladimir Tolmachev on 09.02.14.
//
//

#ifndef __TowerDefence__Log__
#define __TowerDefence__Log__

#include <iostream>
#include "support.h"
#include <stack>
#include <assert.h>

class mlLog : public Singlton<mlLog>
{
	friend class Singlton<mlLog>;
private:
	mlLog();
	mlLog( const mlLog & ){}
	const mlLog& operator=( const mlLog & ){ assert(0); return *this; }
public:
	~mlLog();
	void push(const std::string & message);
	void pop();
	void say(const std::string & message);
protected:
	std::stack<std::string> m_stack;
};

struct __pop_say_stack
{
	__pop_say_stack( const std::string & msg )
	{
		 mlLog::shared().push( msg );
	}
	~__pop_say_stack()
	{
		 mlLog::shared().pop( );
	}
};

#define STACK_LOG 0

#if STACK_LOG == 1
#	ifdef WIN32
#		define __log_build_line "line[" + intToStr(__LINE__) + "] [" + __FUNCTION__ +"]: "
#	else
#		define __log_build_line "line[" + intToStr(__LINE__) + "] [" + __func__ +"]: "
#	endif

#	define __log_line( msg ) mlLog::shared().say( __log_build_line + msg )
#	define __push_auto( msg ) __pop_say_stack __stack_will_auto_poped( __log_build_line + msg )
#	define __push_auto_check( msg )  __push_auto( msg ); if(!this) __log_line( "this == nullptr" ); assert( this ) 

#else
#	define __log_build_line
#	define __log_line( msg ) {}
#	define __push_auto( msg ) {}
#	define __push_auto_check( msg ) {}
#endif




#endif /* defined(__TowerDefence__Log__) */
