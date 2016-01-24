//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "IndicatorNode.h"
#include "cocos2d.h"
#include "ml/ImageManager.h"
#include "resources.h"
#include "consts.h"
NS_CC_BEGIN;

float IndicatorWidth(30);

IndicatorNode::IndicatorNode()
: _bg( nullptr )
, _progressNode(nullptr)
{
}

IndicatorNode::~IndicatorNode()
{}

bool IndicatorNode::init( )
{
	do
	{
		CC_BREAK_IF( !Node::init() );
		_bg = ImageManager::shared().sprite( "images/square.png" );
		_progressNode = ImageManager::sprite( "images/square.png" );
		CC_BREAK_IF( !_bg );
		CC_BREAK_IF( !_progressNode );

		_bg->setAnchorPoint( Point( 0.0f, 0.0f ) );
		_bg->setScale( IndicatorWidth, 4 );
		_bg->setColor( Color3B( 220, 0, 0 ) );

		_progressNode->setAnchorPoint( Point( 0.0f, 0.0f ) );
		_progressNode->setScale( IndicatorWidth, 4 );
		_progressNode->setColor( Color3B( 0, 192, 0 ) );

		addChild( _bg, -1 );
		addChild( _progressNode, 1 );

		setName( "health_indicator" );
		return true;
	}
	while( false );
	return false;
}

void IndicatorNode::setProgress(float progress)
{
	progress = std::min<float>( progress, 1 );
	progress = std::max<float>( progress, 0 );
	_progressNode->setScaleX( progress * IndicatorWidth );
}

NS_CC_END;