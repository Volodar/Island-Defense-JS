//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __Observer_h__
#define __Observer_h__
#include <functional>
#include <vector>
#include <assert.h>
#include <memory>
#include <map>
#include "IntrusivePtr.h"

template <class Handler, class Function>
class ObServer
{
public:
	ObServer( )
		: _lockCounter(0)
		, _functions()
		, _holder(nullptr)
	{}

	ObServer( Handler * holder )
	{}

	~ObServer( void )
	{
	}
	
	void add( int tag, const Function & function )
	{
		assert( function );
		_functions[tag] = function;
	}

	void remove( int tag )
	{
		auto iter = _functions.find( tag );
		if( iter != _functions.end() )
			_functions.erase( iter );
	}
	
	template<class...TArgs>
	void pushevent( TArgs && ... _Args )
	{
		if( _lockCounter == 0 )
		for( auto& func : _functions )
		{
			func.second( std::forward<TArgs>( _Args )... );
		}
	}

	void lock()
	{
		++_lockCounter;
		assert( _lockCounter >= 0 );
	}

	void unlock()
	{
		--_lockCounter;
		assert( _lockCounter >= 0 );
	}

	Handler * holder()
	{
		return _holder;
	}

protected:
private:
	int _lockCounter;
	std::map<int, Function > _functions;
	Handler * _holder;
};



#endif