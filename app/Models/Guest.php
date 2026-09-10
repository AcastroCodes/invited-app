<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guest extends Model
{
    protected $fillable = [
        'event_id',
        'table_id',
        'name',
        'email',
        'phone',
        'status',
        'companion_count',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }
}
