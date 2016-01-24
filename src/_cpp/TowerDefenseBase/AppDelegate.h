#ifndef  _APP_DELEGATE_H_
#define  _APP_DELEGATE_H_

#include "cocos2d.h"

class  AppDelegate : private cocos2d::Application
{
public:
	AppDelegate();
	virtual ~AppDelegate();
	virtual bool applicationDidFinishLaunching();
	virtual void applicationDidEnterBackground();
	virtual void applicationWillEnterForeground();

    virtual void onReceivedMemoryWarning();

protected:
	void linkPlugins();
	void applyConfigurations();
	void loadXmlValues();
	void configurePath();
#ifdef WIN32
public:
	static int screenResolutionX;
	static int screenResolutionY;
#endif
};

#endif // _APP_DELEGATE_H_

