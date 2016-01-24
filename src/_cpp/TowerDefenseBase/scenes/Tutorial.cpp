//
//  Tutorial.cpp
//  JungleDefense
//
//  Created by Vladimir Tolmachev on 24.04.14.
//
//
#include "ml/SmartScene.h"
#include "ml/loadxml/xmlProperties.h"
#include "ml/ImageManager.h"
#include "ml/Language.h"
#include "Tutorial.h"
#include "resources.h"
#include "gameboard.h"
#include "GameGS.h"
#include "consts.h"
#include "UserData.h"
#include "ScoreCounter.h"
#include "configuration.h"
#include "Hero.h"
NS_CC_BEGIN;

const std::string ksAutoPosition( "autopos" );
const std::string ksParent( "parent" );
const std::string ksAsBlockingLayer( "asblockinglayer" );
const std::string ksCloseByTap( "closebytap" );
const std::string ksNextTutorial( "nexttutorial" );
const std::string ksShopGift( "shopgift" );
const std::string ksSetLevelScore( "setlevelsscore" );
const std::string ksSelectHero( "selecthero" );
const std::string ksResetHeroSkills( "resetheroskills" );
const std::string ksHerominlevel( "herominlevel" );
const int kAutoPosition( xmlLoader::kUserProperties + 1 );
const int kParent( xmlLoader::kUserProperties + 2 );
const int kAsBlockingLayer( xmlLoader::kUserProperties + 3 );
const int kCloseByTap( xmlLoader::kUserProperties + 4 );
const int kNextTutorial( xmlLoader::kUserProperties + 5 );
const int kShopGift( xmlLoader::kUserProperties + 6 );
const int kSetLevelScore( xmlLoader::kUserProperties + 7 );
const int kSelectHero( xmlLoader::kUserProperties + 8 );
const int kResetHeroSkills( xmlLoader::kUserProperties + 9 );
const int kHerominlevel( xmlLoader::kUserProperties + 10 );

/******************************************************************************/
//MARK: Tutorial
/******************************************************************************/

Tutorial::Tutorial()
{}

Tutorial::~Tutorial()
{}

bool Tutorial::init( const std::string & pathToXml )
{
	load( pathToXml );

	//assert( getParent() != nullptr );
	//{
	//	auto scene = Director::getInstance()->getRunningScene();
	//	auto smartscene = dynamic_cast<SmartScene*>(scene);
	//}

	return true;
}

bool Tutorial::setProperty( int intproperty, const std::string & value )
{
	Node * node( nullptr );
	switch( intproperty )
	{
		case xmlLoader::kPos:
			setPosition( getPosition() + strToPoint( value ) );
			break;
		case kAutoPosition:
			node = getNodeByPath( Director::getInstance()->getRunningScene(), value );
			if( node ) setPosition( getPosition() + node->getPosition() );
			break;
		case kParent:
			assert( getParent() == nullptr );
			node = getNodeByPath( Director::getInstance()->getRunningScene(), value );
			if( node ) node->addChild( this );
			break;
		case kAsBlockingLayer:
			if( strToBool( value ) )
			{
				auto scene = Director::getInstance()->getRunningScene();
				auto smartscene = dynamic_cast<SmartScene*>(scene);
				smartscene->pushLayer( this, true );
			}
			break;
		case kCloseByTap:
			if( strToBool( value ) )
			{
				auto *listener = EventListenerTouchAllAtOnce::create();
				listener->onTouchesBegan = CC_CALLBACK_2( Tutorial::touchesBegan, this );
				listener->onTouchesEnded = CC_CALLBACK_2( Tutorial::touchesEnded, this );
				Director::getInstance()->getEventDispatcher()->addEventListenerWithSceneGraphPriority( listener, this );
			}
			else
			{
				Director::getInstance()->getEventDispatcher()->removeEventListenersForTarget( this );
			}
			break;
		case kNextTutorial:
			_nextTutorial = value;
			break;
		case kShopGift:
			UserData::shared().write( k::user::ShopGift, value );
			break;
		case kSetLevelScore:
			ScoreCounter::shared().setMoney( kScoreLevel, strToInt( value ), false );
			break;
		case kSelectHero:
			UserData::shared().hero_setCurrent( strToInt( value ) );
			break;
		case kResetHeroSkills:
		{
			auto heroname = "hero" + intToStr( strToInt( value ) + 1 );
			std::vector<unsigned> skills( 5 );
			HeroExp::shared().setSkills( heroname, skills );
			break;
		}
		case kHerominlevel:
		{
			auto current = UserData::shared().hero_getCurrent();
			auto heroname = "hero" + intToStr( current + 1 );
			auto exp = HeroExp::shared().getEXP( heroname );
			auto expmin = HeroExp::shared().getHeroLevelExtValue( strToInt( value ) ) + 1;
			exp = std::max( exp, expmin );
			HeroExp::shared().setEXP( heroname, exp );
			break;
		}
		default:
			return NodeExt::setProperty( intproperty, value );
	}
	return true;
}

void Tutorial::enter()
{
	runEvent( "onenter" );
}

void Tutorial::exit()
{
	runEvent( "onexit" );
}

const std::string& Tutorial::next()const
{
	return _nextTutorial;
};

ccMenuCallback Tutorial::get_callback_by_description( const std::string & name )
{
	if( name == "confirm_tutorial_yes" )
		return std::bind( &Tutorial::cb_confirmTutorial, this, std::placeholders::_1, true );
	if( name == "confirm_tutorial_no" )
		return std::bind( &Tutorial::cb_confirmTutorial, this, std::placeholders::_1, false );
	return nullptr;
}

void Tutorial::cb_confirmTutorial( Ref*, bool use )
{
	UserData::shared().write( k::user::UseTitorial, use );
	TutorialManager::shared().close( this );
}

void Tutorial::touchesBegan( const std::vector<Touch*>& touches, Event *event )
{

}

void Tutorial::touchesEnded( const std::vector<Touch*>& touches, Event *event )
{
	TutorialManager::shared().close( this );
}


/******************************************************************************/
//MARK: TutorialManager
/******************************************************************************/

TutorialManager::TutorialManager()
{
	xmlLoader::boolProperty( ksAutoPosition, kAutoPosition );
	xmlLoader::boolProperty( ksParent, kParent );
	xmlLoader::boolProperty( ksAsBlockingLayer, kAsBlockingLayer );
	xmlLoader::boolProperty( ksCloseByTap, kCloseByTap );
	xmlLoader::boolProperty( ksNextTutorial, kNextTutorial );
	xmlLoader::boolProperty( ksShopGift, kShopGift);
	xmlLoader::boolProperty( ksSetLevelScore, kSetLevelScore );
	xmlLoader::boolProperty( ksSelectHero, kSelectHero );
	xmlLoader::boolProperty( ksResetHeroSkills, kResetHeroSkills );
	xmlLoader::boolProperty( ksHerominlevel, kHerominlevel );
}

TutorialManager::TutorialManager( TutorialManager&& )
{}

TutorialManager::TutorialManager( const TutorialManager& )
{}

TutorialManager& TutorialManager::operator=(const TutorialManager&)
{
	return *this;
}

void TutorialManager::onCreate()
{
	load();
}

bool TutorialManager::dispatch( const std::string & eventname, const ParamCollection * params )
{
	bool result( false );

	if( _current && _current->isRunning() == false )
	{
		close( _current );
		result = true;
	}

	if( !_current && _queueEvents.empty() == false )
	{
		auto pair = _queueEvents.front();
		_queueEvents.pop();
		if( dispatch(pair.first, &pair.second) )
		{
			return true;
		}
	}

	if( _current )
	{
		auto range = _eventsForClose.equal_range( eventname );
		for( auto iter = range.first; iter != range.second; ++iter )
		{
			if( iter->second == _current->getName() )
			{
				if( close( _current ) == false )
					dispatch( eventname, params );
				result = true;
				break;
			}
		}
		//if( result == false )
		//{
		//	auto range = _eventsForRun.equal_range( eventname );
		//	for( auto iter = range.first; iter != range.second; ++iter )
		//	{
		//		if( checkOpening( iter->second ) )
		//		{
		//			std::pair< std::string, ParamCollection > pair;
		//			pair.first = eventname;
		//			if( params ) pair.second = *params;
		//			_queueEvents.push( pair );
		//		}
		//	}
		//}

	}
	else
	{
		auto range = _eventsForRun.equal_range( eventname );
		for( auto iter = range.first; iter != range.second; ++iter )
		{
			std::string name = iter->second;
			if( open( name ) )
			{
				result = true;
				break;
			}
		}
	}
	return result;
}

bool TutorialManager::close( Tutorial * tutorial )
{
	if( _current && tutorial == _current )
	{
		int value = UserData::shared().get_int( "tutorial" + _current->getName() );
		UserData::shared().write( "tutorial" + _current->getName(), value + 1 );

		_current->exit();
		_current->removeFromParent();

		std::string next = _current->next();
		_current.reset( nullptr );

		if( next.empty() == false )
			open( next );

		return next.empty() == false;
	}
	else
	{
		assert( tutorial );
		tutorial->exit();
		tutorial->removeFromParent();
		return true;
	}
}

bool TutorialManager::open( const std::string & name )
{
	if( _list.find( name ) == _list.end() )
        return false;
	const TutorialInfo& info = _list[name];
	bool result( false );

	int value = UserData::shared( ).get_int( "tutorial" + name, 0 );
	if( checkOpening(name) )
	{
		UserData::shared().write( "tutorial" + name, value + 1 );

		assert( info.filename.empty() == false );
		_current = Tutorial::create( info.filename );
		_current->setName( name );
		_current->enter();
		result = true;
	}


	if( name == "lvl0_hero" )
	{
		int level = GameGS::getInstance()->getGameBoard().getCurrentLevelIndex();
		
		if( _current )
		{
			if( level == 0 && k::configuration::minLevelHero > 0 )
				result = close( _current );
			if( level == 3 && k::configuration::minLevelHero == 0 )
				result = close( _current );
		}
	}

	return result;
}

bool TutorialManager::checkOpening( const std::string tutorialname )const
{
	auto iter = _list.find( tutorialname );
	if (iter == _list.end())
		return false;
	const TutorialInfo& info = iter->second;

	bool isshow( true );
	int value = UserData::shared( ).get_int( "tutorial" + tutorialname, 0 );
	bool rejection = UserData::shared().get_bool( k::user::UseTitorial, true );
	std::string after = info.onlyaftertutorial;
	bool showprevios = after.empty() ? true : UserData::shared().get_int( "tutorial" + after ) > 0;
	isshow = isshow && showprevios;
	isshow = isshow && value < info.count;
	isshow = isshow && (rejection || info.forced);

	return isshow;
}

void TutorialManager::load()
{
	pugi::xml_document doc;
	doc.load_file( "ini/tutorial/tutorials.xml" );
	auto root = doc.root().first_child();
	auto xmllist = root.child( "list" );
	auto xmlevents = root.child( "events" );
	auto xmlrun = xmlevents.child( "run" );
	auto xmlclose = xmlevents.child( "close" );

	loadList( xmllist );
	loadEvents( xmlrun, _eventsForRun );
	loadEvents( xmlclose, _eventsForClose );
}

void TutorialManager::loadList( const pugi::xml_node & xmlnode )
{
	FOR_EACHXML( xmlnode, child )
	{
		auto dispatch = true;
		if( child.attribute( "dispatch" ) )
		{
			std::string value = child.attribute( "dispatch" ).as_string();
			dispatch = strToBool( xmlLoader::macros::parse( value ) );
		}
		if (dispatch == false)
			continue;

		TutorialInfo info;
		std::string name = child.name();
		info.filename = child.attribute( "filename" ).value();
		info.onlyaftertutorial = child.attribute( "after" ).value( );
		info.count = child.attribute( "count" ).as_int( 1 ) * 2;
		info.forced = child.attribute( "forced" ).as_bool( false );
		_list[name] = info;
	}
}

void TutorialManager::loadEvents( const pugi::xml_node & xmlnode, std::multimap<std::string, std::string> & events )
{
	FOR_EACHXML( xmlnode, child )
	{
		std::string eventname = child.name();
		std::string tutorial = child.attribute( "value" ).value();
		events.insert( std::pair<std::string, std::string>( eventname, tutorial ) );
	}
}


NS_CC_END;