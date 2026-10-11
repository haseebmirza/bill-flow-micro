<?php

namespace App\Http\Requests;

use App\Enums\PaymentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WebhookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_uuid' => 'required|uuid|exists:payments,uuid',
            'status' => ['required', Rule::in([PaymentStatus::Completed->value, PaymentStatus::Failed->value])],
        ];
    }
}
