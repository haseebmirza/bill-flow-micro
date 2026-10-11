<?php

namespace App\Exceptions;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use Symfony\Component\HttpKernel\Exception\HttpException;

class PaymentException extends HttpException
{
    public static function cannotRefund(Payment $payment): self
    {
        return new self(
            422,
            "Payment with status '{$payment->status->value}' cannot be refunded. Only completed payments are eligible."
        );
    }

    public static function cannotTransition(Payment $payment, PaymentStatus $targetStatus): self
    {
        return new self(
            422,
            "Payment cannot transition from '{$payment->status->value}' to '{$targetStatus->value}'."
        );
    }
}
