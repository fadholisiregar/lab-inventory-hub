<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleAndAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['kode' => 'LBR', 'name' => 'Laboran'],
            ['kode' => 'KRD', 'name' => 'Koordinator Gudang'],
            ['kode' => 'ADM', 'name' => 'Petugas Gudang'],
        ];
        
        foreach ($roles as $roleData) {
            \App\Models\Role::firstOrCreate(['name' => $roleData['name']], $roleData);
        }
    }
}
