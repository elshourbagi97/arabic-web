<?php

namespace App\Http\Controllers\Api;

use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Mpdf\Mpdf;
use Dompdf\Dompdf;
use Dompdf\Options;

class PdfExportController extends Controller
{
    public function exportTable(Request $request, Table $table)
    {
        // dd('PDF controller reached');

        if ($table->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            mb_internal_encoding("UTF-8");
            mb_http_output("pass");

            $table = $table->load('rows');

            $html = $this->generateTableHTML($table);

            $cacheDir = storage_path('framework/cache/dompdf');
            if (!file_exists($cacheDir)) {
                @mkdir($cacheDir, 0755, true);
            }

            $options = new Options();
            $options->set('isRemoteEnabled', true);
            $options->set('isHtml5ParserEnabled', true);
            $options->set('defaultFont', 'Amiri');
            $options->set('chroot', realpath(base_path()));
            $options->set('tempDir', $cacheDir);

            $dompdf = new Dompdf($options);
            $dompdf->setPaper('a4', 'landscape');

            while (ob_get_level()) {
                ob_end_clean();
            }
            file_put_contents(storage_path('test.html'), $html);
            $dompdf->loadHtml($html, 'UTF-8');
            $dompdf->render();

            return response($dompdf->output())
                ->header('Content-Type', 'application/pdf')
                ->header(
                    'Content-Disposition',
                    "attachment; filename*=UTF-8''" .
                    rawurlencode($this->sanitizeFilename($table->label)) . ".pdf"
                );

        } catch (\Exception $e) {
            \Log::error("PDF Export Error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function sanitizeFilename($filename)
    {
        return preg_replace('/[^\p{L}\p{N}_\- ]/u', '', $filename);
    }

    private function generateTableHTML(Table $table)
    {
        $html = '<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<style>
    body {
        font-family: "Amiri";
        direction: rtl;
        text-align: right;
        font-size: 13px;
        padding: 20px;
    }

    h1 {
        text-align: center;
        margin-bottom: 20px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        border: 1px solid #333;
        padding: 8px;
        text-align: center;
        vertical-align: middle;
    }

    th {
        background: #f0f0f0;
        font-weight: bold;
    }

    tr:nth-child(even) {
        background: #fafafa;
    }
</style>
</head>
<body>

<h1>' . htmlspecialchars($table->label) . '</h1>

<table>
<thead>
<tr>
<th>#</th>';

        foreach ($table->column_headers as $header) {
            $html .= '<th>' . htmlspecialchars($header) . '</th>';
        }

        $html .= '</tr>
</thead>
<tbody>';

        $i = 1;
        foreach ($table->rows as $row) {
            $html .= '<tr><td>' . $i++ . '</td>';

            foreach ($row->row_data as $cell) {
                $html .= '<td>' . htmlspecialchars($cell) . '</td>';
            }

            $html .= '</tr>';
        }

        $html .= '
</tbody>
</table>

</body>
</html>';

        return $html;
    }
}
