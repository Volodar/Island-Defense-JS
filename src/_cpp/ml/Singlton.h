//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __Singlton_h__
#define __Singlton_h__

template <class T>
class Singlton
{
public:
	static T& shared()
	{
		static T instance;
		static bool firstrun( true );
		if( firstrun )
		{
			instance.onCreate();
			firstrun = false;
		}
		return instance;
	}
	virtual void onCreate() {}
};

#endif