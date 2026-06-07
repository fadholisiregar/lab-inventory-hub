<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Laboran;
use App\Models\Koordinator;
use Illuminate\Support\Facades\Hash;

class LaboranKoordinatorSeeder extends Seeder
{
    public function run()
    {
        $roleLaboran = Role::where('name', 'Laboran')->first();
        $roleKoordinator = Role::where('name', 'Koordinator Gudang')->first();
        $rolePetugas = Role::where('name', 'Petugas Gudang')->first();

        // 1. Koordinator Gudang (only)
        $user1 = User::firstOrCreate(['email' => 'koordinator@itk.ac.id'], [
            'name' => 'Bapak Koordinator',
            'password' => Hash::make('password')
        ]);
        $user1->roles()->syncWithoutDetaching([$roleKoordinator->id]);
        
        \App\Models\Koordinator::firstOrCreate(['user_id' => $user1->id], [
            'nomor_hp' => '081111111111'
        ]);

        // 2. Laboran sekaligus Petugas Gudang
        $user2 = User::firstOrCreate(['email' => 'petugas@itk.ac.id'], [
            'name' => 'Bapak Petugas',
            'password' => Hash::make('password')
        ]);
        $user2->roles()->syncWithoutDetaching([$roleLaboran->id, $rolePetugas->id]);

        $laboran2 = Laboran::firstOrCreate(['user_id' => $user2->id], [
            'nomor_hp' => '082222222222',
            'pic_labs' => ['Lab Kimia Dasar']
        ]);

        $kategori = \App\Models\KategoriRumpun::firstOrCreate(['kode_rumpun' => 'KM'], ['nama_rumpun' => 'Kimia']);
        
        \App\Models\PetugasGudang::firstOrCreate(['user_id' => $user2->id], [
            'laboran_id' => $laboran2->id,
            'kategori_rumpun_id' => $kategori->id
        ]);

        // 3. Laboran biasa saja
        $user3 = User::firstOrCreate(['email' => 'laboran@itk.ac.id'], [
            'name' => 'Bapak Laboran',
            'password' => Hash::make('password')
        ]);
        $user3->roles()->syncWithoutDetaching([$roleLaboran->id]);

        Laboran::firstOrCreate(['user_id' => $user3->id], [
            'nomor_hp' => '083333333333',
            'pic_labs' => ['Lab Komputer']
        ]);
    }
}
