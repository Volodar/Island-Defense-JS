/******************************************************************************
 * Copyright 2014-2016 Vladimir Tolmachev
 * Copyright 2016 Visionarity AG
 * Vladimir Tolmachev and Visionarity AG have unlimited commercial
 * licenses for commercial use and customization
 *
 * Author: Vladimir Tolmachev (tolthis.vl@hotmail.com)
 * Ported C++ to Javascript: Visionarity AG / Vladimir Tolmachev
 * Project: Island Defense (JS)
 * If you received the code not from the author, please contact us
 ******************************************************************************/

/**TESTED**/
//Define namespace
var EU = EU || {};

EU.kScoreLevel = 0;
EU.kScoreCrystals = 1;
EU.kScoreHealth = 2;
EU.kScoreFuel = 3;
EU.kScoreTime = 4;
EU.kScoreStars = 5;

EU.ScoreCounter = {
    scores: {},
    _onChangeScores: {},

    init: function(){
        for( var i = 0; i<6; ++i )
        {
            var s = EU.kUser_Scores_suffix + i.toString();
            var score = EU.UserData.get_int( s, 0 );
            if( score > 0 )
                this.addMoney( i, score, false );
        }
    },
    change: function( id, value, saveValueToUserData )
    {
        value = parseInt(value);
        if( !(id in this.scores ) )
        {
            this.scores[id] = 0;
        }
        var V = this.scores[id] + value;
        this.scores[id] = V;
        var observer = this.observer(id);
        if( observer && observer.pushevent != undefined )
            observer.pushevent( V );
    
        if( saveValueToUserData )
        {
            var s = EU.kUser_Scores_suffix + id.toString();
            EU.UserData.write( s, V );
        }
    },    
    setMoney: function( id, value, saveValueToUserData )
    {
        var current = this.getMoney( id );
        this.addMoney( id, -current + value, saveValueToUserData );
    },
    addMoney: function( id, value, saveValueToUserData )
    {
        this.change( id, value, saveValueToUserData );
    },
    subMoney: function( id, value, saveValueToUserData )
    {
        this.change( id, -value, saveValueToUserData );
    },
    getMoney: function( id )
    {
        //return 9999;
        return id in this.scores ? this.scores[id] : 0;
    },
    observer: function( id )
    {
        if( (id in this._onChangeScores) == false )
            this._onChangeScores[id] = new EU.Observer();
        return this._onChangeScores[id];
    }
};



/***************************************************************/

EU.ScoreByTime = {
    _timer : 0,
    _time : 0,
    _interval : 0,
    _max :0,
    
    init: function() {
        EU.ScoreCounter.observer( EU.kScoreTime ).add( this.__instanceId, this.changeTime, this );
        EU.ScoreCounter.observer( EU.kScoreFuel ).add( this.__instanceId, this.changeFuel, this );
        var doc = null;
        EU.pugixml.readXml( "ini/fuel.xml", function(error, data) {
            doc = data;
        }, this);
        var root = doc.firstElementChild;
        if( !root )
            return;
        this._max = root.getElementsByTagName("max")[0].getAttribute("value");
        this._interval = root.getElementsByTagName("delay")[0].getAttribute("value");

        cc.director.getScheduler().schedule( this.update, this, this, 1, false, "scorebytime" );
    
        this.checkMaxValue();
        this.checktime();
    },
    checkMaxValue: function( )
    {
        this._max = EU.UserData.get_int( EU.k.MaxFuelValue, this._max );
    },
    
    checktime: function()
    {
        //TODO: check time for add fuel
        //var times = EU.UserData.get_str( "score_timer" );
        //if( times.empty() == false )
        //{
        //    struct tm last;
        //    sscanf( times.c_str(), "%d-%d-%d-%d", &last.tthis.sec, &last.tthis.min, &last.tthis.hour, &last.tthis.yday );
        //    time_t time = .time( 0 );
        //    struct tm now = *localtime( &time );
        //    long long last_sec =
        //    last.tthis.sec +
        //    last.tthis.min * 60 +
        //    last.tthis.hour * 60 * 60 +
        //    last.tthis.yday * 60 * 60 * 24;
        //    long long now_sec =
        //    now.tthis.sec +
        //    now.tthis.min * 60 +
        //    now.tthis.hour * 60 * 60 +
        //    now.tthis.yday * 60 * 60 * 24;
        //    long long diff = now_sec - last_sec;
        //    __log_line( "" );
        //    EU.ScoreCounter.subMoney( EU.kScoreTime, diff, true );
        //    __log_line( "ok0" );
        //}
        //else
        //{
        //    EU.ScoreCounter.setMoney( EU.kScoreTime, _interval, true );
        //    EU.ScoreCounter.setMoney( EU.kScoreFuel, _max, true );
        //}
        //savetime();
    },
    
    gettime: function()
    {
        return 0;
    },
    getinterval: function()
    {
        return 0;
    },
    max_fuel: function(){
        return this._max;
    },
    update: function( dt )
    {
        if( EU.ScoreCounter.getMoney( EU.kScoreFuel ) >= this._max )
        {
            EU.ScoreCounter.setMoney( EU.kScoreTime, this._interval, true );
            this.savetime();
        }
        this._timer += dt;
        if( this._timer > 1 )
        {
            this._timer -= 1;
            EU.ScoreCounter.subMoney( EU.kScoreTime, 1, true );
        }
    },
    changeTime: function( score )
    {
        if( score <= 0 )
        {
            var addfuel = (-score) / ( _interval == 0 ? 1 : _interval) + 1;
            var addtime = addfuel * _interval;
    
            if( addtime > 0 )
                EU.ScoreCounter.addMoney( EU.kScoreTime, addtime, true );
    
            var fuel = EU.ScoreCounter.getMoney( EU.kScoreFuel );
            var nfuel = fuel + addfuel;
            if( nfuel > _max ) addfuel = _max - fuel;
            addfuel = Math.max( addfuel, 0 );
            if( addfuel > 0 )
                EU.ScoreCounter.addMoney( EU.kScoreFuel, addfuel, true );
            this.savetime();
        }
    },
    changeFuel: function( score )
    {
    },
    
    savetime: function()
    {
        //TODO: savetime: function()
        //char buf[128];
        //time_t time = .time( 0 );
        //struct tm now = *localtime( &time );
        //sprintf( buf, "%d-%d-%d-%d", now.tthis.sec, now.tthis.min, now.tthis.hour, now.tthis.yday );
        //EU.UserData.write( "score_timer", var(buf) );
    }
};

EU.LevelParams = {
    params : {},
    goldOnFirstRun : 0,

    ctor: function()
    {
    },
    init: function(){
        this.loadRealParams();
        this.loadLevelParams();

        var key = "award_was_obtained_for_real_default";
        if( EU.UserData.get_int( key ) == 0 )
        {
            EU.ScoreCounter.addMoney( EU.kScoreCrystals, this.goldOnFirstRun, true );
            EU.UserData.write( key, 1 );
        }
    },
    loadRealParams: function()
    {
        var doc = null;
        EU.pugixml.readXml( "ini/realgold.xml", function(error, data) {
            doc = data;
        }, this, true);
        var root = doc.firstElementChild;
        if( !root )return;
        root = root.getElementsByTagName("default");
        root = root[0];
        if( !root )return;
        root = root.getAttribute("value");
        this.goldOnFirstRun = root;
    },

    loadLevelParams: function()
    {
        var doc = null;
        EU.pugixml.readXml( "ini/levels.xml", function(error, data) {
            doc = data;
        }, this, true);
        var root = doc.firstElementChild;

        var i = 0;
        var node = null;
        do
        {
            var tag = "level_" + ( i + 1 ).toString();
            node = root.getElementsByTagName( tag )[0];
            if( !node )
                break;
            this.params[i] = {};
            this.params[i].normal = {};
            this.params[i].normal.stars = [];
            this.params[i].normal.stars[0] = EU.Common.strToInt(node.getAttribute( "star1" ));
            this.params[i].normal.stars[1] = EU.Common.strToInt(node.getAttribute( "star2" ));
            this.params[i].normal.stars[2] = EU.Common.strToInt(node.getAttribute( "star3" ));

            this.params[i].hard = {};
            this.params[i].hard.award = EU.Common.strToInt(node.getAttribute( "starhard" ));
            this.params[i].hard.stars = EU.Common.strToInt(node.getAttribute( "starshard" ));
            this.params[i].hard.exclude = node.getAttribute( "excludetext" );

            if( EU.k.useFuel )
            {
                this.params[i].normal.fuel = EU.Common.strToInt(node.getAttribute( "fuel" ) );
                this.params[i].hard.fuel = EU.Common.strToInt(node.getAttribute( "fuelhard" ) );
            }
            else
            {
                this.params[i].normal.fuel = 0;
                this.params[i].hard.fuel = 0;
            }

            this.parseLevel( i );
        }
        while( ++i );
    },
    parseLevel: function(index) {
        var doc = null;
        EU.pugixml.readXml(EU.kDirectoryToMaps + index + ".xml", function(error, data) {
            doc = data;
        }, this, true);
        if( !doc )
            return;
        var root = doc.firstElementChild;

        var waveN = root.getElementsByTagName(EU.k.LevelWaves)[0];
        var waveH = root.getElementsByTagName(EU.k.LevelWavesHard)[0];
        var normal = root.getElementsByTagName(EU.k.LevelParams)[0];
        var hard = root.getElementsByTagName(EU.k.LevelParamsHard)[0];
        if (!normal) normal = root;

        this.params[index].normal.gear = EU.Common.strToInt(normal.getAttribute("startscore"));
        this.params[index].hard.gear = EU.Common.strToInt(hard.getAttribute("startscore"));
        this.params[index].normal.lifes = EU.Common.strToInt(normal.getAttribute("healths"));
        this.params[index].hard.lifes = EU.Common.strToInt(hard.getAttribute("healths"));
        this.params[index].normal.exclude = normal.getAttribute("exclude");

        this.params[index].normal.waves = waveN.children.length;
        this.params[index].hard.waves = waveH.children.length;
    },

    getMaxStars: function( level, forhard )
    {
        var iter = this.params[level];
        if( iter  )
        {
            if( forhard == false )
            {
                return iter.normal.stars.length;
            }
            else
            {
                return iter.hard.stars;
            }
        }
        return 0;
    },
    getAwardGold: function( levelIndex, stars, forhard ) {
        var iter = this.params[levelIndex];
        if(iter) {
            return forhard ?
                (stars > 0 ? iter.hard.award : 0 ) :
                (stars > 0 ? iter.normal.stars[stars - 1] : 0);
        }
        return 0;
    },
    getFuel: function( levelIndex, forhard ) {
        var iter = this.params[levelIndex];
        if (iter ) {
            return forhard ?
                iter.hard.fuel :
                iter.normal.fuel;
        }
        return 0;
    },
    getStartGear: function( level, forhard ) {
        return forhard ?
            this.params[level].hard.gear :
            this.params[level].normal.gear;
    },
    getWaveCount: function( level, forhard ) {
        return forhard ?
            this.params[level].hard.waves :
            this.params[level].normal.waves;
    },
    getLives: function( level, forhard )
        {
            return forhard ?
        this.params[level].hard.lifes :
        this.params[level].normal.lifes;
    },
    getExclude: function( level, forhard ) {
        return forhard ?
            this.params[level].hard.exclude :
            this.params[level].normal.exclude;
    },
    onLevelStarted: function( levelIndex )
    {
        var mode = EU.GameGSInstance.getGameBoard().getGameMode();
        var count = this.getFuel( levelIndex, EU.GameMode.hard == mode );
        EU.ScoreCounter.subMoney( EU.kScoreFuel, count, true );
        //EU.UserData.save();
    },
    //TODO:onLevelFinished
    onLevelFinished: function( index, stars )
    {
        var mode = EU.GameGSInstance.getGameBoard().getGameMode();
        var award = this.getAwardGold( index, stars, EU.GameMode.hard == mode );
        EU.ScoreCounter.addMoney( EU.kScoreCrystals, award, true );

        if( stars > 0 )
        {
            if( mode == EU.GameMode.hard )
                stars = this.getMaxStars( index, false ) + this.getMaxStars( index, true );
            var obtained = EU.UserData.get_int(EU.k.LevelStars + index );
            var diff = Math.max( 0, stars - obtained );
            EU.ScoreCounter.addMoney( EU.kScoreStars, diff, true );
            var all = diff;
            all += EU.UserData.get_int( EU.k.LevelStars + index );
            EU.UserData.write(EU.k.LevelStars + index, all);
        }
        //EU.UserData.save();
        cc.loader.load()
    }
};

(function() {
    EU.ScoreCounter.init();
    EU.ScoreByTime.init();
    EU.LevelParams.init();
})();