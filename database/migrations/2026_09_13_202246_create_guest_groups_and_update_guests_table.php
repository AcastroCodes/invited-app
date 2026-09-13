<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('guest_groups')) {
            Schema::create('guest_groups', function (Blueprint $table) {
                $table->id();
                $table->foreignId('event_id')->constrained()->cascadeOnDelete();
                $table->foreignId('assigned_invitation_id')->nullable()->constrained('invitations')->nullOnDelete();
                $table->string('formal_addressee');
                $table->string('contact_email')->nullable();
                $table->string('contact_phone')->nullable();
                $table->string('contact_whatsapp')->nullable();
                $table->integer('max_guests')->default(1);
                $table->string('status')->default('pending');
                $table->timestamps();
            });
        }

        Schema::table('guests', function (Blueprint $table) {
            if (!Schema::hasColumn('guests', 'guest_group_id')) {
                $table->foreignId('guest_group_id')->nullable()->after('event_id')->constrained('guest_groups')->cascadeOnDelete();
            }
            if (!Schema::hasColumn('guests', 'title')) {
                $table->string('title')->nullable()->after('name');
            }
            if (!Schema::hasColumn('guests', 'role')) {
                $table->string('role')->default('Primary')->after('name');
            }
            if (!Schema::hasColumn('guests', 'category')) {
                $table->string('category')->default('Adulto')->after('role');
            }
            if (!Schema::hasColumn('guests', 'is_confirmed')) {
                $table->boolean('is_confirmed')->nullable()->default(null)->after('category');
            }
            if (!Schema::hasColumn('guests', 'dietary_restrictions')) {
                $table->text('dietary_restrictions')->nullable()->after('is_confirmed');
            }
            if (!Schema::hasColumn('guests', 'seating_assignment')) {
                $table->json('seating_assignment')->nullable()->after('dietary_restrictions');
            }
            if (!Schema::hasColumn('guests', 'checked_in_at')) {
                $table->timestamp('checked_in_at')->nullable()->after('seating_assignment');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guest_groups_and_update_guests');
    }
};
