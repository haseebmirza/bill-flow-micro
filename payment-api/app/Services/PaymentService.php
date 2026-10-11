<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Exceptions\PaymentException;
use App\Kafka\PaymentEventPublisher;
use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(private PaymentEventPublisher $eventPublisher) {}

    public function list(int $perPage = 15): LengthAwarePaginator
    {
        return Payment::latest()->paginate($perPage);
    }

    public function create(array $data): Payment
    {
        $payment = DB::transaction(function () use ($data) {
            return Payment::create([
                ...$data,
                'status' => PaymentStatus::Pending,
            ]);
        });

        $this->eventPublisher->publishPaymentCreated($payment);

        return $payment;
    }

    public function refund(Payment $payment): Payment
    {
        if (!$payment->status->canTransitionTo(PaymentStatus::Refunded)) {
            throw PaymentException::cannotRefund($payment);
        }

        $payment = DB::transaction(function () use ($payment) {
            $payment->update(['status' => PaymentStatus::Refunded]);
            return $payment->fresh();
        });

        $this->eventPublisher->publishPaymentRefunded($payment);

        return $payment;
    }

    public function processWebhook(string $uuid, PaymentStatus $status): Payment
    {
        $payment = Payment::where('uuid', $uuid)->firstOrFail();

        if (!$payment->status->canTransitionTo($status)) {
            throw PaymentException::cannotTransition($payment, $status);
        }

        $payment = DB::transaction(function () use ($payment, $status) {
            $payment->update(['status' => $status]);
            return $payment->fresh();
        });

        $this->eventPublisher->publishForStatus($payment);

        return $payment;
    }
}
