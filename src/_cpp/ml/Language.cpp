//
//  Language.cpp
//  JungleDefense
//
//  Created by Vladimir Tolmachev on 11.03.14.
//
//

#include "ml/Language.h"
#include "ml/pugixml/pugixml.hpp"
#include "cocos2d.h"
using namespace cocos2d;


Language::Language()
{
	load();
};

std::string Language::string( const std::string & id )
{
	std::string temp = id;
	std::string result;
	while( true )
	{
		size_t k0 = temp.find( "#" );
		size_t k1 = temp.substr(k0+1).find( "#" );
		if( k0 != std::string::npos && k1 != std::string::npos )
		{
			std::string word = temp.substr( k0+1, k1 );
			word = this->string(word);
			result += temp.substr(0,k0) + word;
			temp = temp.substr( k0+k1+2 );
		}
		else
		{
			if( m_current )
			{
				auto it = m_current->find(id);
				if( it != m_current->end() )
					result = it->second;
				else
				{
					result += temp;
				}
			}
			break;
		}
	};
	return result;
}

void Language::set( const std::string & language )
{
	auto iterator = m_packs.find( language );
	if( iterator == m_packs.end() )
	{
		set( "en" );
	}
	else
	{
		m_current = iterator->second;
	}
}

void Language::load()
{
	pugi::xml_document doc;
	doc.load_file("lang/lang.xml");
	auto root = doc.root().first_child();
	if( !root )
		log( "WARNING!!! Language wasnt loaded. Cannot open laguages path [%s]", FileUtils::getInstance()->fullPathForFilename("lang/lang.xml").c_str() );
	auto lang = root.child("languages");
	for( auto node = lang.first_child(); node; node = node.next_sibling() )
	{
		std::string id = node.first_attribute().name();
		std::string path = node.first_attribute().value();
		m_packs[id] = loadPack(path);
		//log( "language added: [%s] [%s]", id.c_str(), path.c_str() );
	}
	std::string def = lang.attribute("default").value();

	auto systemlang = Application::getInstance()->getCurrentLanguage();
    std::string forced = lang.attribute("forced").value();
    if (forced.length() > 0) {
        set(forced);
        return;
    }
	switch( systemlang )
	{
		case LanguageType::ENGLISH: set( "en" ); break;
        case LanguageType::RUSSIAN: set( "ru" ); break;
        case LanguageType::CHINESE: set( "cz" ); break;
        case LanguageType::GERMAN: set( "de" ); break;
        case LanguageType::POLISH: set( "pl" ); break;
		default: set(def);
	}
}

Language::PointerPack Language::loadPack(const std::string & from)
{
	auto pack = std::make_shared<Pack>();
	
    ValueMap strings = FileUtils::getInstance()->getValueMapFromFile(from);
	for( auto i : strings )
	{
		std::string id = i.first;
		std::string value= i.second.asString();
		//log( "		string added: [%s] [%s]", id.c_str(), value.c_str() );
		pack->insert( Word(id, value) );
	}
	return pack;
}

