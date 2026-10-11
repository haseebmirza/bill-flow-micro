from __future__ import annotations

import math
from datetime import datetime
from typing import List, Optional, Tuple

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import settings
from app.models.invoice import Invoice, InvoiceStatus


class InvoiceService:
    def __init__(self, db: Session):
        self.db = db

    def list_invoices(self, page: int = 1, per_page: int = 15) -> Tuple[List[Invoice], int]:
        total = self.db.scalar(select(func.count(Invoice.id)))
        invoices = (
            self.db.execute(
                select(Invoice)
                .order_by(Invoice.created_at.desc())
                .offset((page - 1) * per_page)
                .limit(per_page)
            )
            .scalars()
            .all()
        )
        return invoices, total

    def get_invoice(self, invoice_id: int) -> Optional[Invoice]:
        return self.db.get(Invoice, invoice_id)

    def get_invoice_by_payment(self, payment_id: str) -> Optional[Invoice]:
        return self.db.execute(
            select(Invoice).where(Invoice.payment_id == payment_id)
        ).scalar_one_or_none()

    def generate_invoice(
        self,
        payment_id: str,
        customer_email: str,
        customer_name: str,
        amount: int,
        currency: str,
    ) -> Invoice:
        existing = self.get_invoice_by_payment(payment_id)
        if existing:
            return existing

        invoice_number = self._next_invoice_number()
        tax_rate = settings.tax_rate
        tax_amount = math.floor(amount * tax_rate)
        total = amount + tax_amount

        invoice = Invoice(
            invoice_number=invoice_number,
            payment_id=payment_id,
            customer_email=customer_email,
            customer_name=customer_name,
            amount=amount,
            currency=currency,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            total=total,
            status=InvoiceStatus.GENERATED,
            issued_at=datetime.utcnow(),
        )

        self.db.add(invoice)
        self.db.commit()
        self.db.refresh(invoice)
        return invoice

    def cancel_invoice(self, payment_id: str) -> Optional[Invoice]:
        invoice = self.get_invoice_by_payment(payment_id)
        if not invoice or invoice.status == InvoiceStatus.CANCELLED:
            return invoice

        invoice.status = InvoiceStatus.CANCELLED
        self.db.commit()
        self.db.refresh(invoice)
        return invoice

    def _next_invoice_number(self) -> str:
        year = datetime.utcnow().year
        prefix = f"INV-{year}-"

        last_invoice = self.db.execute(
            select(Invoice)
            .where(Invoice.invoice_number.like(f"{prefix}%"))
            .order_by(Invoice.id.desc())
        ).scalar_one_or_none()

        if last_invoice:
            last_seq = int(last_invoice.invoice_number.split("-")[-1])
            next_seq = last_seq + 1
        else:
            next_seq = 1

        return f"{prefix}{next_seq:05d}"
