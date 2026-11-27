// =====================================================
//  DWIBAHASA: English (en) & Bahasa Melayu (ms)
//  Tambah/ubah teks di sini. {nama} = nilai yang diisi semasa paparan.
// =====================================================
window.I18N = (function () {
  const dict = {
    en: {
      "meta.desc": "Upscale images 2× or 4× with Real-ESRGAN AI. One image or many at once, right in your browser.",
      "nav.how": "How it works", "nav.pricing": "Pricing", "nav.faq": "FAQ",
      "lang.label": "Language",

      "quota.unlimited": "Free · unlimited",
      "quota.left": "{n}/{total} free left",
      "quota.none": "No free images left",
      "quota.basic": "Basic · {n}/{total} left this month",
      "quota.pro": "Pro · unlimited",

      "hero.eyebrow": "Real-ESRGAN · 2× / 4× · one or many",
      "hero.h1a": "Enlarge your images.",
      "hero.h1b": "Keep every detail.",
      "hero.lead": "Add one image or ten at once. The AI rebuilds edges and texture as it enlarges, then you download them one by one or all together in a single ZIP file.",
      "drop.aria": "Choose images to upload",
      "drop.title": "Drop images here",
      "drop.subBatch": "JPG, PNG, WEBP · up to {n} images at once · paste with <kbd>Ctrl</kbd>+<kbd>V</kbd>",
      "drop.subUnlimited": "JPG, PNG, WEBP · as many images as you like · paste with <kbd>Ctrl</kbd>+<kbd>V</kbd>",
      "drop.pick": "Choose images",
      "loupe.aria": "Magnifier demo: the area inside the circle shows high resolution",
      "loupe.in": "Inside the lens: high resolution",
      "loupe.out": "Outside: original 120×90 px",
      "loupe.note": "Illustration · move your pointer",

      "bench.engine": "Engine", "bench.size": "Size", "bench.format": "Format",
      "mode.fast": "Fast",
      "bench.look": "Result", "look.natural": "Natural", "look.enhanced": "Enhanced",
      "note.natural": "Natural: keeps faces and the original look, just bigger and sharper.",
      "note.enhanced": "Enhanced: stronger AI detail; may smooth or change faces.",
      "bench.add": "+ Add",
      "run.all": "Upscale all", "run.one": "Upscale 1 image", "run.n": "Upscale {n} images", "run.busy": "Processing…",
      "zip.label": "Download ZIP", "zip.n": "Download ZIP ({n})", "zip.prep": "Preparing ZIP…", "dl.one": "Download",
      "zip.name": "nuvapix-{n}-images.zip",
      "bs.done": "{d} / {n} done", "bs.cur": "· processing {name}", "bs.err": "· {n} failed", "bs.wait": "· {n} waiting", "bs.all": "· all done",
      "tag.orig": "Original",
      "zoom": "Zoom",
      "sheet.title": "Contact sheet", "sheet.clear": "Clear",
      "st.queued": "Waiting", "st.processing": "Processing", "st.done": "Done", "st.error": "Failed",
      "frame.dl": "Download", "frame.redo": "Process again with current settings", "frame.rm": "Remove",
      "note.fast": "Fast mode: instant, no AI. Good for simple graphics.",
      "note.ready": "AI model ready ({dev}).",
      "note.first": "First image: the 4.9 MB AI model downloads once.",
      "note.big": " Images over {px}px are processed at {px}px first.",
      "meta.ai": "AI", "meta.fast": "Fast",
      "proc.prep": "Getting ready…",

      "up.loadEngine": "Loading AI engine…", "up.engineProg": "Loading AI engine… {p}%",
      "up.download": "Downloading AI model… {p}%", "up.prepModel": "Preparing AI model…",
      "up.processing": "AI processing… {p}%", "up.eta": " · ~{s}s left", "up.toCpu": "Switching to CPU mode…",
      "up.finishing": "Finishing…", "up.done": "Done!", "up.enlarge": "Enlarging ({i}/{n})…", "up.sharpen": "Sharpening details…",

      "spec.model": "Model", "spec.size": "Model size", "spec.sizeV": "4.9 MB, downloaded once",
      "spec.proc": "Processing", "spec.procV": "GPU (WebGPU) or CPU", "spec.yours": "Your images", "spec.yoursV": "Stay on your device",

      "how.title": "How it works",
      "how.1h": "Add your images", "how.1p": "Drag, choose or paste. One image or many at once.",
      "how.2h": "Pick 2× or 4×", "how.2p": "AI engine for the best quality, or Fast when you need it right now.",
      "how.3h": "Check and save", "how.3p": "Compare each image, then download one or all of them in a ZIP.",
      "use.1h": "Online sellers", "use.1p": "Supplier product photos are often small. Enlarge them 4× so they look sharp on Shopee, Lazada and TikTok Shop.",
      "use.2h": "Old & family photos", "use.2p": "Blurry scans of old photos get cleaner edges and less noise.",
      "use.3h": "Logos & graphics", "use.3p": "A low-res logo becomes big enough for banners, shirts or print.",

      "price.title": "Pricing", "price.soon": "Coming soon", "price.sub": "Every user gets 3 free images. Paid plans open soon.",
      "bill.monthly": "Monthly", "bill.yearly": "Yearly", "bill.save": "Pro: 2 months free",
      "per.month": "/ month", "per.year": "/ year", "price.equiv": "≈ {p} a month, billed yearly", "price.monthlyOnly": "Monthly plan only",
      "plan.best": "Best value",
      "plan.free.name": "Free", "plan.free.f1": "{n} free images", "plan.free.f2": "2× and 4× upscaling", "plan.free.f3": "PNG or JPG download", "plan.free.cta": "Start now",
      "plan.basic.name": "Basic", "plan.basic.f1": "{n} images a month", "plan.basic.f2": "Bulk upload up to {n} images", "plan.basic.f3": "AI Real-ESRGAN, 2× and 4×", "plan.basic.f4": "No watermark", "plan.basic.cta": "Choose Basic",
      "plan.pro.name": "Pro", "plan.pro.f1": "Unlimited images", "plan.pro.f2": "Unlimited bulk upload", "plan.pro.f3": "AI Real-ESRGAN, 2× and 4×", "plan.pro.f4": "No watermark", "plan.pro.cta": "Choose Pro",
      "pay.soon": "Payments open soon. Basic and Pro aren't available to buy yet.",

      "faq.title": "FAQ",
      "faq.1q": "Is it free?", "faq.1a": "Every user gets 3 free images. After that you can choose Basic (500 images a month) or Pro (unlimited).",
      "faq.2q": "How many images can I upscale at once?", "faq.2a": "On the free plan, up to {n} images per batch. Basic lets you upload and process up to 500 images a month. Pro has no limit.",
      "faq.3q": "Can I pay yearly?", "faq.3a": "Yes, for the Pro plan. Pro yearly costs the same as 10 months, so you get 2 months free. Basic is monthly only.",
      "faq.4q": "What is Real-ESRGAN?", "faq.4a": "An open-source AI model for restoring and enlarging real photos that are blurry, noisy or compressed. It enlarges 4× while rebuilding detail.",
      "faq.5q": "Why is the first image a bit slow?", "faq.5a": "The AI model (4.9 MB) downloads once and is kept in your browser. After that, speed depends on image size and your device.",
      "faq.6q": "Are my images sent to a server?", "faq.6a": "No. All processing happens in your browser.",

      "foot.made": "Made in Malaysia · Real-ESRGAN (BSD-3)",
      "pw.close": "Close",
      "pw.titleFree": "You've used all your free images", "pw.titleBasic": "You've used this month's {n} images", "pw.titleBasicLow": "Only {n} images left this month",
      "pw.text": "Choose a plan to continue.", "pw.textDone": "{n} images are done. Choose a plan to process the rest.",
      "pw.demo": "Payments are not active yet. This is a demo.",

      "skip.format": "{name}: format not supported", "skip.size": "{name}: larger than {mb}MB",
      "skip.batch": "{n} images go over your limit of {max}", "skip.batch1": "1 image goes over your limit of {max}", "skip.read": "{name}: couldn't be read",
      "skip.many": "{n} files skipped. {first}",
      "ai.fail": "The AI engine can't run on this device. Using Fast mode.",
      "run.err": "{n} images failed. Try 2× or a smaller image, then press ↻.",
      "run.doneMany": "{n} images done. Download them one by one or as a ZIP.",
      "run.doneOne": "Done. Drag the line to compare.",
      "save.fail": "This view can't save files.",

      "plan.current": "Your current plan",
      "pay.soonAcct": "Online payment opens soon. To upgrade now, contact us and we'll activate your plan.",
      "pw.guest": "Create a free account or log in to choose a plan.",
      "auth.login": "Log in", "auth.register": "Sign up",
      "auth.loginTitle": "Welcome back", "auth.loginSub": "Log in to see your plan and usage.",
      "auth.regTitle": "Create your account", "auth.regSub": "Free to join. You get {n} free images, then pick a plan when you need more.",
      "auth.toBuy": "Create an account first. Your plan is linked to it.",
      "auth.name": "Name", "auth.email": "Email", "auth.password": "Password", "auth.pwHint": "At least 8 characters.",
      "auth.welcome": "Logged in as {name}.", "auth.welcomeNew": "Account created. Welcome, {name}!",
      "err.email": "Enter a valid email address.", "err.password": "Password must be at least 8 characters.",
      "err.exists": "This email already has an account. Log in instead.", "err.invalid": "Wrong email or password.",
      "err.disabled": "This account is disabled. Contact us for help.", "err.throttle": "Too many tries. Wait a few minutes and try again.",
      "err.network": "Can't reach the server. Check your connection.", "err.server": "Something went wrong. Try again.",
      "acct.title": "Your account", "acct.email": "Email", "acct.plan": "Plan", "acct.expires": "Active until", "acct.usage": "Usage",
      "acct.usageFree": "{n} of {total} free images used", "acct.usageMonth": "{n} of {total} images this month", "acct.usageUnlimited": "{n} images this month · unlimited",
      "acct.admin": "Admin dashboard", "acct.upgrade": "See plans", "acct.logout": "Log out", "acct.loggedOut": "You're logged out.",

      "adm.title": "Admin dashboard", "adm.back": "Back to website",
      "adm.gate": "Admin login", "adm.gateSub": "Log in with the admin account.", "adm.notAdmin": "This account isn't an admin.",
      "adm.stTotal": "All users", "adm.stFree": "Free", "adm.stBasic": "Basic", "adm.stPro": "Pro", "adm.stExpired": "Expired plans",
      "adm.search": "Search name or email", "adm.fAll": "All plans", "adm.fExpired": "Expired", "adm.fDisabled": "Disabled", "adm.refresh": "Refresh",
      "adm.cUser": "User", "adm.cPlan": "Plan", "adm.cExpires": "Active until", "adm.cUsage": "Usage", "adm.cStatus": "Account", "adm.cActions": "Actions",
      "adm.joined": "Joined {d}", "adm.lastLogin": "Last login {d}", "adm.never": "never",
      "adm.noExpiry": "Leave empty = no end date", "adm.expired": "Expired, now on Free",
      "adm.usageFree": "{n}/{total} free", "adm.usageMonth": "{n}/{total} this month", "adm.usageUnl": "{n} this month", "adm.usageTotal": "{n} total",
      "adm.disabled": "Disabled", "adm.active": "Active", "adm.you": "You",
      "adm.save": "Save", "adm.saved": "Saved: {email}", "adm.reset": "Reset usage", "adm.resetConfirm": "Reset image usage for {email}?",
      "adm.pw": "New password", "adm.pwPrompt": "New password for {email} (at least 8 characters):", "adm.pwDone": "Password changed for {email}.",
      "adm.del": "Delete", "adm.delConfirm": "Delete {email} permanently? This can't be undone.", "adm.deleted": "Deleted: {email}",
      "adm.empty": "No users match.", "adm.count": "{n} users", "adm.err": "Failed: {e}",
    },

    ms: {
      "meta.desc": "Besarkan gambar 2× atau 4× dengan AI Real-ESRGAN. Satu atau banyak gambar sekaligus, terus dalam browser.",
      "nav.how": "Cara guna", "nav.pricing": "Harga", "nav.faq": "Soalan",
      "lang.label": "Bahasa",

      "quota.unlimited": "Percuma tanpa had",
      "quota.left": "Baki percuma {n}/{total}",
      "quota.none": "Baki percuma habis",
      "quota.basic": "Asas · baki {n}/{total} bulan ini",
      "quota.pro": "Pro · tanpa had",

      "hero.eyebrow": "Real-ESRGAN · 2× / 4× · satu atau pukal",
      "hero.h1a": "Besarkan gambar.",
      "hero.h1b": "Kekalkan setiap perincian.",
      "hero.lead": "Masukkan satu gambar atau sepuluh sekaligus. AI membina semula tepi dan tekstur ketika membesarkan, kemudian anda muat turun satu persatu atau terus dalam satu fail ZIP.",
      "drop.aria": "Pilih gambar untuk dimuat naik",
      "drop.title": "Seret gambar ke sini",
      "drop.subBatch": "JPG, PNG, WEBP · sehingga {n} gambar sekali · tampal dengan <kbd>Ctrl</kbd>+<kbd>V</kbd>",
      "drop.subUnlimited": "JPG, PNG, WEBP · berapa banyak gambar pun · tampal dengan <kbd>Ctrl</kbd>+<kbd>V</kbd>",
      "drop.pick": "Pilih gambar",
      "loupe.aria": "Demonstrasi kanta pembesar: kawasan dalam bulatan menunjukkan resolusi tinggi",
      "loupe.in": "Dalam kanta: resolusi tinggi",
      "loupe.out": "Luar: 120×90 px asal",
      "loupe.note": "Ilustrasi · gerakkan tetikus",

      "bench.engine": "Enjin", "bench.size": "Saiz", "bench.format": "Format",
      "mode.fast": "Pantas",
      "bench.look": "Hasil", "look.natural": "Asli", "look.enhanced": "Dipertingkat",
      "note.natural": "Asli: muka dan rupa gambar asal dikekalkan, cuma lebih besar dan tajam.",
      "note.enhanced": "Dipertingkat: perincian AI lebih kuat; muka mungkin jadi licin atau berubah.",
      "bench.add": "+ Tambah",
      "run.all": "Upscale semua", "run.one": "Upscale 1 gambar", "run.n": "Upscale {n} gambar", "run.busy": "Sedang memproses…",
      "zip.label": "Muat turun ZIP", "zip.n": "Muat turun ZIP ({n})", "zip.prep": "Menyediakan ZIP…", "dl.one": "Muat turun",
      "zip.name": "nuvapix-{n}-gambar.zip",
      "bs.done": "{d} / {n} siap", "bs.cur": "· sedang proses {name}", "bs.err": "· {n} gagal", "bs.wait": "· {n} menunggu", "bs.all": "· semua siap",
      "tag.orig": "Asal",
      "zoom": "Zum",
      "sheet.title": "Helaian kontak", "sheet.clear": "Kosongkan",
      "st.queued": "Menunggu", "st.processing": "Memproses", "st.done": "Siap", "st.error": "Gagal",
      "frame.dl": "Muat turun", "frame.redo": "Proses semula dengan tetapan semasa", "frame.rm": "Buang",
      "note.fast": "Mod Pantas: serta-merta, tanpa AI. Sesuai untuk grafik ringkas.",
      "note.ready": "Model AI sedia ({dev}).",
      "note.first": "Gambar pertama: model AI 4.9 MB dimuat turun sekali sahaja.",
      "note.big": " Gambar melebihi {px}px diproses pada {px}px dahulu.",
      "meta.ai": "AI", "meta.fast": "Pantas",
      "proc.prep": "Bersedia…",

      "up.loadEngine": "Memuatkan enjin AI…", "up.engineProg": "Memuatkan enjin AI… {p}%",
      "up.download": "Memuat turun model AI… {p}%", "up.prepModel": "Menyediakan model AI…",
      "up.processing": "AI sedang memproses… {p}%", "up.eta": " · ~{s}s lagi", "up.toCpu": "Menukar ke mod CPU…",
      "up.finishing": "Menyiapkan hasil…", "up.done": "Siap!", "up.enlarge": "Membesarkan ({i}/{n})…", "up.sharpen": "Menajamkan perincian…",

      "spec.model": "Model", "spec.size": "Saiz model", "spec.sizeV": "4.9 MB, dimuat sekali",
      "spec.proc": "Pemprosesan", "spec.procV": "GPU (WebGPU) atau CPU", "spec.yours": "Gambar anda", "spec.yoursV": "Kekal dalam peranti",

      "how.title": "Cara guna",
      "how.1h": "Masukkan gambar", "how.1p": "Seret, pilih atau tampal. Boleh satu, boleh banyak sekaligus.",
      "how.2h": "Pilih 2× atau 4×", "how.2p": "Enjin AI untuk kualiti terbaik, atau Pantas bila perlu segera.",
      "how.3h": "Semak dan simpan", "how.3p": "Bandingkan setiap gambar, kemudian muat turun satu atau semua dalam ZIP.",
      "use.1h": "Peniaga online", "use.1p": "Gambar produk dari pembekal selalunya kecil. Besarkan 4× supaya jelas di Shopee, Lazada dan TikTok Shop.",
      "use.2h": "Foto lama & keluarga", "use.2p": "Imbasan gambar lama yang kabur dapat tepi yang lebih kemas dan hingar yang kurang.",
      "use.3h": "Logo & grafik", "use.3p": "Logo resolusi rendah jadi cukup besar untuk banner, baju atau cetakan.",

      "price.title": "Harga", "price.soon": "Akan datang", "price.sub": "Setiap pengguna dapat 3 gambar percuma. Pakej berbayar akan dibuka tidak lama lagi.",
      "bill.monthly": "Bulanan", "bill.yearly": "Tahunan", "bill.save": "Pro: percuma 2 bulan",
      "per.month": "/ bulan", "per.year": "/ tahun", "price.equiv": "≈ {p} sebulan, dibayar setahun", "price.monthlyOnly": "Pakej bulanan sahaja",
      "plan.best": "Paling berbaloi",
      "plan.free.name": "Percuma", "plan.free.f1": "{n} gambar percuma", "plan.free.f2": "Upscale 2× dan 4×", "plan.free.f3": "Muat turun PNG atau JPG", "plan.free.cta": "Mula sekarang",
      "plan.basic.name": "Asas", "plan.basic.f1": "{n} gambar sebulan", "plan.basic.f2": "Upload pukal sehingga {n} gambar", "plan.basic.f3": "AI Real-ESRGAN, 2× dan 4×", "plan.basic.f4": "Tiada tera air", "plan.basic.cta": "Pilih Asas",
      "plan.pro.name": "Pro", "plan.pro.f1": "Gambar tanpa had", "plan.pro.f2": "Upload pukal tanpa had", "plan.pro.f3": "AI Real-ESRGAN, 2× dan 4×", "plan.pro.f4": "Tiada tera air", "plan.pro.cta": "Pilih Pro",
      "pay.soon": "Pembayaran akan dibuka tidak lama lagi. Pakej Asas dan Pro belum boleh dibeli.",

      "faq.title": "Soalan lazim",
      "faq.1q": "Adakah ia percuma?", "faq.1a": "Setiap pengguna dapat 3 gambar percuma. Selepas itu anda boleh pilih Asas (500 gambar sebulan) atau Pro (tanpa had).",
      "faq.2q": "Berapa banyak gambar boleh diproses sekaligus?", "faq.2a": "Dengan pakej Percuma, sehingga {n} gambar setiap kali. Pakej Asas membolehkan upload dan proses sehingga 500 gambar sebulan. Pro tiada had.",
      "faq.3q": "Boleh bayar tahunan?", "faq.3a": "Boleh, untuk pakej Pro. Pro tahunan sama harga dengan 10 bulan, jadi anda dapat 2 bulan percuma. Pakej Asas bulanan sahaja.",
      "faq.4q": "Apa itu Real-ESRGAN?", "faq.4a": "Model AI sumber terbuka untuk membaiki dan membesarkan gambar sebenar yang kabur, berhingar atau termampat. Ia membesarkan 4× sambil membina semula perincian.",
      "faq.5q": "Kenapa gambar pertama lambat sedikit?", "faq.5a": "Model AI (4.9 MB) dimuat turun sekali dan disimpan dalam browser. Kelajuan seterusnya bergantung pada saiz gambar dan kuasa peranti anda.",
      "faq.6q": "Adakah gambar saya dihantar ke server?", "faq.6a": "Tidak. Semua pemprosesan berlaku dalam browser anda.",

      "foot.made": "Dibuat di Malaysia · Real-ESRGAN (BSD-3)",
      "pw.close": "Tutup",
      "pw.titleFree": "Gambar percuma anda sudah habis", "pw.titleBasic": "Kuota {n} gambar bulan ini sudah habis", "pw.titleBasicLow": "Hanya {n} gambar berbaki bulan ini",
      "pw.text": "Pilih pakej untuk teruskan.", "pw.textDone": "{n} gambar sudah siap. Pilih pakej untuk proses baki gambar.",
      "pw.demo": "Pembayaran belum diaktifkan. Ini paparan demo.",

      "skip.format": "{name}: format tidak disokong", "skip.size": "{name}: lebih {mb}MB",
      "skip.batch": "{n} gambar melebihi had {max} anda", "skip.batch1": "1 gambar melebihi had {max} anda", "skip.read": "{name}: tidak dapat dibaca",
      "skip.many": "{n} fail dilangkau. {first}",
      "ai.fail": "Enjin AI tidak dapat dijalankan di peranti ini. Menggunakan mod Pantas.",
      "run.err": "{n} gambar gagal. Cuba 2× atau gambar lebih kecil, kemudian tekan ↻.",
      "run.doneMany": "{n} gambar siap. Muat turun satu persatu atau sebagai ZIP.",
      "run.doneOne": "Siap. Seret garisan untuk bandingkan.",
      "save.fail": "Fail tidak dapat disimpan di paparan ini.",

      "plan.current": "Pakej semasa anda",
      "pay.soonAcct": "Pembayaran dalam talian akan dibuka tidak lama lagi. Untuk naik taraf sekarang, hubungi kami dan kami akan aktifkan pakej anda.",
      "pw.guest": "Daftar akaun percuma atau log masuk untuk pilih pakej.",
      "auth.login": "Log masuk", "auth.register": "Daftar",
      "auth.loginTitle": "Selamat kembali", "auth.loginSub": "Log masuk untuk lihat pakej dan penggunaan anda.",
      "auth.regTitle": "Daftar akaun", "auth.regSub": "Percuma untuk daftar. Anda dapat {n} gambar percuma, kemudian pilih pakej bila perlu lagi.",
      "auth.toBuy": "Daftar akaun dahulu. Pakej anda dipautkan pada akaun ini.",
      "auth.name": "Nama", "auth.email": "Emel", "auth.password": "Kata laluan", "auth.pwHint": "Sekurang-kurangnya 8 aksara.",
      "auth.welcome": "Log masuk sebagai {name}.", "auth.welcomeNew": "Akaun berjaya didaftar. Selamat datang, {name}!",
      "err.email": "Masukkan alamat emel yang sah.", "err.password": "Kata laluan mesti sekurang-kurangnya 8 aksara.",
      "err.exists": "Emel ini sudah ada akaun. Sila log masuk.", "err.invalid": "Emel atau kata laluan salah.",
      "err.disabled": "Akaun ini telah dinyahaktifkan. Hubungi kami untuk bantuan.", "err.throttle": "Terlalu banyak cubaan. Tunggu beberapa minit dan cuba lagi.",
      "err.network": "Tidak dapat hubungi server. Semak sambungan internet anda.", "err.server": "Ada ralat. Cuba lagi.",
      "acct.title": "Akaun anda", "acct.email": "Emel", "acct.plan": "Pakej", "acct.expires": "Aktif sehingga", "acct.usage": "Penggunaan",
      "acct.usageFree": "{n} daripada {total} gambar percuma digunakan", "acct.usageMonth": "{n} daripada {total} gambar bulan ini", "acct.usageUnlimited": "{n} gambar bulan ini · tanpa had",
      "acct.admin": "Papan pemuka admin", "acct.upgrade": "Lihat pakej", "acct.logout": "Log keluar", "acct.loggedOut": "Anda telah log keluar.",

      "adm.title": "Papan pemuka admin", "adm.back": "Kembali ke website",
      "adm.gate": "Log masuk admin", "adm.gateSub": "Log masuk dengan akaun admin.", "adm.notAdmin": "Akaun ini bukan admin.",
      "adm.stTotal": "Semua pengguna", "adm.stFree": "Percuma", "adm.stBasic": "Asas", "adm.stPro": "Pro", "adm.stExpired": "Pakej tamat",
      "adm.search": "Cari nama atau emel", "adm.fAll": "Semua pakej", "adm.fExpired": "Tamat tempoh", "adm.fDisabled": "Dinyahaktif", "adm.refresh": "Muat semula",
      "adm.cUser": "Pengguna", "adm.cPlan": "Pakej", "adm.cExpires": "Aktif sehingga", "adm.cUsage": "Penggunaan", "adm.cStatus": "Akaun", "adm.cActions": "Tindakan",
      "adm.joined": "Daftar {d}", "adm.lastLogin": "Log masuk terakhir {d}", "adm.never": "belum pernah",
      "adm.noExpiry": "Kosongkan = tiada tarikh tamat", "adm.expired": "Tamat, kini Percuma",
      "adm.usageFree": "{n}/{total} percuma", "adm.usageMonth": "{n}/{total} bulan ini", "adm.usageUnl": "{n} bulan ini", "adm.usageTotal": "{n} keseluruhan",
      "adm.disabled": "Dinyahaktif", "adm.active": "Aktif", "adm.you": "Anda",
      "adm.save": "Simpan", "adm.saved": "Disimpan: {email}", "adm.reset": "Set semula kiraan", "adm.resetConfirm": "Set semula kiraan gambar untuk {email}?",
      "adm.pw": "Kata laluan baharu", "adm.pwPrompt": "Kata laluan baharu untuk {email} (sekurang-kurangnya 8 aksara):", "adm.pwDone": "Kata laluan {email} telah ditukar.",
      "adm.del": "Padam", "adm.delConfirm": "Padam {email} secara kekal? Tindakan ini tidak boleh dibatalkan.", "adm.deleted": "Dipadam: {email}",
      "adm.empty": "Tiada pengguna yang sepadan.", "adm.count": "{n} pengguna", "adm.err": "Gagal: {e}",
    },
  };

  const KEY = "nuvapix_lang";
  const listeners = [];
  const pick = (l) => (l === "ms" || l === "en" ? l : null);
  let lang = pick(new URLSearchParams(location.search).get("lang"))
    || (() => { try { return pick(localStorage.getItem(KEY)); } catch { return null; } })()
    || pick(window.APP_CONFIG?.defaultLang) || "en";

  function t(key, vars = {}) {
    const s = dict[lang][key] ?? dict.en[key] ?? key;
    return s.replace(/\{(\w+)\}/g, (m, n) => (vars[n] !== undefined ? vars[n] : m));
  }
  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.desc"));
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    listeners.forEach((f) => f(lang));
  }
  function set(l) {
    if (!pick(l)) return;
    lang = l;
    try { localStorage.setItem(KEY, l); } catch {}
    apply();
  }
  return { t, apply, set, onChange: (f) => listeners.push(f), get lang() { return lang; } };
})();
