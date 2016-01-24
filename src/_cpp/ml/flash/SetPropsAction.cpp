#include "SetPropsAction.h"

CCSetFrame::CCSetFrame()
	: CCActionInstant()
	, frame(NULL)
{
}

CCSetFrame::~CCSetFrame()
{
	if (frame)
	{
		frame->release();
		frame = NULL;
	}
}

CCSetFrame* CCSetFrame::actionWithSpriteFrame(CCSpriteFrame* _frame)
{
	CCSetFrame* setFrame = new CCSetFrame();
	setFrame->initWithSpriteFrame(_frame);
	setFrame->autorelease();
	
	return setFrame;
}

CCSetFrame* CCSetFrame::initWithSpriteFrame(CCSpriteFrame* _frame)
{
	frame = _frame;
	frame->retain();

	return this;
}

void CCSetFrame::startWithTarget(CCNode *pTarget)
{
	CCActionInstant::startWithTarget(pTarget);
	CCSprite* sprite = dynamic_cast<CCSprite*>(pTarget);
	if (sprite)
		sprite->setDisplayFrame(frame);
}

CCSetProps::CCSetProps()
	: CCActionInstant()
{}

CCSetProps::~CCSetProps()
{
}

CCSetProps* CCSetProps::actionWithPosition(CCPoint _position, float _rotation, float _scaleX, float _scaleY, CCPoint _anchorPoint)
{
	CCSetProps* setProps = new CCSetProps();
	setProps->initWithPosition(_position, _rotation, _scaleX, _scaleY, _anchorPoint);
	setProps->autorelease();
	
	return setProps;
}

CCSetProps* CCSetProps::initWithPosition(CCPoint _position, float _rotation, float _scaleX, float _scaleY, CCPoint _anchorPoint)
{
	position = _position;
	rotation = _rotation;
	scaleX = _scaleX;
	scaleY = _scaleY;
	anchorPoint = _anchorPoint;
	
	return this;
}

void CCSetProps::startWithTarget(CCNode* pTarget)
{
	CCActionInstant::startWithTarget(pTarget);
	CCSprite* sprite = dynamic_cast<CCSprite*>(pTarget);
	if (sprite)
	{
		sprite->setPosition(position);
		sprite->setRotation(rotation);
		sprite->setScaleX(scaleX);
		sprite->setScaleY(scaleY);
		sprite->setAnchorPoint(anchorPoint);
	}
}