//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __WaveIcon_h__
#define __WaveIcon_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/MenuItemWithText.h"
#include "support.h"
NS_CC_BEGIN





class WaveIcon : public Menu
{
	friend class AutoPlayer;
public:
	typedef std::function<void( WaveIcon*, float, float )> CallBack;
protected:
	DECLARE_BUILDER( WaveIcon );
	bool init( const Point & startwave, float delay, float cooldown, const CallBack & onclick, UnitLayer type );
public:
	void setActive( bool var );
protected:
	void update( float dt );
	void on_click( Ref* );
private:
	NodePointer _arrow;
	MenuItemImageWithText::Pointer _icon;
	ProgressTimer* _timer;
	CallBack _callback;
	Point _wavestart;
	float _elapsed;
	float _cooldown;
	float _duration;
	bool _runned;
};




NS_CC_END
#endif // #ifndef WaveIcon