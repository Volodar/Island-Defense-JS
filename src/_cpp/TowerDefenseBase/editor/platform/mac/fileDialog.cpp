#include "filesystem.h"
//#include "utils.h"
#include "OpenPanel.h"
#include "cocos2d.h"

USING_NS_CC;

namespace FileSystem{;
	
	std::string dialogSaveFile(const char * filter)
	{
		return openPanelSaveFile();
	}
	
	void dialogOpenFiles(const char * filter, std::list<std::string> & list)
	{
		const int length(4096);
		char f[length];
		unsigned countFiles = openPanelOpenFile(f, length);
		
		char * ptr = f;
		for ( unsigned i=0; i<countFiles; ++i)
		{
			list.push_back(ptr);
			ptr += strlen(ptr) + 1;
		}
	}
	
};