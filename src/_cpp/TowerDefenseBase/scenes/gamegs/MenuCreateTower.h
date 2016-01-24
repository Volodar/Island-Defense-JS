//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __MenuCreateTower_h__
#define __MenuCreateTower_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/ScrollMenu.h"
#include "ml/NodeExt.h"
NS_CC_BEGIN





class MenuCreateTower : public ScrollMenu, public NodeExt
{
	DECLARE_BUILDER( MenuCreateTower );
	bool init();
public:
	void appearance();
	void disappearance();
	void setExcludedTowers( const std::list<std::string> & list );
	void addExludedTower( const std::string & towerName );
	void removeExludedTower( const std::string & towerName );
	void setClickPoint( const Point & point );
	void setActived( bool mode );
protected:
	void onBlocked( Ref * sender );
	void onActivate( Ref * sender, bool availebledButton );
	void confirmSelect( Ref * sender, bool availebledButton );
	void hideConfirmButton( );
	void changeCost();

	void buildDescription( );
	void onChangeMoney( int money );

	MenuItemPointer getButtonForTower( const std::string & towername );
	MenuItemPointer getButtonForTowerUn( const std::string & towername );
	void update( float );
	void setBclokButton( MenuItem*button );
private:
	bool _disabled;
	std::string _selectedTower;
	MenuItemPointer _confirmButton;
	MenuItemPointer _confirmButtonUn;
	MenuItemPointer _hidenButton;
	struct
	{
		NodePointer node;
		LabelPointer name;
		LabelPointer text;
		LabelPointer dmg;
		LabelPointer rng;
		LabelPointer spd;
	} _desc;

	std::map< std::string, MenuItemPointer > _buttonTowers;
	std::map< std::string, MenuItemPointer > _buttonTowersUn;
	Point _centerPoint;
};




NS_CC_END
#endif // #ifndef MenuCreateTower