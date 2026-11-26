<?php
// Rekod gambar yang telah diproses oleh pengguna yang log masuk, ikut kuota pakej.
require __DIR__ . '/lib.php';

require_post();
$u = current_user();
if (!$u) fail('auth', 401);

$n = max(1, min(100, (int)(body()['n'] ?? 1)));
$st = status($u);
if ($st['remaining'] !== null && $st['remaining'] < $n) fail('quota', 402, ['status' => $st]);

$mk = date('Y-m');
if ($st['plan'] === 'free') {
  db()->prepare('UPDATE users SET free_used = free_used + ?, used_total = used_total + ? WHERE id = ?')->execute([$n, $n, $u['id']]);
} else {
  // Kiraan bulanan diset semula bila bulan bertukar
  db()->prepare('UPDATE users SET used_month = (CASE WHEN month_key = ? THEN used_month ELSE 0 END) + ?, month_key = ?, used_total = used_total + ? WHERE id = ?')
    ->execute([$mk, $n, $mk, $n, $u['id']]);
}
out(['ok' => true, 'status' => status(user_by_id((int)$u['id']))]);
