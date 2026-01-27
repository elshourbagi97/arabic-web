<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->headers->get('origin');
        
        $allowed = array_filter(array_map('trim', explode(',', env('ALLOWED_ORIGINS', ''))));
        
        $allowedAll = in_array('*', $allowed, true);
        
        // Check if origin matches allowed origins or localhost pattern
        $isAllowed = $allowedAll || 
                     in_array($origin, $allowed, true) ||
                     $this->isLocalhost($origin);
        
        $headers = [];
        
        if ($origin && $isAllowed) {
            $headers['Access-Control-Allow-Origin'] = $origin;
            $headers['Access-Control-Allow-Credentials'] = 'true';
            $headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
            $headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN';
            $headers['Vary'] = 'Origin';
        }
        
        if ($request->getMethod() === 'OPTIONS') {
            return response()->noContent(Response::HTTP_NO_CONTENT)->withHeaders($headers);
        }
        
        $response = $next($request);
        
        foreach ($headers as $key => $value) {
            $response->headers->set($key, $value);
        }
        
        return $response;
    }
    
    /**
     * Check if origin is localhost with any port
     */
    private function isLocalhost(?string $origin): bool
    {
        if (!$origin) {
            return false;
        }
        
        // Match http://localhost:ANY_PORT or http://127.0.0.1:ANY_PORT
        return preg_match('/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin) === 1;
    }
}