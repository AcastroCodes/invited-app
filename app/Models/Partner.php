<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Partner extends Model
{
    protected $fillable = [
        'user_id',
        'business_name',
        'business_rut',
        'logo',
        'business_address',
        'business_phone',
        'contact_name',
        'contact_phone',
        'social_links',
        'is_active',
        'credits_web',
        'credits_video',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'credits_web' => 'integer',
            'credits_video' => 'integer',
            'social_links' => 'array',
        ];
    }

    protected function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo) {
            return null;
        }

        if (filter_var($this->logo, FILTER_VALIDATE_URL) || str_starts_with($this->logo, '/storage/')) {
            return $this->logo;
        }

        return '/storage/' . $this->logo;
    }

    protected $appends = ['logo_url'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'partner_user');
    }


}
