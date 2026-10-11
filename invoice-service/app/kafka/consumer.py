import asyncio
import json
import logging

from aiokafka import AIOKafkaConsumer

from app.config import settings
from app.database import SessionLocal
from app.schemas.events import PaymentEvent
from app.services.invoice_service import InvoiceService

logger = logging.getLogger(__name__)

TOPICS = ["payment.completed", "payment.refunded"]


async def start_consumer():
    consumer = AIOKafkaConsumer(
        *TOPICS,
        bootstrap_servers=settings.kafka_bootstrap_servers,
        group_id=settings.kafka_consumer_group,
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
        auto_offset_reset="earliest",
    )

    while True:
        try:
            await consumer.start()
            logger.info("Kafka consumer started, listening on: %s", TOPICS)
            break
        except Exception as e:
            logger.warning("Kafka not available, retrying in 5s: %s", e)
            await asyncio.sleep(5)

    try:
        async for message in consumer:
            await handle_message(message)
    finally:
        await consumer.stop()


async def handle_message(message):
    try:
        event = PaymentEvent(**message.value)
        logger.info(
            "Received event: %s for payment %s",
            event.event_type,
            event.data.payment_id,
        )

        db = SessionLocal()
        try:
            service = InvoiceService(db)

            if event.event_type == "payment.completed":
                invoice = service.generate_invoice(
                    payment_id=event.data.payment_id,
                    customer_email=event.data.customer_email,
                    customer_name=event.data.customer_name,
                    amount=event.data.amount,
                    currency=event.data.currency,
                )
                logger.info("Invoice generated: %s", invoice.invoice_number)

            elif event.event_type == "payment.refunded":
                invoice = service.cancel_invoice(payment_id=event.data.payment_id)
                if invoice:
                    logger.info("Invoice cancelled: %s", invoice.invoice_number)

        finally:
            db.close()

    except Exception as e:
        logger.error("Failed to process message: %s", e, exc_info=True)


async def safe_start_consumer():
    try:
        await start_consumer()
    except Exception as e:
        logger.error("Kafka consumer failed: %s", e)
