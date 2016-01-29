//Define namespace
var EU = EU || {};

EU.NodeExt = cc.Class.extend({

    /** @type {EU.EventsList} */
    _events : null,
    /** @type {cc.Action} */
    _actions: null,
    /** @type {EU.ParamCollection} */
    _params: null,
    ctor: function(){
    },
    as_node_ref: function()
    {
        return (this instanceof Node ? this : null);
    },
    getChildByPath_str: function( path_names )
    {
        var self = this.as_node_ref();
        var result = self ? EU.Common.getNodeByPath( self, path_names ) : null;
        return result;
    },
    getChildByPath_arr: function(path_tags )
    {
        var self = this.as_node_ref();
        var result = self ? EU.Common.getNodeByTagsPath(self, path_tags) : null;
        return result;
    },
    getParamCollection: function()
    {
        return this._params;
    },
    /**
     * @param {String} path
     * @param {String} xmlFile
     */
    load_str_n_str: function( path, xmlFile )
    {
        var file = path;
        if( !EU.xmlLoader.isEmpty(file) && file.substr(-1) != '/' )
            file += '/';
        file += xmlFile;
        this.load_str( file );
    },
    load_str: function(file )
    {
        if( EU.xmlLoader.isEmpty(file)) return;
        var xmlnode = new EU.pugixml.readXml(file);
        var root = xmlnode.firstElementChild;
        this.load_xmlnode( root );
    },
    load_xmlnode: function( root )
    {
        EU.xmlLoader.bookDirectory( this );
        EU.xmlLoader.load( this, root );
        EU.xmlLoader.unbookDirectory();
    },
    runEvent: function( eventname )
    {
        var iter = this._events[eventname];
        if( iter != null )
        {
            iter.execute( this );
        } else {
            var name = this.as_node_ref() ? EU.Node.prototype.getName.call(this) : "Not node inherited";
            //log_once( "NodeExt[%s]: event with name [%s] not dispatched", name.c_str( ), eventname.c_str( ) );
        }
    },
    getAction: function( name )
    {
        var iter = this._actions[name];
        if( iter != null )
            return iter;
        return null;
    },
    setProperty_int: function( intproperty, value )
    {
        return false;
    },
    setProperty_str: function( stringproperty, value )
    {
        return false;
    },
    /**
     * @param {Element} xmlnode
     */
    loadActions: function( xmlnode )
    {
        for(var i=0; i < xmlnode.children.length; i++){
            var xmlaction = xmlnode.children[i];
            var actionname = xmlaction.getAttribute( "name" );
            var action = EU.xmlLoader.load_action_xml_node( xmlaction );
            EU.assert( action );
            this._actions[actionname] = action;
        }
    },
    /**
     * @param {Element} xmlnode
     */
    loadEvents: function(xmlnode )
    {
        for(var i=0; i < xmlnode.children.length; i++){
            var xmllist = xmlnode.children[i];
            var listname = xmllist.getAttribute( "name" );
            for(var j=0; j < xmllist.children.length; j++){
                var xmlevent = xmllist.children[j];
                var event = EU.xmlLoader.load_event_xml_node( xmlevent );
                EU.assert( event );
                this._events[listname].push( event );
            }
        }
    },
    loadParams: function( xmlnode )
    {
        for(var i=0; i < xmlnode.children.length; i++){
            var xmlparam = xmlnode.children[i];
            var name = xmlparam.tagName;
            var attr = xmlparam.getAttribute( "value" );
            var value = attr ? attr : xmlparam.text();
            this._params[name] = value;
        }
    },
    loadXmlEntity: function(tag, xmlnode )
    {
        if( tag == EU.k.xmlTag.ParamCollection )
        {
            this.loadParams( xmlnode );
        }
        return false;
    }
});


EU.LayerExt = cc.Layer.extend();
EU.LayerExt.implement(EU.NodeExt.prototype);
cc.extend(EU.LayerExt, function() {
    //DECLARE_BUILDER( LayerExt );
    this.ctor = function () {
    }
});

EU.NodeExt_ = cc.Node.extend();
cc.extend(EU.NodeExt_, cc.NodeExt);
cc.extend(EU.NodeExt_, function() {
    //DECLARE_BUILDER( NodeExt_ );
    this.init = function () { return true; }
});
