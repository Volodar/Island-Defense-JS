//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "Events.h"
#include "ObjectFactory.h"
#include "ml/common.h"
#include "ml/common.h"
#include "NodeExt.h"
#include "loadxml/xmlProperties.h"
#include "loadxml/xmlLoader.h"
#include "Audio/AudioEngine.h"
NS_CC_BEGIN;

EventBase::Pointer EventBase::create( const std::string & type )
{
	return Factory::shared().build<EventBase>( type );
}

EventBase::EventBase()
{}

EventBase::~EventBase()
{}

void EventBase::setParam( const std::string & name, const std::string & value )
{
	if( name == "targettags" )
	{
		std::list<std::string>list;
		split( list, value );
		for( auto tag : list )
			_targetTags.push_back( strToInt( tag ) );
	}
	else if( name == "target" )
	{
		_targetPath = value;
	}
}

Node* EventBase::getTarget( NodeExt * context )
{
	Node * target = nullptr;
	if( _targetTags.empty() == false )
		target = context->getChildByPath( _targetTags );
	else if( _targetPath.empty() == false )
		target = context->getChildByPath( _targetPath );
	else
		target = context->as_node_pointer();
	return target;
}


/****************************************************************************************/
//MARK:	EventAction
/****************************************************************************************/
EventAction::EventAction()
{}

EventAction::~EventAction()
{}

bool EventAction::init()
{
	return true;
}


void EventAction::execute( NodeExt * context )
{
	assert( context );
	auto action = context->getAction( _actionname );

	Node * target = getTarget( context );

	if( target == nullptr )
		log( "EventAction::execute: cannot find target. context: [%s], path: [%s]",
		context->as_node_pointer()->getName().c_str(), getPathToTarget().c_str() );
	if( action == nullptr )
		log( "EventAction::execute: cannot find action. context: [%s], action name: [%s]",
		context->as_node_pointer()->getName().c_str(), _actionname.c_str() );

	if( !(action && target) )
		return;

	if( _state == "run" )
	{
		auto clone = action->clone();
		//auto tag = static_cast<int>(*((int*)action.ptr()));
		auto tag = action->_ID;
		target->runAction( clone );
		clone->setTag( tag );
	}
	else if( _state == "stop" )
	{
		//auto tag = static_cast<int>(*((int*)action.ptr()));
		auto tag = action->_ID;
		target->stopActionByTag( tag );
	}
	else
		assert( 0 );
}

void EventAction::setParam( const std::string & name, const std::string & value )
{
	if( name == "action" )
		_actionname = value;
	if( name == "state" )
	{
		_state = value;
		assert( _state == "run" || _state == "stop" );
	}
	else
		EventBase::setParam( name, value );
}

std::string EventAction::getParam( const std::string & name )
{
	if( name == "action" )
		return _actionname;
	return "";
}

EventRunAction::EventRunAction() {}
EventRunAction::~EventRunAction() {}
bool EventRunAction::init()
{
	if( EventAction::init() ) { setParam( "state", "run" ); return true; }
	return false;
}

EventStopAction::EventStopAction() {}
EventStopAction::~EventStopAction() {}
bool EventStopAction::init()
{
	if( EventAction::init() ) { setParam( "state", "stop" ); return true; }
	return false;
}

/****************************************************************************************/
//MARK:	EventStopAllAction
/****************************************************************************************/

EventStopAllAction::EventStopAllAction() {}
EventStopAllAction::~EventStopAllAction() {}
bool EventStopAllAction::init() { return true; }
void EventStopAllAction::execute( NodeExt * context )
{
	Node * target = getTarget( context );
	assert( target );
	if( target )
		target->stopAllActions();
}

/****************************************************************************************/
//MARK:	EventSetProperty
/****************************************************************************************/
EventSetProperty::EventSetProperty()
{}

EventSetProperty::~EventSetProperty()
{}

bool EventSetProperty::init()
{
	return true;
}

void EventSetProperty::execute( NodeExt * context )
{
	Node * target = getTarget( context );
	if( target )
	{
		if( xmlLoader::setProperty( target, _property, _value ) == false )
			xmlLoader::setProperty( target, _stringProperty, _value );
	}

}

void EventSetProperty::setParam( const std::string & name, const std::string & value )
{
	if( name == "property" )
	{
		_property = xmlLoader::strToPropertyType( value );
		_stringProperty = value;
	}
	else if( name == "value" ) _value = value;
	else EventBase::setParam( name, value );
}

std::string EventSetProperty::getParam( const std::string & name )
{
	assert( 0 );
	return "";
}


/****************************************************************************************/
//MARK:	EventCreateNode
/****************************************************************************************/

EventCreateNode::EventCreateNode()
: _additionalZOrder(0)
{
	_positionInfo.method = PositionInfo::byContext;
}

EventCreateNode::~EventCreateNode()
{}

bool EventCreateNode::init()
{
	return true;
}

void EventCreateNode::execute( NodeExt * context )
{
	auto target = getTarget( context );
	if( target && _node && _node->getParent() == nullptr )
	{
		target->addChild( _node );
		switch( _positionInfo.method )
		{
			case PositionInfo::byContext:
			{
				Node* node = context ? context->as_node_pointer() : nullptr;
				Point pos = node ? node->getPosition() : Point::ZERO;
				pos += _positionInfo.offset;
				_node->setPosition( pos );
				break; 
			}

		}
		_node->setLocalZOrder( -_node->getPositionY() + _additionalZOrder );
	}
}

void EventCreateNode::setParam( const std::string & name, const std::string & value )
{
	if( 0 );
	else if( name == "additionalzorder" ) _additionalZOrder = strToInt( value );
	else if( name == "posinfo_offset" ) _positionInfo.offset = strToPoint( value );
	else if( name == "posinfo_method" )
	{
		_positionInfo.method = PositionInfo::byContext;
	}
	EventBase::setParam( name, value );
}

std::string EventCreateNode::getParam( const std::string & name )
{
	//return EventBase::getParam( name );
	return "";
}

void EventCreateNode::loadXmlEntity( const std::string& tag, const pugi::xml_node& node )
{
	if( tag == "node" )
	{
		_node = xmlLoader::load_node( node );
	}
	else
		EventBase::loadXmlEntity( tag, node );
}



/****************************************************************************************/
//MARK:	EventPlaySound
/****************************************************************************************/

EventPlaySound::EventPlaySound()
: _sound()
, _soundID( -1 )
, _looped( 0 )
, _predelay( 0 )
, _duration( 0 )
, _panoram( 0 )
{}

EventPlaySound::~EventPlaySound()
{}

bool EventPlaySound::init()
{
	return true;
}

void EventPlaySound::execute( NodeExt * context )
{
	assert( _looped ? _duration > 0 : true );
	retain();
	if( _predelay == 0 )
	{
		play( 0 );
	}
	else
	{
		auto func = std::bind( &EventPlaySound::play, this, std::placeholders::_1 );
		auto key = "EventPlaySound::play" + intToStr( _ID );
		if( Director::getInstance()->getScheduler()->isScheduled( key, this ) == false )
		{
			Director::getInstance()->getScheduler()->schedule( func, this, _predelay, 0, 0, false, key );
		}
	}

}

void EventPlaySound::setParam( const std::string & name, const std::string & value )
{
	if( name == "sound" ) _sound = xmlLoader::macros::parse( value );
	else if( name == "looped" ) _looped = strToBool( xmlLoader::macros::parse( value ) );
	else if( name == "predelay" ) _predelay = strToFloat( xmlLoader::macros::parse( value ) );
	else if( name == "duration" ) _duration = strToFloat( xmlLoader::macros::parse( value ) );
	else if( name == "panoram" ) _panoram = strToFloat( xmlLoader::macros::parse( value ) );
	assert( _panoram >= -1 && _panoram <= 1 );
}

std::string EventPlaySound::getParam( const std::string & name )
{
	if( name == "sound" ) return _sound;
	else if( name == "looped" ) return boolToStr( _looped );
	else if( name == "predelay" ) return floatToStr( _predelay );
	else if( name == "duration" ) return floatToStr( _duration );
	else if( name == "panoram" ) return floatToStr( _panoram );
	return "";
}

void EventPlaySound::play( float dt )
{
	_soundID = AudioEngine::shared().playEffect( _sound, _looped, _panoram );
	if( _looped )
	{
		auto func = std::bind( &EventPlaySound::stop, this, std::placeholders::_1 );
		auto key = "EventPlaySound::stop" + intToStr( _ID );
		if( Director::getInstance()->getScheduler()->isScheduled( key, this ) == false )
		{
			retain();
			Director::getInstance()->getScheduler()->schedule( func, this, _duration, 0, 0, false, key );
		}
	}
	release();
}

void EventPlaySound::stop( float dt )
{
	if( _soundID != -1 )
	{
		AudioEngine::shared().stopEffect( _soundID );
	}
	release();
}


/****************************************************************************************/
//MARK:	EventsList
/****************************************************************************************/

void EventsList::execute( NodeExt * context )
{
	for( auto event : *this )
	{
		event->execute( context );
	}
}

NS_CC_END;