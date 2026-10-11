from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.invoice import InvoiceListResponse, InvoiceResponse
from app.services.invoice_service import InvoiceService
from app.services.pdf_service import PDFService

router = APIRouter(prefix="/api")


@router.get("/health")
def health_check():
    return {
        "service": "invoice-service",
        "status": "ok",
    }


@router.get("/invoices", response_model=InvoiceListResponse)
def list_invoices(
    page: int = 1,
    per_page: int = 15,
    db: Session = Depends(get_db),
):
    service = InvoiceService(db)
    invoices, total = service.list_invoices(page=page, per_page=per_page)

    return InvoiceListResponse(
        data=[InvoiceResponse.model_validate(inv) for inv in invoices],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    service = InvoiceService(db)
    invoice = service.get_invoice(invoice_id)

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    return InvoiceResponse.model_validate(invoice)


@router.get("/invoices/{invoice_id}/pdf")
def download_invoice_pdf(invoice_id: int, db: Session = Depends(get_db)):
    service = InvoiceService(db)
    invoice = service.get_invoice(invoice_id)

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    pdf_bytes = PDFService.generate_invoice_pdf(invoice)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{invoice.invoice_number}.pdf"'
        },
    )
