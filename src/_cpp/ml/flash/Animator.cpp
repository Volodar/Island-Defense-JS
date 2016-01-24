#include "Animator.h"
#include "SetPropsAction.h"

#include <stack>

typedef enum 
{
    SAX_NONE = 0,
    SAX_KEY,
    SAX_DICT,
    SAX_INT,
    SAX_REAL,
    SAX_STRING,
    SAX_ARRAY
}CCSAXState;

class CCArrayMaker : public SAXDelegator
{
public:
	std::vector<CCObject*> *m_pRootArray;
    std::map<std::string, CCObject*> *m_pRootDict;
	std::map<std::string, CCObject*> *m_pCurDict;
	std::stack<std::map<std::string, CCObject*>*> m_tDictStack;
    std::string m_sCurKey;///< parsed key
    CCSAXState m_tState;
    std::vector<CCObject*> *m_pArray;

	std::stack<std::vector<CCObject*>*> m_tArrayStack;
    std::stack<CCSAXState>  m_tStateStack;

public:
    CCArrayMaker()
		: m_pRootArray(NULL),
		  m_pRootDict(NULL),
		  m_pCurDict(NULL),
          m_tState(SAX_NONE),
          m_pArray(NULL)
    {
    }

    ~CCArrayMaker()
    {
    }

    std::vector<CCObject*> *arrayWithContentsOfFile(const char *pFileName)
    {
        SAXParser parser;

        if (false == parser.init("UTF-8"))
        {
            return NULL;
        }
        parser.setDelegator(this);

        parser.parse(pFileName);
        return m_pRootArray;
    }

    void startElement(void *ctx, const char *name, const char **atts)
    {
        CC_UNUSED_PARAM(ctx);
        CC_UNUSED_PARAM(atts);
        std::string sName((char*)name);
        if( sName == "dict" )
        {
            if(! m_pRootDict)
            {
				// Because it will call m_pCurDict->release() later, so retain here.
                m_pRootDict = m_pCurDict;
            }
            m_tState = SAX_DICT;

            CCSAXState preState = SAX_NONE;
            if (! m_tStateStack.empty())
            {
                preState = m_tStateStack.top();
            }

            if (SAX_ARRAY == preState)
            {
                // add the dictionary into the array
                m_pArray.push_back(m_pCurDict);
            }
            else if (SAX_DICT == preState)
            {
                // add the dictionary into the pre dictionary
                CCAssert(! m_tDictStack.empty(), "The state is wrong!");
                std::map<std::string, CCObject*>* pPreDict = m_tDictStack.top();
                pPreDict->setObject(m_pCurDict, m_sCurKey);
            }

			m_pCurDict->release();

            // record the dict state
            m_tStateStack.push(m_tState);
            m_tDictStack.push(m_pCurDict);
        }
        else if(sName == "key")
        {
            m_tState = SAX_KEY;
        }
        else if(sName == "integer")
        {
            m_tState = SAX_INT;
        }
        else if(sName == "real")
        {
            m_tState = SAX_REAL;
        }
        else if(sName == "string")
        {
            m_tState = SAX_STRING;
        }
        else if (sName == "array")
        {
            m_tState = SAX_ARRAY;
            m_pArray = new std::vector<CCObject*>();
			if (! m_pRootArray)
			{
				m_pRootArray = m_pArray;
				m_pRootArray->retain();
			}

            CCSAXState preState = m_tStateStack.empty() ? SAX_NONE : m_tStateStack.top();
            if (preState == SAX_DICT)
            {
                m_pCurDict->setObject(m_pArray, m_sCurKey);
            }
            else if (preState == SAX_ARRAY)
            {
                CCAssert(! m_tArrayStack.empty(), "The state is worng!");
                std::vector<CCObject*>* pPreArray = m_tArrayStack.top();
                pPreArray.push_back(m_pArray);
            }
            m_pArray->release();
            // record the array state
            m_tStateStack.push(m_tState);
            m_tArrayStack.push(m_pArray);
        }
        else
        {
            m_tState = SAX_NONE;
        }
    }

    void endElement(void *ctx, const char *name)
    {
        CC_UNUSED_PARAM(ctx);
        CCSAXState curState = m_tStateStack.empty() ? SAX_DICT : m_tStateStack.top();
        std::string sName((char*)name);
        if( sName == "dict" )
        {
            m_tStateStack.pop();
            m_tDictStack.pop();
            if ( !m_tDictStack.empty())
            {
                m_pCurDict = m_tDictStack.top();
            }
        }
        else if (sName == "array")
        {
            m_tStateStack.pop();
            m_tArrayStack.pop();
            if (! m_tArrayStack.empty())
            {
                m_pArray = m_tArrayStack.top();
            }
        }
        else if (sName == "true")
        {
            CCString *str = new CCString("1");
            if (SAX_ARRAY == curState)
            {
                m_pArray.push_back(str);
            }
            else if (SAX_DICT == curState)
            {
                m_pCurDict->setObject(str, m_sCurKey);
            }
            str->release();
        }
        else if (sName == "false")
        {
            CCString *str = new CCString("0");
            if (SAX_ARRAY == curState)
            {
                m_pArray.push_back(str);
            }
            else if (SAX_DICT == curState)
            {
                m_pCurDict->setObject(str, m_sCurKey);
            }
            str->release();
        }
        m_tState = SAX_NONE;
    }

    void textHandler(void *ctx, const char *ch, int len)
    {
        CC_UNUSED_PARAM(ctx);
        if (m_tState == SAX_NONE)
        {
            return;
        }

        CCSAXState curState = m_tStateStack.empty() ? SAX_DICT : m_tStateStack.top();
        CCString *pText = new CCString();
        pText->m_sString = std::string((char*)ch,0,len);

        switch(m_tState)
        {
        case SAX_KEY:
            m_sCurKey = pText->m_sString;
            break;
        case SAX_INT:
        case SAX_REAL:
        case SAX_STRING:
            {
                CCAssert(!m_sCurKey.empty(), "not found key : <integet/real>");

                if (SAX_ARRAY == curState)
                {
                    m_pArray.push_back(pText);
                }
                else if (SAX_DICT == curState)
                {
                    m_pCurDict->setObject(pText, m_sCurKey);
                }
                break;
            }
        default:
            break;
        }
        pText->release();
    }
};

Animator::Animator()
	: CCObject()
{
}

Animator::~Animator()
{
}

Animator* Animator::animationFromFile(const char* fileName)
{
	Animator* anim = new Animator();
	anim->initAnimationsFromFile(fileName);
	anim->autorelease();
	return anim;
}

Animator* Animator::initAnimationsFromFile(const char* fileName)
{
	const char* path = CCFileUtils::fullPathFromRelativePath(fileName);
	CCArrayMaker tMaker;
	std::vector<CCObject*>* array = tMaker.arrayWithContentsOfFile(path);

	for (int i = 0; i < array->count(); ++i)
	{
		std::vector<std::string, CCObject*>* dict = static_cast<std::vector<std::string, CCObject*>*>(array->getObjectAtIndex(i));
		
		std::vector<std::string, CCObject*>* sourceDictionary = static_cast<std::vector<std::string, CCObject*>*>(dict->objectForKey("source"));
		CCPoint startPoint = ccp((float)(atof(valueForKey("x", sourceDictionary))), (float)(atof(valueForKey("y", sourceDictionary))));
		CCPoint anchorPoint = ccp((float)(atof(valueForKey("transformationPointX", sourceDictionary))), (float)(atof(valueForKey("transformationPointY", sourceDictionary))));
		float rotation = (float)(atof(valueForKey("rotation", sourceDictionary)));
		float scaleX = (float)(atof(valueForKey("scaleX", sourceDictionary)));
		float scaleY = (float)(atof(valueForKey("scaleY", sourceDictionary)));

		CCSetProps* initProps = CCSetProps::actionWithPosition(startPoint, rotation, scaleX, scaleY, anchorPoint);
		CCFiniteTimeAction *mainSequence = CCSequence::actions(initProps, NULL);

		if (sourceDictionary->objectForKey("alpha"))
		{
			GLubyte alpha = (GLubyte)(atof(valueForKey("alpha", sourceDictionary)) * 255.f);
			CCFadeTo *fadeAction = CCFadeTo::actionWithDuration(0.0f, alpha);
			mainSequence = CCSequence::actionOneTwo(mainSequence, fadeAction);
		}
	
		float currentX = startPoint.x;
		float currentY = startPoint.y;
		float currentScaleX = scaleX;
		float currentScaleY = scaleY;

		if ( string(valueForKey("name", sourceDictionary)) == "grass_F_C")
		{
			int a = 0;
			a = a;
		}

		std::vector<CCObject*>* keyframes = static_cast<std::vector<CCObject*>*>(dict->objectForKey("keyframes"));
		for (int j = 0; j < keyframes->count(); ++j)
		{
			std::vector<std::string, CCObject*>* keyframe = static_cast<std::vector<std::string, CCObject*>*>(keyframes->getObjectAtIndex(j));

			float duration = (float)(atof(valueForKey("duration", keyframe)));
			
			CCActionInterval* keyframeAction = CCSpawn::actionWithDuration(duration);
			
			if(keyframe->objectForKey("x") || keyframe->objectForKey("y"))
			{				
				float xChange = keyframe->objectForKey("x") ? (float)(atof(valueForKey("x", keyframe))) : currentX;
				float yChange = keyframe->objectForKey("y") ? (float)(atof(valueForKey("y", keyframe))) : currentY;
				
				currentX = xChange;
				currentY = yChange;
				
				CCMoveTo *moveAction = CCMoveTo::actionWithDuration(duration, ccp(currentX, currentY));
				keyframeAction = CCSpawn::actionOneTwo(keyframeAction, moveAction);
				
			}
			
			if(keyframe->objectForKey("scaleX") || keyframe->objectForKey("scaleY"))
			{
				float scaleXChange = keyframe->objectForKey("scaleX") ? (float)(atof(valueForKey("scaleX", keyframe))) : currentScaleX;
				float scaleYChange = keyframe->objectForKey("scaleY") ? (float)(atof(valueForKey("scaleY", keyframe))) : currentScaleY;
				
				currentScaleX = scaleXChange;
				currentScaleY = scaleYChange;	
				
				CCScaleTo *scaleAction = CCScaleTo::actionWithDuration(duration, currentScaleX, currentScaleY);
				keyframeAction = CCSpawn::actionOneTwo(keyframeAction, scaleAction);
			}
			
			if(keyframe->objectForKey("rotation"))
			{
				float angle = (float)(atof(valueForKey("rotation", keyframe)));
				CCRotateTo *rotateAction = CCRotateTo::actionWithDuration(duration, angle);
				keyframeAction = CCSpawn::actionOneTwo(keyframeAction, rotateAction);
			}
			
			if(keyframe->objectForKey("alpha"))
			{
				GLubyte alpha = (GLubyte)(atof(valueForKey("alpha", keyframe)) * 255.f);
				CCFadeTo *fadeAction = CCFadeTo::actionWithDuration(duration, alpha);
				keyframeAction = CCSpawn::actionOneTwo(keyframeAction, fadeAction);
			}
			
			//We make final action in case of easing.  In that case we will need to add a new action around the spawn action;
			float ease = (float)(atof(valueForKey("easing", keyframe)));
			
			//if there is easing we will figure out whether its in or out then multiply the amount by 2 to try and mimic flash's default easing
			if(ease != 0.0f)
			{
				CCFiniteTimeAction *easeAction;
				
				if(ease < 0.0f)
				{
					easeAction = CCEaseIn::actionWithAction(keyframeAction, fabsf(ease) * 2.f);
				} else if(ease > 0.0f)
				{
					easeAction = CCEaseOut::actionWithAction(keyframeAction, fabsf(ease) * 2.f);
				}
					
				mainSequence = CCSequence::actionOneTwo(mainSequence, easeAction);
			} else {
				mainSequence = CCSequence::actionOneTwo(mainSequence, keyframeAction);
			}
		}	

		if (dict->objectForKey("repeatForever"))
		{
			string repeat = valueForKey("repeatForever", dict);
			if (repeat == "1")
			{
				mainSequence = CCRepeatForever::actionWithAction((CCActionInterval*)mainSequence);
			}
		}

		_animations.setObject(mainSequence, valueForKey("name", sourceDictionary));
	}
	return this;
}

CCActionInterval* Animator::getAnimationByName(const char* name)
{
	return static_cast<CCActionInterval*>(_animations.objectForKey(name));
}