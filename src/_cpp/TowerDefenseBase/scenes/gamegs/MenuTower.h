//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __MenuTower_h__
#define __MenuTower_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/ScrollMenu.h"
#include "ml/NodeExt.h"
#include "unit.h"
NS_CC_BEGIN





class MenuTower : public ScrollMenu, public NodeExt
{
	DECLARE_BUILDER( MenuTower );
	bool init( );
public:
	void appearance( );
	void disappearance( );
	void setUnit( Unit::Pointer unit );
protected:
	void activateUpgrade( Ref * sender, bool availebledButton );
	void confirmUpgrade( Ref * sender, bool availebledButton );
	void activateSell( Ref * sender, bool availebledButton );
	void confirmSell( Ref * sender, bool availebledButton );
	void lockClick( Ref * sender );

	void showConfirmButton( );
	void hideConfirmButton( );
	void onChangeMoney( int money );

	void buildDescription( unsigned level );
	void checkLockedUpgrade();
	void update( float );
private:
	Unit::Pointer _unit;
	bool _disabled;
	MenuItemPointer _upgrade;
	MenuItemPointer _upgradeUn;
	MenuItemPointer _sell;
	MenuItemPointer _confirm;
	MenuItemPointer _confirmUn;
	MenuItemPointer _confirmCurrent;
	MenuItemPointer _lock;
	bool _waitSellConfirm;
	bool _waitUpgradeConfirm;
	struct
	{
		NodePointer node;
		LabelPointer name;
		LabelPointer text;
		LabelPointer dmg;
		LabelPointer rng;
		LabelPointer spd;
	} _desc;
};




NS_CC_END
#endif // #ifndef MenuTower