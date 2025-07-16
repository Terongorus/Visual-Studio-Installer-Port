// $handler_atl_doc_header_file$ : Declaration of the $handler_atl_doc_class_name$

#pragma once

#include <atlhandlerimpl.h>

using namespace ATL;

class $handler_atl_doc_class_name$ : public CAtlDocumentImpl
{
public:
	$handler_atl_doc_class_name$(void)
	{
	}

	virtual ~$handler_atl_doc_class_name$(void)
	{
	}

	virtual HRESULT LoadFromStream(IStream* pStream, DWORD grfMode);
	virtual void InitializeSearchContent();

protected:
	void SetSearchContent(CString& value);
	virtual void OnDrawThumbnail(HDC hDrawDC, LPRECT lprcBounds);
};
