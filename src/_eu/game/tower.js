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

EU.mlTowersInfo = {

    /** For Test Instance of */
    __mlTowersInfo : true,

    towerInfo: function() {
        this.sellRate = 0.0;
        this.minlevel = 0;
        this.cost = [];
        this.costlab = [];
        this.dmg = [];
        this.rng = [];
        this.spd = [];
        this.desc = "";
        this.order = 0;
        this.lab = {
            dmg : 0.0,
            rng : 0.0,
            spd : 0.0
        }
    },
    _digcost : 0,
    /** Map<String, towerInfo> */
    m_towersInfo : {},
    // : [],
    _max_dmg : 0.0,
    _max_rng : 0.0,
    _max_spd : 0.0,

    /** float */ parameterMin : 1 ,
    /** float */ parameterMax : 10 ,

    fetch : function ( /** Array<String> */ towers ) {
        for (var key in this.m_towersInfo) {
            if (key.length > 0) towers.push( key );
        }
        var self = this;
        towers.sort(
            function(  l,  r )
            {
                var a = self.m_towersInfo[l];
                var b = self.m_towersInfo[r];
                return b.order < a.order;
            }
        );
        return towers;
    },
    getCost : function (  name, level ) {
        var iter = this.m_towersInfo[name];
        if ( iter )
        {
            if ( iter.cost.length < level )return 999;
            return iter.cost[level - 1];
        }
        return 0;
    },
    getCostLab : function (  name, level ) {
        var iter = this.m_towersInfo[name];
        if ( iter )
        {
            if ( iter.costlab.length < level )return 999;
            return iter.costlab[level - 1];
        }
        return 0;
    },
    getSellCost : function (  name, level ) {
        var iter = this.m_towersInfo[name];
        if ( iter )
        {
            var towerInfo = iter;
            if ( level > towerInfo.cost.length )
                return 0;
            return towerInfo.cost[level - 1] * towerInfo.sellRate;
        }
        return 0;
    },
    get_dmg : function (  name, level ) {
        var iter = this.m_towersInfo[name];
        if ( iter )
        {
            if ( level == 0 )return 0;
            if ( iter.dmg.length < level )return 0;
            return iter.dmg[level - 1];
        }
        return 0;
    },
    get_rng : function (  name, level ) {
        var iter = this.m_towersInfo[name];
        if ( iter )
        {
            if ( level == 0 )return 0;
            if ( iter.rng.length < level )return 0;
            return iter.rng[level - 1];
        }
        return 0;
    },
    get_spd : function (  name, level ) {
        var iter = this.m_towersInfo[name];
        if ( iter )
        {
            if ( level == 0 )return 0;
            if ( iter.spd.length < level )return 0;
            return iter.spd[level - 1];
        }
        return 0;
    },
    get_desc : function (  name, level ) {
        var iter = this.m_towersInfo[name];
        if ( iter )
        {
            return iter.desc;
        }
        return "";
    },
    get_dmg_forlab : function (  name ) {
        var iter = this.m_towersInfo[name];
        if ( iter )
        {
            return iter.lab.dmg;
        }
        return 0;
    },
    get_rng_forlab : function (  name )  {
        var iter = this.m_towersInfo[name];
        if ( iter )
        {
            return iter.lab.rng;
        }
        return 0;
    },
    get_spd_forlab : function (  name ) {
        var iter = this.m_towersInfo[name];
        if ( iter )
        {
            return iter.lab.spd;
        }
        return 0;
    },
    radiusInPixels: function(  name, level ) {
        var iter = this.m_towersInfo[name];
        if ( iter )
        {
            if ( iter.rng.length < level )return 0;
            var v = iter.rng[level - 1];

            return (v - this.parameterMin)* (this._max_rng) / (this.parameterMax - this.parameterMin);
        }
        return 0;
    },
    load : function () {
        var doc;
        EU.pugixml.readXml( "ini/towers.xml", function(error, data) {
            doc = data;
        }, this);
        var root = doc.firstElementChild;
        this._digcost = EU.asObject(root.getAttribute( "digcost" ), 0);

        var labUpgrade = root.getElementsByTagName( "laboratory_upgrade" )[0];
        var s = labUpgrade ? labUpgrade.getAttribute( "value" ) : "";

        var order = 0 ;
        for(var towerindex=0; towerindex < root.children.length; towerindex++){
            var node = root.children[towerindex];
            var info = new this.towerInfo();
            var name = node.getAttribute( "name" );
            var costXml = node.getElementsByTagName( "cost" )[0];
            var costlabXml = node.getElementsByTagName( "costlab" )[0];
            var sellXml = node.getElementsByTagName( "sell" )[0];
            var levelXml = node.getElementsByTagName( "minlevel" )[0];

            info.order = order++;
            info.sellRate = EU.asObject(sellXml.getAttribute( "value" ), 0.0);
            info.minlevel = EU.asObject(levelXml.getAttribute( "value" ), 0);

            {
                /** Array<String> */ var costs = [];
                costs =  costXml.getAttribute( "value").split(',');
                for (var j = 0; j < costs.length; j++) {
                    var cost = costs[j];
                    info.cost.push( parseInt( cost ) );
                }
            }
            {
                /** Array<String> */ var costslab = [];
                costslab =  costlabXml.getAttribute( "value").split(',');
                for (var j = 0; j < costslab.length; j++) {
                    var cost = costslab[j];
                    info.costlab.push( parseInt( cost ) );
                }
            }

            info.desc = EU.Language.string( node.getElementsByTagName( "desc" )[0].getAttribute( "value" ) );
            var labParams = node.getElementsByTagName( "laboratories_params" )[0];
            if (labParams) {

                info.lab.dmg = EU.asObject(labParams.getAttribute( "dmg" ), 0);
                info.lab.rng = EU.asObject(labParams.getAttribute( "rng" ), 0);
                info.lab.spd = EU.asObject(labParams.getAttribute( "spd" ), 0);
            }
            {//load tower info
                var maxlevel =  1 ;
                for ( i = 1; i <= maxlevel; ++i )
                {
                    var docTemplate;
                    var doc2 = null;
                    EU.pugixml.readXml( "ini/units/" + name +  i  + ".xml", function(error, data) {
                        doc2 = data;
                    }, this);
                    var root2 = doc2.firstElementChild;
                    if ( maxlevel == 1 ) maxlevel = parseInt(EU.asObject(root2.getAttribute( "maxlevel" ), 0));

                    if (root2.getAttribute("template")) {

                        docTemplate  = null;
                        EU.pugixml.readXml(root2.getAttribute( "template" ), function(error, data) {
                            docTemplate = data;
                        }, this);
                    }

                    var xmlEffects = root2.getElementsByTagName( "effects" )[0];
                    var xmlMachine = root2.getElementsByTagName( "machine_unit" )[0];

                    if ( !xmlEffects )
                        xmlEffects = docTemplate.firstElementChild.getElementsByTagName( "effects" )[0];
                    if ( !xmlMachine )
                        xmlMachine = docTemplate.firstElementChild.getElementsByTagName( "machine_unit" )[0];

                    var xmlEffectsPositive = xmlEffects.getElementsByTagName( "positive" )[0];
                    var xmlMachineParams = xmlMachine.getElementsByTagName( "params" )[0];

                    var delayfire = parseFloat(EU.asObject(xmlMachineParams.getElementsByTagName( "state_readyfire" )[0].getAttribute( "delay" ), 0.0));
                    var delaycharge = parseFloat(EU.asObject(xmlMachineParams.getElementsByTagName( "state_charging" )[0].getAttribute( "duration" ), 0.0));
                    var volume = parseFloat(EU.asObject(xmlMachineParams.getElementsByTagName( "state_readyfire" )[0].getAttribute( "charge_volume" ), 0));

                    var radius = parseFloat(EU.asObject(root2.getAttribute( "radius" ), 0.0));
                    var damage = parseFloat(EU.asObject(xmlEffectsPositive.getAttribute( "damage" ), 0.0));
                    var damageR = parseFloat(EU.asObject(xmlEffectsPositive.getAttribute( "fireRate" ), 0.0)) *
                        parseFloat(EU.asObject(xmlEffectsPositive.getAttribute( "fireTime" ), 0.0));
                    var damageI = parseFloat(EU.asObject(xmlEffectsPositive.getAttribute( "iceRate" ), 0.0))*
                        parseFloat(EU.asObject(xmlEffectsPositive.getAttribute( "iceTime" ), 0.0));
                    var damageE = parseFloat(EU.asObject(xmlEffectsPositive.getAttribute( "electroRate" ), 0.0))*
                        parseFloat(EU.asObject(xmlEffectsPositive.getAttribute( "electroTime" ), 0.0));
                    damage += damageR;
                    damage += damageI;
                    damage += damageE;

                    var speed = 1 / (delayfire*volume + delaycharge);
                    var fps = volume * speed;
                    damage *= fps;

                    cc.log("%s:%d fps = %f", name, i, fps);
                    cc.log("%s:%d damage = %f", name, i, damage);
                    cc.log("%s:%d radius = %f", name, i, radius);
                    cc.log("%s:%d speed = %f", name, i, speed);

                    EU.assert ( damage > 0 );
                    EU.assert ( radius > 0 );
                    EU.assert ( speed > 0 );
                    info.dmg.push( damage );
                    info.rng.push( radius );
                    info.spd.push( speed );
                    this._max_dmg = Math.max( this._max_dmg, damage );
                    this._max_rng = Math.max( this._max_rng, radius );
                    this._max_spd = Math.max( this._max_spd, speed );
                }
            }
            this.m_towersInfo[name] = info;
        }
        for (var key in this.m_towersInfo) {
            var param = this.m_towersInfo[key];
            for (var i = 0; i < param.dmg.length; i++) {
                var v = this.m_towersInfo[key].dmg[i];
                this.m_towersInfo[key].dmg[i] = v / this._max_dmg * (this.parameterMax - this.parameterMin) + this.parameterMin;
            }
            for (var i = 0; i < param.spd.length; i++) {
                var v = this.m_towersInfo[key].spd[i];
                this.m_towersInfo[key].spd[i] = v / this._max_spd * (this.parameterMax - this.parameterMin) + this.parameterMin;
            }
            for (var i = 0; i < param.rng.length; i++) {
                var v = this.m_towersInfo[key].rng[i];
                this.m_towersInfo[key].rng[i] = v / this._max_rng * (this.parameterMax - this.parameterMin) + this.parameterMin;
            }
        }

    },
    checkAvailabledTowers : function () {
        var passed = EU.UserData.level_getCountPassed();
        for (var key in this.m_towersInfo) {
            var iter = this.m_towersInfo[key];
            if ( iter.minlevel <= passed )
            {
                var level = EU.UserData.tower_getUpgradeLevel(key );
                level = Math.max( 1, level );
                EU.UserData.tower_setUpgradeLevel( key, level );
            }
        }
    },
    getCostForDig: function(){ return this._digcost; }

};

(function() {
    EU.mlTowersInfo.load();
})();

EU.mlUnitInfo = {

    Info: function()
    {
        /**UnitLayer*/ this.layer = null;
        /**UnitType*/ this.type = null;
        /**float*/ this.radius = 0.0;
    },

    /**map<string, Info >*/
    _info: {},


    info: function(  name )
    {
        if (! this._info[name] )
            this.fetch( name );
        if ( this._info[name] )
            return this._info[name];

        return new this.Info();
    },
    fetch: function( name )
    {
        var doc = null;
        EU.pugixml.readXml( "ini/units/" + name + ".xml", function(error, data) {
            doc = data;
        }, this);
        var root = doc.firstElementChild;

        while( root.getAttribute( "template" ) )
        {
            var doc = null;
            EU.pugixml.readXml( root.getAttribute( "template" ), function(error, data) {
                doc = data;
            }, this);
            root.removeAttribute( "template" );

            var temp = doc.firstElementChild;
            for (var i=0; i<temp.attributes.length; i++)
            {
                var attr = temp.attributes[i];
                var tag = attr.name;
                var attrRoot = root.getAttribute(tag);
                if ( !attrRoot ) root.setAttribute( tag, attr.value );
            }
        }

        var info = new this.Info();
        info.layer = EU.strToUnitLayer( root.getAttribute( "unitlayer" ) );
        info.type = EU.strToUnitType( root.getAttribute( "unittype" ) );
        info.radius = EU.asObject(root.getAttribute( "radius" ));

        this._info[name] = info ;
    }

};
