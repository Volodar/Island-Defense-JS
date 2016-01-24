//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __NodeExt_h__
#define __NodeExt_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "Events.h"
#include "loadxml/xmlLoader.h"
#include "ml/common.h"
#include "ml/ParamCollection.h"
NS_CC_BEGIN

class NodeExt
{
public:
	void runEvent( const std::string & eventname );
	ActionPointer getAction( const std::string & name );
	virtual Node* as_node_pointer();

	Node * getChildByPath( const std::string & path_names );
	Node * getChildByPath( const std::list<int> path_tags );
	virtual ccMenuCallback get_callback_by_description( const std::string & name ) { return nullptr; }

	ParamCollection& getParamCollection();
	const ParamCollection& getParamCollection()const;
protected:
	NodeExt();
	virtual ~NodeExt();

	virtual bool init();
	virtual void load( const std::string & directory, const std::string & xmlFile )final;
	virtual void load( const std::string & pathToXmlFile )final;
	virtual void load( const pugi::xml_node & root );

public:
	virtual bool setProperty( int intproperty, const std::string & value );
	virtual bool setProperty( const std::string & stringproperty, const std::string & value );
	virtual bool loadXmlEntity( const std::string & tag, const pugi::xml_node & xmlnode );
	void loadActions( const pugi::xml_node & xmlnode );
	void loadEvents( const pugi::xml_node & xmlnode );
	void loadParams( const pugi::xml_node & xmlnode );
private:
	std::map<std::string, EventsList> _events;
	std::map<std::string, ActionPointer> _actions;
	ParamCollection _params;
};

class LayerExt: public Layer, public NodeExt
{
	DECLARE_BUILDER( LayerExt );
	bool init() { return true; }
};

class NodeExt_: public Node, public NodeExt
{
	DECLARE_BUILDER( NodeExt_ );
	bool init() { return true; }
};

NS_CC_END
#endif // #ifndef NodeExt