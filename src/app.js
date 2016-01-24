//Define namespace
var EU = EU || {};

EU.HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;

        var mainscene = ccs.load(res.MainScene_json);
        this.addChild(mainscene.node, 1);

        for (var i = 0; i < 16; i++) {
            var obj = new EU.Node();
            this.addChild(obj, 1);
            obj.setPosition(49+i%4*74, 400-Math.floor(i/4)*74)
        }

        var layer = new cc.LayerGradient(cc.color(0,0,0,255), cc.color(0x46,0x82,0xB4,255));
        this.addChild(layer, 0);
        /* you can create scene with following comment code instead of using csb file.
        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        var helloLabel = new cc.LabelTTF("Hello World", "Arial", 38);
        // position the label on the center of the screen
        helloLabel.x = size.width / 2;
        helloLabel.y = size.height / 2 + 200;
        // add the label as a child to this layer
        this.addChild(helloLabel, 5);

        // add "HelloWorld" splash screen"
        this.sprite = new cc.Sprite(res.HelloWorld_png);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2
        });
        this.addChild(this.sprite, 0);
        */

        return true;
    }
});

EU.Node = EU.CCSNode.extend({
    resFile:res.Node_json,
    ctor: function() {
        this._super();
    }
});

EU.HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new EU.HelloWorldLayer();
        this.addChild(layer);
    }
});

