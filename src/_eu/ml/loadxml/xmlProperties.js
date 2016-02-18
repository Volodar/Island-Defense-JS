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

EU.xmlKey = {
    i: 0,
    Type: {name: "type", int: 0},
    Pos: {name: "pos", int: 1},
    Scale: {name: "scale", int: 2},
    Rotation: {name: "rotation", int: 3},
    Strech: {name: "strech", int: 4},
    Size: {name: "size", int: 5},
    Visible: {name: "visible", int: 6},
    LocalZ: {name: "z", int: 7},
    GlobalZ: {name: "globalzorder", int: 8},
    Center: {name: "center", int: 9},
    Tag: {name: "tag", int: 10},
    CascadeColor: {name: "cascadecolor", int: 11},
    CascadeOpacity: {name: "cascadeopacity", int: 12},
    Name: {name: "name", int: 13},
    Image: {name: "image", int: 14},
    Blending: {name: "blending", int: 15},
    Opacity: {name: "opacity", int: 16},
    Color: {name: "color", int: 17},
    Animation: {name: "animation", int: 18},
    ImageNormal: {name: "imageN", int: 19},
    ImageSelected: {name: "imageS", int: 20},
    ImageDisabled: {name: "imageD", int: 21},
    Text: {name: "text", int: 22},
    Font: {name: "font", int: 23},
    TextWidth: {name: "textwidth", int: 24},
    TextAlign: {name: "textalign", int: 25},
    MenuCallBack: {name: "callback", int: 26},
    ScaleEffect: {name: "scale_effect", int: 27},
    Sound: {name: "sound", int: 28},
    Path: {name: "path", int: 29},
    Template: {name: "template", int: 30},
    AlignCols: {name: "cols", int: 31},
    AlignStartPosition: {name: "alignstartpos", int: 32},
    GridSize: {name: "gridsize", int: 33},
    ScissorRect: {name: "scissorrect", int: 34},
    ScissorEnabled: {name: "scissorenabled", int: 35},
    ScrollEnabled: {name: "scrollenabled", int: 36},
    AllowScrollByX: {name: "allowscrollbyx", int: 37},
    AllowScrollByY: {name: "allowscrollbyy", int: 38},
    //ProgressTimer
    ProgressType: {name: "progresstype", int: 39},
    Percent: {name: "percent", int: 40},
    MidPoint: {name: "midpoint", int: 41},
    BarChangeRate: {name: "barchangerate", int: 42},
    Enabled: {name: "enabled", int: 43},
    Disabled: {name: "disabled", int: 44},

    //declare other properties as UserProperties + int constant
    UserProperties: {name: "", int: 100},
};
