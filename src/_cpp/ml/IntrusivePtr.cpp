//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "IntrusivePtr.h"
#include "cocos2d.h"
#include <memory>
NS_CC_BEGIN;
/*
static int count(0);

class IinrusiveRef
{
public:
	IinrusiveRef( ) : _reference( 1 )
	{
		++count;
	}
	virtual ~IinrusiveRef( )
	{
		--count;
	}

	int retain( )
	{
		return ++_reference;
	}

	int release( )
	{
		int r = --_reference;
		if( r == 0 )
			delete this;
		return r;
	}

private:
	int _reference;
};

class RefInheritor : public IinrusiveRef
{
public:
	RefInheritor() {}
	virtual ~RefInheritor() {}
};

typedef IntrusivePtr<IinrusiveRef> RefHolder;
typedef IntrusivePtr<RefInheritor> RefInheritorHolder;

bool IntrusivePtr_test( )
{
	log( "..........IntrusivePtrTemplate_test started" );

	{
		auto ref = new IinrusiveRef;
		auto ref0 = IntrusivePtr<IinrusiveRef>( ref );
		ref->release();
	}
	if( count != 0 ) log( "..........constructor/destructor failed" );

	{
		auto ref0 = make_intrusive<IinrusiveRef>( );
		auto ref1( ref0 );
		ref0 = ref1;
		ref1 = ref0;
	}
	if( count != 0 ) log( "..........copy constructor failed" );

	{
		auto ref0 = make_intrusive<IinrusiveRef>( );
		auto ref1 = std::move( ref0 );
		ref1.reset( nullptr );
	}
	if( count != 0 ) log( "..........move constructor failed" );

	{
		
		auto ref = make_intrusive<IinrusiveRef>( );
		auto raw = ref.ptr();

		assert( raw == &(*ref) );
		assert( ref != make_intrusive<IinrusiveRef>( ) );
		assert( ref != make_intrusive<RefInheritor>( ) );

		auto ref0 = make_intrusive<IinrusiveRef>( );
		auto ref1 = make_intrusive<IinrusiveRef>( );
		assert( (ref0.ptr() < ref1.ptr()) == (ref0 < ref1) );
		
	}
	if( count != 0 ) log( "..........compare operators failed" );

	{
		auto ref0 = make_intrusive<IinrusiveRef>( );
		auto ref1 = make_intrusive<IinrusiveRef>( );
		ref0 = ref1;
		ref1 = ref0;
	}
	if( count != 0 ) log( "..........operator == failed" );

	{
		std::vector<RefHolder> array;
		array.push_back( make_intrusive<IinrusiveRef>( ) );
		array.push_back( make_intrusive<RefInheritor>( ) );
	} 
	if( count != 0 ) log( "..........make not work" ); 

	{
		std::vector<RefHolder> array;
		auto ref0 = make_intrusive<IinrusiveRef>( );
		auto ref1 = make_intrusive<RefInheritor>( );

		array.push_back( ref0 );
		array.push_back( ref1 );
	}
	if( count != 0 ) log( "..........make( ) not work" );

	{
		RefHolder ref0 = make_intrusive<IinrusiveRef>( );
		RefHolder ref1 = make_intrusive<RefInheritor>( );
		RefInheritorHolder ref2 = make_intrusive<RefInheritor>( );
		ref0 = ref2;
		ref1 = ref2;
	}
	if( count != 0 ) log( ".......... cast not work" );



	bool result = count == 0;
	assert( result );
	if( result ) log( "..........IntrusivePtrTemplate_test complite successful" );
	return result;

}
*/

bool IntrusivePtr_test( )
{
	return true;
}

NS_CC_END;