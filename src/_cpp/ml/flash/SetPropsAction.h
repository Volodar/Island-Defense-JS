#ifndef __SETPROPSACTION_H__
#define __SETPROPSACTION_H__

#include "cocos2d.h"

using namespace cocos2d;

struct CCSetFrame : public CCActionInstant
{
						CCSetFrame();
	virtual			   ~CCSetFrame();

	static CCSetFrame*	actionWithSpriteFrame(CCSpriteFrame* _frame);

	CCSetFrame*			initWithSpriteFrame(CCSpriteFrame* _frame);

	virtual void		startWithTarget(CCNode* pTarget);

protected:
	CCSpriteFrame*		frame;
};

struct CCSetProps : public CCActionInstant
{
						CCSetProps();
	virtual			   ~CCSetProps();

	static CCSetProps*	actionWithPosition(CCPoint _position, float _rotation, float _scaleX, float _scaleY, CCPoint _anchorPoint);
	CCSetProps*			initWithPosition(CCPoint _position, float _rotation, float _scaleX, float _scaleY, CCPoint _anchorPoint);

	virtual void		startWithTarget(CCNode* pTarget);

protected:
	CCPoint				position;
	float				rotation;
	float				scaleX;
	float				scaleY;
	CCPoint				anchorPoint;
};
#endif