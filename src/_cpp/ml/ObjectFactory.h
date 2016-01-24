//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __ObjectFactory_h__
#define __ObjectFactory_h__
#include "Singlton.h"
#include "ml/macroses.h"
NS_CC_BEGIN;


class Factory : public Singlton<Factory>
{
private:
	friend class Singlton<Factory>;
	Factory();

	class IObject : public cocos2d::Ref {
		public: virtual IntrusivePtr<cocos2d::Ref> build()=0;
	};

	template<class T> class Object : public IObject {
		public: virtual IntrusivePtr<Ref> build() { return IntrusivePtr<Ref>( T::create() ); };
	};

	template<class T> class ObjectPointer : public IObject {
		public: virtual IntrusivePtr<Ref> build() { return IntrusivePtr<Ref>( T::create(nullptr) ); };
	};

	std::map< std::string, IntrusivePtr<IObject> > m_objects;

public:
	template <class CLASS>
	void book( const std::string & key )
	{
		assert( m_objects.find(key) == m_objects.end() );
		auto ptr = IntrusivePtr< Object<CLASS> >( new Object<CLASS> );
		m_objects[key] = ptr;
	};

	template <class CLASS>
	void book_pointer( const std::string & key )
	{
		assert( m_objects.find(key) == m_objects.end() );
		auto ptr = IntrusivePtr< ObjectPointer<CLASS> >( new ObjectPointer<CLASS> );
		m_objects[key] = ptr;
	};

	IntrusivePtr<cocos2d::Ref> build( const std::string & key );
	
	template < class CLASS >
	IntrusivePtr<CLASS> build( const std::string & key )
	{
		IntrusivePtr<Ref> ref = build(key);
		IntrusivePtr<CLASS> result( dynamic_cast<CLASS*>(ref.ptr()) );
		return result;
	};

};

NS_CC_END
#endif