//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#if EDITOR==1
#ifndef __TOWER_PLACE_EDITOR__
#define __TOWER_PLACE_EDITOR__

#include "cocos2d.h"

NS_CC_BEGIN;

class TowerPlacesEditor : public cocos2d::Layer, public IMEDelegate
{
public:
	static TowerPlacesEditor * create();
	virtual bool init();  

	virtual bool onTouchBegan(cocos2d::Touch *touch, cocos2d::Event *event);
	virtual void onTouchMoved(cocos2d::Touch *touch, cocos2d::Event *event);
	virtual void onTouchEnded(cocos2d::Touch *touch, cocos2d::Event *event);
	//virtual void visit();
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
	void menuHideMenu() { m_menuMaps->setVisible(!m_menuMaps->isVisible()); }
	void newPlace(const cocos2d::Point & position, bool active);
	void removePlace();
	void createPlace( bool active ) { newPlace( cocos2d::Point( 512, 384 ), active ); }

protected:
	CC_SYNTHESIZE_READONLY(bool, m_enabled, IsEnabled);
	cocos2d::Menu * m_menuMaps;
	cocos2d::Menu * m_menu;
	int m_levelIndex;
	std::vector<cocos2d::Sprite*>m_places;
	std::vector<bool>m_placesActive;
	std::vector<cocos2d::Sprite*>::iterator m_touchedPlace;
};

NS_CC_END;

#endif
#endif