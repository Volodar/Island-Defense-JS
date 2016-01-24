//
//  IslandDefense
//
//  Created by Vladimir Tolmachev‚ on 03.11.14.
//
//
#ifndef __MenuItemCooldown_h__
#define __MenuItemCooldown_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/MenuItemWithText.h"
NS_CC_BEGIN





class MenuItemCooldown : public MenuItemImageWithText
{
	DECLARE_BUILDER( MenuItemCooldown );
public:
	bool init( const std::string & back, const std::string & forward, float duration, const ccMenuCallback & callback, const std::string & resourceCancel );

	void run();
	void stop();
	void showCancel( bool mode );
	void setAnimationOnFull( const std::string & animationFrame );
	void setPercentage( float percent );//0..1000

	virtual void selected();
	virtual void unselected();

protected:
	virtual void on_click( Ref*sender );
	virtual void onFull(  );
private:
	ProgressTimerPointer _timer;
	IntrusivePtr< FiniteTimeAction > _action;
	float _duration;
	SpritePointer _cancelImage;
	std::string _cancelImageResource;
	std::string _animationFrame;
};




NS_CC_END
#endif // #ifndef MenuItemCooldown