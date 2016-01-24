//
//  RateMeLayer.h
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 12.12.14.
//
//

#ifndef __IslandDefense__RateMeLayer__
#define __IslandDefense__RateMeLayer__

#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/NodeExt.h"

NS_CC_BEGIN;

class RateMeLayer : public LayerExt
{
	DECLARE_BUILDER(RateMeLayer);
	bool init();
public:
protected:
	virtual ccMenuCallback get_callback_by_description( const std::string & name ) override;

};

NS_CC_END;
#endif /* defined(__IslandDefense__RateMeLayer__) */
