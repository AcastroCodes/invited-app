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

    protected function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo) {
            return null;
        }
        if (filter_var($this->logo, FILTER_VALIDATE_URL) || str_starts_with($this->logo, '/storage/')) {
            return $this->logo;
        }
        return asset('storage/' . $this->logo);
    }

    protected function getBackgroundUrlAttribute(): ?string
    {
        if (!$this->background) {
            return null;
        }
        if (filter_var($this->background, FILTER_VALIDATE_URL) || str_starts_with($this->background, '/storage/')) {
            return $this->background;
        }
        return asset('storage/' . $this->background);
    }

    protected $appends = ['logo_url', 'background_url'];

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

    public function invitations()
    {
        return $this->hasMany(Invitation::class);
    }
}
