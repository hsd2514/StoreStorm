"""
API Router for GST Report endpoints
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from appwrite.exception import AppwriteException

from config.appwrite import databases, DATABASE_ID

router = APIRouter(prefix="/gst-reports", tags=["GST Reports"])


@router.get("/", response_model=dict)
async def list_gst_reports(
    limit: int = Query(default=25, le=100),
    offset: int = Query(default=0, ge=0),
    shop_id: Optional[str] = None,
    period: Optional[str] = None,
    status: Optional[str] = None
):
    """List GST reports with filtering"""
    try:
        queries = []
        if shop_id:
            queries.append(f'shop_id="{shop_id}"')
        if period:
            queries.append(f'period="{period}"')
        if status:
            queries.append(f'status="{status}"')
        
        result = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id="gst_reports",
            queries=queries
        )
        
        return {
            "total": result['total'],
            "reports": result['documents']
        }
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{report_id}", response_model=dict)
async def get_gst_report(report_id: str):
    """Get a single GST report by ID"""
    try:
        report = databases.get_document(
            database_id=DATABASE_ID,
            collection_id="gst_reports",
            document_id=report_id
        )
        return report
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"GST Report {report_id} not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict, status_code=201)
async def create_gst_report(report_data: dict):
    """Create a new GST report"""
    try:
        from appwrite.id import ID
        
        report = databases.create_document(
            database_id=DATABASE_ID,
            collection_id="gst_reports",
            document_id=ID.unique(),
            data=report_data
        )
        return report
    except AppwriteException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{report_id}", response_model=dict)
async def update_gst_report(report_id: str, report_data: dict):
    """Update a GST report"""
    try:
        report = databases.update_document(
            database_id=DATABASE_ID,
            collection_id="gst_reports",
            document_id=report_id,
            data=report_data
        )
        return report
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"GST Report {report_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{report_id}/file", response_model=dict)
async def file_gst_report(report_id: str):
    """Mark a GST report as filed"""
    try:
        from datetime import datetime
        
        report = databases.update_document(
            database_id=DATABASE_ID,
            collection_id="gst_reports",
            document_id=report_id,
            data={
                "status": "filed",
                "filed_at": datetime.utcnow().isoformat()
            }
        )
        return report
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"GST Report {report_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{report_id}", status_code=204)
async def delete_gst_report(report_id: str):
    """Delete a GST report"""
    try:
        databases.delete_document(
            database_id=DATABASE_ID,
            collection_id="gst_reports",
            document_id=report_id
        )
        return None
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"GST Report {report_id} not found")
        raise HTTPException(status_code=500, detail=str(e))
