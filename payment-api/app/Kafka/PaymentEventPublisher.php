<?php

namespace App\Kafka;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use Illuminate\Support\Str;

class PaymentEventPublisher
{
    public function __construct(private KafkaProducer $producer) {}

    public function publishPaymentCreated(Payment $payment): void
    {
        $this->publish('payment.created', $payment);
    }

    public function publishPaymentCompleted(Payment $payment): void
    {
        $this->publish('payment.completed', $payment);
    }

    public function publishPaymentFailed(Payment $payment): void
    {
        $this->publish('payment.failed', $payment);
    }

    public function publishPaymentRefunded(Payment $payment): void
    {
        $this->publish('payment.refunded', $payment);
    }

    public function publishForStatus(Payment $payment): void
    {
        match ($payment->status) {
            PaymentStatus::Pending => $this->publishPaymentCreated($payment),
            PaymentStatus::Completed => $this->publishPaymentCompleted($payment),
            PaymentStatus::Failed => $this->publishPaymentFailed($payment),
            PaymentStatus::Refunded => $this->publishPaymentRefunded($payment),
            default => null,
        };
    }

    private function publish(string $topic, Payment $payment): void
    {
        $this->producer->publish($topic, [
            'event_id' => (string) Str::uuid(),
            'event_type' => $topic,
            'timestamp' => now()->toIso8601String(),
            'data' => [
                'payment_id' => $payment->uuid,
                'customer_email' => $payment->customer_email,
                'customer_name' => $payment->customer_name,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'status' => $payment->status->value,
            ],
        ]);
    }
}
