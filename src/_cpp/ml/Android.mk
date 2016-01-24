LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

$(call import-add-path,$(LOCAL_PATH)/../cocos2d)
$(call import-add-path,$(LOCAL_PATH)/../cocos2d/external)
$(call import-add-path,$(LOCAL_PATH)/../cocos2d/cocos)

LOCAL_MODULE := ml_static

LOCAL_MODULE_FILENAME := libml

LOCAL_SRC_FILES := \
Animation.cpp \
AStar.cpp \
Audio/AudioEngine.cpp \
Audio/AudioMenu.cpp \
common.cpp \
Events.cpp \
FiniteStateMachine.cpp \
ImageManager.cpp \
IntrusivePtr.cpp \
Language.cpp \
loadxml/xmlLoader.cpp \
loadxml/xmlProperties.cpp \
MenuItemWithText.cpp \
NodeExt.cpp \
ObjectFactory.cpp \
ParamCollection.cpp \
pugixml/pugixml.cpp \
ScrollMenu.cpp \
SmartScene.cpp \

LOCAL_C_INCLUDES += $(LOCAL_PATH)/..

LOCAL_WHOLE_STATIC_LIBRARIES := cocos2dx_static
LOCAL_WHOLE_STATIC_LIBRARIES += cocosdenshion_static

include $(BUILD_STATIC_LIBRARY)

$(call import-module,.)
$(call import-module,audio/android)