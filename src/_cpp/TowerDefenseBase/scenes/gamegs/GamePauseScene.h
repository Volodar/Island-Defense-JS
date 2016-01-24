//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __GAMEPAUSE_SCENE__
#define __GAMEPAUSE_SCENE__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/NodeExt.h"

NS_CC_BEGIN;

class GamePauseLayer : public Menu, public NodeExt
{
	DECLARE_BUILDER( GamePauseLayer );
	bool init( const std::string& path, bool showScores = true );
public:
	virtual void onEnter();
	virtual void onKeyReleased( EventKeyboard::KeyCode keyCode, Event* event );
protected:
	virtual ccMenuCallback get_callback_by_description( const std::string & name );

	void cb_resume( Ref*sender );
	void cb_restart( Ref*sender );
	void cb_exit( Ref*sender );
	void cb_sound( Ref*sender, bool enabled );
	void cb_music( Ref*sender, bool enabled );

	void checkAudio();
	void gameresume();
	void restart();
	void exit();
	void shop_did_closed( );

	void fadeexit();
	void fadeenter();
	void checkFullscreen();
protected:
	//SpritePointer m_shadow;
	MenuItemPointer _resume;
	MenuItemPointer _restart;
	MenuItemPointer _quit;
	MenuItemPointer _store;
	MenuItemPointer _music_on;
	MenuItemPointer _music_off;
	MenuItemPointer _sound_on;
	MenuItemPointer _sound_off;
	bool _showScores;
	float _scaleFactor;
};

NS_CC_END;

#endif
