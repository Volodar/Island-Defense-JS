//
//  ml.h
//  Strategy
//
//  Created by Vladimir Tolmachev on 26.06.14.
//
//

#ifndef __ml_macroses_h__
#define __ml_macroses_h__

#include "types.h"

#pragma warning( disable : 4996 )


#include <memory>
#include "cocos2d.h"
#include "IntrusivePtr.h"

#define DECLARE_BUILDER( CLASS ) \
public:\
typedef IntrusivePtr<CLASS> Pointer; \
typedef IntrusivePtr<CLASS> CLASS##Pointer; \
CLASS(); \
virtual ~CLASS(); \
template <class ... Types> \
static CLASS::Pointer create(Types && ... _Args){	\
	Pointer pointer = make_intrusive<CLASS>(); \
	if( !pointer || !pointer->init( std::forward<Types>( _Args )... ) ) \
		pointer.reset( nullptr ); \
	return pointer; \
}

//#define DECLARE_BUILDER( CLASS ) \
//public:\
//typedef IntrusivePtr<CLASS> Pointer; \
//typedef IntrusivePtr<CLASS> CLASS##Pointer; \
//CLASS(); \
//virtual ~CLASS(); \
//static CLASS::Pointer create(){	\
//	Pointer pointer = make_intrusive<CLASS>(); \
//	/*try*/{ \
//	if( !pointer || !pointer->init( ) ) \
//		pointer.reset( nullptr ); \
//	}/*catch(...)\
//		{ cocos2d::log( "error creating class" ); }*/ \
//	return pointer; \
//}

#define DECLARE_POINTER( CLASS ) \
public:\
typedef IntrusivePtr<CLASS> Pointer; \
typedef IntrusivePtr<CLASS> CLASS##Pointer; \
CLASS(); \
virtual ~CLASS(); \

#define PROTECTED_CONSTRUCTORS( CLASS ) \
	protected: \
	CLASS( ); \
	~CLASS( ); \
	CLASS( const CLASS & ); \
	CLASS& operator = (const CLASS &); \
	CLASS( CLASS && ); \

#define PRIVATED_CONSTRUCTORS( CLASS ) \
	private: \
	CLASS( ); \
	~CLASS( ); \
	CLASS( const CLASS & ); \
	CLASS& operator = (const CLASS &); \
	CLASS( CLASS && ); \



#endif