//
//  AudioEngine.h
//  TowerDefence
//
//  Created by Vladimir Tolmachev on 04.02.14.
//
//

#ifndef __TowerDefence__AudioEngine__
#define __TowerDefence__AudioEngine__
#include "SimpleAudioEngine.h"
#include "ml/Singlton.h"
#include "cocos2d.h"
NS_CC_BEGIN;

class AudioEngine : public Singlton<AudioEngine>
{
	friend class Singlton<AudioEngine>;
	friend class AudioMenu;
public:
	static void callback_isSoundEnabled( std::function<bool()> isSoundEnabled );
	static void callback_isMusicEnabled( std::function<bool()> isMusicEnabled );
	static void callback_setSoundEnabled( std::function<void(bool)> setSoundEnabled );
	static void callback_setMusicEnabled( std::function<void(bool)> setMusicEnabled );
public:
	virtual ~AudioEngine();
	void soundEnabled( bool mode );
	void musicEnabled( bool mode );
	bool isSoundEnabled()const;
	bool isMusicEnabled()const;
	
	void playMusic( const std::string & path, bool lopped = true );
	int  playEffect( const std::string & path, bool lopped = false, float pan = 0 );
	/*
	if I want use sound as callback.? need use this method
	*/
	void playEffect2( const std::string & path );
	void stopEffect( int id );
	void pauseEffect( int id );
	void resumeEffect( int id );
	
	void stopMusic();
	
	void pauseAllEffects();
	void resumeAllEffects();
private:
	AudioEngine();
	virtual void onCreate();
private:
	std::string m_currentMusic;
};

NS_CC_END;
#endif /* defined(__TowerDefence__AudioEngine__) */
