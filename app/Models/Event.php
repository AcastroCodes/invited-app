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
        'services',
        'logo',
        'background',
        'status',
        'guest_count',
        'confirmed_count',
    ];

    protected $casts = [
        'guest_count' => 'integer',
        'confirmed_count' => 'integer',
        'services' => 'array',
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
