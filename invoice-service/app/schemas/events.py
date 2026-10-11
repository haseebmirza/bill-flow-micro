from datetime import datetime

from pydantic import BaseModel


class PaymentEventData(BaseModel):
    payment_id: str
    customer_email: str
    customer_name: str
    amount: int
    currency: str
    status: str


class PaymentEvent(BaseModel):
    event_id: str
    event_type: str
    timestamp: datetime
    data: PaymentEventData
