//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __ScoreLayer_h__
#define __ScoreLayer_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/NodeExt.h"
NS_CC_BEGIN





class ScoreLayer : public Layer, public NodeExt
{
	DECLARE_BUILDER( ScoreLayer );
	bool init();
public:
protected:
	void change_time( int score );
	void change_fuel( int score );
	void change_real( int score );
	void change_star( int score );
	void cb_shop( Ref*sender );
private:
	LabelPointer _gold;
	LabelPointer _fuel;
	LabelPointer _time;
	LabelPointer _star;
	MenuItemPointer _shop;
};




NS_CC_END
#endif // #ifndef ScoreLayer