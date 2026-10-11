<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RequestLogger
{
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = (string) Str::uuid();
        $startTime = microtime(true);

        $request->headers->set('X-Request-ID', $requestId);

        Log::info('incoming_request', [
            'request_id' => $requestId,
            'method' => $request->method(),
            'path' => $request->path(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $response = $next($request);

        $durationMs = round((microtime(true) - $startTime) * 1000, 2);

        Log::info('outgoing_response', [
            'request_id' => $requestId,
            'status' => $response->getStatusCode(),
            'duration_ms' => $durationMs,
        ]);

        $response->headers->set('X-Request-ID', $requestId);
        $response->headers->set('X-Response-Time', $durationMs.'ms');

        return $response;
    }
}
