/******************************************************************************
 * Copyright 2014-2016 Vladimir Tolmachev
 * Copyright 2016 Visionarity AG
 * Vladimir Tolmachev and Visionarity AG have unlimited commercial
 * licenses for commercial use and customization
 *
 * Author: Vladimir Tolmachev (tolm_vl@hotmail.com)
 * Ported C++ to Javascript: Visionarity AG / Vladimir Tolmachev
 * Project: Island Defense (JS)
 * If you received the code not from the author, please contact us
 ******************************************************************************/

/**TESTED*/

//Define namespace
var EU = EU || {};

EU.AudioEngine =
{
    //friend class AudioMenu;

    //void playMusic(  std.string path, bool lopped = true );
    //int  playEffect(  std.string path, bool lopped = false, float pan = 0 );
    /*
     if I want use sound as callback.? need use this method
     */
    m_currentMusic : "",
    /**std::function<bool()> */ getIsSoundEnabled : null ,
    /**std::function<bool()>*/ getIsMusicEnabled : null ,
    /**std::function<void(bool)>*/ setSoundEnabled : null ,
    /**std::function<void(bool)>*/ setMusicEnabled : null ,

    callback_isSoundEnabled: function(  func )
    { this.getIsSoundEnabled = func; },
    callback_isMusicEnabled: function(  func )
    { this.getIsMusicEnabled = func; },
    callback_setSoundEnabled: function(  func )
    { this.setSoundEnabled = func; },
    callback_setMusicEnabled: function(  func )
    { this.setMusicEnabled = func; },

    onCreate: function()
    {
        this.soundEnabled( this.isSoundEnabled() );
        this.musicEnabled( this.isMusicEnabled() );
    },

    soundEnabled: function( mode )
    {
        var volume = mode ? 1.0 : 0.0;
        cc.audioEngine.setEffectsVolume( volume );
        if( this.setSoundEnabled ) this.setSoundEnabled( mode );
        EU.UserData.write( "sound_enabled", mode ? 1 : 0 );

        if (cc.sys.platform == cc.sys.WIN32) {
            if( mode == false )
            {
                cc.audioEngine.stopAllEffects();
            }
        }
    },

    musicEnabled: function(mode )
    {
        if (cc.sys.platform == cc.sys.WIN32) {
            var playMusic = mode;
        }

        var volume = mode ? 0.3 : 0.0;
        cc.audioEngine.setMusicVolume( volume );
        if( this.setMusicEnabled ) this.setMusicEnabled( mode );
        EU.UserData.write( "music_enabled", mode ? 1 : 0 );

        if (cc.sys.platform == cc.sys.WIN32) {
            if( playMusic )
            {
                var music = this.m_currentMusic;
                this.m_currentMusic.clear();
                this.playMusic( music, true );
            }
            else
            {
                this.stopMusic();
            }
        }
    },

    isSoundEnabled: function()
    {
        if( this.getIsSoundEnabled ) return this.getIsSoundEnabled();
        //return true;
        return EU.UserData.get_int( "sound_enabled", 1 ) != 0;
    },

    isMusicEnabled: function()
    {
        if( this.getIsMusicEnabled ) return this.getIsMusicEnabled();
        //return true;
        return EU.UserData.get_int( "music_enabled", 1 ) != 0;
    },

    playMusic: function(path, lopped )
    {
        if( path == this.m_currentMusic )
            return;
        this.m_currentMusic = path;
        if (cc.sys.platform == cc.sys.WIN32) {
            if( this.isMusicEnabled() == false )
            {
                return;
            }
        }
        var pathmusic = path;
        pathmusic = EU.xmlLoader.macros.parse( pathmusic );
        var fullPath = pathmusic.indexOf( EU.xmlLoader.resourcesRoot ) == 0 ?
            pathmusic : EU.xmlLoader.resourcesRoot + pathmusic;
        //if( cc.path.isFileExist(pathmusic) )
        {
            //pathmusic = cc.fileUtils.fullPathForFilename( pathmusic );
            cc.audioEngine.playMusic( fullPath, lopped );
        }
    },

   playEffect: function(path, lopped, pan )
    {
        if (cc.sys.platform == cc.sys.WIN32) {
            if( this.isSoundEnabled() == false )
            {
                return -1;
            }
        }
        var sound = path;
        sound = EU.xmlLoader.macros.parse( path );
        var fullPath = sound.indexOf( EU.xmlLoader.resourcesRoot ) == 0 ?
            sound : EU.xmlLoader.resourcesRoot + sound;
        //if( cc.fileUtils.isFileExist(sound) )
        {
            //sound = cc.fileUtils.fullPathForFilename(sound);
            return cc.audioEngine.playEffect( fullPath, lopped );
        }
        return -1;
    },

    playEffect2: function(path )
    {
        this.playEffect( path, false, 0 );
    },

    stopEffect: function(id )
    {
        id = EU.xmlLoader.resourcesRoot + id;
        cc.audioEngine.stopEffect( id );
    },

    pauseEffect: function(id )
    {
        id = EU.xmlLoader.resourcesRoot + id;
        cc.audioEngine.pauseEffect( id );
    },

    resumeEffect: function(id )
    {
        id = EU.xmlLoader.resourcesRoot + id;
        cc.audioEngine.resumeEffect( id );
    },

    stopMusic: function()
    {
        cc.audioEngine.stopMusic();
    },

    pauseAllEffects: function()
    {
        cc.audioEngine.pauseAllEffects();
    },

    resumeAllEffects: function()
    {
        cc.audioEngine.resumeAllEffects();
    }

};