<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_email',
        'customer_name',
        'amount',
        'currency',
        'status',
        'payment_method',
        'description',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'integer',
        'status' => PaymentStatus::class,
        'metadata' => 'array',
    ];

    protected $hidden = ['id'];

    protected static function booted(): void
    {
        static::creating(function (Payment $payment) {
            $payment->uuid = (string) Str::uuid();
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
