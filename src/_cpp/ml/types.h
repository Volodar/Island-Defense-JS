//
//  ml.h
//  Strategy
//
//  Created by Vladimir Tolmachev on 26.06.14.
//
//
#ifndef __ml_types__
#define __ml_types__


#pragma warning( disable : 4996 )


#include <memory>
#include "cocos2d.h"
#include "IntrusivePtr.h"

typedef IntrusivePtr<cocos2d::Sprite>SpritePointer;
typedef IntrusivePtr<cocos2d::Node>NodePointer;
typedef IntrusivePtr<cocos2d::Layer>LayerPointer;
typedef IntrusivePtr<cocos2d::Scene>ScenePointer;
typedef IntrusivePtr<cocos2d::Label>LabelPointer;
typedef IntrusivePtr<cocos2d::Ref> RefPointer;
typedef IntrusivePtr<cocos2d::Action> ActionPointer;
typedef IntrusivePtr<cocos2d::FiniteTimeAction> FiniteTimeActionPointer;
typedef IntrusivePtr<cocos2d::Menu> MenuPointer ;
typedef IntrusivePtr<cocos2d::MenuItem> MenuItemPointer;
typedef IntrusivePtr<cocos2d::ProgressTimer> ProgressTimerPointer;



template <typename T>
class UnsetValue
{
public:
	UnsetValue( ) :m_valid( false ), m_value( ) {}
	UnsetValue( const T & value ) :m_valid( true ), m_value( value ) {}
	template <typename Type>UnsetValue( const Type & value ) : m_valid( true ), m_value( value ) {}
	UnsetValue( const UnsetValue & other ) :m_valid( other.m_valid ), m_value( other.m_value ) {}
	UnsetValue( UnsetValue && other ) :m_valid( other.m_valid ), m_value( other.m_value ) { other.m_valid = false; }
	UnsetValue& operator = (const UnsetValue & other) { m_valid = other.m_valid; m_value = other.m_value; return *this; }
	UnsetValue& operator = (const T & value) { m_valid = true; m_value = value; return *this; }
	operator T( ) const { assert( m_valid ); return m_value; }

	void set( const T & value ) { m_valid = true; m_value = value; }
	bool valid( ) const { return m_valid; }
private:
	bool m_valid;
	T m_value;
};


#endif
