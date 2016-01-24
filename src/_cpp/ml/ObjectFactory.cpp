//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "ObjectFactory.h"
#include "Events.h"
#include "ScrollMenu.h"
#include "MenuItemWithText.h"
#include "ml/NodeExt.h"
NS_CC_BEGIN;



Factory::Factory()
{
	book<Node>("node");
	book<Sprite>( "sprite" );
	book<Label>( "bmlabel" );
	book<Label>( "label" );
	book<Menu>( "menu" );
	book<ScrollMenu>( "scrollmenu" );
	book<MenuItemImageWithText>( "menuitem" );
	book<Layer>( "layer" );
	book<LayerExt>( "layerext" );
	book<NodeExt_>( "nodeext" );
	book_pointer<ProgressTimer>( "progresstimer" );

	book<EventAction>( "action" );
	book<EventRunAction>( "runaction" );
	book<EventStopAction>( "stopaction" );
	book<EventStopAllAction>( "stopallaction" );
	book<EventSetProperty>( "setproperty" );
	book<EventPlaySound>( "playsound" );
	book<EventCreateNode>( "createnode" );

}

IntrusivePtr<cocos2d::Ref> Factory::build( const std::string & key )
{
	bool isreg = m_objects.find( key ) != m_objects.end();
	if( !isreg )
		log( "Class with key [%s] not registred", key.c_str() );
	assert( isreg );
	return m_objects[key]->build();
};


NS_CC_END
