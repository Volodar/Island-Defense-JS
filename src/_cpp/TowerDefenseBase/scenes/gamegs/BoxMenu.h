#ifndef __BoxMenu_h__
#define __BoxMenu_h__
#include "cocos2d.h"
#include "macroses.h"
#include "ml/NodeExt.h"
#include "ml/FiniteStateMachine.h"
NS_CC_BEGIN





class BoxMenu : public Menu, public NodeExt, public FiniteState::Machine
{
	DECLARE_BUILDER( BoxMenu );
	bool init( const std::string & xml );
	bool init_machine();

	enum state
	{
		state_close = 0,
		state_open,
		state_wait,
	};
	enum event
	{
		event_open = 0,
		event_close,
		event_wait,
		event_cancel,
	};
public:
	virtual void onEnter()override;
	void close();
	bool isItemSelected();
protected:
	virtual ccMenuCallback get_callback_by_description( const std::string & name )override;
	virtual bool onTouchBegan( Touch* touch, Event* event )override;
	bool createItem( const Point & location );
	void displayCountItems();

	void callback_open();
	void callback_close();
	void callback_wait();

	void close_deactivate();


private:
	unsigned _selectedItem;
	bool _isItemSelected;
};




NS_CC_END
#endif // #ifndef BoxMenu