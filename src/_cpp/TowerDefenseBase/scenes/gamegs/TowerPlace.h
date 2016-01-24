//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __TowerPlace_h__
#define __TowerPlace_h__
#include "cocos2d.h"
#include "ml/macroses.h"
NS_CC_BEGIN


struct TowerPlaseDef
{
	TowerPlaseDef() :position(), isActive( true ) {}
	Point position;
	bool isActive;
};


class TowerPlace : public Sprite
{
	DECLARE_BUILDER( TowerPlace );
	bool init( const TowerPlaseDef & def );
public:
	bool checkClick( const Point & location, float & outDistance );
	void selected();
	void unselected();
protected:
	void changeView();
private:
	CC_SYNTHESIZE( unsigned, _cost, Cost );
	CC_PROPERTY( bool, _active, Active );
};




NS_CC_END
#endif // #ifndef TowerPlace