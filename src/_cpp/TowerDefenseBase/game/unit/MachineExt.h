//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __MachineExt_h__
#define __MachineExt_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/FiniteStateMachine.h"
#include "ml/pugixml/pugixml.hpp"
NS_CC_BEGIN

#define FSM_ADD_STATE(name) add_state( state_##name, nullptr ).set_string_name( #name );
#define FSM_ADD_EVENT(name) add_event( event_##name ).set_string_name( #name );

class MachineExt : public FiniteState::Machine
{
protected:
	void load( const pugi::xml_node & xmlmachine );
	void load_transitions( const pugi::xml_node & xmlnode );
	virtual void load_params( const pugi::xml_node & xmlnode );
	virtual void load_other( const pugi::xml_node & xmlnode ) {}
private:
};




NS_CC_END
#endif // #ifndef MachineExt