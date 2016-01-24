//
//  RateMeLayer.c
//  IslandDefense
//
//  Created by Владимир Толмачев on 04.01.15.
//
//

#include "AppController.h"
#include "configuration.h"

NS_CC_BEGIN

void openUrl( const std::string& url )
{
	const char * URL = url.c_str();
	[AppController openURL:URL];
}

void cb_open_application_store()
{
	openUrl( k::configuration::LinkToStore );
}

NS_CC_END;