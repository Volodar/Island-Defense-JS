//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#if EDITOR==1
#ifndef __DECORATION_EDITOR__
#define __DECORATION_EDITOR__

#include "cocos2d.h"
#include "platform/DropFileProtocol.h"
#include "Decoration.h"

NS_CC_BEGIN;

class DecorationEditor : public cocos2d::Layer, public IMEDelegate, public DropFileProtocol
{
public:
	static DecorationEditor * create();
	virtual bool init();  

	virtual bool onTouchBegan(cocos2d::Touch *touch, cocos2d::Event *event);
	virtual void onTouchMoved(cocos2d::Touch *touch, cocos2d::Event *event);
	virtual void onTouchEnded(cocos2d::Touch *touch, cocos2d::Event *event);
	//virtual void visit();
	virtual void onDropBegin( const cocos2d::Point & locationInView );
	virtual void onDropEnded( const cocos2d::Point & locationInView, const std::list<std::string> & files );
	virtual void onDropMoved( const cocos2d::Point & locationInView );
	virtual void onDropCanceled( );

	void setEnabled( bool var );
	void selectLevel(int level);
public:
    virtual void insertText(const char * text, int len);
    virtual void deleteBackward();
	virtual bool canDetachWithIME() { return true; }
    virtual bool canAttachWithIME() { return true; }
	void loadLevel();
	void saveLevel();
protected:
	void createDecorationMenu();
	void markTouchedDecoration( );
	void menuHideMenu() { m_menuMaps->setVisible(!m_menuMaps->isVisible()); }
	void remove();
protected:
	CC_SYNTHESIZE_READONLY(bool, m_enabled, IsEnabled);
	cocos2d::Menu * m_menuMaps;
	cocos2d::Menu * m_menu;
	int m_levelIndex;
	struct decor
	{
		decor( Decoration::Pointer node, const std::string & _name )
		: name( _name )
		, body( node ) 
		{}

		std::string name;
		Decoration::Pointer body;
	};
	std::vector<decor>m_decorations;
	std::vector<std::vector<decor>::iterator> m_touchedDecoration;
	Rect m_selectedZone;
	bool m_pull;
	bool m_pullInProcess;
};

NS_CC_END;

#endif
#endif