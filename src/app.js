//Define namespace
var EU = EU || {};

EU.HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        this._super();
        var size = cc.winSize;

        var bg = cc.Sprite.create("res/HelloWorld.png");
        this.addChild( bg );
        bg.setPosition( size.width / 2, size.height / 2 );

        //var xmlContent = EU.pugixml.readXml("res/_origin/ini/creeps.xml");

        this.tests();

        return true;
    },

    tests: function() {
        var pc = new EU.ParamCollection( "var1:value1,var2:value2" );
        pc.tolog();
    }

});

EU.HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new EU.HelloWorldLayer();
        this.addChild(layer);

    }
});

