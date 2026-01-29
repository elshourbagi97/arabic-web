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
        // 1. Authorization
        if ($table->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // 2. Setup Environment for Arabic/UTF-8
            mb_internal_encoding("UTF-8");
            mb_http_output("UTF-8");
            
            // Load table data
            $table = $table->load('rows', 'notes');

            // 3. Generate HTML Content
            $html = $this->generateTableHTML($table);

            // 4. Configure DomPDF
            // We use a specific cache directory to prevent file locking issues
            $cacheDir = storage_path('framework/cache/dompdf');
            if (!file_exists($cacheDir)) {
                @mkdir($cacheDir, 0755, true);
            }

            $options = new Options();
            $options->set('isRemoteEnabled', true);
            $options->set('isHtml5ParserEnabled', true);
            $options->set('isFontSubsettingEnabled', false); // Disable to avoid cache corruption on repeated requests
            $options->set('defaultFont', 'DejaVu Sans');
            $options->set('fontDir', $cacheDir); 
            $options->set('fontCache', $cacheDir);
            $options->set('tempDir', $cacheDir);
            $options->set('chroot', realpath(base_path()));

            // 5. Instantiate & Render
            $dompdf = new Dompdf($options);
            $dompdf->setPaper('a4', 'landscape');
            
            // Clean any buffer garbage
            if (ob_get_length()) ob_end_clean();
            
            $dompdf->loadHtml($html, 'UTF-8');
            $dompdf->render();

            // 6. Return Response with No-Cache Headers
            $content = $dompdf->output();

            return response($content)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="' . $this->sanitizeFilename($table->label) . '.pdf"')
                ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
                ->header('Pragma', 'no-cache')
                ->header('Expires', 'Sat, 26 Jul 1997 05:00:00 GMT');

        } catch (\Exception $e) {
            \Log::error("PDF Export Error: " . $e->getMessage());
            return response()->json([
                'message' => 'Error generating PDF',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function sanitizeFilename($filename)
    {
        // Remove special chars that might break the header, keep Arabic
        return preg_replace('/[^\p{L}\p{N}_\- ]/u', '', $filename);
    }

    private function reshapeArabic($text)
    {
        if (!$text) return $text;
        if (class_exists('ArPHP\I18N\Arabic')) {
            $arabic = new \ArPHP\I18N\Arabic('Glyphs');
            return $arabic->utf8Glyphs($text);
        }
        return $text;
    }

    private function generateTableHTML(Table $table)
    {
        // We use DejaVu Sans which is built-in to DomPDF 2.x+, no need for external font file references usually.
        // But if needed, we define the font-family stack.
        
        $html = '<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta charset="UTF-8">
    <title>' . htmlspecialchars($table->label) . '</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: "DejaVu Sans", sans-serif;
            direction: rtl;
            text-align: right;
            padding: 20px;
            font-size: 12pt;
        }
        h1 { text-align: center; color: #333; margin-bottom: 5px; }
        .subtitle { text-align: center; color: #666; font-size: 10pt; margin-bottom: 20px; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: center; 
            vertical-align: middle;
        }
        th { background-color: #f8f9fa; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        
        .notes-box {
            background: #fafffa;
            border: 1px solid #e0e0e0;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .notes-title { font-weight: bold; color: #2e7d32; margin-bottom: 5px; }
        .footer { 
            margin-top: 50px; 
            text-align: center; 
            font-size: 9pt; 
            color: #999; 
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <h1>' . htmlspecialchars($this->reshapeArabic($table->label)) . '</h1>
    <div class="subtitle">' . $this->reshapeArabic('تقرير تم تصديره من النظام') . '</div>

    <table>
        <thead>
            <tr>
                <th width="40" style="background-color: #eee;">#</th>';
        
        if (!empty($table->column_headers)) {
            foreach ($table->column_headers as $h) {
                $html .= '<th>' . htmlspecialchars($this->reshapeArabic($h)) . '</th>';
            }
        }
        
        $html .= '</tr></thead><tbody>';

        $rowIndex = 1;
        foreach ($table->rows as $row) {
            $html .= '<tr>';
            $html .= '<td style="background-color: #f8f9fa;">' . $rowIndex++ . '</td>';
            
            // Ensure we match the number of columns in headers
            $maxCols = !empty($table->column_headers) ? count($table->column_headers) : 0;
            $data = $row->row_data ?? [];
            
            for ($i = 0; $i < $maxCols; $i++) {
                $val = $data[$i] ?? '';
                $html .= '<td>' . htmlspecialchars($this->reshapeArabic($val)) . '</td>';
            }
            $html .= '</tr>';
        }

        $html .= '</tbody></table>';

        if (!empty($table->notes)) {
            $html .= '<div class="notes-box">
                <div class="notes-title">' . $this->reshapeArabic('الملاحظات') . '</div>
                <div>' . nl2br(htmlspecialchars($this->reshapeArabic($table->notes))) . '</div>
            </div>';
        }

        $html .= '<div class="footer">
            ' . $this->reshapeArabic('تاريخ التصدير') . ': ' . date('Y-m-d H:i') . '
        </div>
</body>
</html>';

        return $html;
    }
}
