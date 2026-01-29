<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperTable
 */
class Table extends Model
{
    protected $table = 'tables';

    protected $fillable = [
        'user_id',
        'label',
        'table_name',
        'name',
        'section',
        'data',
        'column_headers',
        'notes',
        'last_updated',
    ];

    protected $casts = [
        'data' => 'array',
        'last_updated' => 'datetime',
    ];

    /**
     * Get the column_headers attribute with fixed encoding.
     * Fixes UTF-8 data that was corrupted by double-encoding (UTF-8 bytes interpreted as Latin-1/Windows-1252 and re-encoded).
     */
    public function getColumnHeadersAttribute($value)
    {
        // Decode JSON if it's a string (raw from database)
        $headers = is_string($value) ? json_decode($value, true) : $value;
        
        if (!is_array($headers)) {
            return $headers;
        }

        return array_map(function ($header) {
            if (!is_string($header) || $header === '') {
                return $header;
            }
            
            // Check if it contains Arabic characters that are valid UTF-8
            if (preg_match('/[\x{0600}-\x{06FF}]/u', $header)) {
                // Already has valid Arabic UTF-8
                return $header;
            }
            
            // Check for common corruption patterns (high bytes that shouldn't be there in ASCII)
            if (!preg_match('/[\x80-\xFF]/', $header)) {
                // Pure ASCII, return as-is
                return $header;
            }
            
            // The data was likely double-encoded:
            // Original UTF-8 Arabic (e.g., ض = D8 B6) was read as Windows-1252,
            // then encoded to UTF-8 again, producing garbage.
            // To fix: convert from UTF-8 (treating current bytes) back to Latin-1 (single-byte representation)
            // This gives us the original UTF-8 bytes.
            
            // Pattern 1: Double-encoded UTF-8 - use utf8_decode or mb_convert_encoding to Latin-1
            $fixed = mb_convert_encoding($header, 'ISO-8859-1', 'UTF-8');
            if ($fixed && preg_match('/[\x{0600}-\x{06FF}]/u', $fixed)) {
                return $fixed;
            }
            
            // Pattern 2: Triple-encode detection - apply fix twice
            $double_fixed = mb_convert_encoding($fixed, 'ISO-8859-1', 'UTF-8');
            if ($double_fixed && preg_match('/[\x{0600}-\x{06FF}]/u', $double_fixed)) {
                return $double_fixed;
            }
            
            // Pattern 3: Try the iconv approach
            $fixed = @iconv('UTF-8', 'ISO-8859-1//IGNORE', $header);
            if ($fixed && preg_match('/[\x{0600}-\x{06FF}]/u', $fixed)) {
                return $fixed;
            }
            
            // Return original if no fix works
            return $header;
        }, $headers);
    }

    /**
     * Set the column_headers attribute - ensure proper JSON encoding with UTF-8.
     */
    public function setColumnHeadersAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['column_headers'] = json_encode($value, JSON_UNESCAPED_UNICODE);
        } else {
            $this->attributes['column_headers'] = $value;
        }
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function rows()
    {
        return $this->hasMany(TableRow::class, 'table_id');
    }

    public function notes()
    {
        return $this->hasMany(Note::class, 'table_id');
    }
}
