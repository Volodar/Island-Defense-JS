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

EU.ksAutoPosition = "autopos";
EU.ksParent = "parent";
EU.ksAsBlockingLayer = "asblockinglayer";
EU.ksCloseByTap = "closebytap";
EU.ksNextTutorial = "nexttutorial";
EU.ksShopGift = "shopgift";
EU.ksSetLevelScore = "setlevelsscore";
EU.ksSelectHero = "selecthero";
EU.ksResetHeroSkills = "resetheroskills";
EU.ksHerominlevel = "herominlevel";
EU.kAutoPosition = EU.xmlKey.UserProperties.int + 1;
EU.kParent = EU.xmlKey.UserProperties.int + 2;
EU.kAsBlockingLayer = EU.xmlKey.UserProperties.int + 3;
EU.kCloseByTap = EU.xmlKey.UserProperties.int + 4;
EU.kNextTutorial = EU.xmlKey.UserProperties.int + 5;
EU.kShopGift = EU.xmlKey.UserProperties.int + 6;
EU.kSetLevelScore = EU.xmlKey.UserProperties.int + 7;
EU.kSelectHero = EU.xmlKey.UserProperties.int + 8;
EU.kResetHeroSkills = EU.xmlKey.UserProperties.int + 9;
EU.kHerominlevel = EU.xmlKey.UserProperties.int + 10;

/******************************************************************************/
//MARK: Tutorial
/******************************************************************************/
EU.Tutorial = cc.Layer.extend(
{
    /** @type {String} */ _nextTutorial : null,

    ctor: function( /**@type {String} */ pathToXml )
    {
        this._super();
        this._nextTutorial = "";
        this.initExt();
        this.load_str( pathToXml );

        //EU.assert( this.getParent() != null );
        //{
        //	var scene = cc.director.getRunningScene();
        //	var smartscene = dynamic_cast<SmartScene*>(scene);
        //}

        return true;
    },


    enter: function()
    {
        this.runEvent( "onenter" );
    },

    exit: function()
    {
        this.runEvent( "onexit" );
    },

    next: function()
    {
        return this._nextTutorial;
    },

    cb_confirmTutorial: function( use )
    {
        EU.UserData.write( EU.k.UseTitorial, use );
        EU.TutorialManager.close( this );
    },

    touchesBegan: function( touches, event )
    {

    },

    touchesEnded: function(  touches, event )
    {
        EU.TutorialManager.close( this );
    }

});

EU.NodeExt.call(EU.Tutorial.prototype);
EU.Tutorial.prototype.setProperty_int = function( /**@type {Integer} */ intproperty, /**@type {String} */ value ) {
    var node = null;
    switch( intproperty )
    {
        case EU.xmlKey.Pos.int:
            this.setPosition( cc.pAdd(this.getPosition(), EU.Common.strToPoint( value ) ) );
            break;
        case EU.kAutoPosition:
            node = EU.Common.getNodeByPath( cc.director.getRunningScene(), value );
            if( node ) this.setPosition( cc.pAdd(this.getPosition() ,node.getPosition()) );
            break;
        case EU.kParent:
            EU.assert( this.getParent() == null );
            node = EU.Common.getNodeByPath( cc.director.getRunningScene(), value );
            if( node ) node.addChild( this );
            break;
        case EU.kAsBlockingLayer:
            if( EU.Common.strToBool( value ) )
            {
                var scene = cc.director.getRunningScene();
                var smartscene = scene;
                if (!smartscene.__SmartScene) smartscene = null;
                smartscene.pushLayer( this, true );
            }
            break;
        case EU.kCloseByTap:
            if( EU.Common.strToBool( value ) )
            {
                var listener = cc.EventListener.create({
                    event: cc.EventListener.TOUCH_ALL_AT_ONCE,
                    onTouchBegan: this.touchesBegan.bind( this ),
                    onTouchesEnded: this.touchesEnded.bind( this )
                });
                cc.eventManager.addListener(listener, this);
            }
            else
            {
                cc.eventManager.removeListeners(this);
            }
            break;
        case EU.kNextTutorial:
            this._nextTutorial = value;
            break;
        case EU.kShopGift:
            EU.UserData.write( EU.k.user.ShopGift, value );
            break;
        case EU.kSetLevelScore:
            EU.ScoreCounter.setMoney( EU.kScoreLevel, EU.Common.strToInt( value ), false );
            break;
        case EU.kSelectHero:
            EU.UserData.hero_setCurrent( EU.Common.strToInt( value ) );
            break;
        case EU.kResetHeroSkills:
        {
            var heroname = "hero" + ( EU.Common.strToInt( value ) + 1 );
            var skills = [];
            //TODO: EU.HeroExp.setSkills( heroname, skills );
            break;
        }
        case EU.kHerominlevel:
        {
            //TODO:
            //var current = EU.UserData.hero_getCurrent();
            //var heroname = "hero" + ( current + 1 );
            //var exp = EU.HeroExp.getEXP( heroname );
            //var expmin = EU.HeroExp.getHeroLevelExtValue( EU.Common.strToInt( value ) ) + 1;
            //exp = Math.max( exp, expmin );
            //EU.HeroExp.setEXP( heroname, exp );
            break;
        }
        default:
            return false;
    }
    return true;
};
EU.Tutorial.prototype.get_callback_by_description = function( /**@type {String} */ name ) {
    var self = this;
    if( name == "confirm_tutorial_yes" )
        return this.cb_confirmTutorial.bind( this, true );
    if( name == "confirm_tutorial_no" )
        return this.cb_confirmTutorial.bind( this, false );
    return null;
};



/******************************************************************************/
//MARK: TutorialManager
/******************************************************************************/
EU.TutorialManager = {


    //var dispatch(  var  eventname,  ParamCollection * params = null );
    /** @type {this} */ _current : null,
    TutorialInfo: function(filename, onlyaftertutorial, count, forced)
    {
        this.filename = filename || "";
        this.onlyaftertutorial = onlyaftertutorial || "";
        this.count = count || 1;
        this.forced = forced || false;
    },
    /** @type {map<string, EU.TutorialManager.TutorialInfo>} */ _list : null,
    /*
     Events for run tutorial.
     * first - eventname
     * second - tutorial name
     */
    /** @type {map<string, Array<string>>} */ _eventsForRun : null,
    /*
     Events for close tutorial.
     * first - eventname
     * second - tutorial name
     */
    /** @type {map<string, Array<string>>} */ _eventsForClose : null,

    /** @type {Array<[ string, ParamCollection ] >} */ _queueEvents : null,


    onCreate: function()
    {

        this._list = {};
        this._eventsForRun = {};
        this._eventsForClose = {};
        this._queueEvents = [];
        EU.xmlLoader.bookProperty( EU.ksAutoPosition, EU.kAutoPosition );
        EU.xmlLoader.bookProperty( EU.ksParent, EU.kParent );
        EU.xmlLoader.bookProperty( EU.ksAsBlockingLayer, EU.kAsBlockingLayer );
        EU.xmlLoader.bookProperty( EU.ksCloseByTap, EU.kCloseByTap );
        EU.xmlLoader.bookProperty( EU.ksNextTutorial, EU.kNextTutorial );
        EU.xmlLoader.bookProperty( EU.ksShopGift, EU.kShopGift);
        EU.xmlLoader.bookProperty( EU.ksSetLevelScore, EU.kSetLevelScore );
        EU.xmlLoader.bookProperty( EU.ksSelectHero, EU.kSelectHero );
        EU.xmlLoader.bookProperty( EU.ksResetHeroSkills, EU.kResetHeroSkills );
        EU.xmlLoader.bookProperty( EU.ksHerominlevel, EU.kHerominlevel );

        this.load();
    },

    dispatch: function( eventname,  params )
    {
        var result = false;

        if( this._current && this._current.isRunning() == false )
        {
            this.close( this._current );
            result = true;
        }

        if( !this._current && this._queueEvents.length > 0 )
        {
            var pair = this._queueEvents.shift();
            if( this.dispatch(pair[0], pair[1]) )
            {
                return true;
            }
        }

        if( this._current )
        {
            var range = this._eventsForClose[eventname];
            for (var i = 0; range != null && i < range.length; i++) {
                var iter = range[i];
                if( iter == this._current.getName() )
                {
                    if( this.close( this._current ) == false )
                        this.dispatch( eventname, params );
                    result = true;
                    break;
                }
            }
            //if( result == false )
            //{
            //	var range = this._eventsForRun.equal_range( eventname );
            //	for( var iter = range.first; iter != range.second; ++iter )
            //	{
            //		if( this.checkOpening( iter.second ) )
            //		{
            //			pair< string, ParamCollection > pair;
            //			pair.first = eventname;
            //			if( params ) pair.second = *params;
            //			this._queueEvents.push( pair );
            //		}
            //	}
            //}

        }
        else
        {
            var range = this._eventsForRun[ eventname ];
            for (var i = 0; range != null && i < range.length; i++) {
                var name = range[i];
                if( this.open( name ) )
                {
                    result = true;
                    break;
                }
            }
        }
        return result;
    },

    close: function( tutorial )
    {
        if( this._current && tutorial == this._current )
        {
            var value = EU.UserData.get_int( "tutorial" + this._current.getName() );
            EU.UserData.write( "tutorial" + this._current.getName(), value + 1 );

            this._current.exit();
            this._current.removeFromParent(true);

            var next = this._current.next();
            this._current = null;
            var result = cc.isString(next) && next.length > 0;
            if( result )
                this.open( next );

            return result;
        }
        else
        {
            EU.assert( tutorial );
            tutorial.exit();
            tutorial.removeFromParent(true);
            return true;
        }
    },

    open: function( /**@type {String} */ name )
    {
        if( this._list[name] == null )
            return false;
        var info = this._list[name];
        var result = false;

        var value = EU.UserData.get_int( "tutorial" + name, 0 );
        if( this.checkOpening(name) )
        {
            EU.UserData.write( "tutorial" + name, value + 1 );

            EU.assert( info.filename.length > 0 );
            this._current = new EU.Tutorial( info.filename );
            this._current.setName( name );
            this._current.enter();
            result = true;
        }

        if( name == "lvl0_hero" )
        {
           var level = EU.GameGSInstance.getGameBoard().getCurrentLevelIndex();

            if( this._current )
            {
                if( level == 0 && EU.k.minLevelHero > 0 )
                    result = this.close( this._current );
                if( level == 3 && EU.k.minLevelHero == 0 )
                    result = this.close( this._current );
            }
        }

        return result;
    },

    checkOpening: function( /**@type {String} */ tutorialname )
    {
        var iter = this._list[tutorialname];
        if (iter == null)
            return false;
        var info = iter;

        var isshow = true ;
        var value = EU.UserData.get_int( "tutorial" + tutorialname, 0 );
        var rejection = EU.UserData.get_bool( EU.k.UseTitorial, true );
        var after = info.onlyaftertutorial;
        var showprevious = after.length == 0 ? true : EU.UserData.get_int( "tutorial" + after ) > 0;
        isshow = isshow && showprevious;
        isshow = isshow && value < info.count;
        isshow = isshow && (rejection || info.forced);

        return isshow;
    },

    load: function()
    {
        /**@type {Element} */
        var doc = null;
        EU.pugixml.readXml("ini/tutorial/tutorials.xml", function(error, data) {
            doc = data;
        }, this);
        var root = doc.firstElementChild;
        var xmllist = root.getElementsByTagName( "list" )[0];
        var xmlevents = root.getElementsByTagName( "events" )[0];
        var xmlrun = xmlevents.getElementsByTagName( "run" )[0];
        var xmlclose = xmlevents.getElementsByTagName( "close" )[0];

        this.loadList( xmllist );
        this.loadEvents( xmlrun, this._eventsForRun );
        this.loadEvents( xmlclose, this._eventsForClose );
    },

    loadList: function( /**@type {Element} */ xmlnode )
    {
        for (var i = 0; i < xmlnode.children.length; i++) {
            var child = xmlnode.children[i];
            var dispatch = true;
            if( child.getAttribute( "dispatch" ) )
            {
                var value = child.getAttribute( "dispatch" );
                dispatch = EU.Common.strToBool( EU.xmlLoader.macros.parse( value ) );
            }
            if (dispatch == false)
                continue;

            var info = new EU.TutorialManager.TutorialInfo();
            var name = child.tagName;
            info.filename = EU.asObject(child.getAttribute( "filename" ), "");
            info.onlyaftertutorial = EU.asObject(child.getAttribute( "after" ), "");
            info.count = parseInt(EU.asObject(child.getAttribute( "count" ), "1" )) * 2;
            info.forced = EU.Common.strToBool(EU.asObject(child.getAttribute( "forced" ), "false" ));
            this._list[name] = info;
        }
    },

    loadEvents: function( xmlnode, /**map<string, Array<string>>*/ events )
    {
        for (var i = 0; i < xmlnode.children.length; i++) {
            var child = xmlnode.children[i];
            var eventname = child.tagName;
            var tutorial = EU.asObject(child.getAttribute( "value" ), "");
            if (events[eventname] == null) events[eventname] = [];
            events[eventname].push( tutorial );
        }
    }

};

EU.TutorialManager.onCreate();