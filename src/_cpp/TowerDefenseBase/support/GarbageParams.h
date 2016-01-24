//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __GARBAGE_PARAMS__
#define __GARBAGE_PARAMS__

#include "ml/pugixml/pugixml.hpp"
#include <map>
#include <string>
#include "cocos2d.h"

NS_CC_BEGIN;

class GarbageParams : public Ref
{
public:
	bool isExist(const std::string & name);
	void set(const std::string & name, const std::string & value);
	const std::string get(const std::string & name);
	void load(const pugi::xml_node & node);
protected:
	std::map<std::string, std::string> m_params;
};

NS_CC_END;

#endif