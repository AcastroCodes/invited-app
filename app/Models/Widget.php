<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Widget extends Model
{
    protected $fillable = [
        'name',
        'type',
        'preview_image',
        'content',
    ];

    protected $casts = [
        'content' => 'array',
    ];
}
