var res = {
    MainScene_json : "images/maings/title_20481536.jpg",
    MapBG : "images/map/Friendly_Map.jpg",
    helvetica_fnt : "fonts/helvetica.fnt",
    helveticastoke_fnt : "fonts/helveticastoke.fnt",
    mdefensefont2_fnt : "fonts/mdefensefont2.fnt",
    mdefensefont_fnt : "fonts/mdefensefont.fnt",
    titlefont_fnt : "fonts/titlefont.fnt",
    whitefont1_fnt : "fonts/whitefont1.fnt",
    choose_png : "images/map/choose.png",
    choose : "images/map/choose.plist",
    map1 : "images/maps/map1.jpg",
    map2 : "images/maps/map2.jpg",
    map3 : "images/maps/map3.jpg",
    itemshop_bg : "images/itemshop/1136.png",
    itemshop_item : "images/laboratory/ui_panel1.png",
};

var g_resources = [];
for (var i in res) {
    var resRoot = "res/_origin/";
    g_resources.push( resRoot + res[i]);
}
