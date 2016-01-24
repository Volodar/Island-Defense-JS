//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "ml/MenuItemWithText.h"
#include "ml/ImageManager.h"
#include "ml/Audio/AudioEngine.h"
using namespace cocos2d;

const std::string kNameText( "text" );
const std::string kNameText2( "text2" );
const std::string kNameImageNormal( "normal" );
const std::string kNameImageSelected( "selected" );
const std::string kNameImageDisabled( "disabled" );

MenuItemImageWithText::MenuItemImageWithText()
: _imageNormal()
, _imageSelected()
, _imageDisabled()
, _font()
, _text()
, _font2()
, _text2()
, _sound()
, _useScaleEffectOnSelected( true )
, _onClick( nullptr )
, _labelNormal()
, _labelSelected()
, _labelDisabled()
, _labelNormal2()
, _labelSelected2()
, _labelDisabled2()

{}

MenuItemImageWithText::~MenuItemImageWithText()
{
	stopAllActions();
	removeAllChildrenWithCleanup( true );
}

MenuItemImageWithText::Pointer MenuItemImageWithText::create(
	const std::string & normalImage,
	const std::string & selectdImage,
	const std::string & disabledImage,
	const std::string & fontBMP,
	const std::string & text,
	const ccMenuCallback& callback )
{
	Pointer ptr = make_intrusive<MenuItemImageWithText>();
	if( ptr && ptr->initWithNormalImage( normalImage, selectdImage, disabledImage, fontBMP, text, callback ) )
		return ptr;
	ptr.reset( nullptr );
	return ptr;
}

MenuItemImageWithText::Pointer MenuItemImageWithText::create(
	const std::string & normalImage,
	const std::string & selectedImage,
	const std::string & fontBMP,
	const std::string & text,
	const ccMenuCallback & callback )
{
	return create( normalImage, selectedImage, normalImage, fontBMP, text, callback );
}

MenuItemImageWithText::Pointer MenuItemImageWithText::create(
	const std::string & normalImage,
	const std::string & selectedImage,
	const ccMenuCallback & callback )
{
	const std::string kEmpty;
	return create( normalImage, selectedImage, normalImage, kEmpty, kEmpty, callback );
}

MenuItemImageWithText::Pointer MenuItemImageWithText::create(
	const std::string & normalImage,
	const ccMenuCallback & callback )
{
	const std::string kEmpty;
	return create( normalImage, normalImage, kEmpty, kEmpty, kEmpty, callback );
}

MenuItemImageWithText::Pointer MenuItemImageWithText::create()
{
	const std::string kEmpty;
	return create( kEmpty, kEmpty, kEmpty, kEmpty, kEmpty, nullptr );
}

bool MenuItemImageWithText::initWithNormalImage(
	const std::string & normalImage,
	const std::string & selectedImage,
	const std::string & disabledImage,
	const std::string & fontBMP,
	const std::string & text,
	const ccMenuCallback& callback )
{
	MenuItemImage::initWithCallback( callback );
	setCallback( callback );
	NodeExt::init();

	setCascadeColorEnabled( true );
	setCascadeOpacityEnabled( true );

	setImageNormal( normalImage );
	setImageSelected( selectedImage );
	setImageDisabled( disabledImage );
	setFont( fontBMP );
	setText( text );

	return true;
}

void MenuItemImageWithText::setCallback( const ccMenuCallback& callback )
{
	auto base = std::bind( &MenuItemImageWithText::on_click, this, std::placeholders::_1 );
	MenuItem::setCallback( base );
	_onClick = callback;
}

void MenuItemImageWithText::setImageNormal( const std::string & imagefile )
{
	if( _imageNormal == imagefile )
		return;
	_imageNormal = imagefile;
	IntrusivePtr<Sprite> image = ImageManager::shared().sprite( _imageNormal );
	MenuItemImage::setNormalImage( image );
	image->setName( kNameImageNormal );
	locateImages();
}

void MenuItemImageWithText::setImageSelected( const std::string & imagefile )
{
	if( _imageSelected == imagefile )
		return;
	_imageSelected = imagefile;
	IntrusivePtr<Sprite> image = ImageManager::shared().sprite( imagefile );
	MenuItemImage::setSelectedImage( image );
	image->setName( kNameImageSelected );
	locateImages();
}

void MenuItemImageWithText::setImageDisabled( const std::string & imagefile )
{
	if( _imageDisabled == imagefile )
		return;
	_imageDisabled = imagefile;
	IntrusivePtr<Sprite> image = ImageManager::shared().sprite( imagefile );
	MenuItemImage::setDisabledImage( image );
	image->setName( kNameImageDisabled );
	locateImages();
}

void MenuItemImageWithText::setText( const std::string & string )
{
	if( _text == string )return;
	_text = string;
	buildText();
}

void MenuItemImageWithText::setFont( const std::string & fontfile )
{
	if( _font == fontfile )return;
	_font = fontfile;
	buildText();
}

void MenuItemImageWithText::buildText()
{
	if( _font.empty() || _text.empty() )
		return;
	auto allocate = [this]( LabelPointer& label, Node * parent )
	{
		assert( parent );

		Point center = Point( parent->getContentSize() / 2 );

		if( !label )
		{
			label.reset( Label::createWithBMFont( _font, _text ) );
			parent->addChild( label );
			label->setName( kNameText );
		}
		else
		{
			label->setBMFontFilePath( _font );
			label->setString( _text );
		}
		label->setPosition( center );
	};

	if( getNormalImage() )allocate( _labelNormal, getNormalImage() );
	if( getSelectedImage() )allocate( _labelSelected, getSelectedImage() );
	if( getDisabledImage() )allocate( _labelDisabled, getDisabledImage() );
}

void MenuItemImageWithText::setText2( const std::string & string )
{
    if( _text2 == string )return;
    _text2 = string;
    buildText2();
}

void MenuItemImageWithText::setFont2( const std::string & fontfile )
{
    if( _font2 == fontfile )return;
    _font2 = fontfile;
    buildText2();
}

void MenuItemImageWithText::buildText2()
{
    if( _font2.empty() || _text2.empty() )
        return;
    auto allocate = [this]( LabelPointer& label2, Node * parent )
    {
        assert( parent );
        
        Point center = Point( parent->getContentSize() / 2 );
        
        if( !label2 )
        {
            auto str = parent->getName();
			label2.reset( Label::createWithBMFont( _font2, _text2 ) );
            parent->addChild( label2 );
            label2->setName( kNameText2 );
            label2->setAnchorPoint(Point(0.5f, 0.5f));
        }
        else
        {
            label2->setBMFontFilePath( _font2 );
            label2->setString( _text2 );
        }
        label2->setPosition( center );
    };
    
    if( getNormalImage() )allocate( _labelNormal2, getNormalImage() );
    if( getSelectedImage() )allocate( _labelSelected2, getSelectedImage() );
    if( getDisabledImage() )allocate( _labelDisabled2, getDisabledImage() );
}

void MenuItemImageWithText::locateImages()
{
	if( !getNormalImage() )
		return;

	Point center = Point( getNormalImage()->getContentSize() / 2 );

	Node * node( nullptr );
	if( (node = getNormalImage()) )
	{
		node->setAnchorPoint( Point( 0.5f, 0.5f ) );
		node->setPosition( center );
		node->setCascadeColorEnabled( true );
		node->setCascadeOpacityEnabled( true );
	}
	if( (node = getSelectedImage()) )
	{
		node->setAnchorPoint( Point( 0.5f, 0.5f ) );
		node->setPosition( center );
		node->setCascadeColorEnabled( true );
		node->setCascadeOpacityEnabled( true );
	}
	if( (node = getDisabledImage()) )
	{
		node->setAnchorPoint( Point( 0.5f, 0.5f ) );
		node->setPosition( center );
		node->setCascadeColorEnabled( true );
		node->setCascadeOpacityEnabled( true );
	}
}

void MenuItemImageWithText::on_click( Ref*sender )
{
	if( _sound.empty() == false )
	{
		AudioEngine::shared().playEffect( _sound, false, 0 );
	}
	if( _onClick )
		_onClick( sender );
}

Rect MenuItemImageWithText::rect() const
{
	//MenuItem::rect();
	Rect result;
	result = Rect( _position.x, _position.y,
				 _contentSize.width, _contentSize.height );

	Node const* node = getNormalImage();
	if( node == nullptr )
		node = this;
	auto size = node->getContentSize();
	auto pos = getPosition();
	auto center = node->getAnchorPoint();
	result.origin = -Point( size.width * center.x, size.height * center.y );
	result.origin += pos;
	result.size = size;

	return result;
}

void MenuItemImageWithText::selected()
{
	MenuItemImage::selected();

	if( _useScaleEffectOnSelected )
	{
		int tag = 0x123;
		auto actionN = EaseIn::create( ScaleTo::create( 0.3f, 0.8f ), 2 );
		auto actionS = actionN->clone();
		actionN->setTag( tag );
		actionS->setTag( tag );
		if( getNormalImage() )
		{
			getNormalImage()->stopActionByTag( tag );
			getNormalImage()->runAction( actionN );
		}
		if( getSelectedImage() )
		{
			getSelectedImage()->stopActionByTag( tag );
			getSelectedImage()->runAction( actionS );
		}
	}
}

void MenuItemImageWithText::unselected()
{
	MenuItemImage::unselected();

	if( _useScaleEffectOnSelected )
	{
		int tag = 0x123;
		auto actionN = EaseIn::create( ScaleTo::create( 0.2f, 1.0f ), 2 );
		auto actionS = actionN->clone();
		actionN->setTag( tag );
		actionS->setTag( tag );
		if( getNormalImage() )
		{
			getNormalImage()->stopActionByTag( tag );
			getNormalImage()->runAction( actionN );
		}
		if( getSelectedImage() )
		{
			getSelectedImage()->stopActionByTag( tag );
			getSelectedImage()->runAction( actionS );
		}
	}
}

void MenuItemImageWithText::setEnabled( bool bEnabled )
{
	if( isEnabled() == bEnabled )
		return;

	MenuItemImage::setEnabled( bEnabled );
	switchAnimation();
}

void MenuItemImageWithText::onEnter()
{
	MenuItemImage::onEnter();
	switchAnimation();
}

void MenuItemImageWithText::onExit()
{
	MenuItemImage::onExit();
	switchAnimation();
}

void MenuItemImageWithText::setSound( const std::string sound )
{
	_sound = sound;
}

void MenuItemImageWithText::switchAnimation()
{
	return;
	//	stopActionByTag( kActionTagMenuItemImageWithText_Enabled );
	//
	//	if( isEnabled() )
	//	{
	//		float part = (CCRANDOM_MINUS1_1() * 0.1f + 1) / 2;
	//		float s = 1.05f + CCRANDOM_0_1() * 0.05f;
	//		float t0 = 1 * part;
	//		float t1 = 2 * part;
	//		float t2 = 1 * part;
	//
	//		auto a0 = ScaleTo::create( t0, 1 * s, 1 / s );
	//		auto a1 = ScaleTo::create( t1, 1 / s, 1 * s );
	//		auto a2 = ScaleTo::create( t2, 1, 1 );
	//		auto action = RepeatForever::create( Sequence::create( a0, a1, a2, nullptr ) );
	//		runAction( action );
	//		action->setTag( kActionTagMenuItemImageWithText_Enabled );
	//	}
}
