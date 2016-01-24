#include "SplashScene.h"
#include "configuration.h"
#include "MainGS.h"
NS_CC_BEGIN





SplashScene::SplashScene()
{}

SplashScene::~SplashScene()
{}

bool SplashScene::init()
{
	do
	{
		CC_BREAK_IF( !Scene::init() );
		CC_BREAK_IF( !NodeExt::init() );

		load( "splash/splash.xml" );
		runEvent( "appearance" );
		
		auto action = getAction("delay");
		if( !action )
			return false;
		
		auto duration = static_cast<FiniteTimeAction*>(action.ptr())->getDuration();
		auto delay = DelayTime::create(duration);
		auto func = CallFunc::create( []()
			 {
				 auto scene = MainGS::scene();
				 Director::getInstance()->replaceScene( scene.ptr() );
			 } );
		runAction( Sequence::createWithTwoActions(delay, func) );

		return true;
	}
	while( false );
	return false;
}

NS_CC_END
