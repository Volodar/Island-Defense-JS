#ifndef __LandMine_h__
#define __LandMine_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "Unit.h"
NS_CC_BEGIN





class LandMine : public Unit
{
	DECLARE_BUILDER( LandMine );
	bool init( const std::string & path, const std::string & iniFile);
public:
protected:
private:
};




NS_CC_END
#endif // #ifndef LandMine