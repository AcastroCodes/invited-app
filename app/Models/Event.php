<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'name',
        'event_type',
        'event_date',
        'location',
        'description',
        'theme_color',
        'status',
        'guest_count',
        'confirmed_count',
    ];

    public function tables()
    {
        return $this->hasMany(Table::class);
    }

    public function guests()
    {
        return $this->hasMany(Guest::class);
    }
}
