#ifndef __HeroIcon_h__
#define __HeroIcon_h__
#include "cocos2d.h"
#include "macroses.h"
#include "ml/MenuItemWithText.h"
#include "Hero.h"
NS_CC_BEGIN





class HeroIcon : public MenuItemImageWithText
{
	DECLARE_BUILDER( HeroIcon );
	bool init( const std::string & heroname, const ccMenuCallback & callback );
public:
	void setHero( Hero::Pointer hero );
	void showCancel( bool mode );

protected:
private:
	Hero::Pointer _hero;
	ProgressTimerPointer _timer;
	SpritePointer _cancelImage;
	std::string _unselectedHero;
	std::string _selectedHero;
};




NS_CC_END
#endif // #ifndef HeroIcon