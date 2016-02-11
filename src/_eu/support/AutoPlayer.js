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

EU.AutoPlayer = cc.Class.extend(
{
    /** @type {int} */ _currentLevel : null,
    /** @type {string} */ _currentTowerForBuild : null,
    /** @type {string} */ _previuosTowerForBuild : null,
    /** @type {string} */ _previuosTowerForBuild2 : null,
    /** @type {Array<EU.Unit>} */ _towers : null,
    /** @type {Array<EU.Unit>} */ _towerUpgraded : null,

    /** @type {bool} */ _runCurrentLevel : null,
    /** @type {bool} */ _onlyOnceLevel : null,
    /** @type {bool} */ _withoutDefeat : null,
    /** @type {EU.GameMode} */ _mode : null,

    setGameMode: function( /**EU.GameMode*/ mode ) { this._mode = mode; },

    SCHEDULE: function(func, interval) {
        "use strict";
        cc.director.getScheduler().schedule( func , this, interval, false )
    },

    UNSCHEDULE: function(){
        "use strict";
        cc.director.getScheduler().unscheduleAllForTarget( this );
    },

    getMap: function()
    {
        var scene = cc.director.getRunningScene();
        var node = scene.getChildByName( "maplayer" );
        return node && node.__MapLayer ? node : null;
    },

    getGame: function()
    {
        var scene = cc.director.getRunningScene();
        var node = scene.getChildByName( "gamelayer" );
        return node.__GameGS ? node : null;
    },

    onExit: function()
    {
        this.sharedDirector = null;
    },

    ctor: function(runCurrentLevel, onlyOnceLevel, rate, withoutDefeat )
    {
        this._mode = EU.GameMode.normal;
        this._towers = [];
        this._towerUpgraded = [];

        //var t = Date.now();
        //srand( t );

        this._runCurrentLevel = runCurrentLevel;
        this._onlyOnceLevel = onlyOnceLevel;
        this._withoutDefeat = withoutDefeat;

        this._currentLevel = runCurrentLevel ? this.getMap().selectedLevelIndex : 0;
        if( this._currentLevel == -1 )
            this._currentLevel = 0;

        //TODO: check if setTimeScale can replace setTimeRate
        cc.director.getScheduler().setTimeScale( rate );

        this.SCHEDULE( this.state_selectLevel, 1 );

        return true;
    },

    state_selectLevel: function( /**@type {var} */ dt )
    {
        if( this.getMap() )
        {
            this._currentTowerForBuild = "";
            EU.ScoreCounter.setMoney( EU.kScoreFuel, 100, false );
            this.getMap().runLevel( this._currentLevel, this._mode );
            this.UNSCHEDULE();
            this.SCHEDULE( this.state_waitLoading, 1 );
        }
    },

    state_waitLoading: function( /**@type {var} */ dt )
    {
        if( this.getGame() )
        {
            this.UNSCHEDULE();
            this.SCHEDULE( this.state_play, 1.5 );
        }
    },

    state_play: function( /**@type {var} */ dt )
    {
        if( !EU.GameGSInstance )
        {
            this.UNSCHEDULE();
            release();
            return;
        }
        if( EU.GameGSInstance.getGameBoard().checkGameFinished() )
        {
            this.UNSCHEDULE();
            this.SCHEDULE( this.state_victory, 1 );
            return;
        }

        if( EU.GameGSInstance.getGameBoard().isGameStarted() == false )
        {
           var score = EU.ScoreCounter.getMoney( EU.kScoreLevel );
            EU.ScoreCounter.addMoney( EU.kScoreLevel, score / 2, false );

            if( this._withoutDefeat )
                EU.ScoreCounter.setMoney( EU.kScoreHealth, 99999, false );
        }

        var icon = EU.Common.getNodeByPath( EU.GameGSInstance, "interface/waveicon" );
        var click = EU.GameGSInstance.getGameBoard().isGameStarted() == false;
        if( icon )
        {
            click = click || icon._elapsed > icon._duration / 2.5;
        }
        if( click && icon )
        {
            icon.on_click( null );
        }

        var places = EU.GameGSInstance.getTowerPlaces();
        var scores = EU.ScoreCounter.getMoney( EU.kScoreLevel );
        if( places.length > 0 )
        {
            if( EU.xmlLoader.stringIsEmpty(this._currentTowerForBuild) )
            {
                while( true )
                {
                    var towers = [];
                    EU.mlTowersInfo.fetch( towers );
                    var index = cc.rand() % towers.length;
                    while( index-- )
                        towers.shift();
                    this._currentTowerForBuild = towers[0];
                    if( this._previuosTowerForBuild != this._currentTowerForBuild && this._previuosTowerForBuild2 != this._currentTowerForBuild )
                        break;
                }
            }

            var cost = EU.mlTowersInfo.getCost( this._currentTowerForBuild, 1 );
            if( cost <= scores )
            {
               /**EU.TowerPlace*/
               var place;
               var min = 0 ;
                var min_d = 9999999 ;
                var decorations = EU.GameGSInstance.getDecorations( "base_point" );
                if( decorations.length > 0 )
                {
                    var decor = decorations[cc.rand() % decorations.length];
                    var index = 0 ;
                    for (var i = 0; i < places.length; i++) {
                        var place = places[i];
                        var d = cc.pDistance(place.getPosition(), decor.getPosition() );
                        if( d < min_d )
                        {
                            min_d = d;
                            min = index;
                        }
                        ++index;
                    }
                    place = places[min];
                }
                else
                {
                   var index = cc.rand() % places.length;
                    place = places[index];
                }


                if( place )
                {
                    EU.GameGSInstance.setSelectedTowerPlaces( place );
                    this._towers.push( EU.GameGSInstance.getGameBoard().createTower( this._currentTowerForBuild ) );
                    this._previuosTowerForBuild2 = this._previuosTowerForBuild;
                    this._previuosTowerForBuild = this._currentTowerForBuild;
                    this._currentTowerForBuild = "";
                }
            }
        }
        else if( this._towers.length > 0 )
        {
            var towerForUpgrade = this._towers[cc.rand() % this._towers.length];

           var level = towerForUpgrade._level;
           var cost = EU.mlTowersInfo.getCost( towerForUpgrade.getName(), level + 1 );
            if( cost <= scores )
            {
                var tower = EU.GameGSInstance.getGameBoard().upgradeTower( towerForUpgrade );
                if( tower )
                {
                    this._towerUpgraded.push( tower );
                    var index = this._towers.indexOf(towerForUpgrade );
                    if( index >= 0)
                        this._towers.splice( index , 1 );
                }
            }

            if( this._towers.length == 0 )
            {
                this._towers = this._towerUpgraded;
                this._towerUpgraded = [];
            }
        }
    },

    state_victory: function( /**@type {var} */ dt )
    {
        if( EU.ScoreCounter.getMoney( EU.kScoreHealth ) > 0 )
            ++this._currentLevel;

        this._currentTowerForBuild = "";
        this._previuosTowerForBuild = "";
        this._previuosTowerForBuild2 = "";
        this._towers = [];
        this._towerUpgraded = [];

        cc.director.popScene();
        this.UNSCHEDULE();
        this.SCHEDULE( this.state_waitMap, 1 );
    },

    state_waitMap: function( /**@type {var} */ dt )
    {
        if( this.getMap() )
        {
            this.UNSCHEDULE();
            this.SCHEDULE( this.state_loop, 1 );
        }
    },

    state_loop: function( /**@type {var} */ dt )
    {
        this.UNSCHEDULE();
        if( !this._onlyOnceLevel )
        {
            this.SCHEDULE( this.state_selectLevel, 1 );
        }
        else
        {
            release();
        }
    }

});


EU.AutoPlayer.sharedInstance = null;
EU.AutoPlayer.firstUseInstance = true;

EU.AutoPlayer._getInstance = function () {
    if (EU.AutoPlayer.firstUseInstance) {
        EU.AutoPlayer.firstUseInstance = false;
        EU.AutoPlayer.sharedInstance = new EU.AutoPlayer(null, null, 1, false);
    }
    return EU.AutoPlayer.sharedInstance;
};
//EU.autoPlayer = EU.AutoPlayer._getInstance();