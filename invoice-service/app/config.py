from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "invoice-service"
    database_url: str = "postgresql://billflow:billflow_secret@localhost:5432/billflow_invoices"
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_consumer_group: str = "invoice-service"
    tax_rate: float = 0.21
    debug: bool = True

    model_config = {"env_prefix": "INVOICE_"}


settings = Settings()
