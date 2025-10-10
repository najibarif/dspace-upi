<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrganizationSeeder extends Seeder
{
    /**
     * Jalankan seeder.
     */
    public function run(): void
    {
        // UUID untuk hierarki organisasi
        $universityId = Str::uuid();
        $facultyId = Str::uuid();
        $labId = Str::uuid();

        DB::table('organizations')->insert([
            [
                'org_id' => $universityId,
                'name' => 'Universitas Teknologi Nusantara',
                'type' => 'university',
                'parent_org_id' => null,
                'url' => 'https://utn.ac.id',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'org_id' => $facultyId,
                'name' => 'Fakultas Sains dan Teknologi',
                'type' => 'faculty',
                'parent_org_id' => $universityId,
                'url' => 'https://utn.ac.id/fst',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'org_id' => $labId,
                'name' => 'Laboratorium Komputasi dan AI',
                'type' => 'lab',
                'parent_org_id' => $facultyId,
                'url' => 'https://utn.ac.id/fst/lab-ai',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
