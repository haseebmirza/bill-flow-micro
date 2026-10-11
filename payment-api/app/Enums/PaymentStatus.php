<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Completed = 'completed';
    case Failed = 'failed';
    case Refunded = 'refunded';

    public function canTransitionTo(self $target): bool
    {
        return match ($this) {
            self::Pending => in_array($target, [self::Processing, self::Completed, self::Failed]),
            self::Processing => in_array($target, [self::Completed, self::Failed]),
            self::Completed => $target === self::Refunded,
            self::Failed, self::Refunded => false,
        };
    }
}
