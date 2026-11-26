<?php
// Papan pemuka admin: list | update | password | delete  (admin sahaja)
require __DIR__ . '/lib.php';

$me = current_user();
if (!$me) fail('auth', 401);
if ($me['role'] !== 'admin') fail('forbidden', 403);

$action = (string)($_GET['action'] ?? 'list');

function row(array $u): array {
  $s = status($u);
  return [
    'id' => (int)$u['id'], 'email' => $u['email'], 'name' => $u['name'], 'role' => $u['role'],
    'plan' => $u['plan'], 'planExpires' => $u['plan_expires'], 'effectivePlan' => $s['plan'],
    'quota' => $s['quota'], 'used' => $s['used'], 'usedTotal' => (int)$u['used_total'],
    'disabled' => (bool)(int)$u['disabled'], 'createdAt' => $u['created_at'], 'lastLogin' => $u['last_login'],
  ];
}

if ($action === 'list') {
  $users = db()->query('SELECT * FROM users ORDER BY id DESC LIMIT 5000')->fetchAll();
  $rows = array_map('row', $users);
  $stats = ['total' => count($rows), 'free' => 0, 'basic' => 0, 'pro' => 0, 'expired' => 0, 'disabled' => 0];
  foreach ($rows as $r) {
    if ($r['role'] === 'admin') continue;
    $stats[$r['effectivePlan']]++;
    if ($r['plan'] !== 'free' && $r['effectivePlan'] === 'free') $stats['expired']++;
    if ($r['disabled']) $stats['disabled']++;
  }
  out(['ok' => true, 'me' => (int)$me['id'], 'users' => $rows, 'stats' => $stats, 'quotas' => ['free' => FREE_QUOTA, 'basic' => BASIC_QUOTA]]);
}

require_post();
$b = body();
$id = (int)($b['id'] ?? 0);
$u = user_by_id($id);
if (!$u) fail('notfound', 404);
$self = $id === (int)$me['id'];

switch ($action) {
  case 'update': {
    $plan = (string)($b['plan'] ?? $u['plan']);
    if (!in_array($plan, PLANS, true)) fail('plan');
    $exp = trim((string)($b['planExpires'] ?? ''));
    if ($exp !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $exp)) fail('date');
    if ($plan === 'free') $exp = '';
    $disabled = !empty($b['disabled']) ? 1 : 0;
    if ($self && $disabled) fail('self');
    $name = substr(trim((string)($b['name'] ?? $u['name'])), 0, 80);
    db()->prepare('UPDATE users SET plan = ?, plan_expires = ?, disabled = ?, name = ? WHERE id = ?')
      ->execute([$plan, $exp === '' ? null : $exp, $disabled, $name, $id]);
    if (!empty($b['resetUsage'])) {
      db()->prepare('UPDATE users SET free_used = 0, used_month = 0, month_key = ? WHERE id = ?')->execute([date('Y-m'), $id]);
    }
    if ($disabled) db()->prepare('DELETE FROM sessions WHERE user_id = ?')->execute([$id]);
    out(['ok' => true, 'user' => row(user_by_id($id))]);
  }

  case 'password': {
    if ($u['role'] === 'admin') fail('admin_pw'); // kata laluan admin ditetapkan dalam local-config.php
    $pw = (string)($b['password'] ?? '');
    if (!valid_password($pw)) fail('password');
    db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([password_hash($pw, PASSWORD_DEFAULT), $id]);
    db()->prepare('DELETE FROM sessions WHERE user_id = ?')->execute([$id]);
    out(['ok' => true]);
  }

  case 'delete': {
    if ($self || $u['role'] === 'admin') fail('self');
    db()->prepare('DELETE FROM sessions WHERE user_id = ?')->execute([$id]);
    db()->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);
    out(['ok' => true]);
  }

  default:
    fail('action', 404);
}
