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

    ctor: function(){
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
        return null;
        //return _onChangeScores[id];
    }
};


//
///***************************************************************/
//
//ScoreByTime::ScoreByTime()
//: _timer( 0 )
//    , _time( 0 )
//    , _interval( 60 )
//    , _max( 10 )
//{
//    __log_line( "" );
//    EU.ScoreCounter.observer( EU.kScoreTime ).add( _ID, std::bind( &ScoreByTime::changeTime, this, std::placeholders::_1 ) );
//    EU.ScoreCounter.observer( EU.kScoreFuel ).add( _ID, std::bind( &ScoreByTime::changeFuel, this, std::placeholders::_1 ) );
//}
//
//ScoreByTime::~ScoreByTime()
//{
//    __log_line( "" );
//    savetime();
//}
//
//void ScoreByTime::onCreate()
//{
//    __log_line( "" );
//    pugi::xml_document doc;
//    doc.load_file( "ini/fuel.xml" );
//    var root = doc.root().first_child();
//    _max = root.child( "max" ).attribute( "value" ).as_int();
//    _interval = root.child( "delay" ).attribute( "value" ).as_int();
//
//    log( "ScoreByTime::_max = [%d]", _max );
//    log( "ScoreByTime::_interval = [%d]", _interval );
//
//    Director::getInstance()->getScheduler()->schedule( std::bind( &ScoreByTime::update, this, std::placeholders::_1 ), this, 1, false, "scorebytime" );
//
//    checkMaxValue();
//    checktime();
//}
//
//void ScoreByTime::checkMaxValue( )
//{
//    _max = UserData::shared( ).get_int( k::user::MaxFuelValue, _max );
//}
//
//void ScoreByTime::checktime()
//{
//    __log_line( "" );
//    var times = EU.UserData.get_str( "score_timer" );
//    if( times.empty() == false )
//    {
//        struct tm last;
//        sscanf( times.c_str(), "%d-%d-%d-%d", &last.tthis.sec, &last.tthis.min, &last.tthis.hour, &last.tthis.yday );
//        time_t time = ::time( 0 );
//        struct tm now = *localtime( &time );
//        long long last_sec =
//        last.tthis.sec +
//        last.tthis.min * 60 +
//        last.tthis.hour * 60 * 60 +
//        last.tthis.yday * 60 * 60 * 24;
//        long long now_sec =
//        now.tthis.sec +
//        now.tthis.min * 60 +
//        now.tthis.hour * 60 * 60 +
//        now.tthis.yday * 60 * 60 * 24;
//        long long diff = now_sec - last_sec;
//        __log_line( "" );
//        EU.ScoreCounter.subMoney( EU.kScoreTime, diff, true );
//        __log_line( "ok0" );
//    }
//    else
//    {
//        EU.ScoreCounter.setMoney( EU.kScoreTime, _interval, true );
//        EU.ScoreCounter.setMoney( EU.kScoreFuel, _max, true );
//    }
//    savetime();
//}
//
//var ScoreByTime::gettime()const
//    {
//        return 0;
//}
//
//var ScoreByTime::getinterval()const
//    {
//        return 0;
//}
//
//void ScoreByTime::update( float dt )
//{
//    __log_line( "" );
//    if( EU.ScoreCounter.getMoney( EU.kScoreFuel ) >= _max )
//    {
//        __log_line( "" );
//        EU.ScoreCounter.setMoney( EU.kScoreTime, _interval, true );
//        savetime();
//    }
//    _timer += dt;
//    if( _timer > 1.f )
//    {
//        _timer -= 1.f;
//        EU.ScoreCounter.subMoney( EU.kScoreTime, 1, true );
//    }
//}
//
//void ScoreByTime::changeTime( var score )
//{
//    if( score <= 0 )
//    {
//        var addfuel = (-score) / ( _interval == 0 ? 1 : _interval) + 1;
//        var addtime = addfuel * _interval;
//
//        if( addtime > 0 )
//            EU.ScoreCounter.addMoney( EU.kScoreTime, addtime, true );
//
//        var fuel = EU.ScoreCounter.getMoney( EU.kScoreFuel );
//        var nfuel = fuel + addfuel;
//        if( nfuel > _max ) addfuel = _max - fuel;
//        addfuel = std::max( addfuel, 0 );
//        if( addfuel > 0 )
//            EU.ScoreCounter.addMoney( EU.kScoreFuel, addfuel, true );
//        savetime();
//    }
//}
//
//void ScoreByTime::changeFuel( var score )
//{
//
//}
//
//void ScoreByTime::savetime()
//{
//    __log_line( "" );
//    char buf[128];
//    time_t time = ::time( 0 );
//    struct tm now = *localtime( &time );
//    sprintf( buf, "%d-%d-%d-%d", now.tthis.sec, now.tthis.min, now.tthis.hour, now.tthis.yday );
//    EU.UserData.write( "score_timer", var(buf) );
//}
//
//
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
        var doc = EU.pugixml.readXml( "ini/realgold.xml");
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
        var doc = EU.pugixml.readXml( "ini/levels.xml");
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
        var doc = EU.pugixml.readXml(EU.kDirectoryToMaps + index + ".xml");
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
                return iter.normal.stars.size();
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
        var mode = EU.GameGS.getInstance().getGameBoard().getGameMode();
        var count = this.getFuel( levelIndex, EU.GameMode.hard == mode );
        EU.ScoreCounter.subMoney( EU.kScoreFuel, count, true );
        EU.UserData.save();
    },
    //TODO:onLevelFinished
    onLevelFinished: function( index, stars )
    {
        var mode = EU.GameGS.getInstance().getGameBoard().getGameMode();
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
        EU.UserData.save();
    }
};

(function() {
    EU.LevelParams.init();
})();