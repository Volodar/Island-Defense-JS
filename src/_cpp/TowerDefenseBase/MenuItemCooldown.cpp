//
//  IslandDefense
//
//  Created by Vladimir Tolmachev� on 03.11.14.
//
//
#include "MenuItemCooldown.h"
#include "ml/Animation.h"
#include "ml/ImageManager.h"
#include "configuration.h"
NS_CC_BEGIN


MenuItemCooldown::MenuItemCooldown()
: _timer( nullptr )
, _action( nullptr )
, _duration(0)
, _cancelImage(nullptr)
{}

MenuItemCooldown::~MenuItemCooldown()
{}

bool MenuItemCooldown::init( const std::string & back, const std::string & forward, float duration, const ccMenuCallback & callback, const std::string & resourceCancel )
{
	std::string e;
	do
	{
		auto CB = callback ? callback : _callback;
		MenuItemImageWithText::initWithNormalImage( forward, "", back, e, e, CB );

		if( forward.empty() == false )
		{
			Sprite * image = ImageManager::sprite( forward );
			image->setOpacity( 92 );
			_timer = ProgressTimer::create( image );
			CC_BREAK_IF( !_timer );

			image->setAnchorPoint( Point::ANCHOR_BOTTOM_LEFT );
			_timer->setType( ProgressTimer::Type::BAR );
			_timer->setMidpoint( Point( 0.5f, 0 ) );
			_timer->setBarChangeRate( Point( 0, 1 ) );
			_timer->setAnchorPoint( Point::ANCHOR_BOTTOM_LEFT );
			_timer->setPercentage( 0 );
			getDisabledImage()->addChild( _timer, 1 );
			getDisabledImage()->setOpacity( 128 );
			_duration = duration;

			auto timer = ProgressFromTo::create( _duration, 0, 100 );
			auto disabler = CallFunc::create( [this](){setEnabled( false ); } );
			auto enabler = CallFunc::create( [this](){setEnabled( true ); } );
			auto call = CallFunc::create( [this](){onFull(); } );
			_action = Sequence::create( disabler, timer, enabler, call, nullptr );
		}

		if( _cancelImageResource != resourceCancel && resourceCancel.empty() == false )
		{
			_cancelImageResource = resourceCancel;
		}

		if (_cancelImageResource.empty() == false && getNormalImage())
		{
			if (_cancelImage)
				_cancelImage->removeFromParent();
		
			_cancelImage = ImageManager::sprite( _cancelImageResource );
			addChild( _cancelImage );

			_cancelImage->setAnchorPoint(Point(0.5f, 0.5f));
			_cancelImage->setPosition(Point(getNormalImage()->getContentSize() * 0.5f));
			_cancelImage->setCascadeColorEnabled(true);
			_cancelImage->setCascadeOpacityEnabled(true);
			_cancelImage->setVisible(false);

			//auto s1 = ScaleTo::create( 0.4f, 1.2f );
			//auto s2 = ScaleTo::create( 0.4f, 1.0f );
			//auto d = DelayTime::create( 1 );
			//auto s = Sequence::create( s1, s2, d, nullptr );
			//auto action = RepeatForever::create( EaseInOut::create( s, 0.5f ) );
			//_cancelImage->runAction( action );
		}

		return true;
	}
	while( false );
	return false;
}

void MenuItemCooldown::run( )
{
	showCancel( false );
	if( _timer )
		_timer->runAction( _action->clone() );
}

void MenuItemCooldown::stop()
{
	showCancel( false );
	if( _timer )
	{
		_timer->stopAllActions();
		_timer->setPercentage( 0 );
	}
	setEnabled( false );
}

void MenuItemCooldown::showCancel( bool mode )
{
	if( _cancelImage )
	{
		_cancelImage->setVisible( mode );
	}
	if (_normalImage && _timer )
	{
		_normalImage->setVisible( _timer->getPercentage() >= 100.f );
	}
}

void MenuItemCooldown::setAnimationOnFull( const std::string & animationFrame )
{
	_animationFrame = animationFrame;
}

void MenuItemCooldown::setPercentage( float percent )
{
	if( _timer )
		_timer->setPercentage( percent );
}

void MenuItemCooldown::on_click( Ref*sender )
{
	MenuItemImageWithText::on_click( sender );
}

void MenuItemCooldown::onFull( )
{
	if( _animationFrame.empty() )
		return;
	std::vector< std::string > frames;
	frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0001.png" );
	frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0002.png" );
	frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0003.png" );
	frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0004.png" );
	frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0005.png" );
	frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0006.png" );
	frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0007.png" );

    if (!k::configuration::desertBuild) {
    frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0008.png" );
	frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0009.png" );
	frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0010.png" );
	frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0011.png" );
	frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0012.png" );
	frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0013.png" );
	frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0014.png" );
	frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0015.png" );
	frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0016.png" );
	frames.push_back( "buttoln_skills::button_" + _animationFrame + "_0017.png" );
    }

	if( ImageManager::shared().spriteFrame( frames.front() ) == nullptr )
		return;

	auto sprite = ImageManager::sprite( frames.front() );

	auto animation = createAnimation( frames, 0.5f );
	auto animate = Animate::create( animation );
	auto remover = CallFunc::create( [sprite](){ sprite->removeFromParent(); } );
	auto action = Sequence::create( animate, remover, nullptr );

	sprite->runAction( action );
	getNormalImage()->addChild( sprite, 99 );
	sprite->setPosition( Point( getNormalImage()->getContentSize() / 2 ) + Point( 1.5f, -1.5f ) );
	
}

void MenuItemCooldown::selected()
{
	MenuItemImageWithText::selected();

	if (_useScaleEffectOnSelected)
	{
		int tag = 0x123;
		auto actionC = EaseIn::create(ScaleTo::create(0.3f, 0.8f), 2);
		actionC->setTag(tag);
		if (_cancelImage)
		{
			_cancelImage->stopActionByTag(tag);
			_cancelImage->runAction(actionC);
		}
	}
}

void MenuItemCooldown::unselected()
{
	MenuItemImageWithText::unselected();

	if (_useScaleEffectOnSelected)
	{
		int tag = 0x123;
		auto actionC = EaseIn::create(ScaleTo::create(0.2f, 1.0f), 2);
		actionC->setTag(tag);
		if (_cancelImage)
		{
			_cancelImage->stopActionByTag(tag);
			_cancelImage->runAction(actionC);
		}
	}
}

NS_CC_END
