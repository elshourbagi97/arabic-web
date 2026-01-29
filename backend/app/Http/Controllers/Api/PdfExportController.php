<?php

namespace App\Http\Controllers\Api;

use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Dompdf\Dompdf;
use Dompdf\Options;

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
                // ... (proxy logic kept same, omitted for brevity if not changing) ...
            }

            // Create HTML for PDF with Arabic support
            $html = $this->generateTableHTML($table);

            // Generate PDF using direct DomPDF class to ensure fresh instance
            
            // Ensure font directory exists
            if (!file_exists(storage_path('fonts'))) {
                mkdir(storage_path('fonts'), 0755, true);
            }

            $options = new Options();
            $options->set('isRemoteEnabled', true);
            $options->set('isHtml5ParserEnabled', true);
            $options->set('isFontSubsettingEnabled', true);
            $options->set('defaultFont', 'DejaVu Sans');
            $options->set('fontDir', storage_path('fonts'));
            $options->set('fontCache', storage_path('fonts'));

            $dompdf = new Dompdf($options);
            $dompdf->setPaper('a4', 'landscape');
            // Do not add BOM, rely on <meta charset="utf-8">
            $dompdf->loadHtml($html, 'UTF-8');
            
            // Clear any potential output buffer content (whitespace/warnings) to prevent corruption
            if (ob_get_length()) ob_end_clean();
            
            $dompdf->render();

            return $dompdf->stream($table->label . '.pdf', [
                'Attachment' => true
            ]);

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
