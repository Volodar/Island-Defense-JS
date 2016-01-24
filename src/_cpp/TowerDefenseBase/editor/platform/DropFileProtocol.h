#if EDITOR==1
#ifndef __DragFileProtocol_H__
#define __DragFileProtocol_H__
#include "cocos2d.h"

class DropFileProtocol 
{
public:
	DropFileProtocol()
	{
		init();
	}
	virtual ~DropFileProtocol() 
	{ 
		m_instance = NULL; 
		cleanup();
	}
	static DropFileProtocol* getInstance() { return m_instance; }
	static void setInstance( DropFileProtocol* instance ) { m_instance = instance; }

	virtual bool init();
	virtual void cleanup();

	virtual void onDropBegin( const cocos2d::Point & locationInView )=0;
	virtual void onDropEnded( const cocos2d::Point & locationInView, const std::list<std::string> & files )=0;
	virtual void onDropMoved( const cocos2d::Point & locationInView )=0;
	virtual void onDropCanceled()=0;
private:
	static DropFileProtocol * m_instance;
};


#endif
#endif