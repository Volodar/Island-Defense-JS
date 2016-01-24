//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "GarbageParams.h"

NS_CC_BEGIN;

bool GarbageParams::isExist(const std::string & name)
{
	auto i = m_params.find(name);
	return i != m_params.end();
}

void GarbageParams::set(const std::string & name, const std::string & value)
{
	m_params[name] = value;
}

const std::string GarbageParams::get(const std::string & name)
{
	auto i = m_params.find(name);
	if ( i != m_params.end() )
		return i->second;
	return "";
}

void GarbageParams::load(const pugi::xml_node & node)
{
	for(pugi::xml_node child = node.first_child(); child; child = child.next_sibling() )
	{
		std::string name = child.attribute("name").value();
		std::string value = child.attribute("value").value();
		set(name, value);
	}
}


NS_CC_END;