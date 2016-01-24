//
//  Tutorial.h
//  JungleDefense
//
//  Created by Vladimir Tolmachev on 24.04.14.
//
//

#ifndef __JungleDefense__Tutorial__
#define __JungleDefense__Tutorial__

#include "cocos2d.h"
#include "ml/NodeExt.h"
#include "ml/Singlton.h"
#include "ml/ParamCollection.h"
#include "support.h"
#include "ml/pugixml/pugixml.hpp"
NS_CC_BEGIN;

class Tutorial : public Layer, public NodeExt
{
	DECLARE_BUILDER(Tutorial);
	bool init( const std::string & pathToXml );
	virtual bool setProperty( int intproperty, const std::string & value )override;
public:
	void enter();
	void exit();
	const std::string& next( )const;
protected:
	virtual ccMenuCallback get_callback_by_description( const std::string & name )override;
	void cb_confirmTutorial( Ref*, bool use );
	void touchesBegan( const std::vector<Touch*>& touches, Event *event );
	void touchesEnded( const std::vector<Touch*>& touches, Event *event );
private:
	std::string _nextTutorial;
};


class TutorialManager : public Singlton<TutorialManager>
{
	friend Singlton<TutorialManager>;
	TutorialManager();
	TutorialManager(TutorialManager&&);
	TutorialManager(const TutorialManager&);
	TutorialManager& operator=(const TutorialManager&);
	virtual void onCreate()override;
public:
	~TutorialManager() {}
	bool dispatch( const std::string & eventname, const ParamCollection * params = nullptr );
	bool close( Tutorial * tutorial );
protected:
	bool open( const std::string & name );
	void load( );
	void loadList(const pugi::xml_node & xmlnode );
	void loadEvents( const pugi::xml_node & xmlnode, std::multimap<std::string, std::string> & events );
	bool checkOpening( const std::string eventname )const;
private:
	Tutorial::Pointer _current;
	struct TutorialInfo
	{
		TutorialInfo() : filename(), onlyaftertutorial(), count( 1 ), forced( false ) {}
		std::string filename;
		std::string onlyaftertutorial;
		int count;
		bool forced;
	};
	std::map<std::string, TutorialInfo> _list;
	/*
	 Events for run tutorial. 
	 * first - eventname
	 * second - tutorial name
	 */
	std::multimap<std::string, std::string> _eventsForRun;
	/*
	 Events for close tutorial.
	 * first - eventname
	 * second - tutorial name
	 */
	std::multimap<std::string, std::string> _eventsForClose;

	std::queue<std::pair< std::string, ParamCollection > > _queueEvents;
};


NS_CC_END;

#endif /* defined(__JungleDefense__Tutorial__) */
