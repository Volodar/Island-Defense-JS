//Define namespace
var EU = EU || {};

EU.NodeExt = function(){

    /** For Test Instance of */
    this.__NodeExt = true;

    /** @type {map<EU.EventsList>} */
    this._events = {};
    /** @type {map<cc.Action>} */
    this._actions = {};
    /** @type {EU.ParamCollection} _params*/
    this._params = new EU.ParamCollection();
    this.as_node_ref= function()
    {
        return (this instanceof cc.Node ? this : null);
    };
    this.getChildByPath_str= function( path_names )
    {
        var self = this.as_node_ref();
        //TODO: EU.Common
        var result = self ? EU.Common.getNodeByPath( self, path_names ) : null;
        return result;
    };
    this.getChildByPath_arr= function(path_tags )
    {
        var self = this.as_node_ref();
        //TODO: EU.Common
        var result = self ? EU.Common.getNodeByTagsPath(self, path_tags) : null;
        return result;
    };
    this.getParamCollection= function()
    {
        return this._params;
    };
    /**
     * @param {String} path
     * @param {String} xmlFile
     */
    this.load_str_n_str= function( path, xmlFile )
    {
        var file = path;
        if( !EU.xmlLoader.stringIsEmpty(file) && file.substr(-1) != '/' )
            file += '/';
        file += xmlFile;
        this.load_str( file );
    };
    this.load_str= function(file )
    {
        if( EU.xmlLoader.stringIsEmpty(file)) return;
        var xmlnode = EU.pugixml.readXml( file);
        var root = xmlnode.firstElementChild;
        if( this.load_xmlnode2 )
            this.load_xmlnode2( root );
        else
            this.load_xmlnode(root);
    };
    this.load_xmlnode= function( root )
    {
        EU.xmlLoader.bookDirectory( this.as_node_ref() );
        EU.xmlLoader.load_node_xml_node( this.as_node_ref(), root, false );
        EU.xmlLoader.unbookDirectory();
    };
    this.runEvent= function( eventname )
    {
        var iter = this._events[eventname];
        if( iter != null )
        {
            iter.execute( this );
        }
        //else {
        //    var name = this.as_node_ref() ? EU.Node.prototype.getName.call(this) : "Not node inherited";
        //    //log_once( "NodeExt[%s]: event with name [%s] not dispatched", name.c_str( ), eventname.c_str( ) );
        //}
    };
    this.getAction= function( name )
    {
        var iter = this._actions[name];
        if( iter != null )
            return iter;
        return null;
    };
    this.setProperty_int= function( intproperty, value )
    {
        return false;
    };
    this.setProperty_str= function( stringproperty, value )
    {
        return false;
    };
    /**
     * @param {Element} xmlnode
     */
    this.loadActions= function( xmlnode )
    {
        for(var i=0; i < xmlnode.children.length; i++){
            var xmlaction = xmlnode.children[i];
            var actionname = xmlaction.getAttribute( "name" );
            var action = EU.xmlLoader.load_action_xml_node( xmlaction );
            EU.assert( action );
            this._actions[actionname] = action;
        }
    };
    /**  @param {Element} xmlnode */
    this.loadEvents= function(xmlnode )
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
    };
    /**  @param {Element} xmlnode */
    this.loadParams= function( xmlnode )
    {
        for(var i=0; i < xmlnode.children.length; i++){
            var xmlparam = xmlnode.children[i];
            var name = xmlparam.tagName;
            var attr = xmlparam.getAttribute( "value" );
            var value = attr ? attr : xmlparam.textContent;
            this._params.set(name, value);
        }
    };
    /**  @param {String} tag 
     * @param {Element} xmlnode */
    this.loadXmlEntity= function(tag, xmlnode )
    {
        if( tag == EU.xmlLoader.k.xmlTag.ParamCollection )
        {
            this.loadParams( xmlnode );
        }
        return false;
    }
};


EU.LayerExt = cc.Layer.extend();
EU.NodeExt.call(EU.LayerExt.prototype);

EU.NodeExt_ = cc.Node.extend();
EU.NodeExt.call(EU.NodeExt_.prototype);
