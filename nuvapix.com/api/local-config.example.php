<?php
// Salin fail ini kepada local-config.php (TIDAK di-commit, tetapi dideploy ke hosting).
// Jana hash kata laluan admin di Mac:
//   htpasswd -niBC 12 admin      (taip kata laluan, salin bahagian selepas "admin:")
return [
  'admin_email' => 'emel-admin@contoh.com',
  'admin_hash'  => '$2y$12$...',
  // Pilihan: folder pangkalan data (lalai: ../nuvapix-data di luar public_html)
  // 'data_dir' => '/home/akaun/nuvapix-data',
];
