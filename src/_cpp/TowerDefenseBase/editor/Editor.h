//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#if EDITOR==1
#ifndef __EDITOR_SCENE__
#define __EDITOR_SCENE__
#include "cocos2d.h"
NS_CC_BEGIN;

class DecorationEditor;
class PathEditor;
class TowerPlacesEditor;

class EditorScene : public Scene
{
public:
	~EditorScene();
	static EditorScene& shared();
	static EditorScene* create();
	//virtual void visit();

	void changeBackground( int level );
	void selectLevel(int level);

private:


	void hideGUI(Ref * sender);
	void disableTouches();
	void enableTouches0( );
	void enableTouches1( );
	void enableTouches2( );
	void save( );
	EditorScene();
private:
	static EditorScene * s_instance;
	Sprite * m_bg;
	Menu * m_menu;
	DecorationEditor * m_decorations;
	PathEditor * m_paths;
	TowerPlacesEditor * m_places;
	int m_currentLevelIndex;
};

NS_CC_END;
#endif
#endif