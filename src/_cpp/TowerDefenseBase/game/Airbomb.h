#ifndef __Airbomb_h__
#define __Airbomb_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "Unit.h"
#include "effects.h"
NS_CC_BEGIN





class Airbomb : public Unit
{
protected:
	DECLARE_BUILDER( Airbomb );
	bool init( const std::string & path, const std::string & xmlFile, const Point & position );
public:
protected:
	void explosion( const Point & position );
	void die();
private:
	Point _targetPoint;
};




NS_CC_END
#endif // #ifndef Airbomb