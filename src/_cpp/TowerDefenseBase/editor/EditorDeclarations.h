//
//  EditorDeclarations.h
//  JungleDefense
//
//  Created by Vladimir Tolmachev on 25.05.14.
//
//

#if EDITOR==1
#ifndef JungleDefense_EditorDeclarations_h
#define JungleDefense_EditorDeclarations_h
#include "configuration.h"

static auto kEditorLevelsMenuPosX = [](){ return cocos2d::k::configuration::LevelMapSize.width + 30; };
const int kEditorLevelsMenuPosY(750);

static auto kEditorLayersMenuPosX = [](){ return cocos2d::k::configuration::LevelMapSize.width + 150; };
const int kEditorLayersMenuPosY(750);
const int kEditorLayersMenuPosY_add(550);


#endif
#endif