#if EDITOR==1
#include "base/CCDirector.h"
#include "editor/platform/DropFileProtocol.h"
#include "platform/desktop/CCGLViewImpl-desktop.h"
#include <Ole2.h>
#include <OleIdl.h>
#pragma comment ( lib, "Ole32.lib" )

USING_NS_CC;

DropFileProtocol * DropFileProtocol::m_instance( NULL );

namespace
{
	HWND _hWnd( 0 );
}

class DropTarget : public IDropTarget
{
	ULONG refcount;
public:
	DropTarget():refcount(0)
	{
	}

    virtual HRESULT STDMETHODCALLTYPE QueryInterface( REFIID riid, _COM_Outptr_ void __RPC_FAR *__RPC_FAR *ppvObject)
	{
		if (riid == IID_IUnknown || riid == IID_IDropTarget) 
		{
			*ppvObject = static_cast<IUnknown*>(this);
			AddRef();
			return S_OK;
		}
		*ppvObject = NULL;
		return E_NOINTERFACE;
	}

    virtual ULONG STDMETHODCALLTYPE AddRef( void)
	{
		LONG cRef = InterlockedIncrement(&refcount);
		return cRef;
	}

    virtual ULONG STDMETHODCALLTYPE Release( void)
	{
		LONG cRef = InterlockedIncrement(&refcount);
		if( cRef == 0 ) delete this;
		return cRef;
	}

	Point convertPoint(POINTL pt)
	{
		auto director = Director::getInstance();
		auto eglview = director->getOpenGLView();
		RECT rect;
		GetWindowRect( _hWnd, &rect );

		int width = rect.right - rect.left;
		int height = rect.bottom - rect.top;

		int border = (width - 1366) / 2;
		int caption = (height - 768) - border;

		Size winsize = eglview->getDesignResolutionSize();
		Point point( float(pt.x), float(pt.y));
		point.x = point.x - rect.left - border;
		point.y = point.y - rect.top - caption;
		point.y = winsize.height - point.y;
		return point;
	}

    virtual HRESULT STDMETHODCALLTYPE DragEnter( IDataObject *pDataObj, DWORD grfKeyState, POINTL pt, DWORD *pdwEffect)
	{
		DropFileProtocol::getInstance()->onDropBegin( convertPoint(pt) );
		return S_OK;
	}

    virtual HRESULT STDMETHODCALLTYPE DragOver( DWORD grfKeyState, POINTL pt, DWORD *pdwEffect)
	{
		DropFileProtocol::getInstance()->onDropMoved( convertPoint(pt) );
		return S_OK;
	}
        
    virtual HRESULT STDMETHODCALLTYPE DragLeave( void)
	{
		DropFileProtocol::getInstance()->onDropCanceled();
		return S_OK;
	}
        
    virtual HRESULT STDMETHODCALLTYPE Drop( __RPC__in_opt IDataObject *pDataObj, DWORD grfKeyState, POINTL pt, __RPC__inout DWORD *pdwEffect)
	{
		std::list<std::string> files;
		FORMATETC fmte = { CF_HDROP, NULL, DVASPECT_CONTENT, -1, TYMED_HGLOBAL };
		STGMEDIUM stgm;
		if (SUCCEEDED(pDataObj->GetData(&fmte, &stgm))) {
			HDROP hdrop = reinterpret_cast<HDROP>(stgm.hGlobal);
			UINT cFiles = DragQueryFileA(hdrop, 0xFFFFFFFF, NULL, 0);
			for (UINT i = 0; i < cFiles; i++) {
				CHAR szFile[MAX_PATH];
				UINT cch = DragQueryFileA(hdrop, i, szFile, MAX_PATH);
				files.push_back(szFile);
			}
			ReleaseStgMedium(&stgm);
		}
		DropFileProtocol::getInstance()->onDropEnded( convertPoint(pt), files );
		return S_OK;
	}
} *DropTargetInstance(NULL);

bool DropFileProtocol::init() 
{
	_hWnd = FindWindowA( NULL, "Editor: IslandDefense" );

	HRESULT result = OleInitialize(NULL);
	DropTargetInstance = new DropTarget;
	result = RegisterDragDrop( _hWnd, DropTargetInstance );
	return result == S_OK;
}

void DropFileProtocol::cleanup()
{
	OleUninitialize();
	RevokeDragDrop( _hWnd );
}
/*
void DropFileProtocol::onDropBegin( const cocos2d::CCPoint & locationInView )
{
	//EditorScene::getInstance()->dragFileBegan();
}

void DropFileProtocol::onDropEnded( const cocos2d::CCPoint & locationInView, const std::list<std::string> & files )
{
	//EditorScene::getInstance()->dragFileEnded( convertPoint(pt), files );
}

void DropFileProtocol::onDropMoved( const cocos2d::CCPoint & locationInView )
{
	//EditorScene::getInstance()->dragFileOver( convertPoint(pt) );
}

void DropFileProtocol::onDropCanceled( )
{
	//EditorScene::getInstance()->dragFileCancel();
}
*/
#endif