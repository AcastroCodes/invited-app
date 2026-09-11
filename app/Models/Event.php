<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'partner_id',
        'name',
        'event_type',
        'event_date',
        'location',
        'latitude',
        'longitude',
        'itinerary',
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
        'itinerary' => 'array',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function tables()
    {
        return $this->hasMany(Table::class);
    }

    public function guests()
    {
        return $this->hasMany(Guest::class);
    }
}
