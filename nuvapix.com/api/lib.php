<?php
// =====================================================
//  Nuvapix API — fungsi kongsi (akaun, sesi, kuota).
//  Fail ini tidak boleh dibuka terus dari browser (lihat api/.htaccess).
//  Pangkalan data: SQLite, disimpan di luar public_html jika boleh.
// =====================================================
declare(strict_types=1);

// Mesti sama dengan config.js -> plans
const FREE_QUOTA = 3;      // jumlah gambar percuma (sekali sahaja)
const BASIC_QUOTA = 500;   // gambar sebulan untuk pakej Asas
const PLANS = ['free', 'basic', 'pro'];
const SESSION_DAYS = 30;
const COOKIE = 'nvx_s';

date_default_timezone_set('Asia/Kuala_Lumpur');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$cfgFile = __DIR__ . '/local-config.php';
$LOCAL = is_file($cfgFile) ? (require $cfgFile) : [];
if (!is_array($LOCAL)) $LOCAL = [];

function out(array $data, int $code = 200): void {
  http_response_code($code);
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}
function fail(string $err, int $code = 400, array $extra = []): void {
  out(['ok' => false, 'error' => $err] + $extra, $code);
}
set_exception_handler(function ($e) {
  error_log('nuvapix api: ' . $e);
  fail('server', 500);
});

function body(): array {
  static $b = null;
  if ($b === null) {
    $b = json_decode((string)file_get_contents('php://input'), true);
    if (!is_array($b)) $b = [];
  }
  return $b;
}
// POST sahaja + pengepala khas (browser lain tidak boleh hantar tanpa CORS → halang CSRF)
function require_post(): void {
  if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('method', 405);
  if (($_SERVER['HTTP_X_NUVAPIX'] ?? '') !== '1') fail('csrf', 403);
}
function now(): string { return date('Y-m-d H:i:s'); }

// ---------- Pangkalan data ----------
function data_dir(): string {
  global $LOCAL;
  $cands = [];
  if (!empty($LOCAL['data_dir'])) $cands[] = (string)$LOCAL['data_dir'];
  $cands[] = dirname(__DIR__, 2) . '/nuvapix-data'; // di luar public_html (paling selamat)
  $cands[] = __DIR__ . '/data';                     // sandaran, dilindungi .htaccess
  foreach ($cands as $d) {
    if ((@is_dir($d) || @mkdir($d, 0700, true)) && @is_writable($d)) {
      if (!@is_file("$d/.htaccess")) @file_put_contents("$d/.htaccess", "Require all denied\n");
      return $d;
    }
  }
  throw new RuntimeException('Tiada folder data yang boleh ditulis');
}

function db(): PDO {
  static $pdo = null;
  if ($pdo) return $pdo;
  $pdo = new PDO('sqlite:' . data_dir() . '/nuvapix.sqlite', null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
  $pdo->exec('PRAGMA busy_timeout = 5000');
  $pdo->exec('PRAGMA foreign_keys = ON');
  $pdo->exec('CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL DEFAULT \'\',
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT \'user\',
    plan TEXT NOT NULL DEFAULT \'free\',
    plan_expires TEXT,
    free_used INTEGER NOT NULL DEFAULT 0,
    used_month INTEGER NOT NULL DEFAULT 0,
    month_key TEXT NOT NULL DEFAULT \'\',
    used_total INTEGER NOT NULL DEFAULT 0,
    disabled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    last_login TEXT
  )');
  $pdo->exec('CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires INTEGER NOT NULL
  )');
  $pdo->exec('CREATE TABLE IF NOT EXISTS attempts (k TEXT NOT NULL, ts INTEGER NOT NULL)');
  $pdo->exec('CREATE INDEX IF NOT EXISTS attempts_k ON attempts(k, ts)');
  seed_admin($pdo);
  return $pdo;
}

// Akaun admin dari local-config.php (emel + hash kata laluan). Dicipta/dikemas kini automatik.
function seed_admin(PDO $pdo): void {
  global $LOCAL;
  $email = strtolower(trim((string)($LOCAL['admin_email'] ?? '')));
  $hash = (string)($LOCAL['admin_hash'] ?? '');
  if ($email === '' || $hash === '') return;
  $st = $pdo->prepare('SELECT id, role, password_hash FROM users WHERE email = ?');
  $st->execute([$email]);
  $u = $st->fetch();
  if (!$u) {
    $pdo->prepare('INSERT INTO users (email, name, password_hash, role, plan, created_at) VALUES (?, ?, ?, \'admin\', \'pro\', ?)')
      ->execute([$email, 'Admin', $hash, now()]);
  } elseif ($u['role'] !== 'admin' || $u['password_hash'] !== $hash) {
    $pdo->prepare('UPDATE users SET role = \'admin\', password_hash = ?, disabled = 0 WHERE id = ?')->execute([$hash, $u['id']]);
  }
}

// ---------- Sesi (token rawak dalam cookie, hash disimpan dalam DB) ----------
function set_cookie(string $val, int $exp): void {
  setcookie(COOKIE, $val, ['expires' => $exp, 'path' => '/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
}
function start_session(int $uid): void {
  $tok = bin2hex(random_bytes(32));
  $exp = time() + SESSION_DAYS * 86400;
  db()->prepare('DELETE FROM sessions WHERE expires < ?')->execute([time()]);
  db()->prepare('INSERT INTO sessions (token, user_id, expires) VALUES (?, ?, ?)')->execute([hash('sha256', $tok), $uid, $exp]);
  set_cookie($tok, $exp);
}
function session_token(): string {
  $tok = (string)($_COOKIE[COOKIE] ?? '');
  return preg_match('/^[a-f0-9]{64}$/', $tok) ? $tok : '';
}
function end_session(): void {
  $tok = session_token();
  if ($tok) db()->prepare('DELETE FROM sessions WHERE token = ?')->execute([hash('sha256', $tok)]);
  set_cookie('', time() - 3600);
}
function current_user(): ?array {
  $tok = session_token();
  if (!$tok) return null;
  $st = db()->prepare('SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires > ?');
  $st->execute([hash('sha256', $tok), time()]);
  $u = $st->fetch();
  return ($u && !(int)$u['disabled']) ? $u : null;
}
function user_by_id(int $id): ?array {
  $st = db()->prepare('SELECT * FROM users WHERE id = ?');
  $st->execute([$id]);
  $u = $st->fetch();
  return $u ?: null;
}

// ---------- Pakej & kuota ----------
function effective_plan(array $u): string {
  if ($u['role'] === 'admin') return 'pro';
  $p = in_array($u['plan'], PLANS, true) ? $u['plan'] : 'free';
  if ($p !== 'free' && !empty($u['plan_expires']) && $u['plan_expires'] < date('Y-m-d')) return 'free'; // tamat tempoh
  return $p;
}
function month_used(array $u): int { return $u['month_key'] === date('Y-m') ? (int)$u['used_month'] : 0; }

function status(array $u): array {
  $plan = effective_plan($u);
  if ($plan === 'pro') { $q = null; $used = month_used($u); }
  elseif ($plan === 'basic') { $q = BASIC_QUOTA; $used = month_used($u); }
  else { $q = FREE_QUOTA; $used = (int)$u['free_used']; }
  return [
    'user' => [
      'id' => (int)$u['id'], 'email' => $u['email'], 'name' => $u['name'], 'role' => $u['role'],
      'plan' => $u['plan'], 'planExpires' => $u['plan_expires'],
    ],
    'plan' => $plan,
    'quota' => $q,
    'used' => $used,
    'remaining' => $q === null ? null : max(0, $q - $used),
  ];
}

// ---------- Had cubaan (elak teka kata laluan / spam daftar) ----------
function client_ip(): string { return (string)($_SERVER['REMOTE_ADDR'] ?? '0'); }
function throttle(string $kind, int $max, int $window): void {
  $pdo = db();
  $pdo->prepare('DELETE FROM attempts WHERE ts < ?')->execute([time() - 86400]);
  $st = $pdo->prepare('SELECT COUNT(*) FROM attempts WHERE k = ? AND ts > ?');
  $st->execute([$kind . ':' . client_ip(), time() - $window]);
  if ((int)$st->fetchColumn() >= $max) fail('throttle', 429);
}
function record_attempt(string $kind): void {
  db()->prepare('INSERT INTO attempts (k, ts) VALUES (?, ?)')->execute([$kind . ':' . client_ip(), time()]);
}

function clean_email($v): string { return strtolower(trim((string)$v)); }
function valid_password($v): bool { $n = strlen((string)$v); return $n >= 8 && $n <= 200; }
