<?php

namespace App\Services;

use App\Mail\EmailNotification;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Layanan notifikasi terpusat: mengirim email + WhatsApp sekaligus.
 * Kegagalan pada salah satu kanal hanya dicatat di log dan tidak
 * menggagalkan alur transaksi yang memanggilnya.
 */
class NotificationService
{
    public function __construct(private FonnteService $fonnte)
    {
    }

    /**
     * Kirim notifikasi ke satu user, array user, atau Collection user.
     *
     * @param  User|iterable|null  $users
     * @param  string|null  $waMessage  Teks khusus WhatsApp; default gabungan judul + isi.
     */
    public function notifyUsers($users, string $title, string $body, ?string $waMessage = null): void
    {
        $collection = $this->toCollection($users);
        $message = $waMessage ?? ($title . "\n\n" . $body);

        foreach ($collection as $user) {
            if (!$user) {
                continue;
            }
            $this->sendEmail($user, $title, $body);
            $this->sendWhatsapp($user, $message);
        }
    }

    private function sendEmail($user, string $title, string $body): void
    {
        try {
            if (!empty($user->email)) {
                Mail::to($user->email)->send(new EmailNotification($title, $body));
            }
        } catch (\Throwable $e) {
            Log::error('Notifikasi email gagal untuk user #' . ($user->id ?? '?') . ': ' . $e->getMessage());
        }
    }

    private function sendWhatsapp($user, string $message): void
    {
        // === NOTIFIKASI WHATSAPP DINONAKTIFKAN SEMENTARA ===
        // Untuk mengaktifkan kembali, hapus baris `return;` di bawah ini.
        return;

        $no = method_exists($user, 'whatsappNumber')
            ? $user->whatsappNumber()
            : ($user->nomor_hp ?? null);

        if (empty($no)) {
            return;
        }

        // FonnteService sudah menangani error secara internal (log + return false).
        $this->fonnte->send($no, $message);
    }

    private function toCollection($users): Collection
    {
        if ($users instanceof Collection) {
            return $users;
        }
        if (is_iterable($users)) {
            return collect($users);
        }
        return collect($users ? [$users] : []);
    }
}
