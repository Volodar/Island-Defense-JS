//Define namespace
var EU = EU || {};


EU.Unit = cc.Node.extend();
EU.NodeExt.call(EU.Unit.prototype);
EU.MachineUnit.call(EU.Unit.prototype);

EU.Unit.implement({

    /** For Test Instance of */
    __Unit : true,

    ObserverHealth : null,
    Extra : function()
    {
        //friend class Unit; TODO:
        var _electroPosition;
        var _electroSize;
        var _electroScale;
        var _firePosition;
        var _fireScale;
        var _freezingPosition;
        var _freezingScale;
    }
});
//
//public Node, public NodeExt, public MachineUnit/*, public MachineMove*/
//{
//    public:
//        typedef ObServer<Unit, std::function<void( float, float )> > ObserverHealth;
//    private:
//        class Extra
//        {
//            friend class Unit;
//            public:
//                Extra();
//            const Point& getPositionElectro( )const;
//            const std::string& getSizeElectro( )const;
//            const float getScaleElectro( )const;
//
//            const Point& getPositionFire()const;
//            const float getScaleFire()const;
//            const Point& getPositionFreezing()const;
//            const float getScaleFreezing()const;
//            private:
//                Point _electroPosition;
//            std::string _electroSize;
//            float _electroScale;
//            Point _firePosition;
//            float _fireScale;
//            Point _freezingPosition;
//            float _freezingScale;
//        };
//
//    DECLARE_BUILDER( Unit );
//    bool init( const std::string & path, const std::string & xmlFile = "ini.xml" );
//    bool init( const std::string & path, const std::string & xmlFile, Unit* upgradedUnit );
//    public:
//        /*
//         getters and setters
//         */
//        mlEffect& getEffect();
//    const mlEffect& getEffect()const;
//
//    Extra& extra();
//
//    /*
//     fight!
//     */
//    virtual bool checkTargetByRadius( const Unit * target )const;
//    virtual void capture_targets( const std::vector<Unit::Pointer> & targets );
//    virtual void get_targets( std::vector<Unit::Pointer> & targets )const;
//    void applyDamageToTarget( Unit::Pointer target );
//    void applyDamage( Unit* damager, float time = 1 );
//    void applyDamageExtended( float time );
//    void turn( float dt );
//
//    /*
//     Sounds:
//     */
//    void stopAllLoopedSounds();
//
//    void update( float dt );
//    virtual void clear();
//    Mover& getMover() { return _mover; }
//    int getDirection()const { return _angle; }
//
//    void moveByRoute( const Route & route );
//
//    void setCurrentHealth( float value );
//    float getCurrentHealth()const { return _currentHealth; }
//
//    void removeSkill( UnitSkill::Pointer skill );
//    std::vector<UnitSkill::Pointer>& getSkills();
//    const std::vector<UnitSkill::Pointer>& getSkills()const;
//
//    void forceShoot(Unit* target, const mlEffect& effect );
//
//    virtual void skillActivated( UnitSkill* skill );
//    virtual void skillDeactivated( UnitSkill* skill );
//    public:
//        ObserverHealth observerHealth;
//
//    protected:
//        void applyVelocityRate( float dt );
//    void applyTimedDamage( float dt );
//
//    protected:
//        virtual void load( const pugi::xml_node & root ) override;
//    virtual bool loadXmlEntity( const std::string & tag, const pugi::xml_node & xmlnode )override;
//    virtual void loadXmlSkills( const pugi::xml_node & xmlnode );
//    virtual UnitSkill::Pointer loadXmlSkill( const pugi::xml_node & xmlnode );
//    virtual bool setProperty( const std::string & stringproperty, const std::string & value )override;
//    virtual ccMenuCallback get_callback_by_description( const std::string & name )override;
//
//    virtual void on_shoot( unsigned index ) override;
//    virtual void on_sleep( float duration ) override;
//    virtual void on_cocking( float duration ) override;
//    virtual void on_relaxation( float duration ) override;
//    virtual void on_readyfire( float duration ) override;
//    virtual void on_charging( float duration ) override;
//    virtual void on_waittarget( float duration ) override;
//    virtual void on_move( ) override;
//    virtual void on_stop( ) override;
//    virtual void on_die( ) override;
//    virtual void on_die_finish( ) override;
//    virtual void on_enter();
//
//    virtual void move_update( float dt ) override;
//    virtual void stop_update( float dt ) override;
//
//    virtual void on_mover( const Point & position, const Vec2 & direction );
//    virtual void on_movefinish( );
//    virtual void on_damage( float value );
//
//
//    private:
//        mlEffect _effect;
//    Extra _extra;
//    Mover _mover;
//    int _angle;
//    std::vector<Unit::Pointer> _targets;
//    CC_SYNTHESIZE( Unit::Pointer, _currentDamager, CurrentDamager );
//    IndicatorNode::Pointer _healthIndicator;
//    std::vector<UnitSkill::Pointer> _skills;
//
//    float _currentHealth;
//    unsigned int _soundMoveID;
//
//    struct BulletParams
//    {
//        float byangle;
//        float useangle;
//        Point offset;
//    };
//    std::string _bulletXml;
//    std::map<float, BulletParams> _bulletParams;
//
//    CC_PROPERTY( float, _rate, Rate );
//    CC_SYNTHESIZE_READONLY( std::string, _effectOnShoot, EffectOnShoot );
//    CC_SYNTHESIZE( unsigned, _level, Level );
//    CC_SYNTHESIZE( unsigned, _maxLevel, MaxLevel );
//    CC_SYNTHESIZE( unsigned, _maxLevelForLevel, MaxLevelForLevel );
//    CC_SYNTHESIZE( unsigned, _cost, Cost );
//    CC_SYNTHESIZE( float, _radius, Radius );
//    CC_SYNTHESIZE( BodyType, _bodyType, BodyType );
//    CC_SYNTHESIZE_READONLY( float, _defaultHealth, DefaultHealth );
//    CC_SYNTHESIZE( float, _health, Health );
//    CC_SYNTHESIZE_READONLY( bool, _moveFinished, MoveFinished );
//    CC_SYNTHESIZE( bool, _damageBySector, DamageBySector );
//    CC_SYNTHESIZE( float, _damageBySectorAngle, DamageBySectorAngle );
//    CC_SYNTHESIZE( UnitLayer, _unitLayer, UnitLayer );
//    CC_SYNTHESIZE_PASS_BY_REF( std::vector<UnitLayer>, _allowTargets, AllowTargets );
//    CC_SYNTHESIZE_READONLY( unsigned, _maxTargets, MaxTargets );
//    CC_SYNTHESIZE( UnitType, _type, Type );
//    CC_SYNTHESIZE_READONLY( std::string, _soundMove, SoundMove );
//    CC_SYNTHESIZE_READONLY( int, _lifecost, LifeCost );
//    CC_SYNTHESIZE_READONLY( float, _exp, Exp );
//    int _additionalZorder;
//
//    float _damageShield;
//    float _damageRate;
//};
//
//
//typedef std::vector<Unit::Pointer> TowersArray;
//
//
//
//NS_CC_END
//#endif // #ifndef Unit