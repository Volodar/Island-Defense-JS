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

EU.UserData = {
    ctor: function(){

    },
    get_str: function( key, defaultValue ){
        if( defaultValue !== undefined && defaultValue !== null )
            return defaultValue;
        return "";
    },
    write: function( key, value ){

    },
    get_int: function( key, defaultValue ){
        return EU.Common.strToInt( EU.UserData.get_str(key, (defaultValue ? defaultValue.toString():null)) );
    },
    get_bool: function( key, defaultValue ){
        return EU.Common.strToInt( EU.UserData.get_str(key, (defaultValue ? defaultValue.toString():null)) );
    },
    get_float: function( key, defaultValue ){
        return EU.Common.strToFloat( EU.UserData.get_str(key, (defaultValue ? defaultValue.toString():null)) );
    },

    level_getCountPassed: function(){ return 2; },

    clear: function(){},
    save: function(){},
    level_complite: function( index ){},
    level_incrementPassed: function(){ return 0; },
    level_getScoresByIndex: function(levelIndex){return 0; },
    level_setCountPassed: function(value){},
    level_setScoresByIndex: function(levelIndex, value){},
    tower_getUpgradeLevel: function( name ){ return 1; },
    tower_setUpgradeLevel: function( name, level ){},
    tower_damage: function( name ){ return 0; },
    tower_radius: function( name ){ return 0; },
    tower_rateshoot: function( name ){ return 0; },
    tower_damage: function( name, value ){},
    tower_radius: function( name, value ){},
    tower_rateshoot: function( name, value ){},
    bonusitem_add: function( index, count ){return 0; },
    bonusitem_sub: function( index, count ){return 0; },
    bonusitem_count: function( index ){return 0; },
    hero_setCurrent: function( index ){},
    hero_getCurrent: function(){return 0; },
}