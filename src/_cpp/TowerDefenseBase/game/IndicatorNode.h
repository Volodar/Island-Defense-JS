//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __INDICATOR_NODE__
#define __INDICATOR_NODE__
#include "cocos2d.h"
#include "ml/macroses.h"
NS_CC_BEGIN;

class IndicatorNode : public Node
{
	DECLARE_BUILDER( IndicatorNode );
	bool init();
public:
	void setProgress(float progress); //0..1;
protected:
	Sprite * _bg;
	Sprite * _progressNode;
};

NS_CC_END;
#endif