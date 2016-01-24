//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "ml/SmartScene.h"
#include "ml/ImageManager.h"

NS_CC_BEGIN





SmartScene::SmartScene()
: _nowBlockedTopLayer( false )
{}

SmartScene::~SmartScene()
{}

bool SmartScene::init( LayerPointer mainlayer )
{
	auto dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();

	resetMainLayer( mainlayer );

	_shadow = ImageManager::sprite( "images/square.png" );
	_shadow->setName( "shadow" );
	_shadow->setScaleX( dessize.width );
	_shadow->setScaleY( dessize.height );
	_shadow->setColor( Color3B( 0, 0, 0 ) );
	_shadow->setOpacity( 0 );
	_shadow->setPosition( Point( dessize / 2 ) );
	addChild( _shadow, 1 );

	return true;
}

void SmartScene::onExit()
{
	while( _stack.size() > 1 )
	{
		auto layer = _stack.back();
		layer->onExit();
	}
	Scene::onExit();
}

void SmartScene::resetMainLayer( Layer* mainlayer )
{
	if( mainlayer == _mainlayer ) return;

	if( _mainlayer )
	{
		removeChild( _mainlayer );
		assert( _stack.size() == 1 );
		_stack.clear();
	}
	_mainlayer = mainlayer;
	if( _mainlayer )
	{
		addChild( _mainlayer, 0 );
		_stack.push_back( _mainlayer );
	}

}

void SmartScene::shadow_appearance( int z, unsigned opacity )
{
	_shadow->setLocalZOrder( z );
	_shadow->runAction( FadeTo::create( 0.2f, opacity ) );
}

void SmartScene::shadow_disappearance()
{
	_shadow->runAction( FadeTo::create( 0.2f, 0 ) );
}

void SmartScene::pushLayer( Layer* layer, bool exitPrevios )
{
	shadow_appearance();
	if( layer )
	{
		assert( _stack.empty() == false );
		auto top = _stack.back();
		int z = top->getLocalZOrder() + 2;
		_shadow->setLocalZOrder( z - 1 );

		layer->setOnExitCallback( std::bind( &SmartScene::on_layerClosed, this, layer ) );
		addChild( layer, z );

		_stack.push_back( layer );
		if( exitPrevios )
			top->onExit();
	}
}

void SmartScene::on_layerClosed( Layer* layer )
{
	if( _nowBlockedTopLayer )return;

	if( layer == _stack.back() )
	{
		assert( _stack.size() >= 2 );
		_stack.pop_back();
		_stack.back()->onEnter();
	}
	if( _stack.empty() == false )
	{
		auto top = _stack.back();
		_shadow->setLocalZOrder( top->getLocalZOrder() - 1 );
	}
	if( _stack.size() == 1 )
	{
		shadow_disappearance();
	}
	//removeChild( layer );
}

void SmartScene::blockTopLayer()
{
	if( _stack.empty() == false )
	{
		_nowBlockedTopLayer = true;
		auto top = _stack.back();
		assert( top->isRunning() );
		top->onExit();
		_shadow->setLocalZOrder( top->getLocalZOrder() + 1 );
	}
}

void SmartScene::unblockTopLayer()
{
	if( _stack.empty() == false )
	{
		auto top = _stack.back();
		//assert( top->isRunning() == false );
        if(top->isRunning() == false)
            top->onEnter();
		_shadow->setLocalZOrder( top->getLocalZOrder() - 1 );
		_nowBlockedTopLayer = false;
	}
}
NS_CC_END
