//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __SmartScene_h__
#define __SmartScene_h__
#include "cocos2d.h"
#include "ml/macroses.h"
NS_CC_BEGIN





class SmartScene : public Scene
{
	DECLARE_BUILDER( SmartScene );
	bool init(LayerPointer mainlayer);
public:
	LayerPointer getMainLayer() { return _mainlayer; }
	void resetMainLayer( Layer* mainlayer );
	void shadow_appearance( int z = 1, unsigned opacity = 204 );
	void shadow_disappearance( );
	void pushLayer( Layer* layer, bool exitPrevios );
	void blockTopLayer( );
	void unblockTopLayer( );
	void on_layerClosed( Layer* layer );

	virtual void onExit();
protected:
private:
	LayerPointer _mainlayer;
	SpritePointer _shadow;
	bool _nowBlockedTopLayer;

	std::deque<LayerPointer> _stack;
};



NS_CC_END
#endif // #ifndef SmartScene