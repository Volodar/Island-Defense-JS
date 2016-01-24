#ifndef __SplashScene_h__
#define __SplashScene_h__
#include "cocos2d.h"
#include "macroses.h"
#include "ml/NodeExt.h"
#include "inapp/purchase.h"
NS_CC_BEGIN





class SplashScene : public Scene, public NodeExt
{
	DECLARE_BUILDER( SplashScene );
	bool init();
public:
protected:
private:
};


NS_CC_END
#endif // #ifndef SelectHero