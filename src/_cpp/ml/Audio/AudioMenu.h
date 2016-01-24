//
//  AudioMenu.h
//  TowerDefence
//
//  Created by Vladimir Tolmachev on 04.02.14.
//
//

#ifndef __TowerDefence__AudioMenu__
#define __TowerDefence__AudioMenu__
#include "cocos2d.h"
#include "ml/macroses.h"
NS_CC_BEGIN;

class AudioMenu : public Menu
{
	DECLARE_BUILDER( AudioMenu );
	bool init() { return true; }
public:
	void check();
private:
	CC_SYNTHESIZE(MenuItemSprite *, m_soundOn, SoundOn);
	CC_SYNTHESIZE(MenuItemSprite *, m_soundOff, SoundOff);
	CC_SYNTHESIZE(MenuItemSprite *, m_musicOn, MusicOn);
	CC_SYNTHESIZE(MenuItemSprite *, m_musicOff, MusicOff);
};

NS_CC_END;
#endif /* defined(__TowerDefence__AudioMenu__) */
