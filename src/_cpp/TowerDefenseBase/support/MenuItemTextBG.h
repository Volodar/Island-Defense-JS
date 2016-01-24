//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __MENU_ITEM_TEXTBG__
#define __MENU_ITEM_TEXTBG__

#include "cocos2d.h"
#pragma warning (disable : 4996)

NS_CC_BEGIN;

class MenuItemTextBG : public MenuItemLabel
{
public:
	static MenuItemTextBG * create(const std::string & text, Color4F colorBG, Color3B colorText, const ccMenuCallback& callback);
	bool initWithText(const std::string & text, Color4F colorBG, Color3B colorText, const ccMenuCallback& callback);
	void setBorders(float x, float y);
	void setText(const std::string & text );
	//virtual void visit();
protected:
	Color4F m_bgColor;
	CC_SYNTHESIZE_READONLY( LabelTTF *, m_label, Label ) ;
	Point m_borders;
	CC_SYNTHESIZE_READONLY( Sprite *, m_bg, BG );
};

NS_CC_END;

#endif