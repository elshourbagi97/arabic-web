<?php

namespace App\Http\Controllers\Api;

use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Http;

class PdfExportController extends Controller
{
    public function exportTable(Request $request, Table $table)
    {
        // Check authorization
        if ($table->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // Load table with relations
            $table = $table->load('rows', 'notes');

            // If a Node PDF service is configured, proxy to it (preferred for better RTL/Arabic rendering)
            $pdfService = env('PDF_SERVICE_URL');
            if (!empty($pdfService)) {
                try {
                    $payload = [
                        'title' => $table->label,
                        'headers' => $table->column_headers ?? [],
                        'rows' => [],
                        'filename' => $table->label,
                        'response' => 'attachment',
                    ];
                    foreach ($table->rows as $r) {
                        if (is_array($r->row_data)) {
                            $payload['rows'][] = $r->row_data;
                        } else {
                            $payload['rows'][] = [];
                        }
                    }

                    $apiKey = env('PDF_API_KEY');
                    $client = Http::withHeaders($apiKey ? ['Authorization' => 'Bearer ' . $apiKey] : [])->timeout(60);
                    $resp = $client->post(rtrim($pdfService, '/') . '/generate-pdf', $payload);

                    if ($resp->successful() && str_contains($resp->header('Content-Type', ''), 'application/pdf')) {
                        return response($resp->body(), 200)
                            ->header('Content-Type', 'application/pdf')
                            ->header('Content-Disposition', 'attachment; filename="' . $table->label . '.pdf"');
                    }

                    // If service returned JSON with base64, decode and return
                    if ($resp->ok()) {
                        $json = $resp->json();
                        if (isset($json['content_base64'])) {
                            $pdfBytes = base64_decode($json['content_base64']);
                            return response($pdfBytes, 200)
                                ->header('Content-Type', 'application/pdf')
                                ->header('Content-Disposition', 'attachment; filename="' . $table->label . '.pdf"');
                        }
                    }
                } catch (\Exception $e) {
                    // If proxy fails, fall back to server-side DomPDF below
                    \Log::warning('PDF service proxy failed: ' . $e->getMessage());
                }
            }

            // Create HTML for PDF with Arabic support
            $html = $this->generateTableHTML($table);

            // Generate PDF using DomPDF
            // Add BOM to force UTF-8
            $htmlWithBOM = "\xEF\xBB\xBF" . $html;

            /** @var \Barryvdh\DomPDF\PDF $pdf */
            $pdf = app('dompdf.wrapper');
            
            // Set options on the underlying DomPDF class
            $pdf->getDomPDF()->set_option('isRemoteEnabled', true);
            $pdf->getDomPDF()->set_option('isHtml5ParserEnabled', true);
            $pdf->getDomPDF()->set_option('isFontSubsettingEnabled', true);
            $pdf->getDomPDF()->set_option('defaultFont', 'DejaVu Sans');

            // Explicitly pass encoding to loadHTML
            $pdf->loadHTML($htmlWithBOM, 'UTF-8');
            $pdf->setPaper('a4', 'landscape');

            return $pdf->download($table->label . '.pdf');
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error generating PDF',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function reshapeArabic($text)
    {
        if (!$text) return $text;
        
        // Check for ArPHP library (khaled.alshamaa/ar-php)
        if (class_exists('ArPHP\I18N\Arabic')) {
            $arabic = new \ArPHP\I18N\Arabic('Glyphs');
            return $arabic->utf8Glyphs($text);
        }
        
        return $text;
    }

    private function generateTableHTML(Table $table)
    {
        // Prefer a shipped Arabic TTF in public/fonts (e.g. NotoNaskhArabic-Regular.ttf)
        $fontUrl = asset('fonts/NotoNaskhArabic-Regular.ttf');

        $html = '<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: "DejaVu Sans", sans-serif;
            direction: rtl;
            color: #222;
            padding: 18px;
            background: #fff;
        }

        .header { text-align: center; margin-bottom: 18px; padding-bottom: 8px; }
        .header h1 { font-size: 18pt; font-weight: 700; color: #222; margin-bottom: 4px; }
        .header p { font-size: 11pt; color: #666; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 14px; table-layout: fixed; }
        table caption { caption-side: top; text-align: center; font-size: 16pt; font-weight: 700; padding: 6px 0; }

        table thead th { background: #f5f5f5; border: 1px solid #e6e6e6; padding: 10px 8px; text-align: center; vertical-align: middle; font-weight: 700; }
        table tbody td { border: 1px solid #ececec; padding: 10px 8px; text-align: center; vertical-align: middle; height: 52px; white-space: normal; word-break: break-word; line-height: 1.4; }
        table tbody tr:nth-child(even) { background: #fbfbfb; }

        
        .notes-section {
            margin-top: 30px;
            padding: 15px;
            background-color: #f5f5f5;
            border-right: 4px solid #2c5aa0;
            border-radius: 4px;
        }
        
        .notes-section h3 {
            color: #2c5aa0;
            font-size: 16px;
            margin-bottom: 10px;
        }
        
        .notes-section p {
            color: #333;
            font-size: 12px;
            line-height: 1.6;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        
        .export-date {
            margin-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>' . htmlspecialchars($this->reshapeArabic($table->label)) . '</h1>
        <p>' . $this->reshapeArabic('تم تصدير من نظام الإدارة - Export from Management System') . '</p>
    </div>
    
    <table>
        <thead>
            <tr>';

        // Row number column (on the far right for RTL)
        $html .= '<th>#</th>';

        // Add column headers
        if ($table->column_headers && is_array($table->column_headers)) {
            foreach ($table->column_headers as $header) {
                $html .= '<th>' . htmlspecialchars($this->reshapeArabic($header)) . '</th>';
            }
        }

        $html .= '</tr>
        </thead>
        <tbody>';

        // Add table rows with leading row-number column
        for ($rIndex = 0; $rIndex < count($table->rows); $rIndex++) {
            $row = $table->rows[$rIndex];
            $html .= '<tr>';
            // Row number
            $html .= '<td>' . ($rIndex + 1) . '</td>';
            if (isset($row->row_data) && is_array($row->row_data)) {
                foreach ($row->row_data as $cell) {
                    $html .= '<td>' . htmlspecialchars($this->reshapeArabic($cell ?? '')) . '</td>';
                }
            } else {
                // fill empty columns if no row_data
                if (is_array($table->column_headers)) {
                    foreach ($table->column_headers as $h) {
                        $html .= '<td></td>';
                    }
                }
            }
            $html .= '</tr>';
        }
        
        $html .= '</tbody>
    </table>';
        
        // Add notes if available
        if (!empty($table->notes)) {
            $html .= '
    <div class="notes-section">
        <h3>' . $this->reshapeArabic('ملاحظات') . '</h3>
        <p>' . htmlspecialchars($this->reshapeArabic($table->notes)) . '</p>
    </div>';
        }
        
        // Add footer
        $html .= '
    <div class="footer">
        <p>© ' . date('Y') . ' - ' . $this->reshapeArabic('نظام إدارة البيانات') . '</p>
    </div>
    
    <div class="export-date">
        <p>' . $this->reshapeArabic('تاريخ التصدير:') . ' ' . date('Y-m-d H:i:s') . '</p>
    </div>
</body>
</html>';
        
        return $html;
    }
}
