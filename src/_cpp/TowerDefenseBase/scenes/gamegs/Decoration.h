//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 18.10.14.
//
//
#ifndef __Decoration_h__
#define __Decoration_h__
#include "cocos2d.h"
#include "ml/macroses.h"
NS_CC_BEGIN





class Decoration : public Sprite
{
	DECLARE_BUILDER( Decoration );
	bool init();
public:
	void setAction( ActionPointer action );
	ActionPointer getAction();
protected:
private:
	ActionPointer _action;
	CC_SYNTHESIZE_PASS_BY_REF( std::string, _actionDescription, ActionDescription );
	CC_SYNTHESIZE_PASS_BY_REF( Point, _startPosition, StartPosition );
};




NS_CC_END
#endif // #ifndef Decoration