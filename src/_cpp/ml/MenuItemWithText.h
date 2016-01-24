//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __MenuItemImageWithText_h__
#define __MenuItemImageWithText_h__
#include "ml/macroses.h"
#include "NodeExt.h"

NS_CC_BEGIN;

class MenuItemImageWithText : public MenuItemImage, public NodeExt
{
	DECLARE_POINTER(MenuItemImageWithText)

	bool initWithNormalImage(
		 const std::string & normalImage,
		 const std::string & selectedImage,
		 const std::string & disabledImage,
		 const std::string & fontBMP,
		 const std::string & text,
		 const ccMenuCallback& callback);
public:
	static Pointer create(
		const std::string & normalImage,
		const std::string & selectedImage,
		const std::string & disabledImage,
		const std::string & fontBMP,
		const std::string & text,
		const ccMenuCallback & callback );

	static Pointer create(
		const std::string & normalImage,
		const std::string & selectedImage,
		const std::string & fontBMP,
		const std::string & text,
		const ccMenuCallback & callback );

	static Pointer create(
		const std::string & normalImage,
		const std::string & selectedImage,
		const ccMenuCallback & callback );

	static Pointer create(
		const std::string & normalImage,
		const ccMenuCallback & callback );
	static Pointer create();

public:
	virtual Rect rect() const;

    virtual void selected();
    virtual void unselected();
    virtual void setEnabled(bool bEnabled);

	virtual void onEnter();
	virtual void onExit();

	virtual void setCallback( const ccMenuCallback& callback );
	void setImageNormal( const std::string & imagefile );
	void setImageSelected( const std::string & imagefile );
	void setImageDisabled( const std::string & imagefile );
	void setText( const std::string & string );
	void setFont( const std::string & fontfile );
    void setText2( const std::string & string );
    void setFont2( const std::string & fontfile );

	void setSound( const std::string sound );
	void useScaleEffect( bool mode ) { _useScaleEffectOnSelected = mode; }
protected:
	bool _useScaleEffectOnSelected;

	void switchAnimation();
	void buildText();
    void buildText2();
    void locateImages();
	virtual void on_click( Ref*sender );
private:
	std::string _imageNormal;
	std::string _imageSelected;
	std::string _imageDisabled;
	std::string _font;
	std::string _text;
    std::string _font2;
    std::string _text2;

    std::string _sound;

	
	ccMenuCallback _onClick;
	CC_SYNTHESIZE(IntrusivePtr<Label>, _labelNormal,   LabelNormal);
	CC_SYNTHESIZE(IntrusivePtr<Label>, _labelSelected, LabelSelected);
	CC_SYNTHESIZE(IntrusivePtr<Label>, _labelDisabled, LabelDisabled);
    CC_SYNTHESIZE(IntrusivePtr<Label>, _labelNormal2,   LabelNormal2);
    CC_SYNTHESIZE(IntrusivePtr<Label>, _labelSelected2, LabelSelected2);
    CC_SYNTHESIZE(IntrusivePtr<Label>, _labelDisabled2, LabelDisabled2);

};

inline ActionInterval * actionMenuItemEnabled( float scalefactor = 1 )
{
	float scale = 1.f - 0.02f * scalefactor;
	
	ActionInterval * action =
	RepeatForever::create(
	Sequence::create(
		EaseInOut::create(ScaleTo::create(0.5f + CCRANDOM_MINUS1_1() * 0.1f, scale), 1.5),
		EaseInOut::create(ScaleTo::create(0.5f + CCRANDOM_MINUS1_1() * 0.1f, 1.00f), 1.5), nullptr
		) );
	return action;
}

typedef MenuItemImageWithText mlMenuItem;

NS_CC_END;

#endif
