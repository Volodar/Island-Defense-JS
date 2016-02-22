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

EU.HeroExp = {
    /** Type{std.vector<var>}*/ _heroLevels: [],
    /** Type{std.vector<var>}*/ _levelAwards: [],
    /** Type{std.vector<var>}*/ _levelCosts: [],
    /** Type{std.map<var, var >}*/ _levelsForUnclockHeroes: {},
    /** Type{std.map<var, std.vector<var> >}*/ _skills: {},
    /** Type{std.map<var, inapp.SkuDetails >}*/ _heroInappDetails: {},

    onCreate: function () {
        var root = null;
        EU.pugixml.readXml("ini/herolevels.json", function (error, data) {
            root = data;
        }, this);
        root = root.getElementsByTagName("params")[0];
        var xmlexp = root.getElementsByTagName("exp")[0];
        var xmllevels = root.getElementsByTagName("levels")[0];
        var xmlcosts = root.getElementsByTagName("upgradecost")[0];
        var xmlHeroCosts = root.getElementsByTagName("heroesparams")[0];
        for (var i = 0; i < xmlexp.children.length; i++) {
            var child = xmlexp.children[i];
            var exp = parseFloat(child.getAttribute("exp"));
            this._heroLevels.push(exp);
        }
        for (i = 0; i < xmllevels.children.length; i++) {
            exp = parseFloat(xmllevels.children[i].getAttribute("exp"));
            this._levelAwards.push(exp);
        }
        for (i = 0; i < xmlcosts.children.length; i++) {
            exp = parseFloat(xmlcosts.children[i].getAttribute("exp"));
            this._levelCosts.push(exp);
        }
        for (i = 0; i < xmlHeroCosts.children.length; i++) {
            var name = xmlHeroCosts.children[i].getAttribute("name");
            var productid = xmlHeroCosts.children[i].getAttribute("productid");
            var levelforunlock = parseInt(xmlHeroCosts.children[i].getAttribute("availabledafterlevel"));

            exp = parseFloat(xmlHeroCosts.children[i].getAttribute("exp"));
            exp = Math.max(this.getEXP(name), exp);
            this.setEXP(name, exp);

            if (productid && productid.length > 0) {
                //TODO: get inapp info
                //_heroInappDetails[name].result = inapp::Result::Fail;
                //
                //var callback = [this, name]( inapp::SkuDetails details )
                //{
                //    if( details.result == inapp::Result::Ok )
                //    {
                //        _heroInappDetails[name] = details;
                //    }
                //};
                //if( k::configuration::useHeroRoom )
                //{
                //    productid = k::configuration::kInappPackage + productid;
                //    _heroInappDetails[name] = inapp::SkuDetails();
                //    _heroInappDetails[name].productId = productid;
                //    _heroInappDetails[name].result = inapp::Result::Fail;
                //    inapp::details( productid, std::bind( callback, std::placeholders::_1 ) );
                //}
            }
            else {
                this._levelsForUnclockHeroes[name] = levelforunlock;
            }
        }

        this._skills["hero1"] = [];
        this._skills["hero2"] = [];
        this._skills["hero3"] = [];
        for (var hero in this._skills) {
            this._skills[hero] = [];
            for (i = 0; i < 5; ++i) {
                var key = EU.k.HeroSkillPoints + hero + i;
                this._skills[hero][i] = EU.UserData.get_int(key, 0);
            }
        }

        this.checkUnlockedHeroes();
    },
    isHeroAvailabled: function (name) {
        return EU.UserData.get_bool(EU.k.HeroBought + name);
    },
    isHeroAsInapp: function (name) {
        return name in this._heroInappDetails;
    },
    getLevelForUnlockHero: function (name) {
        if (name in this._levelsForUnclockHeroes) {
            return this._levelsForUnclockHeroes[name];
        }
        return 0;
    },
    heroBought: function (name) {
        if (EU.UserData.get_bool(EU.k.HeroBought + name) == false) {
            EU.UserData.write(EU.k.HeroBought + name, true);
            //EU.Achievements.process( "heroes_open", 1 );
        }
    },
    getHeroSkuDetails: function (name) {
        //if( this._heroInappDetails[name].result != inapp.Result.Ok )
        //{
        //    var cal.slice(-1)[0] = [this, name]( inapp.SkuDetails details )
        //    {
        //        if( details.result == inapp.Result.Ok )
        //        {
        //            this._heroInappDetails[name] = details;
        //        }
        //    };
        //    if( EU.k.configuration.useHeroRoom )
        //    {
        //        inapp.details( this._heroInappDetails[name].productId, std.bind( cal.slice(-1)[0], std.placeholders._1 ) );
        //    }
        //}
        //
        //
        //inapp.SkuDetails dummy;
        //dummy.result = inapp.Result.Fail;
        //if( this._heroInappDetails.find( name ) == this._heroInappDetails.end() )
        //    return dummy;
        //return this._heroInappDetails.at( name );
        return {};
    },
    setEXP: function (name, exp) {
        EU.assert((exp >= 0) && (exp <= 10E+10));
        var currEXP = this.getEXP(name);
        var curr = this.getLevel(currEXP);
        var next = this.getLevel(exp);
        for (var i = curr; i < next; ++i) {
            var key = "herolevel_" + ( i + 1 );
            if (EU.UserData.get_bool(key + name) == false) {
                //EU.Achievements.process( key, 1 );
            }
        }
        EU.UserData.write(EU.k.HeroExp + name, exp);
    },
    getEXP: function (name) {
        return EU.UserData.get_float(EU.k.HeroExp + name);
    },
    getLevel: function (exp) {
        var level = 0;
        var diff = 0;
        var prev = 0;
        for (var i = 0; i < this._heroLevels.length; ++i) {
            diff = (i < (this._heroLevels.length - 1)) ? this._heroLevels[i + 1] - this._heroLevels[i] : 0.0;
            if (exp < this._heroLevels[i])
                break;
            prev = this._heroLevels[i];
            ++level;
        }
        level += diff != 0 ? (exp - prev) / diff : 0;
        return level;
    },
    getExpOnLevelFinished: function (level) {
        return this._levelAwards[level];
    },
    getHeroLevelExtValue: function (level) {
        return this._heroLevels[level];
    },
    getCostLevelup: function (level) {
        return this._levelCosts[level];
    },
    getMaxLevel: function () {
        return this._heroLevels.length;
    },
    skills: function (name) {
        return this._skills[name];
    },
    skillPoints: function (name) {
        var points = this.getLevel(this.getEXP(name));
        var skills = this.skills(name);
        for (var i = 0; i < skills.length; ++i)
            points -= skills[i];
        EU.assert(points >= 0);
        return points;
    },
    setSkills: function (name, skills) {
        this._skills[name] = skills;
        for (var i = 0; i < skills.length; ++i) {
            var key = EU.k.HeroSkillPoints + name + i;
            EU.UserData.write(key, skills[i]);
        }
    },
    checkUnlockedHeroes: function () {
        var passed = EU.UserData.level_getCountPassed();
        for (var hero in this._levelsForUnclockHeroes) {
            var level = this._levelsForUnclockHeroes[hero];
            if (this.isHeroAvailabled(hero) == false && level <= passed) {
                this.heroBought(hero);
            }
        }
    }
};

EU.Hero = EU.UnitDesant.extend({
    __Hero : true,
    /** @type {var} */ _dieTimer : null,
    /** @type {var} */ _regeneration : null,
    /** @type {String}*/ _skill : null,
    event_live : 100,

    getSkill:function(){return this._skill;},

    ctor: function( path, xmlFile ){
        this._dieTimer = 0;
        this._regeneration = 0;
        this._skill = "";
        this.initMachine();
        this.add_event(  EU.Hero.event_live ).set_string_name( "live" );
        this._super( path, xmlFile );
    },
//
//Hero.~Hero()
//{}
//
    die_update:function( dt )
    {
        this._dieTimer += dt;
        var dlife = (this._defaultHealth * this.getRate()) / EU.MachineUnit._death.duration;
        var health = dlife * this._dieTimer + this.getCurrentHealth();
    
        this.observerHealth.unlock();
        this.setCurrentHealth( health );
        this.observerHealth.lock();
        this.setCurrentHealth(0);
    },
    initSkills: function()
    {
        var skills = this.getSkills();
        for( var i=0; i<skills.length; ++i )
        {
            var skill = skills[i];
            var checkUnitSkill = skill.getNeedUnitSkill().length > 0;
            if( checkUnitSkill == false )
                continue;
            var type = EU.Common.strToInt( skill.getNeedUnitSkill() );
            var level = skill.getNeedUnitSkillLevel();

            var heroSkills = EU.HeroExp.skills( this.getName() );
            if( heroSkills[type] != level )
                this.removeSkill( skill );
        }

        skills = this.getSkills();
        for( i=0; i<skills.length; ++i )
        {
            skill = skills[i];
            if( skill instanceof EU.UnitSkillRateParameter )
            {
                var paramSkill = skill;
                var param = paramSkill.getParameter();
                var rate = paramSkill.getRate();

                if( param == "health" )
                {
                    this.setProperty_str( param, (this.getHealth() * rate) );
                }
                else if( param == "armor" )
                {
                    var effect = this.getEffect();
                    effect.positive.armor *= rate;
                }
                else if( param == "damage" )
                {
                    effect = this.getEffect();
                    effect.positive.damage *= rate;
                    effect.positive.electroRate *= rate;
                    effect.positive.fireRate *= rate;
                    effect.positive.iceRate *= rate;
                }
            }
        }
    },
    moveTo: function( position )
    {
        var myRoute = [];
        if( myRoute.length == 0 ) myRoute = this.findOneRoute( position );
        if( myRoute.length == 0 ) myRoute = this.findTwoRoute( position );

        if( myRoute.length > 0 )
        {
            this.finalizateRoute( position, myRoute );
            this.setBasePosition( position );
            this.getMover().setRoute( myRoute );
            this.move();
        }

        return myRoute.length > 0;
    },
    checkRoute: function( tripleroute, A, B )
    {
        var route = [];
        var maxDistToRoute = 50;
        var checkSelf = EU.checkPointOnRoute_2( A, tripleroute, maxDistToRoute * 2 );
        var checkTarget = EU.checkPointOnRoute_2( B, tripleroute, maxDistToRoute );
        if( checkSelf.result && checkTarget.result )
        {
            var i0 = -1;
            var i1 = -1;
            var min_0 = 9999;
            var min_1 = 9999;
            var  r = tripleroute.main;
            for( i = 0; i < r.length; ++i )
            {
                var d0 = cc.pDistance(A, r[i] );
                var d1 = cc.pDistance(B, r[i] );
                if( d0 < min_0 )
                {
                    min_0 = d0;
                    i0 = i;
                }
                if( d1 < min_1 )
                {
                    min_1 = d1;
                    i1 = i;
                }
            }
            EU.assert( i0 != -1 );
            EU.assert( i1 != -1 );
            var step = i1 > i0 ? 1 : -1;
            for( var i = i0; i != i1; i += step )
            {
                route.push( r[i] );
            }
            if( i0 == i1 )
            {
                route.push( r[i0] );
            }
        }
        return route;
    },
    findOneRoute: function( position )
    {
        var route = [];
        var routes = EU.GameGSInstance.getGameBoard().getCreepsRoutes();

        for( var i=0; i<routes.length; ++i)
        {
            var route = this.checkRoute( routes[i], this.getPosition(), position );
            if( route.length > 0 )
                break;
        }
        return route;
    },
    findTwoRoute: function( position )
    {
        var route = [];
        var atroutes = EU.GameGSInstance.getGameBoard().getCreepsRoutes();
        var troutes = [];

        var temp = [];
        for( var i = 0; i < atroutes.length; ++i )
        {
            temp.length = 0;
            temp = this.checkRoute( atroutes[i], this.getPosition(), atroutes[i].main[0] );
            if( temp.length > 0 )
                troutes.push( atroutes[i] );
        }
        for( i = 0; i < atroutes.length; ++i )
        {
            temp.length = 0;
            temp = this.checkRoute( atroutes[i], position, atroutes[i].main[0] );
            if( temp.length > 0 )
                troutes.push( atroutes[i] );
        }
        if( troutes.length == 0 )
            return;

        var routes = [];
        for( i = 0; i < troutes.length; ++i )
        {
            for( var j = 0; j < troutes[i].main.length; ++j )
            {
                var point = troutes[i].main[j];
                temp.length = 0;
                temp = this.checkRoute( troutes[i], this.getPosition(), point );
                size = temp.length;
                if( size == 0 )
                    continue;
                temp.push( point );
                routes.push( temp );
            }
        }

        for( i = 0; i < routes.length; )
        {
            var path = false;
            for( j = 0; j < troutes.length; ++j )
            {
                var troute = troutes[j];
                temp.length = 0;
                temp = this.checkRoute( troute, routes[i].slice(-1)[0], position );
                var size = temp.length;
                if( size != 0 )
                {
                    routes[i].insert( routes[i].end(), temp.begin(), temp.end() );
                    path = true;
                }
            }
            if( path == false )
            {
                routes.splice( i, 1 );
            }
            else
            {
                ++i;
            }
        }

        routes.sort(
            function(  l,  r )
            {
                var Len = function (route){
                    var l = 0;
                    for( var i = 1; i < route.length; ++i )
                    {
                        l += cc.pDistanceSQ( route[i - 1], route[i] );
                    }
                    return l;
                };
                return Len( l ) < Len( r );
            }
        );

        if( routes.length > 0 )
        {
            route = routes[0]();
        }
        return route;
    },
    finalizateRoute: function( position, route )
    {
        route.push( position );
        while( route.length >= 2 )
        {
            var r1 = cc.pSub(route[0], this.getPosition());
            var r2 = cc.pSub(route[1], route[0]);
            var angle = EU.Common.getAngle( r1, r2 );
            if( Math.abs( angle ) > 90 )
            {
                route.splice( 0, 1 );
            }
            else
            {
                break;
            }
        }
        route.splice( 0, 0, this.getPosition() );
    },
    setProperty_str: function( stringproperty, value )
    {
        if( stringproperty == "regeneration" )
            this._regeneration = EU.Common.strToFloat( value );
        else if( stringproperty == "skill" )
            this._skill = value;
        else
            return this._super(stringproperty, value);
            //return EU.UnitDesant.prototype.setProperty_str( stringproperty, value );

        return true;
    },
    on_die:function()
    {
        this._super();
        this.observerHealth.lock();
        this._dieTimer = 0;
    },
    on_die_finish: function()
    {
        this.runEvent( "on_die_finish" );
        this.setCurrentHealth( this._defaultHealth * this.getRate() );
        this.push_event( this.event_live );
        this.observerHealth.unlock();
    },
    stop_update: function( dt )
    {
        var health = this.getCurrentHealth();
        health = Math.min( this._defaultHealth * this.getRate(), health + this._regeneration * dt );
        this.setCurrentHealth( health );
    }
});