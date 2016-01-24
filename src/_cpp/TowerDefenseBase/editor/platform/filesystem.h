#if EDITOR==1
#ifndef __FILE_SYSTEM__
#define __FILE_SYSTEM__
#include "cocos2d.h"
#include "types.h"
NS_CC_BEGIN;

namespace FileSystem
{
#if CC_TARGET_PLATFORM == CC_PLATFORM_WIN32 //unused for Mac
	std::string dialogSaveFile(const char * filter);
#endif
    
	void dialogOpenFiles(const char * filter, std::list<std::string> & list);
	
	void saveNode( cocos2d::CCNode * node );
	//void appendEditInformation(cocos2d::CCXMLNode * xmlNode, cocos2d::CCNode * node);
	//void loadEditorInfo( cocos2d::CCXMLNode * root );
	void loadResourcesForNode( cocos2d::CCNode * node );

	cocos2d::CCNode* createNodeByPath( const std::string & path );
	cocos2d::CCNode* createAnimationByImages( const std::list<std::string> & files );

	//cocos2d::CCResource* loadResourceByPath( const std::string & path );
};

NS_CC_END;
#endif
#endif