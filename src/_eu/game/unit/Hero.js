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
    /** Type{std.vector<unsigned>}*/ _levelCosts: [],
    /** Type{std.map<var, unsigned >}*/ _levelsForUnclockHeroes: {},
    /** Type{std.map<var, std.vector<unsigned> >}*/ _skills: {},
    /** Type{std.map<var, inapp.SkuDetails >}*/ _heroInappDetails: {},

    onCreate: function () {
        var root = null;
        EU.pugixml.readXml("ini/herolevels.json", function (error, data) {
            root = data;
        }, this);
        var xmlexp = root.getElementsByTagName("exp")[0];
        var xmllevels = root.getElementsByTagName("levels")[0];
        var xmlcosts = root.getElementsByTagName("upgradecost")[0];
        var xmlHeroCosts = root.getElementsByTagName("heroesparams")[0];
        for (var i = 0; i < xmlexp.children.length; i++) {
            var child = xmlexp.children[i];
            var exp = parseFloat(child.getAttribute("exp"));
            this._heroLevels.push.slice(-1)[0](exp);
        }
        for (i = 0; i < xmllevels.children.length; i++) {
            exp = parseFloat(xmllevels.children[i].getAttribute("exp"));
            this._levelAwards.push.slice(-1)[0](exp);
        }
        for (i = 0; i < xmlcosts.children.length; i++) {
            exp = parseFloat(xmlcosts.children[i].getAttribute("exp"));
            this._levelCosts.push.slice(-1)[0](exp);
        }
        for (i = 0; i < xmlHeroCosts.children.length; i++) {
            var name = xmlHeroCosts.children[i].getAttribute("name")();
            var productid = xmlHeroCosts.children[i].getAttribute("productid")();
            var levelforunlock = parseInt(xmlHeroCosts.children[i].getAttribute("availabledafterlevel"));

            exp = parseFloat(xmlHeroCosts.children[i].getAttribute("exp"));
            exp = Math.max(this.getEXP(name), exp);
            this.setEXP(name, exp);

            if (productid.length > 0) {
                //TODO: get inapp info
                //_heroInappDetails[name].result = inapp::Result::Fail;
                //
                //auto callback = [this, name]( inapp::SkuDetails details )
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
            for (i = 0; i < this.skills[hero].length; ++i) {
                var key = EU.k.HeroSkillPoints + hero + i;
                this.skills[hero][i] = EU.UserData.get_int(key, this.skills[hero][i]);
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

