//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "MenuItemTextBG.h"
#include "resources.h"
#include "Log.h"
#include "ml/ImageManager.h"
#include "ml/ScrollMenu.h"
using namespace cocos2d;

int g_menuItemImageWithTextCount(0);

MenuItemTextBG * MenuItemTextBG::create(const std::string & text, cocos2d::Color4F colorBG, cocos2d::Color3B colorText, const ccMenuCallback& callback)
{
	__push_auto("MenuItemTextBG::create");
	MenuItemTextBG * ptr = new MenuItemTextBG;
	if ( ptr && ptr->initWithText(text, colorBG, colorText, callback) )
	{
		ptr->autorelease();
		return ptr;
	}
	CC_SAFE_DELETE(ptr);
	return nullptr;
}

bool MenuItemTextBG::initWithText(const std::string & text, cocos2d::Color4F colorBG, cocos2d::Color3B colorText, const ccMenuCallback& callback)
{
	__push_auto_check("MenuItemTextBG::initWithText");
	m_label = LabelTTF::create( text, "Arial", 16 );
	if ( !m_label )
		return false;
	if( !MenuItemLabel::initWithLabel( m_label, callback ) )
		return false;
	m_label->setColor( colorText );

	m_bg = ImageManager::sprite( kPathSpriteSquare );
	m_bg->setAnchorPoint( Point::ZERO );
	m_bg->setColor( Color3B( colorBG.r * 255, colorBG.g * 255, colorBG.b * 255 ) );
	m_bg->setOpacity( colorBG.a * 255 );
	addChild( m_bg, -1 );

	setText( text );
	return true;
}

void MenuItemTextBG::setBorders(float x, float y)
{
	__push_auto_check("MenuItemTextBG::setBorders");
	m_borders = Point(x, y);
}

void MenuItemTextBG::setText(const std::string & text )
{
	__push_auto_check("MenuItemTextBG::setText");
	m_label->setString( text );
	Size size = m_label->getContentSize();
	m_bg->setScale( size.width, size.height );
}

/*******************************************************************************************/