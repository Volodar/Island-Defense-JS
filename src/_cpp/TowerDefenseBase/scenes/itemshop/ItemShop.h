#ifndef __ItemShop_h__
#define __ItemShop_h__
#include "cocos2d.h"
#include "macroses.h"
#include "ml/NodeExt.h"
#include "ml/ScrollMenu.h"
NS_CC_BEGIN





class ItemShop : public ScrollMenu, public NodeExt
{
	DECLARE_BUILDER( ItemShop );
	bool init();
public:
protected:
	MenuItemPointer buildItem( const std::string & itemname );

	void cb_buy( Ref*, const std::string & itemname );
	void cb_info( Ref*, const std::string & itemname );
	void cb_close( Ref* );

	void fadeexit();
	void fadeenter();

	int getCost( const std::string & itemname );
	void runFly( const std::string & itemname );
private:
	float _scaleFactor;
	Point _zeroPosition;
	bool _removeScoreLayer;
};




NS_CC_END
#endif // #ifndef ItemShop