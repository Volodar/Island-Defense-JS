//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "NodeExt.h"
#include "ml/common.h"
#include "ml/loadxml/xmlProperties.h"
NS_CC_BEGIN

NodeExt::NodeExt()
: _events()
, _actions()
{}

NodeExt::~NodeExt()
{}

bool NodeExt::init()
{
	return true;
}

Node* NodeExt::as_node_pointer()
{
	return dynamic_cast<Node*>(this);
}

Node * NodeExt::getChildByPath( const std::string & path_names )
{
	Node * self = as_node_pointer();
	Node * result = self ? getNodeByPath( self, path_names ) : nullptr;
	return result;
}

Node * NodeExt::getChildByPath( const std::list<int> path_tags )
{
	Node * self = as_node_pointer();
	Node * result = self ? getNodeByTagsPath( self, path_tags ) : nullptr;
	return result;
}

ParamCollection& NodeExt::getParamCollection()
{
	return _params;
}

const ParamCollection& NodeExt::getParamCollection()const
{
	return _params;
}

void NodeExt::load( const std::string & path, const std::string & xmlFile )
{
	std::string file = path;
	if( file.empty() == false && file.back() != '/' )
		file += '/';
	file += xmlFile;
	load( file );
}

void NodeExt::load( const std::string & file )
{
	if( file.empty() )
		return;
	pugi::xml_document doc;
	doc.load_file( file.c_str() );
	auto root = doc.root().first_child();
	
	load( root );
}

void NodeExt::load( const pugi::xml_node & root )
{
	xmlLoader::bookDirectory( this );
	xmlLoader::load( as_node_pointer(), root );
	xmlLoader::unbookDirectory();
}

void NodeExt::runEvent( const std::string & eventname )
{
	auto iter = _events.find( eventname );
	if( iter != _events.end() )
	{
		iter->second.execute( this );
	}
	else
	{
		std::string name = as_node_pointer() ? as_node_pointer()->getName() : "Not node inherited";
		//log_once( "NodeExt[%s]: event with name [%s] not dispatched", name.c_str( ), eventname.c_str( ) );
	}
}

ActionPointer NodeExt::getAction( const std::string & name )
{
	auto iter = _actions.find( name );
	if( iter != _actions.end() )
		return iter->second;
	return nullptr;
}

bool NodeExt::setProperty( int intproperty, const std::string & value )
{
	return false;
}

bool NodeExt::setProperty( const std::string & stringproperty, const std::string & value )
{
	return false;
}

void NodeExt::loadActions( const pugi::xml_node & xmlnode )
{
	FOR_EACHXML( xmlnode, xmlaction )
	{
		std::string actionname = xmlaction.attribute( "name" ).as_string();
		auto action = xmlLoader::load_action( xmlaction );
		assert( action );
		_actions[actionname] = action;
	}
}

void NodeExt::loadEvents( const pugi::xml_node & xmlnode )
{
	FOR_EACHXML( xmlnode, xmllist )
	{
		std::string listname = xmllist.attribute( "name" ).as_string();
		FOR_EACHXML( xmllist, xmlevent )
		{
			auto event = xmlLoader::load_event( xmlevent );
			assert( event );
			_events[listname].push_back( event );
		}
	}
}

void NodeExt::loadParams( const pugi::xml_node & xmlnode )
{
	FOR_EACHXML( xmlnode, xmlparam )
	{
		std::string name = xmlparam.name();
		const auto& attr = xmlparam.attribute( "value" );
		std::string value = attr ? attr.as_string() : xmlparam.text().as_string();
		_params[name] = value;
	}
}

bool NodeExt::loadXmlEntity( const std::string & tag, const pugi::xml_node & xmlnode )
{
	if( tag == xmlLoader::k::xmlTag::ParamCollection )
	{
		loadParams( xmlnode );
	};
	return false;
}


LayerExt::LayerExt() {}
LayerExt::~LayerExt() {}
NodeExt_::NodeExt_() {}
NodeExt_::~NodeExt_() {}
NS_CC_END