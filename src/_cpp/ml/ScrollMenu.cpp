//
//  ScrollMenu.cpp
//  Strategy
//
//  Created by Vladimir Tolmachev on 27.06.14.
//
//

#include "ScrollMenu.h"
#include "ml/common.h"
NS_CC_BEGIN;
ScrollMenu::ScrollMenu()
: _touchEnabled( false )
, _scrollEnabled( false )
, _selected( nullptr )
, _selectedOnTouchBegan( nullptr )
, _scrolled( false )
, _alignedCols(99999)
, _allowScrollX( true )
, _allowScrollY( true )
{}

ScrollMenu::~ScrollMenu()
{}

bool ScrollMenu::init()
{
	bool result( true );

	auto size = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
	setContentSize( size );
	setScissorRect( Point::ZERO, size );
	setScissorEnabled( false );
	setTouchEnabled( true );
	setScrollEnabled( false );

	return result;
};

bool ScrollMenu::isTouchEnabled()const
{
	return _touchEnabled;
}

void ScrollMenu::setEnabled( bool var )
{
	setTouchEnabled( var );
}

bool ScrollMenu::isEnabled( )const
{
	return isTouchEnabled();
}

void ScrollMenu::setTouchEnabled( bool var )
{
	if( _touchEnabled == var )
		return;

	_touchEnabled = var;

	auto touchListener = EventListenerTouchOneByOne::create();
	touchListener->onTouchBegan = CC_CALLBACK_2( ScrollMenu::onTouchBegan, this );
	touchListener->onTouchMoved = CC_CALLBACK_2( ScrollMenu::onTouchMoved, this );
	touchListener->onTouchEnded = CC_CALLBACK_2( ScrollMenu::onTouchEnded, this );
	touchListener->onTouchCancelled = CC_CALLBACK_2( ScrollMenu::onTouchCancelled, this );
	touchListener->setSwallowTouches( true );
	_eventDispatcher->addEventListenerWithSceneGraphPriority( touchListener, this );

}

bool ScrollMenu::isScrollEnabled( )const
{
	return _scrollEnabled;
}

void ScrollMenu::setScrollEnabled( bool var )
{
	_scrollEnabled = var;
}

bool ScrollMenu::onTouchBegan( Touch * touch, Event* )
{
	if( _touchEnabled == false ) return false;
	Node * node = this;
	while( node )
	{
		if( node->isVisible() == false ) return false;
		node = node->getParent();
	}

	_selectedOnTouchBegan = getItemForTouch( touch );
	if( _selectedOnTouchBegan )
		select( _selectedOnTouchBegan );

	if( _scrollEnabled )
	{
		Vec2 pointLocal = convertToNodeSpace( touch->getLocation() );
		return checkTouchInScissorArea( pointLocal );
	}
	return _selectedOnTouchBegan != nullptr;
}

void ScrollMenu::onTouchEnded( Touch * touch, Event* )
{
	if( _touchEnabled == false ) return;
	if( _scrollEnabled && _scrolled )
	{
		scrollEnded( touch );
	}
	auto item = getItemForTouch( touch );
	if( item && item == _selectedOnTouchBegan )
	{
		activate( _selectedOnTouchBegan );
	}
	_selectedOnTouchBegan = _selected = nullptr;
}

void ScrollMenu::onTouchMoved( Touch * touch, Event* )
{
	if( _touchEnabled == false ) return;
	if( _scrollEnabled )
	{
		if( _scrolled )
		{
			scrollMoved( touch );
		}
		else
		{
			auto length = (touch->getStartLocation() - touch->getLocation()).getLength();
			if( length > 5 )
			{
				scrollBegan( touch );
				unselect( _selectedOnTouchBegan );
				_selectedOnTouchBegan = nullptr;
			}
		}
	}

	auto item = getItemForTouch( touch );
	if( item != _selected )
	{
		unselect( _selected );
	}
	if( item && _selected == nullptr && item == _selectedOnTouchBegan )
	{
		select( _selectedOnTouchBegan );
	}
}

void ScrollMenu::onTouchCancelled( Touch * touch, Event* )
{
	if( _scrollEnabled && _scrolled )
	{
		scrollCanceled( touch );
	}
	unselect( _selectedOnTouchBegan );
}

void ScrollMenu::scrollBegan( Touch*touch )
{
	assert( _scrollEnabled );
	_scrolled = true;
}

void ScrollMenu::scrollMoved( Touch*touch )
{
	assert( _scrollEnabled );
	Point point = touch->getLocation( );
	Point shift = touch->getDelta();

	Point newPos = _scrollAreaPos + shift;
	newPos = fitPosition( newPos );

	shift = newPos - _scrollAreaPos;
	_scrollAreaPos = newPos;
	for( auto& child : getChildren() )
	{
		auto pos = child->getPosition( );
		pos.x += _allowScrollX ? shift.x : 0;
		pos.y += _allowScrollY ? shift.y : 0;
		child->setPosition( pos );
	}
}

void ScrollMenu::scrollEnded( Touch*touch )
{
	assert( _scrollEnabled );
	auto pos = fitPositionByGrid( _scrollAreaPos );
	Point shift = pos - _scrollAreaPos;

	for( auto child : getChildren() )
	{
		auto to = child->getPosition( ) + shift;
		auto action = EaseBackOut::create( MoveTo::create( 0.2f, to ) );
		child->runAction( action );
	}
	_scrollAreaPos = pos;
	_scrolled = false;
}

void ScrollMenu::scrollCanceled( Touch*touch )
{
	assert( _scrollEnabled );
	scrollEnded( touch );
}

Point ScrollMenu::fitPosition( const Point & pos )
{
	Point result = pos;
	auto scissorSize = getScissorRect().size;
	auto contentSize = getContentSize();

	bool right( true );
	right = _allowScrollX ? _gridSize.width > 0 : right;
	right = _allowScrollY ? _gridSize.height > 0 : right;

	if( right )
	{
		Point min = Point( scissorSize - contentSize );
		result.x = std::max( min.x, result.x );
		result.x = std::min( 0.f, result.x );
		result.y = std::max( min.y, result.y );
		result.y = std::min( 0.f, result.y );
	}
	else
	{
		Point max = Point( scissorSize - contentSize );
		max.y = -max.y;
		result.x = std::min( max.x, result.x );
		result.x = std::max( 0.f, result.x );
		result.y = std::min( max.y, result.y );
		result.y = std::max( 0.f, result.y );
	}
	return result;
}

Point ScrollMenu::fitPositionByGrid( const Point & pos )
{
	Point result = _scrollAreaPos;
	if( _gridSize.width != 0 && _allowScrollX )
	{
		assert( _gridSize.width != 0 );
		if( result.x != getScissorRect().size.width - getContentSize().width )
		{
			int i = (int)((-_scrollAreaPos.x / _gridSize.width) + 0.5f);
			result.x = -(_gridSize.width * i);
		}
	}
	if( _gridSize.height != 0 && _allowScrollY )
	{
		assert( _gridSize.height != 0 );
		auto y = getScissorRect().size.height - getContentSize().height;
		y = _gridSize.height < 0 ? -y : y;
		if( result.y != y )
		{
			int i = (int)((-_scrollAreaPos.y / _gridSize.height) + 0.5f);
			result.y = -(_gridSize.height * i);
		}
	}
	return fitPosition( result );
}


void ScrollMenu::select( MenuItem * item )
{
	assert( _selected == nullptr || _selected.ptr( ) == item );
	unselect( _selected );
	_selected = item;
	if( _selected )
		_selected->selected();
}

void ScrollMenu::unselect( MenuItem * item )
{
	//	assert(_selected == item);
	if( item )
		item->unselected();
	_selected = nullptr;
}

void ScrollMenu::activate( MenuItem * item )
{
    if(_selected.ptr() != item || item == nullptr )
        return;
	assert( _selected.ptr() == item && item != nullptr );
	unselect( _selected );
	if( item )
		item->activate();
}

size_t ScrollMenu::getItemsCount()const
{
	return _items.size();
}

MenuItem* ScrollMenu::getItem( unsigned index )
{
	return _items[index];
}

const MenuItem* ScrollMenu::getItem( unsigned index )const
{
	return _items[index];
}

MenuItem* ScrollMenu::getItemByName( const std::string & name )
{
	int index( 0 );
	for( auto & item : _items )
	{
		if( item->getName() == name )
			return item; 
		++index;
	}
	return nullptr;
}

const MenuItem* ScrollMenu::getItemByName( const std::string & name )const
{
	for( auto & item : _items )
	{ if( item->getName() == name )return item; }
	return nullptr;
}

MenuItem* ScrollMenu::getItemForTouch( Touch *touch )
{
	Vec2 point = touch->getLocation();
	Vec2 pointLocal = convertToNodeSpace( point );

	if( _scrollEnabled && checkTouchInScissorArea( pointLocal ) == false )
		return nullptr;

	for( auto iter = _items.rbegin( ); iter != _items.rend( ); ++iter )
	{
		if( *iter )
		{
			bool check = checkPointInNode( *iter, pointLocal );
			if( check ) return *iter;
		}
	}
	return nullptr;
}

mlMenuItem::Pointer ScrollMenu::push(
	const std::string & normalImage,
	const std::string & selectedImage,
	const std::string & disabledImage,
	const std::string & fontBMP,
	const std::string & text,
	const ccMenuCallback & callback )
{
	auto item = mlMenuItem::create( normalImage, selectedImage, disabledImage, fontBMP, text, callback );
	addItem( item );

	return item;
}

void ScrollMenu::addItem( MenuItemPointer item )
{
	addChild( item );
	_items.push_back( item );
}

//void removeItem( MenuItemPointer item );
void ScrollMenu::removeAllItems( )
{
	for( auto & item : _items )
		item->removeFromParent();
	_items.clear();
}

mlMenuItem::Pointer ScrollMenu::push(
	const std::string & normalImage,
	const std::string & selectedImage,
	const std::string & fontBMP,
	const std::string & text,
	const ccMenuCallback & callback )
{
	return push( normalImage, selectedImage, normalImage, fontBMP, text, callback );
}


mlMenuItem::Pointer ScrollMenu::push(
	const std::string & normalImage,
	const std::string & selectedImage,
	const ccMenuCallback & callback )
{
	return push( normalImage, selectedImage, normalImage, "", "", callback );
}


mlMenuItem::Pointer ScrollMenu::push(
	const std::string & normalImage,
	const ccMenuCallback & callback )
{
	return push( normalImage, normalImage, normalImage, "", "", callback );
}

Node* ScrollMenu::getChildByName( const std::string& name ) const
{
	Vector<Node*> children = getChildren();
	for( auto &item : Node::getChildren() )
		children.pushBack( item);
	for( auto child : children )
	{
		if( child->getName() == name )
			return child;
	}
	return nullptr;
}

void ScrollMenu::align( int cols )
{
	if( _gridSize.width == 0 && _gridSize.height == 0 )
		return;
	setAlignedColums( cols );
	int index( 0 );
	float width0( 0 );
	float width1( 0 );
	float height0( 0 );
	float height1( 0 );
	for( auto& item : _items )
	{
		int row = index / cols;
		int col = index % cols;
		Point pos;
		pos.x = float( col ) * _gridSize.width + _gridSize.width / 2;
		pos.y = float( row ) * _gridSize.height + _gridSize.height / 2;
		pos += _alignedStartPosition;

		width0 = std::max( width0, pos.x + item->getContentSize().width * item->getAnchorPoint().x );
		height0 = std::max( height0, pos.y + item->getContentSize().height * item->getAnchorPoint().y );
		width1 = std::min( width1, pos.x - item->getContentSize().width * item->getAnchorPoint().x );
		height1 = std::min( height1, pos.y - item->getContentSize().height * item->getAnchorPoint().y );

		item->setPosition( pos );
		++index;
	}
	setContentSize( Size( std::fabs( width1 - width0 ), std::fabs( height1 - height0 ) ) );
}

void ScrollMenu::setAlignedColums( const int &count )
{
	_alignedCols = count;
}

const int& ScrollMenu::getAlignedColums( )const
{
	return _alignedCols;
}

NS_CC_END;