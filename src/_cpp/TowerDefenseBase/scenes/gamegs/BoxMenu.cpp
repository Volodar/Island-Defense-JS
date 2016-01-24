#include "BoxMenu.h"
#include "GameGS.h"
#include "UserData.h"
#include "ml/SmartScene.h"
#include "scenes/itemshop/ItemShop.h"
#include "Tutorial.h"
NS_CC_BEGIN





BoxMenu::BoxMenu()
: _selectedItem( 0 )
, _isItemSelected( false )
{}

BoxMenu::~BoxMenu()
{}

bool BoxMenu::init( const std::string & xml )
{
	do
	{
		CC_BREAK_IF( !Menu::init() );
		CC_BREAK_IF( !init_machine() );

		load( xml );

		displayCountItems();

		return true;
	}
	while( false );
	return false;
}

bool BoxMenu::init_machine()
{
	add_state(state_close, std::bind(&BoxMenu::callback_close, this)).set_string_name("close");
	add_state(state_open, std::bind(&BoxMenu::callback_open, this)).set_string_name("open");
	add_state(state_wait, std::bind(&BoxMenu::callback_wait, this)).set_string_name("wait");

	add_event( event_close );
	add_event( event_open );
	add_event( event_wait );
	add_event( event_cancel );

	FiniteState::Machine::state( state_close ).add_transition( event_open, state_open );
	FiniteState::Machine::state( state_open ).add_transition( event_close, state_close );
	FiniteState::Machine::state( state_open ).add_transition( event_wait, state_wait );
	FiniteState::Machine::state( state_wait ).add_transition( event_close, state_close );
	FiniteState::Machine::state( state_wait ).add_transition( event_cancel, state_open );

	FiniteState::Machine::state( state_close ).add_onDeactivateCallBack( std::bind( &BoxMenu::close_deactivate, this ) );

	start( state_close );

	return true;
}

void BoxMenu::onEnter()
{
	Menu::onEnter();
	displayCountItems();
}

bool BoxMenu::isItemSelected(){
	return _isItemSelected;
}

ccMenuCallback BoxMenu::get_callback_by_description( const std::string & name )
{	
	auto close = [this]( Ref* )mutable{ push_event( event_close ); process(); };
	auto open = [this]( Ref* )mutable{ push_event( event_open ); process(); };
	
	auto item = [this]( Ref*, unsigned index )mutable 
	{		
		if( _selectedItem != index )
		{
			_isItemSelected = true;
			push_event( event_cancel );
			process();

			_selectedItem = index; 			
			push_event(event_wait);
			TutorialManager::shared().dispatch("boxmenu_item_did_selected");
		}
		else
		{
			push_event( event_cancel ); 
		}
		process();
	};
	
	auto itemshop = [this]( Ref* )mutable 
	{
		auto shop = ItemShop::create();
		if( shop )
		{
			SmartScene * scene = dynamic_cast<SmartScene*>(getScene());
			scene->pushLayer( shop, true );
		}
	};


	if( name == "close" )
		return std::bind( close, std::placeholders::_1 );
	else if( name == "open" )
		return std::bind( open, std::placeholders::_1 );
	else if( name == "item1" )
		return std::bind( item, std::placeholders::_1, 1 );
	else if( name == "item2" )
		return std::bind( item, std::placeholders::_1, 2 );
	else if (name == "item3")
		return std::bind(item, std::placeholders::_1, 3);    	
	else if( name == "itemshop" )
		return std::bind( itemshop, std::placeholders::_1 );
	else
		return NodeExt::get_callback_by_description( name );
}

bool BoxMenu::onTouchBegan( Touch* touch, Event* event )
{
	auto state = current_state().get_name();
	switch( state )
	{
		case state_close:
			_isItemSelected = false;
			return Menu::onTouchBegan( touch, event );
		case state_open:
		{
			bool touchedItem = Menu::onTouchBegan( touch, event );
			bool autoclose = strToBool( getParamCollection().get( "autoclose", "false" ) );
			if( touchedItem == false && autoclose )
			{
				push_event( event_close );
				process();
			}
			return touchedItem;
		}
		case state_wait:
		{
			bool touchedItem = Menu::onTouchBegan( touch, event );
			if( touchedItem == false )
			{
				if( createItem( touch->getLocation() ) )
				{
					bool autoclose = strToBool( getParamCollection().get( "autoclose", "false" ) );
					if( autoclose )
					{
						push_event( event_close );
						process();
					}
					else
					{
						push_event( event_cancel );
						process();
					}
					TutorialManager::shared().dispatch( "boxmenu_item_did_created" );
				}
			}
			return touchedItem;
		}
	}
	return Menu::onTouchBegan( touch, event );
}

void BoxMenu::close(){ 
	push_event(event_close);
	process();
}

bool BoxMenu::createItem( const Point & location )
{
	assert( _selectedItem != 0 );
	if( _selectedItem > 0 )
	{
		std::string items[] = {
			"_laser",
			"_ice",
			"_dynamit",
		};
		auto point = GameGS::getInstance()->getMainLayer()->convertToNodeSpace( location );
		auto& board = GameGS::getInstance()->getGameBoard();
		auto item = board.createBonusItem( point, "bonusitem" + items[_selectedItem-1] );
		if( item )
		{
			UserData::shared().bonusitem_sub( _selectedItem, 1 );
			displayCountItems();
		}
		return item != nullptr;
	}
	return false;
}

void BoxMenu::displayCountItems()
{
	auto display = [this]( int index )
	{
		auto menuitem = getChildByName<MenuItem*>( "item" + intToStr( index ) );
		auto label = menuitem->getChildByName<Label*>( "count" );
		int count = UserData::shared().bonusitem_count( index );
		label->setString( intToStr( count ) );
		menuitem->setEnabled( count > 0 );
	};
	display( 1 );
	display( 2 );
	display( 3 );
}

void BoxMenu::callback_open()
{
	runEvent( "open2" );
	_selectedItem = 0;
}

void BoxMenu::callback_close()
{
	runEvent( "close" );
	TutorialManager::shared().dispatch( "boxmenu_did_close" );
}

void BoxMenu::callback_wait()
{
	assert( _selectedItem != 0 );
	runEvent( "item" + intToStr( _selectedItem ) );
}

void BoxMenu::close_deactivate()
{
	runEvent( "open" );
	TutorialManager::shared().dispatch( "boxmenu_did_open" );
}


NS_CC_END
