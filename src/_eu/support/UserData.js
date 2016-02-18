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

/**TESTED**/
//Define namespace
var EU = EU || {};

/**
 * Handle for quick access to Cocos2D's implementation of Local Storage:
     var ls = cc.sys.localStorage;

     var value = "foo";
     var key  = "bar";

     //This should save value "foo" on key "bar" on Local Storage
     ls.setItem(key, value);

     //This should read the content associated with key "bar" from Local Storage:
     var data = ls.getItem(key);

     cc.log(data); //Should output "foo" to the console.

     //This should remove the contents of key "bar" from Local Storage:
     ls.removeItem(key);

     //This should print "null"
     data = ls.getItem(key);
     cc.log(data);

 */
EU.UserData = {

    _PREFIX : "EU.UserData",
    write: function( key, value )
    {
        var ls = cc.sys.localStorage;

        /** Preven jsb fault */
        if (value == null || value === undefined) value = "";
        key = key || "";

        ls.setItem(EU.UserData._PREFIX + key, value);
    },

    get_str: function( key, defaultvalue )
    {
        defaultvalue = defaultvalue || "";
        var ls = cc.sys.localStorage;
        var value = ls.getItem(EU.UserData._PREFIX + key);

        //var root = this.UD.Doc.root().child( "root" );
        //var node = root.child( key.c_str( ) );
        //var value = node.getAttribute( "value" ).as_string( "" );

        if( !EU.xmlLoader.stringIsEmpty(value))
            value = this.kUseEncode ? this.decode( value ) : value;
        else
            value = defaultvalue;
        return value;
    },

    get_int: function( key, defaultValue ){
        defaultValue = defaultValue || 0;
        return EU.Common.strToInt( EU.UserData.get_str(key, (defaultValue ? defaultValue.toString():null)) );
    },
    get_bool: function( key, defaultValue ){
        defaultValue = defaultValue || false;
        return EU.Common.strToBool( EU.UserData.get_str(key, (defaultValue ? defaultValue.toString():null)) );
    },
    get_float: function( key, defaultValue ){
        defaultValue = defaultValue || 0;
        return EU.Common.strToFloat( EU.UserData.get_str(key, (defaultValue ? defaultValue.toString():null)) );
    },

    clear: function()
    {
        var ls = cc.sys.localStorage;
        ls.clear();
    },

    //save: function()
    //{
    //    this.UD.save();
    //},

    level_complite: function(index )
    {
        var key = EU.kUser_Level_prefix + ( index ) + EU.kUser_Complite_suffix;
        this.write( key, EU.kUserValue_CompliteYes );

        var countPasses = this.level_getCountPassed();
        if( index >= countPasses )
        this.level_incrementPassed();

    },

    level_incrementPassed: function()
    {
        var count = this.level_getCountPassed();
        if (EU.DEMO_VERSION) {
            if( count >= 2 )
                return count;
        }

        this.level_setCountPassed( count + 1 );

        return count + 1;
    },

    level_getCountPassed: function()
    {
        return this.get_int( EU.kUser_passedLevels, 0 );
    },

    level_getScoresByIndex: function(levelIndex )
    {
        var key = EU.kUser_Level_prefix + ( levelIndex ) + EU.kUser_Scores_suffix;
        return this.get_int( key, 0 );
    },

    level_setCountPassed: function(value )
    {
        this.write( EU.kUser_passedLevels, value );
    },

    level_setScoresByIndex: function(levelIndex,value )
    {
        var saved = this.level_getScoresByIndex( levelIndex );
        if( value >= saved )
        {
            var key = EU.kUser_Level_prefix + ( levelIndex ) + EU.kUser_Scores_suffix;
            this.write( key, value );
        }
    },

    /*********************************************************************/
    //	tower upgrade
    /*********************************************************************/
    tower_getUpgradeLevel: function( name )
    {
        var key = EU.kUserTowerUpgradeLevel + name;
        return this.get_int( key, 0 );
    },

    tower_getDamage: function( name )
    {
        var key = EU.kUserTowerUpgradeDamage + name;
        return this.get_float( key, 1.0 );
    },

    tower_getRadius: function( name )
    {
        var key = EU.kUserTowerUpgradeRadius + name;
        return this.get_float( key, 1.0 );
    },

    tower_getRateshoot: function( name )
    {
        var key = EU.kUserTowerUpgradeRateShoot + name;
        return this.get_float( key, 1.0 );
    },

    tower_setUpgradeLevel: function( name,level )
    {
        level = level || 0;
        EU.assert( level >= 0 );
        var key = EU.kUserTowerUpgradeLevel + name;
        this.write( key, level );
    },

    tower_setDamage: function( name, value )
    {
        value = value || 1.0;
        EU.assert( value >= 1 );
        var key = EU.kUserTowerUpgradeDamage + name;
        this.write( key, value );
    },

    tower_setRadius: function( name, value )
    {
        value = value || 1.0;
        EU.assert( value >= 1 );
        var key = EU.kUserTowerUpgradeRadius + name;
        this.write( key, value );
    },

    tower_setRateshoot: function( name, value )
    {
        value = value || 1.0;
        EU.assert( value >= 1 );
        var key = EU.kUserTowerUpgradeRateShoot + name;
        this.write( key, value );
    },

    bonusitem_add: function(index,count )
    {
        var have = this.bonusitem_count( index );
        have = Math.max( 0, count + have );
        this.write( EU.k.BonuseItem + ( index ), have );
        return have;
    },

    bonusitem_sub: function(index,count )
    {
        count = count || 1;

        return this.bonusitem_add( index, -count );
    },

    bonusitem_count: function(index )
    {
        return this.get_int( EU.k.BonuseItem + ( index ) );
    },

    hero_setCurrent: function(index )
    {
        this.write( EU.k.HeroCurrent, index );
    },

    hero_getCurrent: function()
    {
        return this.get_int( EU.k.HeroCurrent );
    }


};

EU.UserData.kUseEncode = false ;

EU.UserData.MagicSquareSize = 6;
EU.UserData.MagicSquareSizeSq = EU.UserData.MagicSquareSize * EU.UserData.MagicSquareSize;
EU.UserData.MagicSquare =
    [
[ 27, 29, 2, 4, 13, 36],
[ 9, 11, 20, 22, 31, 18],
[ 32, 25, 7, 3, 21, 23],
[ 14, 16, 34, 30, 12, 5],
[ 28, 6, 15, 17, 26, 19],
[ 1, 24, 33, 35, 8, 10]
];
EU.UserData.MagicSquareIndexes = [];
EU.UserData.MagicSquareEmpty = 0x1;

//EU.UserData.UD.open();
