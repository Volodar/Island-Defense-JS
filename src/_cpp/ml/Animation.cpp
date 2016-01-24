//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "Animation.h"
#include <stdio.h>
#include "cocos2d.h"
#include <stdarg.h>
#include "ImageManager.h"
#include "ml/common.h"
using namespace cocos2d;

cocos2d::Animation* createAnimation(const std::string & path, int firstIndex, int lastIndex, const std::string & fileExt, float duration)
{
	auto buildIndex = [firstIndex, lastIndex]( int index )
	{
		std::string result = intToStr( index );
		auto numbers = std::max( intToStr( firstIndex ).size(), intToStr( lastIndex ).size() );
		while( result.size() < numbers )
		{
			result = "0" + result;
		}
		return result;
	};
	std::vector<std::string>indexes;
	if( lastIndex>=firstIndex )
	{
		for(int i=firstIndex; i<=lastIndex; ++i )
			indexes.push_back( buildIndex( i ) );
	}
	else
	{
		for(int i=lastIndex; i<=firstIndex; ++i )
			indexes.push_back( buildIndex( i ) );
		std::reverse(indexes.begin(), indexes.end());
	}
	return createAnimation(path, indexes, fileExt, duration);
}

Animation* createAnimation(const std::string & path, std::vector<std::string> indexes, const std::string & fileExt, float duration)
{
	std::vector<std::string> files;
	for( auto index : indexes )
	{
		files.push_back( path + index + fileExt );
	}
	return createAnimation( files, duration );
}

cocos2d::Animation* createAnimation(std::vector<std::string> textures, float duration)
{
	cocos2d::Vector<cocos2d::SpriteFrame*> frames;
	for( auto texturePath : textures )
	{
		auto frame = ImageManager::shared().spriteFrame( texturePath );
		if( frame )
		{
			frames.pushBack(frame );
			continue;
		}
		//
		cocos2d::Texture2D * texture = Director::getInstance()->getTextureCache()->addImage(texturePath);
		if(!texture)
		{
#if USE_CHEATS == 1
			std::string message = "cannot create animation. Path [" + texturePath + "].";
			log( "%s", message.c_str() );
			MessageBox( message.c_str(), "Animation not created" );
#endif
			continue;
		}
		cocos2d::Rect rect;
		rect.size = texture->getContentSize();

		frames.pushBack( cocos2d::SpriteFrame::create( texturePath.c_str(), rect) );
	}
	float delay = duration / frames.size();

	return cocos2d::Animation::createWithSpriteFrames(frames, delay);
}

//void computePointsByRadius(std::vector<cocos2d::Point> & out, float radius, unsigned countPoints, float startAngleInDegree)
//{
//	float delta = static_cast<float>(M_PI) * 2.0f / countPoints;
//	float startAngleInRadian = startAngleInDegree * static_cast<float>(M_PI) / 180.f;
//	out.resize(countPoints);
//	for( unsigned i=0; i<countPoints; ++i )
//	{
//		float angle = startAngleInRadian + delta * i;
//		out[i].x = radius * cos(angle);
//		out[i].y = radius * sin(angle);
//	}
//}