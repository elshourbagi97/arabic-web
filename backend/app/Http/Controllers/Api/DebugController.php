<?php

namespace App\Http\Controllers\Api;

use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class DebugController extends Controller
{
    /**
     * Debug endpoint to check column_headers encoding
     */
    public function checkEncoding(Request $request, Table $table)
    {
        // Get raw data from database
        $raw = DB::table('tables')
            ->where('id', $table->id)
            ->select('column_headers', 'label')
            ->first();
        
        $rawColumnHeaders = $raw->column_headers ?? '';
        $decodedHeaders = json_decode($rawColumnHeaders, true);
        
        // Analyze each header
        $analysis = [];
        if (is_array($decodedHeaders)) {
            foreach ($decodedHeaders as $idx => $header) {
                $headerAnalysis = [
                    'index' => $idx,
                    'original' => $header,
                    'length' => strlen($header),
                    'mb_length' => mb_strlen($header, 'UTF-8'),
                    'hex' => bin2hex($header),
                    'is_valid_utf8' => mb_check_encoding($header, 'UTF-8'),
                    'has_arabic' => preg_match('/[\x{0600}-\x{06FF}]/u', $header) === 1,
                    'has_high_bytes' => preg_match('/[\x80-\xFF]/', $header) === 1,
                ];
                
                // Try different encoding conversions
                $headerAnalysis['convert_from_cp1252'] = @mb_convert_encoding($header, 'UTF-8', 'Windows-1252');
                $headerAnalysis['convert_from_iso'] = @mb_convert_encoding($header, 'UTF-8', 'ISO-8859-1');
                
                // Check if any conversion produces Arabic
                $headerAnalysis['cp1252_has_arabic'] = preg_match('/[\x{0600}-\x{06FF}]/u', $headerAnalysis['convert_from_cp1252'] ?? '') === 1;
                $headerAnalysis['iso_has_arabic'] = preg_match('/[\x{0600}-\x{06FF}]/u', $headerAnalysis['convert_from_iso'] ?? '') === 1;
                
                $analysis[] = $headerAnalysis;
            }
        }
        
        // Get the model accessor result
        $modelHeaders = $table->column_headers;
        
        return response()->json([
            'table_id' => $table->id,
            'label' => $raw->label,
            'raw_json' => $rawColumnHeaders,
            'raw_json_hex' => bin2hex($rawColumnHeaders),
            'decoded_headers' => $decodedHeaders,
            'model_accessor_headers' => $modelHeaders,
            'header_analysis' => $analysis,
        ], 200, [], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
}
