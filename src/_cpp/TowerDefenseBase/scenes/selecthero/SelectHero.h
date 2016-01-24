#ifndef __SelectHero_h__
#define __SelectHero_h__
#include "cocos2d.h"
#include "macroses.h"
#include "ml/NodeExt.h"
NS_CC_BEGIN





class SelectHero : public LayerExt
{
	DECLARE_BUILDER( SelectHero );
	bool init();
public:
	virtual void onEnter()override;
protected:
	virtual ccMenuCallback get_callback_by_description( const std::string & name )override;
	void fetch( unsigned index );
	void selectSkill( unsigned index );
	void reset();
	void train();
	void select();
	void buylevel();
	void appearance();
	void disappearance();
	void buyHero();
	void restore();

	unsigned getBuyLevelCost()const;
private:
	MenuItemPointer _itemHero[3];
	LabelPointer _level;
	ProgressTimerPointer _levelTimer;
	unsigned _currentHero;
	unsigned _currentSkill;
};




NS_CC_END
#endif // #ifndef SelectHero