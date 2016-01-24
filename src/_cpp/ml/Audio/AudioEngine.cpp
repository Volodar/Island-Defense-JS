//
//  AudioEngine.cpp
//  TowerDefence
//
//  Created by Vladimir Tolmachev on 04.02.14.
//
//

#include "ml/Audio/AudioEngine.h"
#include "ml/loadxml/xmlLoader.h"
//#include "UserData.h"

NS_CC_BEGIN;
using namespace CocosDenshion;

std::function<bool()> getIsSoundEnabled;
std::function<bool()> getIsMusicEnabled;
std::function<void(bool)> setSoundEnabled;
std::function<void(bool)> setMusicEnabled;

void AudioEngine::callback_isSoundEnabled( std::function<bool()> func )
{ getIsSoundEnabled = func; }
void AudioEngine::callback_isMusicEnabled( std::function<bool()> func )
{ getIsMusicEnabled = func; }
void AudioEngine::callback_setSoundEnabled( std::function<void(bool)> func )
{ setSoundEnabled = func; }
void AudioEngine::callback_setMusicEnabled( std::function<void(bool)> func )
{ setMusicEnabled = func; }

AudioEngine::AudioEngine()
{}

void AudioEngine::onCreate()
{
	soundEnabled( isSoundEnabled() );
	musicEnabled( isMusicEnabled() );
}

AudioEngine::~AudioEngine()
{}

void AudioEngine::soundEnabled( bool mode )
{
	float volume = mode ? 1.f : 0.f;
	SimpleAudioEngine::getInstance()->setEffectsVolume( volume );
	if( setSoundEnabled ) setSoundEnabled( mode );
	//UserData::shared().write( "sound_enabled", mode ? 1 : 0 );

#if CC_TARGET_PLATFORM == CC_PLATFORM_WIN32
	if( mode == false )
	{
		SimpleAudioEngine::getInstance()->stopAllEffects();
	}
#endif
}

void AudioEngine::musicEnabled( bool mode )
{
#if CC_TARGET_PLATFORM == CC_PLATFORM_WIN32
	bool playMusic = mode;
#endif
	float volume = mode ? 0.3f : 0.f;
	SimpleAudioEngine::getInstance()->setBackgroundMusicVolume( volume );
	if( setMusicEnabled ) setMusicEnabled( mode );
	//UserData::shared().write( "music_enabled", mode ? 1 : 0 );
#if CC_TARGET_PLATFORM == CC_PLATFORM_WIN32
	if( playMusic )
	{
		auto music = m_currentMusic;
		m_currentMusic.clear();
		this->playMusic( music, true );
	}
	else
	{
		stopMusic();
	}
#endif
}

bool AudioEngine::isSoundEnabled()const
{
	if( getIsSoundEnabled ) return getIsSoundEnabled();
	return true;
	//return UserData::shared().get_int( "sound_enabled", 1 ) != 0;
}

bool AudioEngine::isMusicEnabled()const
{
	if( getIsMusicEnabled ) return getIsMusicEnabled();
	return true;
	//return UserData::shared().get_int( "music_enabled", 1 ) != 0;
}

void AudioEngine::playMusic( const std::string & path, bool lopped )
{
	if( path == m_currentMusic )
		return;
	m_currentMusic = path;
#if CC_TARGET_PLATFORM == CC_PLATFORM_WIN32
	if( isMusicEnabled() == false )
	{
		return;
	}
#endif
	std::string pathmusic = path;
	pathmusic = xmlLoader::macros::parse( pathmusic );
	if( FileUtils::getInstance()->isFileExist(pathmusic) )
	{
		pathmusic = FileUtils::getInstance()->fullPathForFilename( pathmusic );
		SimpleAudioEngine::getInstance()->playBackgroundMusic( pathmusic.c_str(), lopped );
	}
}

int AudioEngine::playEffect( const std::string & path, bool lopped, float pan )
{
#if CC_TARGET_PLATFORM == CC_PLATFORM_WIN32
	if( isSoundEnabled() == false )
	{
		return -1;
	}
#endif
	std::string sound = path;
	sound = xmlLoader::macros::parse( path );
	if( FileUtils::getInstance()->isFileExist(sound) )
	{
		sound = FileUtils::getInstance()->fullPathForFilename(sound);
		return SimpleAudioEngine::getInstance()->playEffect( sound.c_str(), lopped );
	}
	return -1;
}

void AudioEngine::playEffect2( const std::string & path )
{
	playEffect( path, false, 0 );
}

void AudioEngine::stopEffect( int id )
{
	SimpleAudioEngine::getInstance()->stopEffect( id );
}

void AudioEngine::pauseEffect( int id )
{
	SimpleAudioEngine::getInstance()->pauseEffect( id );
}

void AudioEngine::resumeEffect( int id )
{
	SimpleAudioEngine::getInstance()->resumeEffect( id );
}

void AudioEngine::stopMusic()
{
	SimpleAudioEngine::getInstance()->stopBackgroundMusic();
}

void AudioEngine::pauseAllEffects()
{
	SimpleAudioEngine::getInstance()->pauseAllEffects();
}

void AudioEngine::resumeAllEffects()
{
	SimpleAudioEngine::getInstance()->resumeAllEffects();
}


//AudioEngine::AudioEngine()
//{
//
//}
//
//AudioEngine::~AudioEngine()
//{}
//
//void AudioEngine::soundEnabled(bool mode)
//{
//
//}
//
//void AudioEngine::musicEnabled(bool mode)
//{
//
//}
//
//void AudioEngine::addMenu( AudioMenu * menu )
//{
//	
//}
//
//void AudioEngine::removeMenu( AudioMenu * menu )
//{
//
//}
//
//void AudioEngine::playMusic(const std::string & path)
//{
//
//}
//
//int AudioEngine::playEffect(const std::string & path, bool lopped, float pan)
//{
//	//"audio/sound/effect1.wav"
//	return CocosDenshion::SimpleAudioEngine::getInstance()->playEffect(path.c_str(), false);
////	return SimpleAudioEngine::getInstance()->playEffect( path.c_str( ), lopped, pan );
//}
//
//void AudioEngine::playEffect2(const std::string & path)
//{
//	playEffect(path, false, 0);
//}
//
//void AudioEngine::stopEffect(int id)
//{
//
//}
//
//void AudioEngine::pauseEffect(int id)
//{
//}
//
//void AudioEngine::resumeEffect(int id)
//{
//}


NS_CC_END;
