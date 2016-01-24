//
//  RateMeLayer.cpp
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 12.12.14.
//
//

#include "RateMeLayer.h"
#include "support.h"
#include "configuration.h"
#include "ScoreCounter.h"
#include "UserData.h"

#if CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID
#include <jni.h>
#include "platform/android/jni/JniHelper.h"
#endif

NS_CC_BEGIN;

void cb_open_application_store();

#if CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID
void cb_open_application_store( )
{
	const char * URL = k::configuration::LinkToStore.c_str();
	JniMethodInfo t;
	if( JniHelper::getStaticMethodInfo( t, "org.cocos2dx.cpp/AppActivity", "openUrl", "(Ljava/lang/String;)V" ) )
	{
		jstring stringArg = t.env->NewStringUTF( URL );
		t.env->CallStaticVoidMethod( t.classID, t.methodID, stringArg );
		t.env->DeleteLocalRef( stringArg );
		t.env->DeleteLocalRef( t.classID );
	}
}
#elif CC_TARGET_PLATFORM == CC_PLATFORM_IOS
#else
void cb_open_application_store( )
{
}
#endif


RateMeLayer::RateMeLayer()
{
}

RateMeLayer::~RateMeLayer()
{
}

bool RateMeLayer::init()
{
	do
	{
		CC_BREAK_IF( UserData::shared().get_bool("award_for_rate") );
		NodeExt::load("ini/ratemelayer.xml");
		
		setKeyDispatcherBackButton(this);
		
		runEvent("onenter");
		
		return true;
	}
	while( false );
	return false;
}

ccMenuCallback RateMeLayer::get_callback_by_description( const std::string & name )
{
	if( name == "rateme" )
	{
		auto rate = [this](Ref*)mutable
		{
			cb_open_application_store();
			runEvent("showaward");
			
			ScoreCounter::shared().addMoney(kScoreCrystals, 200, true);
			UserData::shared().write("award_for_rate", true);
		};
		auto callback = std::bind( rate, std::placeholders::_1 );
		return callback;
	}
	else if( name == "close" )
	{
		auto close = [this](Ref*)mutable
		{
			runEvent("onexit");
		};
		auto callback = std::bind( close, std::placeholders::_1 );
		return callback;
	}
	return nullptr;
}


NS_CC_END;
