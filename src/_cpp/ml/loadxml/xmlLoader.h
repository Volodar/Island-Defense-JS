//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __xmlLoader_h__
#define __xmlLoader_h__
#include "ml/macroses.h"
#include "ml/pugixml/pugixml.hpp"

class ParamCollection;
NS_CC_BEGIN;


class EventBase;

namespace xmlLoader
{
	namespace macros
	{
		const std::string delimiter( "##" );
		const std::string::size_type delimiter_size = delimiter.size( );

		void set( const std::string & name, const std::string & value );
		const std::string& get( const std::string & name );
		void clear();
		void erase( const std::string & name );

		const std::string parse( const std::string & string );
	}

	NodePointer load_node( const std::string & file );

	template <class T>
	IntrusivePtr<T> load_node( const std::string & file )
	{
		auto node = load_node( file );
		IntrusivePtr<T> result;
		result.reset( dynamic_cast<T*>(node.ptr()) );
		return result;
	};

	NodePointer load_node( const pugi::xml_node & xmlnode );
	ActionPointer load_action( const pugi::xml_node & xmlnode );
	IntrusivePtr<EventBase> load_event( const pugi::xml_node & xmlnode );
	void load( Node* node, const pugi::xml_node & xmlnode );
	void load( Node* node, const std::string & path );
	void load_children( Node* node, const pugi::xml_node & xmlnode );

	ActionPointer load_action( const std::string & desc );

	void load( ParamCollection * params, const std::string & path );


	namespace k
	{
		const std::string ActionSequence( "Sequence" );
		const std::string ActionSpawn( "Spawn" );
		const std::string ActionDelayTime( "DelayTime" );
		const std::string ActionScaleTo( "ScaleTo" );
		const std::string ActionScaleBy( "ScaleBy" );
		const std::string ActionSkewTo( "SkewTo" );
		const std::string ActionSkewBy( "SkewBy" );
		const std::string ActionMoveTo( "MoveTo" );
		const std::string ActionMoveBy( "MoveBy" );
		const std::string ActionRotateTo( "RotateTo" );
		const std::string ActionRotateBy( "RotateBy" );
		const std::string ActionJumpTo( "JumpTo" );
		const std::string ActionJumpBy( "JumpBy" );
		const std::string ActionBlink( "Blink" );
		const std::string ActionFadeTo( "FadeTo" );
		const std::string ActionFadeIn( "FadeIn" );
		const std::string ActionFadeOut( "FadeOut" );
		const std::string ActionTintTo( "TintTo" );
		const std::string ActionTintBy( "TintBy" );
		const std::string ActionRepeatForever( "RepeatForever" );
		const std::string ActionRepeat( "Repeat" );
		const std::string ActionEaseIn( "EaseIn" );
		const std::string ActionEaseOut( "EaseOut" );
		const std::string ActionEaseInOut( "EaseInOut" );
		const std::string ActionBounceIn( "BounceIn" );
		const std::string ActionBounceOut( "BounceOut" );
		const std::string ActionBounceInOut( "BounceInOut" );
		const std::string ActionBackIn( "BackIn" );
		const std::string ActionBackOut( "BackOut" );
		const std::string ActionBackInOut( "BackInOut" );
		const std::string ActionSineIn( "SineIn" );
		const std::string ActionSineOut( "SineOut" );
		const std::string ActionSineInOut( "SineInOut" );
		const std::string ActionAnimate( "Animate" );
		const std::string ActionRemoveSelf( "RemoveSelf" );
		const std::string ActionShow( "Show" );
		const std::string ActionHide( "Hide" );

		namespace xmlTag
		{
			const std::string ParamCollection( "paramcollection" );
		};
	}
};


NS_CC_END;


#endif