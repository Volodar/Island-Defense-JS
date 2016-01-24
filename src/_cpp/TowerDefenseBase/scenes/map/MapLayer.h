//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __Map_h__
#define __Map_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "support.h"
#include "ml/SmartScene.h"
#include "ml/NodeExt.h"
#include "ml/ScrollMenu.h"
#include "gameboard.h"
//#include "../../../cocos2d/extensions/GUI/CCScrollView/CCScrollView.h"

//USING_NS_CC_EXT;

NS_CC_BEGIN

class MapLayer : public Layer, public NodeExt
{
	friend class AutoPlayer;
	DECLARE_BUILDER( MapLayer );
	bool init();
public:
	static SmartScene::Pointer scene();
	static void prepairNodeByConfiguration(NodeExt* node);
	virtual void onEnter();
	virtual void onExit();
	void cb_shop( Ref*sender );
	void cb_paidversion( Ref*sender );
	void onKeyReleased( EventKeyboard::KeyCode keyCode, Event* event );
protected:
	void displayLeaderboardScore();
	void removeUnUsedButtons();
	virtual void load( const pugi::xml_node & root );
	virtual ccMenuCallback get_callback_by_description( const std::string & name );
	
	void scrollBegan( const std::vector<Touch*> & touch, Event * event );
	void scrollMoved( const std::vector<Touch*> & touch, Event * event );
	void scrollEnded( const  std::vector<Touch*> & touch, Event * event );
	void mouseHover(Event*);
#ifdef WIN32
	void touchEditModeBegan( const std::vector<Touch*> & touch, Event * event );
	void touchEditModeMoved( const std::vector<Touch*> & touch, Event * event );
	void touchEditModeEnded( const  std::vector<Touch*> & touch, Event * event );
	
	virtual void visit( Renderer *renderer, const Mat4& parentTransform, uint32_t parentFlags );
#endif
	
	
	void update(float delta);
	
	void cb_back( Ref*sender );
	void cb_lab( Ref*sender );
	void cb_itemshop( Ref*sender );
	void cb_game( Ref*sender, GameMode mode );
	void cb_gamelock( Ref*sender, int index );
	void cb_showChoose( Ref*sender, int index );
	void cb_unlock( Ref*sender );

	void runLevel( int levelIndex, GameMode mode );
	
	void showWindow( NodePointer window );
	void windowDidClosed();
	
	void openRateMeWindowIfNeeded();
	
	void activateLocations();
	void buildCurve( int index, bool shopath );
	MenuItemImageWithText::Pointer createFlag( int index );
	LayerPointer buildChooseWindow( int level );
	LayerPointer buildUnlockWindow( int level );
	
	void createPromoMenu();
	void createDevMenu();
private:
	NodePointer _map;
	ScrollMenu::Pointer _menuLocations;
	Point _velocity;
	Point _unfilteredVelocity;
	bool _isTouching;
	
	struct Location
	{
		Point pos;
		Point posLock;
		Point a;
		Point b;
		int starsForUnlock;
		std::string unlockFrame;
		std::string unlockText;
	};
	std::vector<Location> _locations;
	bool _updateLocations;
	bool _showLaboratoryOnEnter;
	std::vector< Node* > _curveMarkers;
	IntrusivePtr<ScrollTouchInfo> _scrollInfo;
	unsigned _selectedLevelIndex;
#ifdef WIN32
	bool _editMode;
	Point* _editPoint;
#endif
};

NS_CC_END
#endif // #ifndef Map