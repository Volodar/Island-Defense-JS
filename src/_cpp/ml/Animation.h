//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __Animation_h__
#define __Animation_h__
#include "cocos2d.h"
#include "stdio.h"

cocos2d::Animation* createAnimation(const std::string & path, int firstIndex, int lastIndex, const std::string & fileExt, float duration);
cocos2d::Animation* createAnimation(const std::string & path, std::vector<std::string> indexes, const std::string & fileExt, float duration);
cocos2d::Animation* createAnimation(std::vector<std::string> textures, float duration);

#endif