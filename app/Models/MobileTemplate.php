<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MobileTemplate extends Model
{
    protected $fillable = [
        'name',
        'description',
        'settings',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'is_default' => 'boolean',
        ];
    }

    public function partners()
    {
        return $this->hasMany(Partner::class, 'mobile_template_id');
    }
}
