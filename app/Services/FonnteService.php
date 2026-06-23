<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Pengirim pesan WhatsApp melalui gateway Fonnte (https://fonnte.com).
 * Konfigurasi token ada di config/services.php => services.fonnte.token (FONNTE_TOKEN).
 */
class FonnteService
{
    /**
     * Kirim satu pesan WhatsApp. Mengembalikan true jika berhasil dikirim.
     * Tidak pernah melempar exception agar tidak mengganggu alur transaksi.
     */
    public function send(?string $target, string $message): bool
    {
        $token = config('services.fonnte.token');
        if (empty($token)) {
            Log::warning('Fonnte: FONNTE_TOKEN belum dikonfigurasi, pesan WhatsApp dilewati.');
            return false;
        }

        $normalized = $this->normalize($target);
        if (empty($normalized)) {
            Log::warning('Fonnte: nomor tujuan kosong/tidak valid, pesan WhatsApp dilewati.');
            return false;
        }

        try {
            $response = Http::withHeaders(['Authorization' => $token])
                ->asForm()
                ->timeout(15)
                ->post(config('services.fonnte.url', 'https://api.fonnte.com/send'), [
                    'target' => $normalized,
                    'message' => $message,
                ]);

            if (!$response->successful()) {
                Log::error('Fonnte: gagal kirim WA (' . $response->status() . '): ' . $response->body());
                return false;
            }

            // Fonnte mengembalikan {"status":true,...} bila terkirim.
            $json = $response->json();
            if (is_array($json) && array_key_exists('status', $json) && $json['status'] === false) {
                Log::error('Fonnte: API menolak pengiriman: ' . $response->body());
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::error('Fonnte: exception saat kirim WA: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Normalisasi nomor ke format internasional tanpa tanda plus (mis. 628123456789).
     */
    public function normalize(?string $no): ?string
    {
        if (empty($no)) {
            return null;
        }

        // Sisakan digit saja (buang +, spasi, strip, dll).
        $no = preg_replace('/\D+/', '', $no);
        if ($no === '') {
            return null;
        }

        if (str_starts_with($no, '0')) {
            $no = '62' . substr($no, 1);
        } elseif (str_starts_with($no, '8')) {
            $no = '62' . $no;
        }
        // Jika sudah diawali '62', biarkan apa adanya.

        return $no;
    }
}
