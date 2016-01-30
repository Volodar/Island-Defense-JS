//Define namespace
var EU = EU || {};

EU.HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        this._super();
        var size = cc.winSize;

        this.tests();
        //var s = new cc.Sprite;
        //s.setTexture("res/HelloWorld.png");
        //this.addChild(s);

        return true;
    },

    tests: function() {
        var pc = new EU.ParamCollection( "var1:value1,var2:value2" );
        pc.tolog();

        var node = new cc.Node();
        EU.xmlLoader.load_node_n_str(node, "res/_origin/ini/maings/mainlayer.xml");
        this.addChild(node);

        /*
        var xmlnode = new EU.pugixml.readXml("res/tests.xml");
        var root = xmlnode.firstElementChild;
        var name = root.getAttribute( "name" );
        var type = root.getAttribute( "type" );
        cc.log( "type:" + type + ", name:" + name );
        var children = root.children;
        for( var i=0; i < children.length; ++i ){
            var xmlentity = children[i];
            var name = xmlentity.getAttribute( "name" );
            var type = xmlentity.getAttribute( "type" );
            cc.log( "type:" + type + ", name:" + name );
        }
        */
    }

});

EU.HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new EU.HelloWorldLayer();
        this.addChild(layer);

    }
});

