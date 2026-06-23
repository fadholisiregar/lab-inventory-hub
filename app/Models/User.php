<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'nip_nik', 'google_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function rpbSebagaiLaboran()
    {
        return $this->hasMany(RencanaPengambilanBahan::class, 'laboran_id');
    }

    public function rpbSebagaiKoordinator()
    {
        return $this->hasMany(RencanaPengambilanBahan::class, 'koordinator_id');
    }

    public function transaksiSebagaiPengaju()
    {
        return $this->hasMany(Transaksi::class, 'pengaju_id');
    }

    public function transaksiDisetujui()
    {
        return $this->hasMany(Transaksi::class, 'disetujui_oleh');
    }

    public function transaksiDieksekusi()
    {
        return $this->hasMany(Transaksi::class, 'dieksekusi_oleh');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function laboran()
    {
        return $this->hasOne(Laboran::class);
    }

    public function koordinator()
    {
        return $this->hasOne(Koordinator::class);
    }

    public function adminGudang()
    {
        return $this->hasOne(AdminGudang::class);
    }

    /**
     * Nomor WhatsApp untuk notifikasi, diambil dari profil user.
     * Laboran & Petugas Gudang menyimpan nomor di profil laboran;
     * Koordinator menyimpan di profil koordinator.
     */
    public function whatsappNumber(): ?string
    {
        return optional($this->laboran)->nomor_hp
            ?? optional($this->koordinator)->nomor_hp;
    }

    public function hasRole(string $role): bool
    {
        return $this->roles->contains('name', $role);
    }

    public function isAdmin(): bool
    {
        // Check if user has Koordinator Gudang or Petugas Gudang role
        return $this->hasRole('Koordinator Gudang') || $this->hasRole('Petugas Gudang');
    }
}
