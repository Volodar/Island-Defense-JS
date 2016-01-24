//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __ShopLayer_h__
#define __ShopLayer_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/ScrollMenu.h"
#include "inapp/Purchase.h"
#include "ml/ObServer.h"
#include "ml/NodeExt.h"
NS_CC_BEGIN

#if PC != 1
class ShopLayer : public ScrollMenu, public NodeExt
{
public:
	struct Params
	{
		Params()
		:showFreeFuel(false)
		,showFreeGold(false)
		,showLevelScores(false)
		,autoClosingOnPurchase(false)
		{}
		
		bool showFreeFuel;
		bool showFreeGold;
		bool showLevelScores;
		bool autoClosingOnPurchase;
	};
	/*
	 * first - type scores
	 * first - count
	 */
	typedef ObServer< ShopLayer, std::function<void()> > Observer_OnClose;
	typedef std::function<void( int, int )> FunctionOnBuy;
	typedef ObServer<ShopLayer, FunctionOnBuy> ObserverOnPurchase;
protected:
	DECLARE_BUILDER( ShopLayer );
	bool init( bool usefreeFuel, bool showFreeGold, bool asLevelScores, bool autoclose );
	bool init( const Params & params );
	bool loadDefaulParams();
public:
	Observer_OnClose& observerOnClose() { return _observerOnClose; }
	static ObserverOnPurchase& observerOnPurchase();
	void onKeyReleased( EventKeyboard::KeyCode keyCode, Event* event );

	static void request_answer( inapp::PurchaseResult result );
protected:
	MenuItemPointer buildItem( const std::string & id );
	//MenuItemPointer buildItemFreeFuel();
	void close( Ref*sender );

	void request( Ref * sender, const std::string & purchase );
	void show_video( Ref * sender );
	void show_video_started( bool success );
	void show_video_finished( bool successful );
	void show_video_gold( int reward );

	void details_ansfer( inapp::SkuDetails result );

	void push_details( inapp::SkuDetails result );
	void details_dispather( float dt );

	void _pause();
	void _resume();

	void fadeexit();
	void fadeenter();
private:
	float _scaleFactor;
	Point _zeroPosition;
	Observer_OnClose _observerOnClose;
	static ObserverOnPurchase _observerOnPurchase;
	std::map< std::string, unsigned> _itemsValue;
	std::map< std::string, std::string> _itemsDescDefault;


	std::queue<inapp::SkuDetails> _queueDetails;
	std::mutex _queueDetailsMutex;
	bool _autoClosing;
	LayerExt::Pointer _blockLayer;
};
#endif



NS_CC_END
#endif // #ifndef ShopLayer
