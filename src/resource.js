var res = {
    MainScene_json : "images/maings/title_20481536.jpg",
    MapBG : "images/map/Friendly_Map.jpg",
};

var g_resources = [];
for (var i in res) {
    var resRoot = "res/_origin/";
    g_resources.push( resRoot + res[i]);
}
