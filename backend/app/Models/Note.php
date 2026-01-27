<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperNote
 */
class Note extends Model
{
    protected $table = 'notes';

    protected $fillable = [
        'table_id',
        'content',
    ];

    public function table()
    {
        return $this->belongsTo(Table::class, 'table_id');
    }
}
