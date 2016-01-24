#ifndef __ANIMATOR_H__
#define __ANIMATOR_H__

#include "cocos2d.h"

using namespace cocos2d;

class Animator : public CCObject
{
public:
						Animator();
	virtual			   ~Animator();

	static Animator*	animationFromFile(const char* fileName);
	Animator*			initAnimationsFromFile(const char* fileName);
	CCActionInterval*	getAnimationByName(const char* name);

protected:

	inline std::string valueForKey( const char *key, const std::map<std::string, std::string> & dict )
	{
		auto iter = dict.find( key );
		if( iter != dict.end() )
			return iter->second.c_str();
		return "";
	}
private:
	std::map<std::string, CCObject*>	_animations;
};

#endif