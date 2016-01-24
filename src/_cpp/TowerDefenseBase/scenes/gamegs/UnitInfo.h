#ifndef __UnitInfo_h__
#define __UnitInfo_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/NodeExt.h"
NS_CC_BEGIN





class UnitInfo : public Menu, public NodeExt
{
	DECLARE_BUILDER( UnitInfo );
	bool init( const std::string & unitName );
public:
protected:
	virtual ccMenuCallback get_callback_by_description( const std::string & name )override;
	void cb_click( Ref * );
private:
	std::string _unitName;
};




NS_CC_END
#endif // #ifndef UnitInfo