//
//  Language.h
//  JungleDefense
//
//  Created by Vladimir Tolmachev on 11.03.14.
//
//

#ifndef __JungleDefense__Language__
#define __JungleDefense__Language__

#include <string>
#include <memory>
#include <map>
#include "Singlton.h"

#ifdef WORD
#	undef WORD
#endif

#define WORD(id) Language::shared().string(id)

class Language : public Singlton<Language>
{
	typedef std::pair<std::string, std::string>Word;
	typedef std::map<std::string, std::string> Pack;
	typedef std::shared_ptr<Pack> PointerPack;
	typedef std::map<std::string, PointerPack > Packs;
public:
	Language();
	std::string string( const std::string & id );
	void set( const std::string & language );
private:
	void load();
	PointerPack loadPack( const std::string & path );
private:
	Packs m_packs;
	PointerPack m_current;
};

#endif /* defined(__JungleDefense__Language__) */
