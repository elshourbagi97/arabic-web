<?php

namespace App\Console\Commands;

use App\Models\Table;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixColumnHeadersEncoding extends Command
{
    protected $signature = 'fix:column-headers {--dry-run : Show what would be fixed without making changes}';
    protected $description = 'Fix corrupted Arabic text in column_headers field';

    public function handle()
    {
        $dryRun = $this->option('dry-run');
        
        $this->info('Scanning tables for corrupted column_headers...');
        
        // Get raw data from database
        $tables = DB::table('tables')->whereNotNull('column_headers')->get();
        
        $fixedCount = 0;
        
        foreach ($tables as $table) {
            $rawJson = $table->column_headers;
            $headers = json_decode($rawJson, true);
            
            if (!is_array($headers)) {
                continue;
            }
            
            $needsFix = false;
            $fixedHeaders = [];
            
            foreach ($headers as $header) {
                if (!is_string($header) || $header === '') {
                    $fixedHeaders[] = $header;
                    continue;
                }
                
                // Check if it already has valid Arabic
                if (preg_match('/[\x{0600}-\x{06FF}]/u', $header)) {
                    $fixedHeaders[] = $header;
                    continue;
                }
                
                // Check for corruption markers (high bytes without valid Arabic)
                if (!preg_match('/[\x80-\xFF]/', $header)) {
                    $fixedHeaders[] = $header;
                    continue;
                }
                
                // Try to fix double-encoded UTF-8
                $fixed = @mb_convert_encoding($header, 'ISO-8859-1', 'UTF-8');
                if ($fixed && preg_match('/[\x{0600}-\x{06FF}]/u', $fixed)) {
                    $fixedHeaders[] = $fixed;
                    $needsFix = true;
                    $this->line("  Fixed: '{$header}' -> '{$fixed}'");
                    continue;
                }
                
                // Try triple decode
                $double_fixed = @mb_convert_encoding($fixed, 'ISO-8859-1', 'UTF-8');
                if ($double_fixed && preg_match('/[\x{0600}-\x{06FF}]/u', $double_fixed)) {
                    $fixedHeaders[] = $double_fixed;
                    $needsFix = true;
                    $this->line("  Fixed (double): '{$header}' -> '{$double_fixed}'");
                    continue;
                }
                
                // Keep original if no fix works
                $fixedHeaders[] = $header;
                $this->warn("  Could not fix: '{$header}' (hex: " . bin2hex($header) . ")");
            }
            
            if ($needsFix) {
                $this->info("Table ID {$table->id} ('{$table->label}') needs fixing");
                
                if (!$dryRun) {
                    DB::table('tables')
                        ->where('id', $table->id)
                        ->update([
                            'column_headers' => json_encode($fixedHeaders, JSON_UNESCAPED_UNICODE)
                        ]);
                    $this->info("  -> Fixed!");
                    $fixedCount++;
                } else {
                    $this->info("  -> Would fix (dry run)");
                    $fixedCount++;
                }
            }
        }
        
        $action = $dryRun ? 'would be fixed' : 'fixed';
        $this->info("Done! {$fixedCount} tables {$action}.");
        
        return 0;
    }
}
