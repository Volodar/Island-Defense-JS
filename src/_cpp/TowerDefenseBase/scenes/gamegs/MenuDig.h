//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __MenuDig_h__
#define __MenuDig_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/ScrollMenu.h"
#include "ml/NodeExt.h"
NS_CC_BEGIN





class MenuDig : public ScrollMenu, public NodeExt
{
	DECLARE_BUILDER( MenuDig );
	bool init( );
public:
	void appearance( );
	void disappearance( );
	void setClickPoint( const Point & point );
protected:
	void activate( Ref * sender, bool avalabledButton );
	void confirmSelect( Ref * sender, bool avalabledButton );
	void onChangeMoney( int money );
	void update( float );
private:
	MenuItemPointer _dig;
	MenuItemPointer _digUn;
	MenuItemPointer _confirm;
	MenuItemPointer _confirmUn;
	Point _clickedPoint;
};




NS_CC_END
#endif // #ifndef MenuDig