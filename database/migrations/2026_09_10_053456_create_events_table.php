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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('event_type')->default('other');
            $table->dateTime('event_date')->nullable();
            $table->string('location')->nullable();
            $table->text('description')->nullable();
            $table->string('theme_color')->default('#22c55e');
            $table->string('status')->default('draft');
            $table->integer('guest_count')->default(0);
            $table->integer('confirmed_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
