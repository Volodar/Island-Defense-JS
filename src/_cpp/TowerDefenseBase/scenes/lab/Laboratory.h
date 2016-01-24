//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __Laboratory_h__
#define __Laboratory_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/NodeExt.h"
#include "ml/ScrollMenu.h"
NS_CC_BEGIN





class Laboratory : public ScrollMenu, public NodeExt
{
	DECLARE_BUILDER( Laboratory );
	bool init();
public:
	void setCallBackOnClosed( const std::function<void( )> & callback ) { _callbackOnClosed = callback; }
	void onKeyReleased( EventKeyboard::KeyCode keyCode, Event* event );
protected:
	MenuItemPointer buildItem(const std::string & tower );

	void cb_select( Ref*, const std::string & tower );
	void cb_info( Ref*, const std::string & tower );
	void cb_upgrade( Ref*, const std::string & tower );
	void cb_confirm( Ref*, const std::string & tower );
	void cb_cancel( Ref*, const std::string & tower );
	void cb_close( Ref* );

	void selectTower( const std::string & tower );
	void showConfirmMenu( const std::string & itemname, bool mode );
	void switchInfoBox( const std::string & itemname, bool forceHideInfo = false );
	void upgradeTower( const std::string & tower );
	void setIndicator( const std::string & tower, bool nextLevel );
	void setCost( const std::string & tower );
	void setParam( const std::string & tower, bool nextLevel );
	void setIcon( const std::string & tower, bool nextLevel );
	void normalStateForAllItemExcept( const std::string & tower );

	void fadeexit( );
	void fadeenter( );
private:
	float _scaleFactor;
	std::function<void( )> _callbackOnClosed;
	Point _zeroPosition;
};




NS_CC_END
#endif // #ifndef Laboratory