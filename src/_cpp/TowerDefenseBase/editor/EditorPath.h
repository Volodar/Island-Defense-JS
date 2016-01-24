//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#if EDITOR==1
#ifndef __EDITOR_SCENE_H__
#define __EDITOR_SCENE_H__

#include "cocos2d.h"
#include "ml/pugixml/pugixml.hpp"
#include "support.h"

NS_CC_BEGIN;

class MenuItemTextBG;

class PathEditor : public cocos2d::Layer, public IMEDelegate
{
public:
	static PathEditor * create();
	static void saveRoute(const std::vector<Point> & array, pugi::xml_node & node);
	virtual bool init();  
	void menuCloseCallback(Ref* pSender);
	void selectLevel(int level);
	void menuSelectRoute(Ref* pSender);
	void menuSave(Ref* pSender);
	void menuAddRoute(UnitLayer type);
	void menuHideMenu(Ref* pSender);
	virtual bool onTouchBegan(Touch *touch, Event *event);
	virtual void onTouchMoved(Touch *touch, Event *event);
	virtual void onTouchEnded(Touch *touch, Event *event);
	virtual void onTouchCanceled(Touch *touch, Event *event);
	virtual void visit( Renderer *renderer, const Mat4& transform, uint32_t flags );

	void loadMap(unsigned index);
	void setEnabled( bool var );
public:
    virtual void insertText(const char * text, int len);
    virtual void deleteBackward();
	virtual bool canDetachWithIME() { return true; }
    virtual bool canAttachWithIME() { return true; }
public:
	void update(float dt);
	void updateRouteButtons();
	void clickByLink(const Point & point);
	void addNewRoute(UnitLayer type);
	void deleteCurrentRoute();
	void buildSecondRoute();
	void autoSave(float dt);
protected:
	LabelTTF * m_labelStart;
	LabelTTF * m_labelFinish;
	std::vector<Point>::iterator m_touchedNode;
	std::vector<Point>::iterator m_touchedLink;
	std::list<TripleRoute>m_routes;
	std::list<TripleRoute>::iterator m_currentRoute;
	std::vector< MenuItemTextBG* >m_routesButtons;
	float m_timerDoubleClick;
	unsigned m_touchCounter;
	CC_SYNTHESIZE_READONLY(bool, m_enabled, IsEnabled);
	unsigned m_map;
	cocos2d::Menu * m_menuMaps;
	cocos2d::Menu * m_menu;

	struct Circle
	{
		Point center;
		float radius;
		bool moved;
		bool sized;

		void checkRoute( std::list<TripleRoute>::iterator & route );
	}m_circle;
};

NS_CC_END;

#endif // __HELLOWORLD_SCENE_H__
#endif