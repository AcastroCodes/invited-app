<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guest extends Model
{
    protected $fillable = [
        'event_id',
        'guest_group_id',
        'table_id',
        'invitation_id',
        'name',
        'title',
        'email',
        'phone',
        'role',
        'category',
        'status',
        'companion_count',
        'is_confirmed',
        'dietary_restrictions',
        'seating_assignment',
        'checked_in_at',
    ];

    protected $casts = [
        'is_confirmed' => 'boolean',
        'seating_assignment' => 'array',
        'checked_in_at' => 'datetime',
    ];

    public function group()
    {
        return $this->belongsTo(GuestGroup::class, 'guest_group_id');
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function invitation()
    {
        return $this->belongsTo(Invitation::class);
    }
}
