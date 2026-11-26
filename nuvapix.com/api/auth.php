<?php
// Akaun pengguna: me | register | login | logout
require __DIR__ . '/lib.php';

$action = (string)($_GET['action'] ?? '');

if ($action === 'me') {
  $u = current_user();
  out(['ok' => true, 'status' => $u ? status($u) : null]);
}

require_post();
$b = body();

switch ($action) {
  case 'register': {
    throttle('reg', 5, 3600);
    $email = clean_email($b['email'] ?? '');
    $name = trim(preg_replace('/\s+/', ' ', (string)($b['name'] ?? '')));
    $pw = (string)($b['password'] ?? '');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) fail('email');
    if (!valid_password($pw)) fail('password');
    $name = substr($name, 0, 80);
    $st = db()->prepare('SELECT 1 FROM users WHERE email = ?');
    $st->execute([$email]);
    if ($st->fetchColumn()) fail('exists', 409);
    record_attempt('reg');
    db()->prepare('INSERT INTO users (email, name, password_hash, month_key, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?)')
      ->execute([$email, $name, password_hash($pw, PASSWORD_DEFAULT), date('Y-m'), now(), now()]);
    $id = (int)db()->lastInsertId();
    start_session($id);
    out(['ok' => true, 'status' => status(user_by_id($id))]);
  }

  case 'login': {
    throttle('login', 10, 900);
    $email = clean_email($b['email'] ?? '');
    $pw = (string)($b['password'] ?? '');
    $st = db()->prepare('SELECT * FROM users WHERE email = ?');
    $st->execute([$email]);
    $u = $st->fetch();
    // Emel tiada: tetap buat kerja hash supaya masa jawapan lebih kurang sama
    if ($u) $ok = password_verify($pw, $u['password_hash']);
    else { password_hash($pw, PASSWORD_DEFAULT); $ok = false; }
    if (!$u || !$ok) { record_attempt('login'); fail('invalid', 401); }
    if ((int)$u['disabled']) fail('disabled', 403);
    if ($u['role'] !== 'admin' && password_needs_rehash($u['password_hash'], PASSWORD_DEFAULT)) {
      db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([password_hash($pw, PASSWORD_DEFAULT), $u['id']]);
    }
    db()->prepare('UPDATE users SET last_login = ? WHERE id = ?')->execute([now(), $u['id']]);
    start_session((int)$u['id']);
    out(['ok' => true, 'status' => status($u)]);
  }

  case 'logout':
    end_session();
    out(['ok' => true, 'status' => null]);

  default:
    fail('action', 404);
}
