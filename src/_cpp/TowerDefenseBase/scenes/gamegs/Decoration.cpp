//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 18.10.14.
//
//
#include "Decoration.h"
NS_CC_BEGIN





Decoration::Decoration()
{
}

Decoration::~Decoration( )
{
}

bool Decoration::init()
{
	return Sprite::init();
}

void Decoration::setAction( ActionPointer action ) 
{
	_action.reset( action );
	runAction( action->clone() );
}

ActionPointer Decoration::getAction( ) 
{
	return _action;;
}




NS_CC_END