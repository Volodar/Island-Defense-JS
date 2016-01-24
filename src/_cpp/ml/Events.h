//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __Events_h__
#define __Events_h__
#include "ml/macroses.h"
#include "pugixml/pugixml.hpp"
NS_CC_BEGIN;

class NodeExt;

class EventBase : public cocos2d::Ref
{
	DECLARE_POINTER( EventBase );
public:
	static Pointer create( const std::string & type );

	virtual void execute( NodeExt * context ) = 0;
	virtual void setParam( const std::string & name, const std::string & value );
	virtual std::string getParam( const std::string & name ) = 0;
	virtual void loadXmlEntity( const std::string& tag, const pugi::xml_node& node ) {}
	virtual Node* getTarget( NodeExt * context );
private:
	CC_SYNTHESIZE_PASS_BY_REF( std::list<int>, _targetTags, TagsToTarget );
	CC_SYNTHESIZE_PASS_BY_REF( std::string, _targetPath, PathToTarget );
};

class EventsList : public std::list<EventBase::Pointer>
{
public:
	void execute( NodeExt * context );
};

class EventAction : public EventBase
{
	DECLARE_BUILDER( EventAction );
	bool init( );
public:
	virtual void execute( NodeExt * context );
	virtual void setParam( const std::string & name, const std::string & value );
	virtual std::string getParam( const std::string & name );
private:
private:
	std::string _actionname;
	std::string _state;
};

class EventRunAction : public EventAction
{
	DECLARE_BUILDER( EventRunAction );
	bool init( );
};

class EventStopAction : public EventAction
{
	DECLARE_BUILDER( EventStopAction );
	bool init( );
};

class EventStopAllAction : public EventAction
{
	DECLARE_BUILDER( EventStopAllAction );
	bool init( );
public:
	virtual void execute( NodeExt * context );
};

class EventSetProperty : public EventBase
{
	DECLARE_BUILDER( EventSetProperty );
	bool init( );
public:
	virtual void execute( NodeExt * context );
	virtual void setParam( const std::string & name, const std::string & value );
	virtual std::string getParam( const std::string & name );
private:
	int _property;
	std::string _stringProperty;
	std::string _value;
};

class EventCreateNode : public EventBase
{
	DECLARE_BUILDER( EventCreateNode );
	bool init( );
public:
	virtual void execute( NodeExt * context );
	virtual void setParam( const std::string & name, const std::string & value );
	virtual std::string getParam( const std::string & name );
	virtual void loadXmlEntity( const std::string& tag, const pugi::xml_node& node )override;
private:
	struct PositionInfo
	{
		Point offset;
		enum { byContext } method;
	}_positionInfo;
	NodePointer _node;
	int _additionalZOrder;
};

class EventPlaySound : public EventBase
{
	DECLARE_BUILDER( EventPlaySound );
	bool init( );
public:
	virtual void execute( NodeExt * context );
	virtual void setParam( const std::string & name, const std::string & value );
	virtual std::string getParam( const std::string & name );
private:
	void play( float dt );
	void stop( float dt );
private:
	std::string _sound;
	unsigned int _soundID;
	bool _looped;
	float _predelay;
	float _duration;
	float _panoram;
};

NS_CC_END
#endif