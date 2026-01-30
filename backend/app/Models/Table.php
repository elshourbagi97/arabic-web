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
        'column_headers' => 'array',
        'last_updated' => 'datetime',
    ];



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
