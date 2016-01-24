#ifndef __BuyHeroes_h__
#define __BuyHeroes_h__
#include "cocos2d.h"
#include "macroses.h"
#include "ml/NodeExt.h"
#include "inapp/purchase.h"
NS_CC_BEGIN





class BuyHeroes : public LayerExt
{
	DECLARE_BUILDER( BuyHeroes );
	bool init();
public:
protected:
	virtual ccMenuCallback get_callback_by_description( const std::string & name )override;
	void buy();
	void openstore();
private:
	inapp::SkuDetails _details;
};

class BuyHeroMenu : public Menu, public NodeExt
{
	DECLARE_BUILDER( BuyHeroMenu );
	bool init();
public:
	static bool isShow();
protected:
	virtual ccMenuCallback get_callback_by_description( const std::string & name )override;
	void openPromo(Ref*);

	void update(float dt);
private:
	static time_t _duration;
	time_t _timestamp;
};


NS_CC_END
#endif // #ifndef SelectHero