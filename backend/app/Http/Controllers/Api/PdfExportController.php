<?php

namespace App\Http\Controllers\Api;

use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Mpdf\Mpdf;

class PdfExportController extends Controller
{
    public function exportTable(Request $request, Table $table)
    {
        // 1. Authorization
        if ($table->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // Load table data
            $table = $table->load('rows', 'notes');

            // 2. Generate HTML Content
            $html = $this->generateTableHTML($table);

            // 3. Configure mPDF
            // We use a specific temp directory to prevent permission issues
            $tempDir = storage_path('framework/cache/mpdf');
            if (!file_exists($tempDir)) {
                @mkdir($tempDir, 0755, true);
            }

            $mpdf = new Mpdf([
                'mode' => 'utf-8',
                'format' => 'A4-L', // Landscape
                'orientation' => 'L',
                'tempDir' => $tempDir,
                'autoScriptToLang' => true,
                'autoLangToFont' => true,
                'default_font' => 'aealarabiya', // Arabic-compatible font
            ]);

            // Ensure RTL directionality is forced
            $mpdf->SetDirectionality('rtl');

            // 4. Render
            $mpdf->WriteHTML($html);

            // 5. Return Response
            // 'S' returns the PDF as a string
            $content = $mpdf->Output($this->sanitizeFilename($table->label) . '.pdf', 'S');

            return response($content)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename*=UTF-8''" . rawurlencode($this->sanitizeFilename($table->label)) . ".pdf")
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

    private function generateTableHTML(Table $table)
    {
        // mPDF handles styling well.
        
        $html = '<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>' . htmlspecialchars($table->label, ENT_QUOTES, 'UTF-8') . '</title>
    <style>
        body {
            font-family: 'aealarabiya', 'Arial', sans-serif;
            direction: rtl;
            text-align: right;
        }
        h1 { text-align: center; color: #333; margin-bottom: 5px; }
        .subtitle { text-align: center; color: #666; font-size: 10pt; margin-bottom: 20px; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; direction: rtl; }
        th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: right; 
        }
        th {
            background-color: #f8f9fa;
            font-family: aealarabiya !important;
            font-weight: normal !important;
        }
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
    <h1>' . htmlspecialchars($table->label, ENT_QUOTES, 'UTF-8') . '</h1>
    <div class="subtitle">تقرير تم تصديره من النظام</div>

    <table>
        <thead>
            <tr>
                <th width="40" style="background-color: #eee;">#</th>';
        
        if (!empty($table->column_headers)) {
            foreach ($table->column_headers as $h) {
                $html .= '<th>' . htmlspecialchars($h, ENT_QUOTES, 'UTF-8') . '</th>';
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
                $html .= '<td>' . htmlspecialchars($val, ENT_QUOTES, 'UTF-8') . '</td>';
            }
            $html .= '</tr>';
        }

        $html .= '</tbody></table>';

        if (!empty($table->notes)) {
            $html .= '<div class="notes-box">
                <div class="notes-title">الملاحظات</div>
                <div>' . nl2br(htmlspecialchars($table->notes, ENT_QUOTES, 'UTF-8')) . '</div>
            </div>';
        }

        $html .= '<div class="footer">
            تاريخ التصدير: ' . date('Y-m-d H:i') . '
        </div>
</body>
</html>';

        return $html;
    }
}
