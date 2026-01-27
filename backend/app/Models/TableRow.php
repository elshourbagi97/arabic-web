<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperTableRow
 * @property Table $table
 */
class TableRow extends Model
{
    protected $table = 'table_rows';

    protected $fillable = [
        'table_id',
        'row_number',
        'row_data',
    ];

    protected $casts = [
        'row_data' => 'array',
    ];

    public function table()
    {
        return $this->belongsTo(Table::class, 'table_id');
    }
}
