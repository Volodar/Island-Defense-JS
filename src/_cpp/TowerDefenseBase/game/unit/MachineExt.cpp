//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "MachineExt.h"
#include "ml/common.h"
#include "consts.h"
NS_CC_BEGIN

void MachineExt::load( const pugi::xml_node & xmlmachine )
{
	FOR_EACHXML( xmlmachine, xmlnode )
	{
		std::string tag = xmlnode.name();
		if( tag == k::xmlTag::MachineUnitStateTransitions )
			load_transitions( xmlnode );
		else if( tag == k::xmlTag::MachineUnitParams )
			load_params( xmlnode );
		else
			load_other( xmlnode );
	}
	const std::string& statename = xmlmachine.attribute( k::xmlTag::StartState ).as_string();
	if( statename.empty( ) == false )
	{
		auto& state = Machine::state( statename );
		start( state.get_name() );
	}
}

void MachineExt::load_params( const pugi::xml_node & xmlparams )
{}

void MachineExt::load_transitions( const pugi::xml_node & xmltransitions )
{
	for( auto node = xmltransitions.first_child(); node; node = node.next_sibling() )
	{
		auto state = node.name();
		auto event = node.first_attribute().name();
		auto tostate = node.attribute( event ).as_string();

		auto& from = Machine::state( state );
		auto& to = Machine::state( tostate );
		auto& by = Machine::event( event );

		from.add_transition( by.get_name(), to.get_name() );
	}
}


NS_CC_END