#if EDITOR==1
#include "filesystem.h"
#include "utils.h"

NS_CC_BEGIN;

namespace FileSystem
{
	
	std::string dialogSaveFile(const char * filter)
	{
		char filename[MAX_PATH]="";
		char directory[1024];
		std::string nameSlectedFile;
		GetCurrentDirectoryA(1024, directory);
		OPENFILENAMEA of;
		memset(&of, 0, sizeof(of));
		of.lStructSize=OPENFILENAME_SIZE_VERSION_400A;
		of.hwndOwner = CCEGLView::sharedOpenGLView()->getHWnd();
		of.hInstance=0;                     
		of.lpstrFilter=filter;
		of.lpstrCustomFilter=NULL;             
		of.nMaxCustFilter=0;                  
		of.nFilterIndex=1;                   
		of.lpstrFile=filename;             
		of.nMaxFile=MAX_PATH;             
		of.lpstrFileTitle=NULL;
		of.lpstrTitle=NULL;
		of.lpstrDefExt=NULL;                
		of.nMaxFileTitle=0;                   
		of.lpstrInitialDir=directory;            
		of.Flags=OFN_PATHMUSTEXIST|OFN_FILEMUSTEXIST|OFN_HIDEREADONLY ;
		if (GetSaveFileNameA(&of)) {
			nameSlectedFile = of.lpstrFile;
		}
		return nameSlectedFile;
	}
	
	void dialogOpenFiles(const char * filter, std::list<std::string> & list)
	{
/*		const int length(4096);
		char f[length];
		unsigned countFiles = openPanelOpenFile(f, length);
		
		char * ptr = f;
		for ( unsigned i=0; i<countFiles; ++i)
		{
			list.push_back(ptr);
			ptr += strlen(ptr) + 1;
		}
		*/
	}
	
};

NS_CC_END;
#endif