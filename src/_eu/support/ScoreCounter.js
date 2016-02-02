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
            var s = kUser_Scores_suffix + id.toString();
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
//    ScoreCounter::shared().observer( kScoreTime ).add( _ID, std::bind( &ScoreByTime::changeTime, this, std::placeholders::_1 ) );
//    ScoreCounter::shared().observer( kScoreFuel ).add( _ID, std::bind( &ScoreByTime::changeFuel, this, std::placeholders::_1 ) );
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
//        ScoreCounter::shared().subMoney( kScoreTime, diff, true );
//        __log_line( "ok0" );
//    }
//    else
//    {
//        ScoreCounter::shared().setMoney( kScoreTime, _interval, true );
//        ScoreCounter::shared().setMoney( kScoreFuel, _max, true );
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
//    if( ScoreCounter::shared().getMoney( kScoreFuel ) >= _max )
//    {
//        __log_line( "" );
//        ScoreCounter::shared().setMoney( kScoreTime, _interval, true );
//        savetime();
//    }
//    _timer += dt;
//    if( _timer > 1.f )
//    {
//        _timer -= 1.f;
//        ScoreCounter::shared().subMoney( kScoreTime, 1, true );
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
//            ScoreCounter::shared().addMoney( kScoreTime, addtime, true );
//
//        var fuel = ScoreCounter::shared().getMoney( kScoreFuel );
//        var nfuel = fuel + addfuel;
//        if( nfuel > _max ) addfuel = _max - fuel;
//        addfuel = std::max( addfuel, 0 );
//        if( addfuel > 0 )
//            ScoreCounter::shared().addMoney( kScoreFuel, addfuel, true );
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
//void LevelParams::onCreate()
//{
//    loadRealParams();
//    loadLevelParams();
//
//    const char * key = "award_was_obtained_for_real_default";
//    if( EU.UserData.get_int( key ) == 0 )
//    {
//        ScoreCounter::shared().addMoney( kScoreCrystals, _goldOnFirstRun, true );
//        EU.UserData.write( key, 1 );
//    }
//}
//
//void LevelParams::loadRealParams()
//{
//    pugi::xml_document doc;
//    doc.load_file( "ini/realgold.xml" );
//    var root = doc.root().first_child();
//    _goldOnFirstRun = root.child( "default" ).attribute( "value" ).as_int();
//}
//
//void LevelParams::loadLevelParams()
//{
//    pugi::xml_document doc;
//    doc.load_file( "ini/levels.xml" );
//    var root = doc.root().first_child();
//
//    var i = 0;
//    pugi::xml_node node;
//    do
//    {
//        var tag = "level_" + intToStr( i + 1 );
//        node = root.child( tag.c_str() );
//        if( !node )
//            break;
//        _params[i].normal.stars.resize( 3 );
//        _params[i].normal.stars[0] = node.attribute( "star1" ).as_int( 1 );
//        _params[i].normal.stars[1] = node.attribute( "star2" ).as_int( 1 );
//        _params[i].normal.stars[2] = node.attribute( "star3" ).as_int( 1 );
//
//        _params[i].hard.award = node.attribute( "starhard" ).as_int( 0 );
//        _params[i].hard.stars = node.attribute( "starshard" ).as_int( 0 );
//        _params[i].hard.exclude = node.attribute( "excludetext" ).as_string();
//
//        if( k::configuration::useFuel )
//        {
//            _params[i].normal.fuel = node.attribute( "fuel" ).as_int( 1 );
//            _params[i].hard.fuel = node.attribute( "fuelhard" ).as_int( 1 );
//        }
//        else
//        {
//            _params[i].normal.fuel = 0;
//            _params[i].hard.fuel = 0;
//        }
//
//        parceLevel( i );
//    }
//    while( ++i );
//}
//
//void LevelParams::parceLevel(var index)
//{
//    pugi::xml_document doc;
//    doc.load_file( (kDirectoryToMaps + intToStr( index ) + ".xml").c_str() );
//    var root = doc.root().first_child();
//
//    var waveN = root.child( k::xmlTag::LevelWaves );
//    var waveH = root.child( k::xmlTag::LevelWavesHard );
//    var normal = root.child( k::xmlTag::LevelParams );
//    var hard = root.child( k::xmlTag::LevelParamsHard );
//    if( !normal ) normal = root;
//
//    _params[index].normal.gear = normal.attribute( "startscore" ).as_int();
//    _params[index].hard.gear = hard.attribute( "startscore" ).as_int();
//    _params[index].normal.lifes = normal.attribute( "healths" ).as_int();
//    _params[index].hard.lifes = hard.attribute( "healths" ).as_int();
//    _params[index].normal.exclude = normal.attribute( "exclude" ).as_string();
//
//    _params[index].normal.waves = 0;
//    _params[index].hard.waves = 0;
//    FOR_EACHXML( waveN, wave ) { _params[index].normal.waves++; }
//    FOR_EACHXML( waveH, wave ) { _params[index].hard.waves++; }
//}
//
//var LevelParams::getMaxStars( var level, bool forhard )const
//    {
//        var iter = _params.find( level );
//if( iter != _params.end() )
//{
//    if( forhard == false )
//    {
//        return iter->second.normal.stars.size();
//    }
//    else
//    {
//        return iter->second.hard.stars;
//    }
//}
//else
//{
//    cocos2d::MessageBox(
//        ("Sorry, I have not award for level [" + intToStr( level ) + "]").c_str(),
//        "Error" );
//}
//return 0;
//}
//
//var LevelParams::getAwardGold( var levelIndex, var stars, bool forhard )const
//    {
//        var iter = _params.find( levelIndex );
//if( iter != _params.end() )
//{
//    return forhard ?
//        (stars > 0 ? iter->second.hard.award : 0 ):
//        (stars > 0 ? iter->second.normal.stars[stars - 1] : 0);
//}
//else
//{
//    cocos2d::MessageBox(
//        ("Sorry, I have not award for level [" + intToStr( levelIndex ) + "]").c_str(),
//        "Error" );
//}
//return 0;
//}
//
//var LevelParams::getFuel( var levelIndex, bool forhard )const
//    {
//        var iter = _params.find( levelIndex );
//if( iter != _params.end() )
//{
//    return forhard ?
//    iter->second.hard.fuel:
//    iter->second.normal.fuel;
//}
//else
//{
//    cocos2d::MessageBox(
//        ("Sorry, I have not fuel for level [" + intToStr( levelIndex ) + "]").c_str(),
//        "Error" );
//}
//return 0;
//}
//
//var LevelParams::getStartGear( var level, bool forhard )const
//    {
//        return forhard ?
//    _params.at( level ).hard.gear :
//    _params.at( level ).normal.gear;
//}
//
//var LevelParams::getWaveCount( var level, bool forhard )const
//    {
//        return forhard ?
//    _params.at( level ).hard.waves :
//    _params.at( level ).normal.waves;
//}
//
//var LevelParams::getLives( var level, bool forhard )const
//    {
//        return forhard ?
//    _params.at( level ).hard.lifes :
//    _params.at( level ).normal.lifes;
//}
//
//var LevelParams::getExclude( var level, bool forhard )const
//    {
//        return forhard ?
//    _params.at( level ).hard.exclude :
//    _params.at( level ).normal.exclude;
//}
//
//void LevelParams::onLevelStarted( var levelIndex )
//{
//    GameMode mode = GameGS::getInstance()->getGameBoard().getGameMode();
//    var count = getFuel( levelIndex, GameMode::hard == mode );
//    ScoreCounter::shared().subMoney( kScoreFuel, count, true );
//    EU.UserData.save();
//}
//
//void LevelParams::onLevelFinished( var index, var stars )
//{
//    GameMode mode = GameGS::getInstance()->getGameBoard().getGameMode();
//    var award = getAwardGold( index, stars, GameMode::hard == mode );
//    ScoreCounter::shared().addMoney( kScoreCrystals, award, true );
//
//    if( stars > 0 )
//    {
//        if( mode == GameMode::hard )
//            stars = getMaxStars( index, false ) + getMaxStars( index, true );
//        var obtained = EU.UserData.get_int( k::user::LevelStars + intToStr( index ) );
//        var diff = std::max( 0, stars - obtained );
//        ScoreCounter::shared().addMoney( kScoreStars, diff, true );
//        var all = diff;
//        all += EU.UserData.get_int( k::user::LevelStars + intToStr( index ) );
//        EU.UserData.write( k::user::LevelStars + intToStr( index ), all );
//    }
//    EU.UserData.save();
//}
//
//NS_CC_END;