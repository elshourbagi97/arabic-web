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
        'user_id',
        'table_name',
        'content',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the note
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
