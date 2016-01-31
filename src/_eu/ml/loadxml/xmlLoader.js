/**
 *
 */
//Define namespace
var EU = EU || {};

EU.assert = function (condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
};

EU.xmlLoader = {

    /** For Test Instance of */
    __xmlLoader: true,

    self: this,
    macros: {
        delimiter: "##",
        delimiter_size : function() {
            return this.delimiter.length
        },
        _macroses: new EU.ParamCollection(),
        set: function(name, value){
            this._macroses[name] = value;
        },
        get: function(name)
        {
            return this._macroses[name];
        },
        clear: function()
        {
            this._macroses = new EU.ParamCollection();
        },
        erase: function(name)
        {
            delete this._macroses[name];
        },

        /**
         * @param {String} string
         * @returns {String}
         */
        parse: function (string) {
            var result = string;
            while( true )
            {
                var l = result.indexOf( this.delimiter );
                var r = result.indexOf( this.delimiter, l + this.delimiter_size() );

                if( l >= 0 && r >= 0)
                {
                    var macros = result.substr( l + this.delimiter_size(), r - (l + this.delimiter_size()) );
                    var substitution = this.parse( this.get(macros) );
                    result = result.replace( result.substr(l, r - l + this.delimiter_size() ), substitution );
                }
                else
                {
                    break;
                }
            }
            return result;
        }
    },
    k: {
        ActionSequence: "Sequence",
        ActionSpawn: "Spawn",
        ActionDelayTime: "DelayTime",
        ActionScaleTo: "ScaleTo",
        ActionScaleBy: "ScaleBy",
        ActionSkewTo: "SkewTo",
        ActionSkewBy: "SkewBy",
        ActionMoveTo: "MoveTo",
        ActionMoveBy: "MoveBy",
        ActionRotateTo: "RotateTo",
        ActionRotateBy: "RotateBy",
        ActionJumpTo: "JumpTo",
        ActionJumpBy: "JumpBy",
        ActionBlink: "Blink",
        ActionFadeTo: "FadeTo",
        ActionFadeIn: "FadeIn",
        ActionFadeOut: "FadeOut",
        ActionTintTo: "TintTo",
        ActionTintBy: "TintBy",
        ActionRepeatForever: "RepeatForever",
        ActionRepeat: "Repeat",
        ActionEaseIn: "EaseIn",
        ActionEaseOut: "EaseOut",
        ActionEaseInOut: "EaseInOut",
        ActionBounceIn: "BounceIn",
        ActionBounceOut: "BounceOut",
        ActionBounceInOut: "BounceInOut",
        ActionBackIn: "BackIn",
        ActionBackOut: "BackOut",
        ActionBackInOut: "BackInOut",
        ActionSineIn: "SineIn",
        ActionSineOut: "SineOut",
        ActionSineInOut: "SineInOut",
        ActionAnimate: "Animate",
        ActionRemoveSelf: "RemoveSelf",
        ActionShow: "Show",
        ActionHide: "Hide",
        xmlTag:{
            ParamCollection: "paramcollection"
        }
    },
    /**
     * load a node from file name
     * @param {String} path
     */
    load_node_str: function(path) {
        var xmlnode = new EU.pugixml.readXml(path);
        var root = xmlnode.firstElementChild;
        return this.load_node_xml_node( root );
    },
    /**
     * load a node from a xmlnode
     * @param {Element} xmlnode
     */
    load_node_xml_node: function( xmlnode) {
        var type = xmlnode.getAttribute( EU.xmlKey.Type.name );
        var template_ = xmlnode.getAttribute( EU.xmlKey.Template.name );
        if( this.isEmpty(template_) == false )
        {
            // TODO: EU.Factory
            var node = EU.Factory.build(type);
            this.load_node_n_xml_node( node, xmlnode );
            return node;
        }
        else
        {
            var node = this.load_node_str( template_ );
            var xmlnodem = xmlnode;
            xmlnodem.removeAttribute( EU.xmlKey.Template.name );
            load( node, xmlnodem );
            return node;
        }
    },
    /**
     * load an event node
     * @param {Element} xmlnode
     * @returns {type} event
     */
    load_event_xml_node: function(xmlnode ) {
        var type = xmlnode.getAttribute("name");

        //TODO: create EU.EventBase
        var event = EU.EventBase.create( type );
        for (var i=0; i<xmlnode.attributes.length; i++)
        {
            var attr = xmlnode.attributes[i];
            var name = attr.name;
            var value = this.macros.parse( attr.value);
            event.setParam( name, value );
        }
        for(var i=0; i < xmlnode.children.length; i++){
            var child = xmlnode.children[i];
            var name = child.getAttribute("name");
            event.loadXmlEntity( name, child );
        }
        return event;
    },
    /**
     * load a node type from a path
     * @param node
     * @param path
     */
    load_node_n_str: function(node, path ) {
        var xmlnode = new EU.pugixml.readXml(path);
        var root = xmlnode.firstElementChild;
        load( node, root );
    },
    /**
     * check if string is null or empty
     * @param str
     * @returns {boolean}
     */
    isEmpty: function (str) {
        return (!str || 0 === str.length);
    },
    /**
     * load xml configuration into a created node
     * @param {EU.Node} node
     * @param {Element} xmlnode
     */
    load_node_n_xml_node: function (node, xmlnode )
    {
        //const std::string& type = xmlnode.attribute( ksType.c_str() ).as_string();
        var template_ = xmlnode.getAttribute( EU.xmlKey.Template.name );
        if( this.isEmpty(template_) == false )
        {
            this.load_node_n_str( node, template_ );
        }

        for (var i=0; i<xmlnode.attributes.length; i++)
        {
            var attr = xmlnode.attributes[i];
            var name = attr.name;
            //TODO: setProperty
            EU.xmlLoader.setProperty( node, name, attr.value );
        }

        for(var i=0; i < xmlnode.children.length; i++){
            var xmlentity = xmlnode.children[i];

            var tag = xmlentity.tagName;
            if( tag == "children" )
                this.load_children( node, xmlentity );
            else if( tag == "items" )/*&& type == "scrollmenu"*/ //remove checking type for template
            {
                /** @type {EU.ScrollMenu} scrollmenu */
                var scrollmenu = node;
                EU.assert( scrollmenu.__ScrollMenu, "wrong instance");
                this.load_scrollmenu_items( scrollmenu, xmlentity );
            }
            else if( tag == "children_nonscissor" )
            {
                /** @type {cc.ScrollMenu} scrollmenu */
                var scrollmenu = node;
                EU.assert( scrollmenu.__ScrollMenu, "wrong instance");
                if( scrollmenu ) {
                    this.load_nonscissor_children( scrollmenu, xmlentity );
                }
            }
            else if( tag == "actions" )
            {
                /** @type {EU.NodeExt} nodeext */
                var nodeext = node;
                EU.assert( nodeext.__NodeExt, "wrong instance");
                //TODO: loadActions
                nodeext.loadActions( xmlentity );
            }
            else if( tag == "events" )
            {
                /** @type {EU.NodeExt} nodeext */
                var nodeext = node;
                EU.assert( nodeext.__NodeExt, "wrong instance");
                nodeext.loadEvents( xmlentity );
            }
            else
            {
                var result = false;
                /** @type {EU.NodeExt} nodeext */
                var nodeext = node;
                if( nodeext.__NodeExt ) {
                    result = nodeext.loadXmlEntity( tag, xmlentity );
                }
                if( !result )
                {
                    cc.log( "xml node will not reading. path=[%s]", xmlentity.baseURI);
                }
            }

        }
    },
    /**
     *
     * @param {cc.Node} node
     * @param {Element} xmlnode
     * @returns {*}
     */
    getorbuild_node: function( node, xmlnode )
    {
        var type = xmlnode.getAttribute( EU.xmlKey.Type.name );
        var name = xmlnode.getAttribute( EU.xmlKey.Name.name );
        var path = xmlnode.getAttribute( EU.xmlKey.Path.name );
        var template_ = xmlnode.getAttribute( EU.xmlKey.Template.name );

        var child;

        if( this.isEmpty(template_) == false )
        {
            child = this.load_node_str( template_ );
        }
        if( child == null && this.isEmpty(path) == false )
        {
            child = this.getNodeByPath( node, path );
        }
        if( child == null && this.isEmpty(name) == false )
        {
            child = node.getChildByName( name );
        }
        if( child && this.isEmpty(type) == false )
        {
            log( "Warning! type redefined name[%s] type[%s]", name, type);
        }
        if( child == null )
        {
            //TODO: EU.Factory
            child = EU.Factory.build(type);
        }
        return child;
    },
    /**
     * load children of node from xml configurations
     * @param {cc.Node} node
     * @param {Element} xmlnode
     */
    load_children: function(node, xmlnode)
    {
        for(var i=0; i < xmlnode.children.length; i++){
            var xmlchild = xmlnode.children[i];
            if (xmlchild.tagName == "node") {
                var child = this.getorbuild_node( node, xmlchild );
                EU.assert( child, "empty child" );
                if( child == null )
                    continue;
                load( child, xmlchild );
                if( child.getParent() == null )
                {
                    node.addChild( child, child.getLocalZOrder());
                }
            }
        }
    },
    /**
     * load an action
     * @param {String} desc
     * @returns {*}
     */
    load_action_str: function (desc)
    {
        /**
         * @param {String} desc
         * @returns {string|*}
         */
        var remove_spaces = function (desc)
        {
            return desc.trim();
        };
        /**
         * @param {String} desc
         * @returns {string|*}
         */
        var getType = function (desc)
        {
            var type;
            var k = desc.indexOf( "[" );
            if( k >= 0 )
                type = desc.substr( 0, k );
            return type;
        };
        var getParams = function (desc)
        {
            var params;
            var k = desc.indexOf( "[" );
            if( k >= 0 )
            {
                var count = 1;
                var l = k + 1;
                for( ; l < desc.length && count != 0; ++l)
                {
                    if( desc[l] == '[' )++count;
                    else if( desc[l] == ']' )--count;
                }
                params = desc.substr( k + 1, l - k - 2 );
            }
            return params;
        };
        /**
         *
         * @param {String} params
         * @returns {Array} attr
         */
        var getAttrs = function (params)
        {
            var attr = [];
            var count = 0;
            var l = 0;
            for( var r = 0; r < params.size(); ++r )
            {
                if( params[r] == '[' )++count;
                else if( params[r] == ']' )--count;
                if( count == 0 && params[r] == ',' )
                {
                    attr.push( params.substr( l, r - l ) );
                    l = r + 1;
                }
            }
            attr.push( params.substr( l ) );
            return attr;
        };
        /**
         *
         * @param {Number} duration
         * @param {string} value
         * @returns {*}
         */
        var buildAnimation = function( duration, value ) {
            /**
             *
             * @param {String} string
             * @returns {*}
             * @private
             */
            var _folder = function (string) {
                var result;
                var k = string.indexOf("folder:");
                if (k == 0 || k == 1) {
                    var l = 0;
                    for (l = 0; l < string.length; ++l) {
                        if (string[k + l] == ',')
                            break;
                    }
                    result = string.substr(k + 7, l - 7);
                    string = string.substr(k + l + 1);
                }
                return result;
            };
            /**
             *
             * @param {String} string
             * @param {String} folder
             * @returns {*}
             * @private
             */
            var _frames = function (string, folder) {
                var _list = function () {
                    var list = [];
                    var frames = [];
                    var k = string.indexOf("frames:");
                    if (k == 0 || k == 1) {
                        string = string.substr(k + 7);
                    }
                    if (string[string.length - 1] == ']') {
                        string = string.slice(0, -1);
                    }
                    list = string.split(',');
                    for (var frame in list) {
                        frames.push(folder + frame);
                    }
                    return frames;
                };
                var _indexes = function () {
                    var _indexes = "indexes:";
                    var list = [];
                    var frames = [];
                    var k = string.indexOf(_indexes);
                    if (k == 0 || k == 1)
                        string = string.substr(k + _indexes.size());
                    if (string[string.length - 1] == ']') {
                        string = string.slice(0, -1);
                    }
                    list = string.split(',');
                    EU.assert(list.size() >= 2, "size must be >= 2");
                    var frame = list[0];
                    var ext;
                    k = frame.lastIndexOf(".");
                    ext = frame.substr(k);
                    frame = frame.substr(0, k);
                    list.shift();

                    var indexformat = [];
                    var indexes = [];
                    while (list.length > 0) {
                        var string = list[0];
                        var k = string.indexOf(":");
                        if (k < 0) {
                            var index = parseInt(string);
                            indexes.push(index);
                            if (indexformat.length < string.length)
                                indexformat = string;
                        }
                        else {
                            var a = string.substr(0, k);
                            var b = string.substr(k + 1);
                            if (indexformat.length < a.length) indexformat = a;
                            if (indexformat.length < b.length) indexformat = b;
                            var l = parseInt(a);
                            var r = parseInt(b);
                            for (var i = l; i != r; (r > l ? ++i : --i)) {
                                indexes.push(i);
                            }
                            indexes.push(r);
                        }
                        list.shift();
                    }

                    function zeroPad(nr, length) {
                        var len = (length - String(nr).length) + 1;
                        return len > 0 ? new Array(len).join('0') + nr : nr;
                    };

                    var format = "%0" + indexformat.length + "d";
                    for (var i in indexes) {
                        var frameext = frame + zeroPad(i, indexformat.length + 1) + ext;
                        var name = folder + frameext;
                        //TODO: ImageManager
                        var frame = ImageManager.shared().spriteFrame(name);
                        if (frame)
                            frames.push(name);
                    }

                    return frames;
                };
                if (string.indexOf("frames:") >= 0)
                    return _list();
                else if (string.indexOf("indexes:") >= 0)
                    return _indexes();
                EU.assert(0, "");
                return [];
            };

            var _cash = {};
            if (DEBUG !== undefined) {
                var iter = _cash[value];
                if (iter != null)
                    return iter.second.clone();
            }

            var str = value;
            var folder = _folder( str );
            var frames = _frames( str, folder );

            //TODO: createAnimation in Animation.js
            var animation = EU.Animation.createAnimation( frames, duration );
            if( animation )
            {
                animation.retain();
                _cash[value] = animation;
                animation = animation.clone();
            }
            return animation;
        };

        var cleared_desc = this.macros.parse( remove_spaces( desc ) );
        var type = getType( cleared_desc );
        var params = getParams( cleared_desc );
        var attr = getAttrs( params );

        /**
         * @return {Number}
         */
        var FLOAT = function (index )
        {
            var value = attr[index];
            var k = value.indexOf( ".." );
            if( k < 0 )
            {
                return parseFloat( value );
            }
            else
            {
                var l = parseFloat( value.substr( 0, k ) );
                var r = parseFloat( value.substr( k + 2 ) );
                var v = Math.random() * (r - l) + l;
                EU.assert( l <= r );
                EU.assert( v >= l && v <= r );
                return v;
            }
        };
        /**
         * @return {Integer}
         */
        var INT = function( index )
        {
            var value = attr[index];
            var k = value.indexOf( ".." );
            if( k < 0 )
            {
                return parseInt( value );
            }
            else
            {
                var l = parseFloat( value.substr( 0, k ) );
                var r = parseFloat( value.substr( k + 2 ) );
                var v = Math.round((Math.random() * (r - l) + l));
                EU.assert( l <= r );
                EU.assert( v >= l && v <= r );
                return v;
            }
        };
        /**
         * @return {boolean}
         */
        var BOOL = function( index )
        {
            var value = attr[index];
            return (value === 'true');
        };

        var action_interval = function( desc ) { return this.load_action_str( desc ); };
        //auto action_finitetime = []( const std::string & desc ) { return static_cast<FiniteTimeAction*>(load_action( desc ).ptr()); };

        if( type == this.k.ActionSequence || type == this.k.ActionSpawn )
        {
            var sactions = getAttrs( params );
            var actions = [];
            for(saction in sactions )
            {
                var action = this.load_action_xml_node( saction );
                /** @type {cc.FiniteTimeAction} fta */
                var fta = action;
                if( fta instanceof cc.FiniteTimeAction)
                    actions.push( fta );
            }

            if( type == this.k.ActionSequence )
                //
                return cc.sequence( actions );
            else
                return cc.spawn( actions );
        }
        else if( type == this.k.ActionDelayTime ) { return cc.delayTime( FLOAT( 0 ) ); }
        else if( type == this.k.ActionScaleTo ) { return cc.scaleTo( FLOAT( 0 ), FLOAT( 1 ), FLOAT( 2 ) ); }
        else if( type == this.k.ActionScaleBy ) { return cc.scaleBy( FLOAT( 0 ), FLOAT( 1 ), FLOAT( 2 ) ); }
        else if( type == this.k.ActionSkewTo ) { return cc.skewTo( FLOAT( 0 ), FLOAT( 1 ), FLOAT( 2 ) ); }
        else if( type == this.k.ActionSkewBy ) { return cc.skewBy( FLOAT( 0 ), FLOAT( 1 ), FLOAT( 2 ) ); }
        else if( type == this.k.ActionMoveTo ) { return cc.moveTo( FLOAT( 0 ), Point( FLOAT( 1 ), FLOAT( 2 ) ) ); }
        else if( type == this.k.ActionMoveBy ) { return cc.moveBy( FLOAT( 0 ), Point( FLOAT( 1 ), FLOAT( 2 ) ) ); }
        else if( type == this.k.ActionRotateTo ) { return cc.rotateTo( FLOAT( 0 ), FLOAT( 1 ) ); }
        else if( type == this.k.ActionRotateBy ) { return cc.rotateBy( FLOAT( 0 ), FLOAT( 1 ) ); }
        else if( type == this.k.ActionJumpTo ) { return cc.jumpTo( FLOAT( 0 ), Point( FLOAT( 1 ), FLOAT( 2 ) ), FLOAT( 3 ), INT( 4 ) ); }
        else if( type == this.k.ActionJumpBy ) { return cc.jumpBy( FLOAT( 0 ), Point( FLOAT( 1 ), FLOAT( 2 ) ), FLOAT( 3 ), INT( 4 ) ); }
        else if( type == this.k.ActionBlink ) { return cc.blink( FLOAT( 0 ), INT( 1 ) ); }
        else if( type == this.k.ActionFadeTo ) { return cc.fadeTo( FLOAT( 0 ), INT( 1 ) ); }
        else if( type == this.k.ActionFadeIn ) { return cc.fadeIn( FLOAT( 0 ) ); }
        else if( type == this.k.ActionFadeOut ) { return cc.fadeOut( FLOAT( 0 ) ); }
        else if( type == this.k.ActionTintTo ) { return cc.tintTo( FLOAT( 0 ), INT( 1 ), INT( 2 ), INT( 3 ) ); }
        else if( type == this.k.ActionTintBy ) { return cc.tintBy( FLOAT( 0 ), INT( 1 ), INT( 2 ), INT( 3 ) ); }

        else if( type == this.k.ActionRepeatForever ) { return cc.repeatForever( action_interval( attr[0] ) ); }
        else if( type == this.k.ActionRepeat ) { return cc.repeat( action_interval( attr[0] ), INT( 1 ) ); }
        else if( type == this.k.ActionEaseIn ) { return cc.EaseIn.create( action_interval( attr[0] ), FLOAT( 1 ) ); }
        else if( type == this.k.ActionEaseOut ) { return cc.EaseOut.create( action_interval( attr[0] ), FLOAT( 1 ) ); }
        else if( type == this.k.ActionEaseInOut ) { return cc.EaseInOut.create( action_interval( attr[0] ), FLOAT( 1 ) ); }
        else if( type == this.k.ActionBounceIn ) { return cc.EaseBounceIn.create( action_interval( attr[0] ) ); }
        else if( type == this.k.ActionBounceOut ) { return cc.EaseBounceOut.create( action_interval( attr[0] ) ); }
        else if( type == this.k.ActionBounceInOut ) { return cc.EaseBounceInOut.create( action_interval( attr[0] ) ); }
        else if( type == this.k.ActionBackIn ) { return cc.EaseBackIn.create( action_interval( attr[0] ) ); }
        else if( type == this.k.ActionBackOut ) { return cc.EaseBackOut.create( action_interval( attr[0] ) ); }
        else if( type == this.k.ActionBackInOut ) { return cc.EaseBackInOut.create( action_interval( attr[0] ) ); }
        else if( type == this.k.ActionSineIn ) { return cc.EaseSineIn.create( action_interval( attr[0] ) ); }
        else if( type == this.k.ActionSineOut ) { return cc.EaseSineOut.create( action_interval( attr[0] ) ); }
        else if( type == this.k.ActionSineInOut ) { return cc.EaseSineInOut.create( action_interval( attr[0] ) ); }
        else if( type == this.k.ActionAnimate ) { return cc.animate( buildAnimation( FLOAT( 0 ), attr[1] ) ); }

        //action instant
        else if( type == this.k.ActionRemoveSelf ) { return cc.removeSelf(); }
        else if( type == this.k.ActionShow ) { return cc.show(); }
        else if( type == this.k.ActionHide ) { return cc.hide(); }
        else {
            if (USE_CHEATS !== undefined && USE_CHEATS == 1) {

                var message = "undefinited action type [" + type + "] \n";
                message += "action string: \n";
                message += cleared_desc;
                cc.log("%s", message);
                alert(message + ": Error creating action");
                EU.assert(0);
            }
        }

        return null;
    },
    /**
     * load action from xml node
     * @param xmlnode
     * @returns {*}
     */
    load_action_xml_node: function(xmlnode )
    {
        var body = xmlnode.getAttribute( "value" );
        return this.load_action_str( body );
    },
    /**
     * load scroll menu from xml configuration
     * TODO: build EU.ScrollMenu
     * @param {EU.ScrollMenu} menu
     * @param {Element} xmlnode
     */
    load_scrollmenu_items: function(menu, xmlnode )
    {
        for(var i=0; i < xmlnode.children.length; i++){
            var xmlitem = xmlnode.children[i];

            var imageN = this.macros.parse( xmlitem.attribute( "imageN" ));
            var imageS = this.macros.parse( xmlitem.attribute( "imageS" ));
            var imageD = this.macros.parse( xmlitem.attribute( "imageD" ));
            var text = this.macros.parse( xmlitem.attribute( "text" ));
            var font = this.macros.parse( xmlitem.attribute( "font" ));

            var item = null;
            item = menu.getItemByName(xmlitem.getAttribute( "name" ));
            if( !item )
                item = menu.push( imageN, imageS, imageD, font, text, null );
            this.load_node_n_xml_node( item, xmlitem );
        }
        menu.align( menu.getAlignedColums() );
    },
    /**
     *
     * @param {EU.ScrollMenu} node
     * @param xmlnode
     */
    load_nonscissor_children: function(node, xmlnode )
    {
        for(var i=0; i < xmlnode.children.length; i++){
            var xmlchild = xmlnode.children[i];
            if (xmlchild.tagName == "node") {
                var child = this.getorbuild_node( node, xmlchild );
                EU.assert( child );
                if( !child ) continue;
                load( child, xmlchild );
                if( child.getParent() != node )
                    node.addChildNotScissor( child, child.getLocalZOrder() );
            }
        }
    },
    /**
     *
     * @param {EU.ParamCollection} params
     * @param {String} path
     */
    load_paramcollection_n_path: function(params, path )
    {
        EU.assert( params );
        var doc = new EU.pugixml.readXml(path);
        var root = doc.firstElementChild;
        for(var i=0; i < root.children.length; i++){
            var xmlchild = root.children[i];
            var name = xmlchild.getAttribute( "name" );
            var value = xmlchild.getAttribute( "value" );
            params[name] = value;
        }
    }

};