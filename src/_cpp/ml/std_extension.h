//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __std_extension_h__
#define __std_extension_h__
#include <algorithm>
#include <list>

namespace std
{

	template <class Conteiner, class Type>
	typename Conteiner::const_iterator find( Conteiner & conteiner, const Type & value )
	{
		typename Conteiner::const_iterator iterator = std::find( conteiner.begin(), conteiner.end(), value );
		return iterator;
	}

	template <class Type>
	Type sign( const Type & signedvalue )
	{
		return signedvalue < 0 ? -1 : (signedvalue>0 ? 1 : 0);
	}

};


#endif