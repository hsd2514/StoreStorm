import json
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from appwrite.exception import AppwriteException

from config.appwrite import tables_db, DATABASE_ID
from models.gst import GSTReport

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
        from appwrite.query import Query
        queries = [
            Query.limit(limit),
            Query.offset(offset)
        ]
        
        if shop_id:
            queries.append(Query.equal("shop_id", shop_id))
        if period:
            queries.append(Query.equal("period", period))
        if status:
            queries.append(Query.equal("status", status))
        
        result = tables_db.list_rows(
            database_id=DATABASE_ID,
            table_id="gst_reports",
            queries=queries
        )
        
        reports = []
        for doc in result['rows']:
            # Parse JSON strings from Appwrite
            if isinstance(doc.get('breakdown'), str):
                try: doc['breakdown'] = json.loads(doc['breakdown'])
                except: doc['breakdown'] = {}
            if isinstance(doc.get('report_data'), str):
                try: doc['report_data'] = json.loads(doc['report_data'])
                except: doc['report_data'] = {}
            
            reports.append(GSTReport(**doc))
            
        return {
            "total": result['total'],
            "reports": reports
        }
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{report_id}", response_model=GSTReport)
async def get_gst_report(report_id: str):
    """Get a single GST report by ID"""
    try:
        report = tables_db.get_row(
            database_id=DATABASE_ID,
            table_id="gst_reports",
            row_id=report_id
        )
        # Parse JSON strings
        if isinstance(report.get('breakdown'), str):
            report['breakdown'] = json.loads(report['breakdown'])
        if isinstance(report.get('report_data'), str):
            report['report_data'] = json.loads(report['report_data'])
            
        return GSTReport(**report)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"GST Report {report_id} not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=GSTReport, status_code=201)
async def create_gst_report(report_data: GSTReport):
    """Create a new GST report"""
    try:
        from appwrite.id import ID
        
        data = report_data.model_dump(by_alias=True, exclude={"id", "created_at", "updated_at"})
        
        # Serialize Dict fields for Appwrite string attributes
        if isinstance(data.get('breakdown'), dict):
            data['breakdown'] = json.dumps(data['breakdown'])
        if isinstance(data.get('report_data'), dict):
            data['report_data'] = json.dumps(data['report_data'])
            
        report = tables_db.create_row(
            database_id=DATABASE_ID,
            table_id="gst_reports",
            row_id=ID.unique(),
            data=data
        )
        
        # Return parsed
        if isinstance(report.get('breakdown'), str):
            report['breakdown'] = json.loads(report['breakdown'])
        if isinstance(report.get('report_data'), str):
            report['report_data'] = json.loads(report['report_data'])
            
        return GSTReport(**report)
    except AppwriteException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{report_id}", response_model=GSTReport)
async def update_gst_report(report_id: str, report_data: dict):
    """Update a GST report"""
    try:
        report = tables_db.update_row(
            database_id=DATABASE_ID,
            table_id="gst_reports",
            row_id=report_id,
            data=report_data
        )
        return GSTReport(**report)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"GST Report {report_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{report_id}/file", response_model=GSTReport)
async def file_gst_report(report_id: str):
    """Mark a GST report as filed"""
    try:
        from datetime import datetime
        
        report = tables_db.update_row(
            database_id=DATABASE_ID,
            table_id="gst_reports",
            row_id=report_id,
            data={
                "status": "filed",
                "filed_at": datetime.utcnow().isoformat()
            }
        )
        return GSTReport(**report)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"GST Report {report_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{report_id}", status_code=204)
async def delete_gst_report(report_id: str):
    """Delete a GST report"""
    try:
        tables_db.delete_row(
            database_id=DATABASE_ID,
            table_id="gst_reports",
            row_id=report_id
        )
        return None
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"GST Report {report_id} not found")
        raise HTTPException(status_code=500, detail=str(e))
