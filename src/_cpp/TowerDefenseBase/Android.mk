LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

$(call import-add-path,$(LOCAL_PATH)/../cocos2d)
$(call import-add-path,$(LOCAL_PATH)/../cocos2d/external)
$(call import-add-path,$(LOCAL_PATH)/../cocos2d/cocos)

LOCAL_MODULE := towerdefensebase_static

LOCAL_MODULE_FILENAME := libtowerdefensebase

LOCAL_SRC_FILES := \
MenuItemCooldown.cpp \
AppDelegate.cpp \
consts.cpp \
game/Achievements.cpp \
game/Airbomb.cpp \
game/effects.cpp \
game/gameboard.cpp \
game/IndicatorNode.cpp \
game/tower.cpp \
game/WaveGenerator.cpp \
game/LandMine.cpp \
game/unit/Bullet.cpp \
game/unit/MachineExt.cpp \
game/unit/MachineUnit.cpp \
game/unit/UnitDesant.cpp \
game/unit/Mover.cpp \
game/unit/Unit.cpp \
game/unit/UnitWithFadeEffects.cpp \
game/unit/Skills.cpp \
game/unit/Hero.cpp \
game/unit/Hero2.cpp \
resources.cpp \
scenes/Tutorial.cpp \
scenes/LayerLoader.cpp \
scenes/MainGS.cpp \
scenes/ScoreLayer.cpp \
scenes/gamegs/GameGS.cpp \
scenes/gamegs/MenuTower.cpp \
scenes/gamegs/MenuCreateTower.cpp \
scenes/gamegs/MenuDig.cpp \
scenes/gamegs/WaveIcon.cpp \
scenes/gamegs/TowerPlace.cpp \
scenes/gamegs/ShootsEffects.cpp \
scenes/gamegs/GamePauseScene.cpp \
scenes/gamegs/VictoryMenu.cpp \
scenes/gamegs/Decoration.cpp \
scenes/gamegs/UnitInfo.cpp \
scenes/gamegs/HeroIcon.cpp \
scenes/gamegs/BoxMenu.cpp \
scenes/map/MapLayer.cpp \
scenes/shop/ShopLayer.cpp \
scenes/lab/Laboratory.cpp \
scenes/RateMeLayer.cpp \
scenes/itemshop/ItemShop.cpp \
scenes/selecthero/SelectHero.cpp \
scenes/LoadLevelScene.cpp \
scenes/BuyHeroes.cpp \
support/Animations.cpp \
support/GarbageParams.cpp \
support/Log.cpp \
support/MenuItemTextBG.cpp \
support/ScoreCounter.cpp \
support/support.cpp \
support/UserData.cpp \
support/EventsGame.cpp \
support/AutoPlayer.cpp

LOCAL_C_INCLUDES += $(LOCAL_PATH)
LOCAL_C_INCLUDES += $(LOCAL_PATH)/..
LOCAL_C_INCLUDES += $(LOCAL_PATH)/../..
LOCAL_C_INCLUDES += $(LOCAL_PATH)/../../ml
LOCAL_C_INCLUDES += $(LOCAL_PATH)/game
LOCAL_C_INCLUDES += $(LOCAL_PATH)/game/towers/
LOCAL_C_INCLUDES += $(LOCAL_PATH)/game/unit
LOCAL_C_INCLUDES += $(LOCAL_PATH)/scenes
LOCAL_C_INCLUDES += $(LOCAL_PATH)/scenes/editor
LOCAL_C_INCLUDES += $(LOCAL_PATH)/scenes/lab
LOCAL_C_INCLUDES += $(LOCAL_PATH)/scenes/gamegs
LOCAL_C_INCLUDES += $(LOCAL_PATH)/scenes/shop
LOCAL_C_INCLUDES += $(LOCAL_PATH)/scenes/map
LOCAL_C_INCLUDES += $(LOCAL_PATH)/support

LOCAL_EXPORT_C_INCLUDES += $(LOCAL_PATH)/.
LOCAL_EXPORT_C_INCLUDES += $(LOCAL_PATH)/game
LOCAL_EXPORT_C_INCLUDES += $(LOCAL_PATH)/game/towers/
LOCAL_EXPORT_C_INCLUDES += $(LOCAL_PATH)/game/unit
LOCAL_EXPORT_C_INCLUDES += $(LOCAL_PATH)/scenes
LOCAL_EXPORT_C_INCLUDES += $(LOCAL_PATH)/scenes/editor
LOCAL_EXPORT_C_INCLUDES += $(LOCAL_PATH)/scenes/lab
LOCAL_EXPORT_C_INCLUDES += $(LOCAL_PATH)/scenes/gamegs
LOCAL_EXPORT_C_INCLUDES += $(LOCAL_PATH)/scenes/shop
LOCAL_EXPORT_C_INCLUDES += $(LOCAL_PATH)/scenes/map
LOCAL_EXPORT_C_INCLUDES += $(LOCAL_PATH)/support

LOCAL_WHOLE_STATIC_LIBRARIES := cocos2dx_static
LOCAL_WHOLE_STATIC_LIBRARIES += cocosdenshion_static
LOCAL_WHOLE_STATIC_LIBRARIES += services_static

include $(BUILD_STATIC_LIBRARY)

$(call import-module,.)
$(call import-module,audio/android)
$(call import-module,../projects/services/.)
