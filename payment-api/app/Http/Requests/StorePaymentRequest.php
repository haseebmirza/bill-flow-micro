<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_email' => 'required|email|max:255',
            'customer_name' => 'required|string|max:255',
            'amount' => 'required|integer|min:1',
            'currency' => 'sometimes|string|size:3|uppercase',
            'payment_method' => 'sometimes|string|max:50',
            'description' => 'sometimes|string|max:500',
            'metadata' => 'sometimes|array',
        ];
    }
}
