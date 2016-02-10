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

    MagicSquareValue: function(index )
    {
        EU.assert( index < this.MagicSquareSize * this.MagicSquareSize );
        return this.MagicSquare[index / this.MagicSquareSize][index % this.MagicSquareSize];
    },

    buildIndexes: function()
    {
        for( var i = 0; i < this.MagicSquareSizeSq; ++i )
        {
            var v = this.MagicSquareValue( i );
            this.MagicSquareIndexes[v-1] = i;
        }
        for( var i = 0; i < this.MagicSquareSizeSq; ++i )
        {
            log( "%02d %02d", i, this.MagicSquareIndexes[i] );
            EU.assert( this.MagicSquareIndexes[i] != undefined);
        }
    },

    encode: function( string )
    {
        return string;

        EU.assert( string.indexOf( this.MagicSquareEmpty ) < 0 );
        this.buildIndexes();

        var result;
        result.resize( this.MagicSquareSizeSq );
        for( var i = 0; i < this.MagicSquareSizeSq; ++i )
        {
            var v = this.MagicSquareValue( i )-1;
            result[i] = v < string.length ? string[v] : this.MagicSquareEmpty;
        }
        return result;
    },

    decode: function( string )
    {
        return string;

        if( string.length < this.MagicSquareSizeSq )
        {
            //EU.assert( 0 );
            return string;
        }
        var result;
        this.buildIndexes();
        for( var i = 0; i < string.length; ++i )
        {
            var index = this.MagicSquareIndexes[i];
            var value = string[index];
            if( value == this.MagicSquareEmpty )
                break;
            result.push( string[index] );
        }
        return result;
    },

    testMagicSquare: function()
    {
        var sum = 0 ;
        for( var i = 0; i < this.MagicSquareSize; ++i )
        {
            sum += this.MagicSquare[0][i];
        }
        for( var i = 0; i < this.MagicSquareSize; ++i )
        {
            var sumv = 0;
            var sumh = 0;
            var sumd0 = 0;
            var sumd1 = 0;
            for( var j = 0; j < this.MagicSquareSize; ++j )
            {
                sumv += this.MagicSquare[j][i];
                sumh += this.MagicSquare[i][j];
                sumd0 += this.MagicSquare[j][j];
                sumd1 += this.MagicSquare[j][this.MagicSquareSize - j - 1];
            }
            EU.assert( sum == sumv );
            EU.assert( sum == sumh );
            EU.assert( sum == sumd0 );
            EU.assert( sum == sumd1 );
        }
    },

    test_encryption: function()
    {
        var build_string = function()
        {
            return "test string.";

            var size = cc.rand() % this.MagicSquareSize;
            var result;
            for( var i = 0; i < size; ++i )
            {
                result +=  (cc.rand() % 128 + 32);
            }
            EU.assert( result.length == size );
            return result;
        };

        var string = build_string();
        var code = this.encode( string );
        var dcode = this.decode( code );
        EU.assert( dcode == string );
    },
    //}


    //UD :
    //{
    //    kFile:  "xmlfile_pugi.xml" ,
    //    Doc : null,
    //    open: function()
    //    {
    //        var path = cc.fileUtils.getWritablePath();
    //        var kFile = path + this.UD.kFile;
    //        if (EU._DEBUG) {
    //            //clear( );
    //        }
    //        if( cc.fileUtils.isFileExist( kFile ) )
    //            this.UD.Doc = EU.pugixml.readXml(kFile );
    //    },
    //
    //    save: function()
    //    {
    //        this.UD.Doc.save_file( kFile );
    //    }
    //},

    write: function( key, value )
    {
        var ls = cc.sys.localStorage;
        ls.setItem(EU.UserData._PREFIX + key, value);

        //
        //var V = this.kUseEncode ? encode( value ) : value;
        //var root = this.UD.Doc.firstElementChild.child( "root" );
        //if( !root )
        //    root = this.UD.Doc.firstElementChild.appendChild( new Node("root") );
        //var node = root.child( key );
        //if( !node )
        //    node = root.appendChild( key );
        //var attr = node.attribute( "value" );
        //if( !attr ) {
        //    var val = "value";
        //    attr = node[val]  = "";
        //}
        //attr.set_value( V );

    },

    get_str: function( key, defaultvalue )
    {
        defaultvalue = defaultvalue || "";
        var ls = cc.sys.localStorage;
        var value = ls.getItem(EU.UserData._PREFIX + key);

        //var root = this.UD.Doc.root().child( "root" );
        //var node = root.child( key.c_str( ) );
        //var value = node.attribute( "value" ).as_string( "" );

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
