<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuestGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'assigned_invitation_id',
        'formal_addressee',
        'contact_email',
        'contact_phone',
        'contact_whatsapp',
        'max_guests',
        'status',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function invitation()
    {
        return $this->belongsTo(Invitation::class, 'assigned_invitation_id');
    }

    public function guests()
    {
        return $this->hasMany(Guest::class);
    }
}
