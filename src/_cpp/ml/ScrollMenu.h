//
//  MapLayer.h
//  Strategy
//
//  Created by Vladimir Tolmachev on 27.06.14.
//
//
#ifndef __ScrollMenu_h__
#define __ScrollMenu_h__

#include "cocos2d.h"
#include "ml/macroses.h"
#include <map>
#include "Scissor.h"
#include "ml/common.h"
#include "MenuItemWithText.h"

NS_CC_BEGIN;

class ScrollMenu : public Scissor<Layer>
{
	DECLARE_BUILDER( ScrollMenu );
	bool init();
public:
	bool onTouchBegan( Touch*, Event* );
	void onTouchEnded( Touch*, Event* );
	void onTouchMoved( Touch*, Event* );
	void onTouchCancelled( Touch*, Event* );

	void setEnabled( bool var );
	bool isEnabled()const;

	void setTouchEnabled( bool var );
	bool isTouchEnabled( )const;
	void setScrollEnabled( bool var );
	bool isScrollEnabled( )const;

	mlMenuItem::Pointer push(
		const std::string & normalImage,
		const std::string & selectedImage,
		const std::string & disabledImage,
		const std::string & fontBMP,
		const std::string & text,
		const ccMenuCallback & callback );

	mlMenuItem::Pointer push(
		const std::string & normalImage,
		const std::string & selectedImage,
		const std::string & fontBMP,
		const std::string & text,
		const ccMenuCallback & callback );

	mlMenuItem::Pointer push(
		const std::string & normalImage,
		const std::string & selectedImage,
		const ccMenuCallback & callback );

	mlMenuItem::Pointer push(
		const std::string & normalImage,
		const ccMenuCallback & callback );

	void addItem( MenuItemPointer item );
	void removeItem( MenuItemPointer item );
	void removeAllItems();

	virtual Node* getChildByName( const std::string& name ) const override;

	void align( int cols );
public:
	size_t getItemsCount( )const;
	MenuItem* getItem( unsigned index );
	const MenuItem* getItem( unsigned index )const;
	MenuItem* getItemByName( const std::string & name );
	const MenuItem* getItemByName( const std::string & name )const;

private:
	MenuItem* getItemForTouch( Touch *touch );

	void scrollBegan( Touch* );
	void scrollMoved( Touch* );
	void scrollEnded( Touch* );
	void scrollCanceled( Touch* );

	Point fitPosition( const Point & pos );
	Point fitPositionByGrid( const Point & pos );

	void select( MenuItem * item );
	void unselect( MenuItem * item );
	void activate( MenuItem * item );

private:
	bool _touchEnabled;
	bool _scrollEnabled;

	MenuItemPointer _selected;
	MenuItemPointer _selectedOnTouchBegan;
	std::vector<MenuItemPointer> _items;

	bool _scrolled;
	Point _scrollAreaPos;

	CC_PROPERTY_PASS_BY_REF( int, _alignedCols, AlignedColums );

	CC_SYNTHESIZE( bool, _allowScrollX, AllowScrollByX );
	CC_SYNTHESIZE( bool, _allowScrollY, AllowScrollByY );

	CC_SYNTHESIZE_PASS_BY_REF( Size, _gridSize, GrisSize );
	CC_SYNTHESIZE_PASS_BY_REF( Point, _alignedStartPosition, AlignedStartPosition );

};

NS_CC_END;
#endif