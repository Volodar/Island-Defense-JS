//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __VictoryMenu_h__
#define __VictoryMenu_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/NodeExt.h"
NS_CC_BEGIN





class VictoryMenu : public Node, public NodeExt
{
	DECLARE_BUILDER( VictoryMenu );
	bool init( bool victory, int scores, int stars );
public:
	void onKeyReleased( EventKeyboard::KeyCode keyCode, Event* event );
protected:
	void cb_restart( Ref* );
	void cb_close( Ref* );
	void restart();
	void close();
private:
};




NS_CC_END
#endif // #ifndef VictoryMenu