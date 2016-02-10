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

//Define namespace
var EU = EU || {};

EU.AudioMenu = cc.Menu.extend(
{
    m_soundOn : null,
    m_soundOff : null,
    m_musicOn : null,
    m_musicOff : null,
    //CC_SYNTHESIZE(MenuItemSprite *, m_soundOn, SoundOn);
    //CC_SYNTHESIZE(MenuItemSprite *, m_soundOff, SoundOff);
    //CC_SYNTHESIZE(MenuItemSprite *, m_musicOn, MusicOn);
    //CC_SYNTHESIZE(MenuItemSprite *, m_musicOff, MusicOff);

    ctor: function()
    {
        this._super();
        var desSize = cc.view.getDesignResolutionSize();

        this.setPosition( desSize /2, desSize/2 );

        var cb0 = EU.AudioEngine.soundEnabled.bind(this, false);
        var cb1 = function() { EU.AudioEngine.soundEnabled(true);  EU.AudioEngine.playEffect2( "" ); } ;
        var cb2 = function() { EU.AudioEngine.musicEnabled(false); EU.AudioEngine.playEffect2( "" ); } ;
        var cb3 = function() { EU.AudioEngine.musicEnabled(true);  EU.AudioEngine.playEffect2( "" ); } ;

        this.m_soundOn = new cc.MenuItemImage( "",  "", cb0 );
        this.m_soundOff = new cc.MenuItemImage( "", "", cb1 );
        this.m_musicOn = new cc.MenuItemImage( "", "", cb2 );
        this.m_musicOff = new cc.MenuItemImage( "", "", cb3 );

        this.addChild( this.m_soundOn );
        this.addChild( this.m_soundOff );
        this.addChild( this.m_musicOn );
        this.addChild( this.m_musicOff );

        var K = 75;
        this.m_soundOn.setPosition( Point(desSize.width - K*2, desSize.height - K) );
        this.m_soundOff.setPosition( Point(desSize.width - K*2, desSize.height - K) );
        this.m_musicOn.setPosition( Point(desSize.width - K, desSize.height - K) );
        this.m_musicOff.setPosition( Point(desSize.width - K, desSize.height - K) );

    },

    check: function()
    {
        //var s = UserDefault.getInstance().getBoolForKey( "", true );
        //var m = UserDefault.getInstance().getBoolForKey( "", true );

        //this.m_soundOn.setVisible ( s );
        //this.m_soundOff.setVisible( !s );
        //this.m_musicOn.setVisible ( m );
        //this.m_musicOff.setVisible( !m );

    }
});
