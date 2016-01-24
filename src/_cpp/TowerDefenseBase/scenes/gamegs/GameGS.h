//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __GAME_SCENE_H__
#define __GAME_SCENE_H__
#pragma warning ( disable : 4996 )
#include "ml/ScrollMenu.h"

#include "gameboard.h"
#include "support.h"
#include "WaveGenerator.h"
#include "preprocessor.h"
#include "MenuCreateTower.h"
#include "MenuTower.h"
#include "WaveIcon.h"
#include "MenuDig.h"
#include "ml/SmartScene.h"
#include "Decoration.h"
#include "MenuItemCooldown.h"
#include "HeroIcon.h"
#include "BoxMenu.h"


NS_CC_BEGIN;

class Icon;
class GameGS;
class MenuItemImageWithText;

namespace zorder
{
	const int bg(-1000);
	const int earth(-999);
	const int creep_default(10);
	const int creep_earth(10);
	const int tower(20);
	const int tower_cariage(19);
	const int tower_turret(25);
	const int bullet(30);
	const int tree(40);
	
	const int creep_sky(99998);
	const int bullet_sky(99997);

	const int sky(99999);
	const int creep_indicator(100000);
};

struct touchInfo
{
	touchInfo( Node * _nodeBegan = nullptr, Touch * _touch = nullptr )
	: nodeBegin( _nodeBegan )
	, nodeEnd(nullptr)
	, touch(_touch)
	, id(0)
	{
		static unsigned _id;
		id = _id++;
	}
	~touchInfo()
	{
	}
	bool operator < (const touchInfo & src)const
	{
		return id < src.id;
	};

	NodePointer nodeBegin;
	NodePointer nodeEnd;
	Touch* touch;
	unsigned id;
};

enum class Skill
{
	desant,
	bomb,
	heroskill,
};

class ScoresNode : public Node
{
private:
	ScoresNode();
public:
	~ScoresNode();
	static ScoresNode* create();
	void updateWaves();
protected:
	void on_change_lifes( int score );
	void on_change_money( int score );
protected:
	std::map<int, int> m_scores;
	LabelPointer m_healths;
	LabelPointer m_golds;
	LabelPointer m_waves;
	SpritePointer m_healthsIcon;
};


class GameGS : public cocos2d::Layer, public NodeExt
{

public:
	GameGS();
	virtual ~GameGS();
	virtual bool init();
	static SmartScene::Pointer createScene( );
	static void restartLevel();

	static bool instanceIsCreate();
	static GameGS* getInstance();
	GameBoard& getGameBoard();
	
	virtual void onEnter();
	virtual void onExit();

	virtual bool setProperty( const std::string & stringproperty, const std::string & value )override;


	Node * getInterfaceNode() { return m_interface; }
	
	//build level:
	void clear();
	void startGame();
	void loadLevel(int index, const pugi::xml_node & root);
	static void createDecorFromXmlNode(const pugi::xml_node & node, Decoration::Pointer & outNode);

	void excludeTower( const std::string & towername );
	
	TowerPlace::Pointer addTowerPlace( const TowerPlaseDef & def);
	TowerPlace::Pointer getTowerPlaceInLocation( const Point & location );
	unsigned getTowerPlaceIndex( const Point & location );
	void setSelectedTowerPlaces( TowerPlace::Pointer place );
	TowerPlace::Pointer getSelectedTowerPlaces();
	void eraseTowerPlace( TowerPlace::Pointer place );
	const std::vector<TowerPlace::Pointer>& getTowerPlaces()const;
	void resetSelectedPlace();

	std::vector<Decoration*> getDecorations( const std::string & name );
	
	void createPredelayLabel();
	//game:

	static Node * createTree(int index);
	static Node * createStone(int index);

	virtual void onTouchesBegan(const std::vector<Touch*>& touches, Event *event);
	virtual void onTouchesMoved(const std::vector<Touch*>& touches, Event *event);
	virtual void onTouchesEnded(const std::vector<Touch*>& touches, Event *event);
	virtual void onTouchesCancelled(const std::vector<Touch*>&touches, Event *event);

	bool onTouchSkillBegan( Touch* touch, Event *event );
	void onTouchSkillEnded( Touch* touch, Event *event, Skill skill );
	void onTouchSkillCanceled( Touch* touch, Event *event );

	bool onTouchHeroBegan( Touch* touch, Event *event );
	void onTouchHeroMoved( Touch* touch, Event *event );
	void onTouchHeroEnded( Touch* touch, Event *event );
	void onTouchHeroCanceled( Touch* touch, Event *event );

    virtual void onKeyReleased(EventKeyboard::KeyCode keyCode, Event* event);
	//void sendNextTouchToObject(mlObject * object);

	void onClickByObject( Unit::Pointer object );
	void onClickByTowerPlace( TowerPlace::Pointer place );
	void markTowerPlaceOnLocation(const Point& position);
	void onEmptyTouch( const Point & touchlocation );
	void onForbiddenTouch( const Point & touchlocation );

	void onCreateUnit( Unit*unit );
	void onDeathUnit( Unit*unit );
	void onDeathCanceled( Unit*unit );
	void onStartWave( const WaveInfo & wave );

	void markPriorityTarget();
	void unmarkPriorityTarget();

	void onWaveFinished();
	void onFinishGame( FinishLevelParams* params );

	void buyLevelsMoney( int count );

	void shake(float value = 1.f);
protected:
	//build interface:
	void createInterface();
	void createDevMenu();
	void createHeroMenu();

	void openStatisticWindow( FinishLevelParams* params );
	void flyCameraAboveMap(const Point & wavestart );

	void menuFastModeEnabled(bool enabled);
	void menuRestart();
	void setOnEnterParam_needExit();
	void menuPause( Ref*sender );
	void menuSkill( Ref*sender, Skill skill );
	void menuSkillCancel( Ref*sender );
public:
	void menuShop( Ref*sender, bool gears );
protected:
	void menuHero( Ref*sender );
	void menuPauseOff();

	void setTouchDisabled( );
	void setTouchNormal();
	void setTouchSkill( Skill skill );
	void setTouchHero();
	void resetSkillButtons();

public:
	void addObject(Node * object, int zOrder);
	void removeObject(Node * object);
	void update(float dt);

	Node* getMainLayer( ) { return m_mainlayer; }

	void createExplosion(const Point& position);
	void createExplosionWave(const Point& position);
	//void createMeat(const Point& position);
	void createCloud(const Point& position);
	void createFragments(const Point& position);
	void createExplosionSpot(const Point& position);
	void createEffect( Unit*base, Unit*target, const std::string & effect );
	
	void createRoutesMarkers( const Route & route, UnitLayer layer );
	void createIconForWave( const Route & route, const WaveInfo & wave, UnitLayer type, const std::list<std::string> & icons, float delay );
	void removeIconsForWave();
	void startWave( WaveIcon* icon, float elapsed, float duration );
	
	void createAddMoneyNode(unsigned count, const Point & position);
	void createAddMoneyNodeForWave( unsigned count, const Point & position );
	void createAddCrystalNode(unsigned count, const Point & position);
	void createSubMoneyNode(unsigned count, const Point & position);
	void updateWaveCounter();
	
	/*
	void showDialog( IDialog * dialog );
	void unshowDialog( IDialog * dialog );
	*/
	Unit * getObjectInLocation( const Point & location );
	
	IntrusivePtr<MenuCreateTower>& getMenuCreateTower( ) { return m_menuCreateTower; };
	const IntrusivePtr<MenuCreateTower>& getMenuCreateTower( )const { return m_menuCreateTower; };

	void achievementsObtained( const std::string & name );
	void achievementsWindowClose( Ref * ref );

protected:
	GameBoard m_board;
	NodePointer m_mainlayer;
	SpritePointer m_bg;
	NodePointer m_objects;
	NodePointer m_interface;
	std::vector<TowerPlace::Pointer>m_towerPlaces;
	TowerPlace::Pointer m_selectedPlace;
	Unit::Pointer _selectedUnit;
	std::list<Node*>m_fragments;
	std::list<std::string> m_excludedTowers;

	float m_dalayWaveIcon;
	bool _isIntteruptHeroMoving;

	unsigned _scoresForStartWave;
	unsigned _boughtScoresForSession;

	IntrusivePtr< MenuCreateTower> m_menuCreateTower;
	IntrusivePtr< MenuTower> m_menuTower;
	IntrusivePtr< MenuDig> m_menuDig;;
	ScoresNode * m_scoresNode;

	std::map<unsigned, touchInfo> m_touches;
	IntrusivePtr<ScrollTouchInfo> _scrollInfo;


	CC_SYNTHESIZE( bool, m_enabled, Enabled);
	struct{
		MenuItemImageWithText::Pointer rateNormal;
		MenuItemImageWithText::Pointer rateFast;
		MenuItemImageWithText::Pointer pause;
		MenuItemImageWithText::Pointer shop;
		MenuItemCooldown::Pointer desant;
		MenuItemCooldown::Pointer bomb;
		MenuItemCooldown::Pointer heroSkill;
		HeroIcon::Pointer hero;
		Menu * menu;
	}m_interfaceMenu;
	//IDialog * m_dialog;
	BoxMenu::Pointer m_box;

	std::vector<WaveIcon::Pointer> _waveIcons;
	bool _runFlyCamera;

	bool _skillModeActived;
	MenuItemCooldown::Pointer _selectedSkill;
	IntrusivePtr<EventListener> _touchListenerNormal;
	IntrusivePtr<EventListener> _touchListenerDesant;
	IntrusivePtr<EventListener> _touchListenerBomb;
	IntrusivePtr<EventListener> _touchListenerHero;
	IntrusivePtr<EventListener> _touchListenerHeroSkill;
};

class Icon : public Node
{
protected:
	Icon();
	bool init(const std::string & bgResource, const std::string & text);
public:
	~Icon();
	static Icon * create(const std::string & bgResource, const std::string & text);
	FiniteTimeAction * createAndRunAppearanceEffect(float duration, FiniteTimeAction * extraAction);
	FiniteTimeAction * createAndRunDisappearanceEffect(float duration, FiniteTimeAction * extraAction);
	void setIntegerValue(unsigned value);
protected:
	CC_SYNTHESIZE(Label *, m_label, Label);
	CC_SYNTHESIZE(Sprite *, m_bg, BG);
};

NS_CC_END

#endif // __HELLOWORLD_SCENE_H__
