from __future__ import annotations

from datetime import datetime
from typing import List

from pydantic import BaseModel  # type: ignore[import-not-found]

from app.models.invoice import InvoiceStatus


class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    payment_id: str
    customer_email: str
    customer_name: str
    amount: int
    currency: str
    tax_rate: float
    tax_amount: int
    total: int
    status: InvoiceStatus
    issued_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class InvoiceListResponse(BaseModel):
    data: List[InvoiceResponse]
    total: int
    page: int
    per_page: int
