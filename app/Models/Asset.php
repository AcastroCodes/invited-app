<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_id',
        'name',
        'type',
        'file_path',
        'mime_type',
        'size',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    protected $appends = ['url'];

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function getUrlAttribute(): string
    {
        if (filter_var($this->file_path, FILTER_VALIDATE_URL)) {
            return $this->file_path;
        }

        return Storage::url($this->file_path);
    }
}
