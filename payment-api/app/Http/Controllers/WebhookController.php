<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Http\Requests\WebhookRequest;
use App\Http\Resources\PaymentResource;
use App\Services\PaymentService;

class WebhookController extends Controller
{
    public function __construct(private PaymentService $paymentService) {}

    public function stripe(WebhookRequest $request): PaymentResource
    {
        $payment = $this->paymentService->processWebhook(
            $request->validated('payment_uuid'),
            PaymentStatus::from($request->validated('status')),
        );

        return new PaymentResource($payment);
    }
}
