# Dunia Ceria — Game Anak

Game edukasi web ringan (React + Vite + PWA) untuk melatih **logika**, **matematika**, dan **Bahasa Inggris**, dengan batas main harian 30-60 menit dan tingkat kesulitan yang menyesuaikan diri lewat sistem penilaian bergaya **Kumon** (bukan cuma patokan umur).

## Daftar Isi

1. [Menjalankan Project](#menjalankan-project)
2. [Struktur Folder](#struktur-folder)
3. [Alur Pemakaian](#alur-pemakaian)
4. [Tier Umur](#tier-umur)
5. [Sistem Leveling & Grading (ala Kumon)](#sistem-leveling--grading-ala-kumon)
6. [Materi Soal per Game](#materi-soal-per-game)
7. [Tes Penempatan (Placement Test)](#tes-penempatan-placement-test)
8. [Sistem Bintang & Reward](#sistem-bintang--reward)
9. [Batas Waktu Harian](#batas-waktu-harian)
10. [Monitoring Progres (Laporan Orang Tua)](#monitoring-progres-laporan-orang-tua)
11. [Model Data (Backend)](#model-data-backend)
12. [Backend & Akses Internet](#backend--akses-internet)
13. [Keterbatasan & Roadmap](#keterbatasan--roadmap)

---

## Menjalankan Project

Ada backend kecil (Express) sekarang — profil/progres/waktu main disimpan di server, bukan lagi di `localStorage` browser, supaya konsisten dipakai dari banyak device. Untuk development, backend dan frontend jalan sebagai dua proses terpisah:

```bash
npm install
npm run server   # backend Express, http://localhost:3000 (data di ./data/db.json)
npm run dev      # development server frontend, http://localhost:5173 (proxy /api ke port 3000)
npm run build    # build produksi ke ./dist
```

PWA (`vite-plugin-pwa`) membuat app bisa di-install ke homescreen dan jalan offline untuk asetnya (bukan untuk data — data tetap butuh koneksi ke backend).

### Lewat Docker

```bash
docker build -t game-anak .
docker run -d -p 8080:3000 -v game-anak-data:/data game-anak
# buka http://localhost:8080
```

Atau pakai `docker compose up -d app` (lihat `docker-compose.yml`) yang sudah otomatis pasang volume-nya. `Dockerfile` sekarang single-stage runtime: `node:20-alpine` menjalankan `server/index.js`, yang meng-serve API (`/api/*`) **dan** file statis hasil build React sekaligus — nginx sudah tidak dipakai lagi (satu proses, satu port, lebih sederhana untuk di-tunnel ke internet). Lihat [Backend & Akses Internet](#backend--akses-internet) untuk detail data storage dan cara mengaksesnya dari luar rumah.

## Struktur Folder

```
server/
  index.js              # Express: routes /api/* + serve dist/ statis
  db.js                 # datastore JSON-file (lihat bab 11)
src/
  data/
    storage.js          # client API - fetch() ke /api/*, dulunya baca/tulis localStorage langsung
    ageTier.js           # hitung tier (A/B/C/D) dari tahun lahir
    levelStage.js         # label tahapan (Pemanasan..Master) dari nomor level
    sound.js              # efek suara (Web Audio) + text-to-speech (Web Speech API)
  context/
    ProfileContext.jsx    # state profil aktif, daftar profil, CRUD profil
  hooks/
    useDailyTimer.js       # timer harian per profil + auto-lock
    useGameProgress.js      # mesin leveling/grading ala Kumon (lihat bab 5)
  components/
    LoginGate, ProfileSelect, Settings, ParentGate  # gerbang PIN seluruh app, pemilihan profil, pengaturan ortu
    ProgressReport                          # laporan waktu main & perkembangan level per anak
    GameShell, GameMenu                    # kerangka layar bermain + menu game per tier
    PlacementTest, SetReportBanner          # tes penempatan & laporan tiap set soal
  modules/
    registry.js            # daftar semua game + tier + subjek
    shared/
      oddOneOutLogic.js       # bank kategori "Cari yang Beda", dipakai bareng Tier B & C
    tierA/                  # game untuk usia pra-sekolah (3-4 th)
      BalloonPop.jsx          # free-play, tanpa grading
      AnimalSounds.jsx         # free-play, tanpa grading
      ColorMatch.jsx + colorMatchLogic.js   # grading akurasi (tanpa syarat kecepatan)
    tierB/                  # game untuk usia TK - Kelas 1 (5-6 th)
      AdditionB.jsx + additionLogic.js
      OddOneOut.jsx            # pakai shared/oddOneOutLogic.js (pool mudah/sedang)
      WordPictureMatch.jsx + wordPictureLogic.js
    tierC/                  # game untuk usia Kelas 2-3 (7-8 th)
      AddSubtract.jsx + addSubtractLogic.js
      OddOneOut.jsx            # pakai shared/oddOneOutLogic.js (pool sedang/sulit)
      FillBlank.jsx + fillBlankLogic.js
    tierD/                  # game untuk usia 9-10+ th
      Multiplication.jsx + multiplicationLogic.js
      PatternSequence.jsx + patternSequenceLogic.js
      SynonymMatch.jsx + synonymMatchLogic.js
```

Setiap game "berjenjang" (bukan free-play) dipecah jadi dua file: `<Game>.jsx` (tampilan/UI) dan `<game>Logic.js` (fungsi murni pembuat soal `makeQuestion(level)` / `makeRound(level)`). Pemisahan ini sengaja dibuat supaya **Tes Penempatan** bisa memanggil generator soal yang sama persis dengan yang dipakai game aslinya — tidak ada logic soal yang dobel.

## Alur Pemakaian

```
Gerbang Masuk (PIN) ──▶ Pilih Profil ──▶ Menu Game (per tier) ──┬──▶ Main Game ──▶ (dinilai per set 10 soal)
                                                                └──▶ Tes Penempatan ──▶ terapkan level awal
```

Sebelum apa pun lain terlihat, aplikasi meminta PIN 4-digit orang tua (`LoginGate`) — sekali masuk, sesi tersimpan di cookie selama 30 hari jadi tidak perlu diketik ulang tiap buka (detail di [Keamanan masuk](#backend--akses-internet)). Layar Pengaturan Orang Tua (gerbang PIN yang sama, lewat `ParentGate`) dipakai untuk menambah/mengubah profil anak dan mengatur batas waktu harian (30-60 menit), plus tombol Keluar untuk device yang dipakai bersama. Semua layar bermain dibungkus `GameShell`, yang menampilkan tombol home, badge waktu tersisa, dan mengunci layar otomatis kalau waktu harian habis.

## Tier Umur

Tier dihitung otomatis dari `birthYear` yang diisi orang tua (`src/data/ageTier.js`), **tier ini hanya menentukan *pool game* mana yang muncul di menu** — bukan tingkat kesulitan soalnya (itu urusan sistem leveling di bab 5).

| Tier | Umur | Label |
|---|---|---|
| A | 3-4 th | Pra-sekolah |
| B | 5-6 th | TK - Kelas 1 |
| C | 7-8 th | Kelas 2-3 |
| D | 9-10+ th | Kelas 4-5+ |

Semua tier (A, B, C, D) sudah punya 3 game (matematika, logika, Bahasa Inggris) — lihat [Materi Soal per Game](#materi-soal-per-game).

## Sistem Leveling & Grading (ala Kumon)

Ini bagian inti yang membedakan app ini dari game kuis biasa. Implementasinya ada di `src/hooks/useGameProgress.js`, fungsi `recordAnswer(correct, elapsedMs)`.

### Kenapa bukan naik/turun tiap jawaban?

Versi awal menaikkan/menurunkan kesulitan setiap kali anak menjawab (3 benar berturut = naik, 2 salah berturut = turun). Ini terasa "kedap-kedip" — anak baru dapat soal lebih sulit lalu langsung dapat soal lebih mudah lagi dalam hitungan detik, membingungkan dan tidak memberi rasa "menguasai" satu tingkat sebelum pindah. Kumon menilai satu **lembar kerja penuh** sekaligus, bukan tiap butir soal — jadi sistem ini meniru itu.

### Konsep "Set" (lembar kerja mini)

Jawaban anak dikumpulkan ke dalam **satu set berisi N soal** (`setSize`, default 10; Color Match 8) di level yang sama. Level baru berubah **setelah** satu set selesai dijawab semua, dinilai sebagai satu kesatuan, dengan dua kriteria sekaligus:

| Kriteria | Syarat lulus | Alasan |
|---|---|---|
| **Akurasi** | `benar / total ≥ passAccuracy` (default 80%, Color Match 75%) | Meniru standar mastery Kumon — bukan cuma "pernah benar", tapi konsisten benar |
| **Kecepatan** | `rata-rata waktu jawab ≤ targetTimeMs` | Kumon menilai kelancaran (fluency), bukan cuma ketepatan — anak yang menjawab benar tapi lama-lama berarti belum otomatis/lancar |

Kedua syarat harus terpenuhi bersamaan (`passed = accuracy >= passAccuracy && avgTimeMs <= targetTimeMs`). Color Match mematikan syarat kecepatan (`targetTimeMs: Infinity`) karena anak pra-sekolah tidak seharusnya dikejar waktu.

### Naik & turun level

- **Lulus set** → +3 bintang bonus, `setsPassedAtLevel += 1`. Begitu `setsPassedAtLevel` mencapai `setsPerLevel` (default 3, artinya **3 set lulus berturut-turut**), level naik satu, hitungan direset.
- **Gagal set** (akurasi atau kecepatan tidak tercapai) → `consecutiveSetFails += 1`, soal berikutnya tetap di level yang sama (anak dapat set baru untuk latihan ulang, bukan pengulangan soal identik karena semua soal dibuat acak). Begitu `consecutiveSetFails` mencapai 2 (**gagal 2 set berturut-turut**), level turun satu sebagai jaring pengaman supaya anak tidak terus-menerus frustrasi di level yang terlalu sulit.
- Level dibatasi `minLevel` (selalu 1) dan `maxLevel` (beda-beda tiap game, lihat tabel bab 6).

```
                lulus set (3x berturut) 
   Level N ───────────────────────────▶ Level N+1
      ▲                                     │
      │ gagal set (2x berturut)             │ gagal set (2x berturut)
      └─────────────────────────────────────┘
```

Kenapa 3 lulus vs 2 gagal (tidak simetris)? Supaya lebih mudah turun (recover cepat kalau levelnya kelewat sulit) daripada naik (harus benar-benar konsisten dulu sebelum dianggap "menguasai") — condong ke arah "jangan terlalu cepat menaikkan kesulitan", sesuai filosofi Kumon yang lebih suka anak mulai agak mudah lalu naik mantap, ketimbang dipaksa maju lalu keteteran.

### Label Tahapan

`src/data/levelStage.js` membagi rentang 1..maxLevel jadi 5 tahapan bernama (dibagi rata secara proporsional):

**Pemanasan → Dasar → Menengah → Mahir → Master**

Ditampilkan di layar sebagai contoh: `Level 4 · Menengah`. Ini kosmetik saja (tidak mempengaruhi logic), fungsinya memberi rasa progres yang konkret ala "naik sabuk", karena angka level mentah kurang bermakna buat anak.

### Konfigurasi per game

| Game | `setSize` | `passAccuracy` | `targetTimeMs` | `maxLevel` | `setsPerLevel` |
|---|---|---|---|---|---|
| Color Match (Tier A) | 8 | 75% | ∞ (tanpa syarat kecepatan) | 4 | 3 |
| Tambah Ceria (Tier B) | 10 | 80% | 15.000 ms | 9 | 3 |
| Cari yang Beda (Tier B) | 8 | 75% | ∞ (tanpa syarat kecepatan) | 8 | 3 |
| Kata & Gambar (Tier B) | 10 | 80% | 12.000 ms | 6 | 3 |
| Tambah & Kurang (Tier C) | 10 | 80% | 15.000 ms | 10 | 3 |
| Cari yang Beda (Tier C) | 10 | 80% | 12.000 ms | 10 | 3 |
| Lengkapi Kalimat (Tier C) | 10 | 80% | 12.000 ms | 8 | 3 |
| Perkalian Cepat (Tier D) | 10 | 80% | 12.000 ms | 10 | 3 |
| Lanjutkan Pola (Tier D) | 10 | 80% | 15.000 ms | 10 | 3 |
| Synonym Match (Tier D) | 10 | 80% | 10.000 ms | 6 | 3 |

Balloon Pop & Animal Sounds (Tier A) **tidak memakai sistem ini sama sekali** — keduanya free-play tanpa jawaban benar/salah (lihat bab 8), jadi tidak ada "level" untuk dinilai.

### Contoh alur nyata

Anak main Perkalian Cepat di Level 3:
1. Menjawab 10 soal (`setSize=10`) di level 3 → 9 benar, 1 salah, rata-rata 9 detik/soal.
2. Akurasi 90% ≥ 80% ✓, kecepatan 9s ≤ 12s ✓ → **set lulus**, +3 bintang bonus, `setsPassedAtLevel` jadi 1/3.
3. Set berikutnya di level yang **sama** (3) — soal baru, angka acak berbeda.
4. Setelah lulus set ke-3 di level 3 → naik ke **Level 4**, `setsPassedAtLevel` reset ke 0.
5. Kalau di Level 4 anak gagal 2 set berturut (misalnya rata-rata waktunya kelamaan karena soal makin besar) → turun kembali ke Level 3, mendapat lebih banyak latihan di sana sebelum coba naik lagi.

## Materi Soal per Game

### Color Match (Tier A — Logika/Bahasa Inggris, `colorMatchLogic.js`)

- Bank 12 warna Bahasa Inggris (Red, Yellow, Green, Blue, Purple, Orange, Pink, Brown, Black, White, Gray, Cyan).
- Level mengatur **jumlah pilihan** yang ditampilkan, bukan jenis warnanya: `jumlah opsi = min(12, 2 + level)` → Level 1 = 3 opsi, Level 2 = 4 opsi, Level 3 = 5 opsi, Level 4 = 6 opsi. Makin tinggi level, makin banyak "pengganggu" yang harus dibedakan.
- Setiap soal diucapkan dengan Text-to-Speech Bahasa Inggris ("Find the color Red") untuk melatih pengenalan kosakata warna.

### Tambah Ceria (Tier B — Matematika, `additionLogic.js`)

- Penjumlahan dua bilangan, `maxOperand = min(10, 1 + level)` → Level 1: angka 1-2 (jumlah maks 4), Level 9: angka 1-10 (jumlah bisa sampai 20) — sesuai kurikulum "penjumlahan sampai 20" TK-Kelas 1.
- Mulai Level 5, 40% soal berubah jadi **cari suku yang hilang** (`a + ? = c`), sama pola variasinya dengan Perkalian Cepat di Tier D.

### Cari yang Beda (Tier B & Tier C — Logika, `shared/oddOneOutLogic.js`)

Game ini **dipakai bersama** oleh kedua tier (kode generatornya satu file), tapi progres levelnya terpisah per tier (`tierB-odd-one-out` vs `tierC-odd-one-out`) dan Tier C mengambil dari pool yang lebih menantang.

- Bank 10 kategori × 8 anggota (fruits, vegetables, animals, seaAnimals, vehicles, shapes, instruments, clothing, sky, bugs) = 80 item emoji, sehingga kombinasi soal (pilih acak 3 anggota + 1 pengecoh dari kategori lain) sangat banyak.
- 3 tingkat kedekatan kategori: **Easy** (kategori sangat berbeda, mis. buah vs kendaraan), **Medium** (masih beda domain tapi berdekatan, mis. hewan darat vs hewan laut), **Hard** (paling subtil, mis. hewan vs serangga).
- Tier B (maxLevel 8) hanya memakai pool Easy (Level 1-4) dan Medium (Level 5+). Tier C (maxLevel 10) menambahkan pool Hard di Level 7+, dengan Medium di Level 4-6.
- Tanpa syarat kecepatan di Tier B (`targetTimeMs: Infinity`) karena ini soal kategorisasi visual, bukan drill; Tier C memberi target waktu longgar (12 detik) karena anak kelas 2-3 sudah mulai dilatih pace.

### Kata & Gambar (Tier B — Bahasa Inggris, `wordPictureLogic.js`)

- Bank 14 kata mudah (Apple, Banana, Ball, Book, House, Sun, Moon, Star, Milk, Egg, Hat, Shoe, Fish, Bird) dan 14 kata sulit (Elephant, Umbrella, Butterfly, Mountain, Bicycle, Strawberry, Guitar, Rainbow, Dinosaur, Sandwich, Telescope, Volcano, Penguin, Octopus).
- Level 1-3 dari bank mudah, Level 4-6 dari bank sulit. Soal menampilkan **gambar (emoji) besar**, anak memilih kata Bahasa Inggris yang cocok — melatih pengenalan kata tertulis (reading), berbeda dari Animal Sounds di Tier A yang cuma dengar+tap tanpa membaca.

### Tambah & Kurang (Tier C — Matematika, `addSubtractLogic.js`)

- Penjumlahan **dan** pengurangan dua digit, `maxOperand = min(50, 5 + level×5)` → Level 1: angka sampai 10, Level 10: angka sampai 55 (hasil bisa sampai ratusan) — meningkat dari Tier B yang cuma penjumlahan sampai 20.
- Operasi (`+`/`-`) dipilih acak tiap soal; untuk pengurangan, bilangan otomatis ditukar kalau perlu supaya hasil tidak negatif.
- Mulai Level 6, 40% soal berubah format jadi **cari suku yang hilang** (`a - ? = c`, dst.).

### Lengkapi Kalimat (Tier C — Bahasa Inggris, `fillBlankLogic.js`)

- Bank 12 kalimat rumpang level mudah (present tense, subject-verb agreement, artikel a/an — mis. "She ___ happy today." → *is*) dan 12 level sulit (past tense, comparative — mis. "She is ___ than her brother." → *taller*).
- Level 1-4 dari bank mudah, Level 5-8 dari bank sulit. Saat jawaban benar, kalimat lengkap diucapkan (Text-to-Speech Bahasa Inggris) sebagai penguatan — melatih grammar dasar sekaligus listening.

### Perkalian Cepat (Tier D — Matematika, `multiplicationLogic.js`)

- Faktor maksimum naik seiring level: `maxFactor = min(12, 2 + level)` → Level 1: faktor 2-4, Level 10: faktor 2-12 (tabel perkalian penuh sampai 12×12).
- Mulai Level 5, 40% soal berubah format jadi **cari faktor yang hilang** (`a × ? = c`) alih-alih `a × b = ?` — melatih pemahaman relasi perkalian, bukan cuma hafalan urutan.
- 3 pilihan pengecoh dibuat dekat dengan jawaban benar (±4) supaya tidak asal tebak dari besar/kecilnya angka.

### Lanjutkan Pola (Tier D — Logika, `patternSequenceLogic.js`)

Dua jenis pola, dipilih acak tiap soal:

- **Pola angka** — deret aritmatika naik/turun (`start ± i×step`), step makin besar seiring level (`step = 1..min(9, 1+level/2)`). Mulai Level 6, 40% kemungkinan berubah jadi **deret kelipatan** (×2 atau ×3, mis. 2, 4, 8, 16) — pola non-linear yang lebih menuntut penalaran.
- **Pola bentuk** — deret emoji berulang dengan periode yang makin panjang seiring level (2 bentuk di Level <4, 3 bentuk di Level <8, 4 bentuk di Level ≥8), mis. 🔺🔵🔺🔵… → tebak bentuk berikutnya.

### Synonym Match (Tier D — Bahasa Inggris, `synonymMatchLogic.js`)

- Bank 14 pasangan kata level mudah (Happy/Glad, Big/Large, dst.) dan 14 pasangan level sulit (Brave/Courageous, Enormous/Huge, dst.).
- Level 1-3 mengambil dari bank mudah, Level 4-6 dari bank sulit — jadi kenaikan level di sini juga menaikkan tingkat kosakata, bukan cuma jumlah pilihan.
- Tiap soal punya tombol 🔊 untuk mengulang pelafalan kata (Text-to-Speech Bahasa Inggris), melatih *listening* sekaligus *vocabulary*.

### Balloon Pop & Animal Sounds (Tier A — free play, tanpa grading)

- **Balloon Pop**: balon mengambang ke atas, anak tap untuk memecahkan — melatih koordinasi mata-tangan dan berhitung skor (bukan soal formal).
- **Animal Sounds**: 9 dari 18 hewan ditampilkan acak tiap sesi, tap untuk dengar nama + bunyi dalam Bahasa Inggris ("Woof woof! Dog!") — pengenalan kosakata pasif, tanpa benar/salah.

## Tes Penempatan (Placement Test)

`src/components/PlacementTest.jsx` — dipicu tombol **"🎯 Belum yakin levelnya? Coba Tes Penempatan"** di menu game.

### Kenapa perlu, kalau sudah ada sistem leveling otomatis?

Sistem leveling di bab 5 butuh titik awal (`level: 1` secara default untuk profil baru). Tanpa tes ini, anak 10 tahun yang sebenarnya sudah lancar perkalian tetap harus mulai dari Level 1 dan "merayap" naik lewat berkali-kali set — padahal Kumon asli justru memakai **tes penempatan** di awal supaya anak langsung mulai di level yang pas (tidak kebosanan karena kelewat mudah, tidak juga frustrasi karena kelewat sulit).

### Algoritma: pencarian biner (binary search)

Untuk tiap subjek yang tersedia di tier anak (Tier A = Warna; Tier B/C/D masing-masing = Matematika, Logika, Bahasa Inggris), dijalankan maksimal **5 soal** (`ROUNDS_PER_SUBJECT`) per subjek untuk menaksir level:

1. Mulai dengan `low = 1`, `high = maxLevel` game tsb.
2. Ambil `currentLevel = round((low + high) / 2)`, buat 1 soal di level itu (pakai generator soal **yang sama** dengan game aslinya — `makeQuestion`/`makeRound`).
3. Anak jawab:
   - **Benar** → `low = currentLevel` (level ini terbukti bisa).
   - **Salah** → `high = currentLevel - 1` (level ini kelewat sulit).
4. Ulangi dari langkah 2 dengan rentang `[low, high]` yang menyempit, sampai 5 soal terpakai atau `low >= high` (rentang sudah konvergen).
5. Level rekomendasi akhir = `max(minLevel, low - 1)` — sengaja diturunkan 1 tingkat dari batas atas yang terbukti kuasai (safety margin), meniru kebiasaan Kumon menaruh anak sedikit di bawah kemampuan sebenarnya supaya awal pengalamannya sukses dan percaya diri, bukan pas-pasan.

Dengan pencarian biner, 5 pertanyaan cukup untuk menyisir 10 level (`log2(10) ≈ 3.3`, dengan sedikit sisa margin) — jauh lebih cepat daripada naik satu-satu dari Level 1.

### Menerapkan hasil

Setelah semua subjek selesai dites, muncul ringkasan (mis. "Matematika: Level 6 · Mahir"). Tombol **"Terapkan & Mulai Main"** memanggil `applyPlacementLevels()` (`src/data/storage.js`) yang menulis level rekomendasi ke `progress.games[gameId].level` dan me-reset semua penghitung set (`setAnswered`, `setsPassedAtLevel`, dst.) — bintang yang sudah terkumpul tidak ikut direset.

### Turun Tingkat Kalau Belum Siap

Tier (A/B/C/D) normalnya murni dari umur (`tierFromAge()`), tapi umur tidak selalu mencerminkan kesiapan anak. Kalau di hasil tes **semua subjek** berakhir di Level 1 (`subjects.every(s => results[s.gameId] <= s.minLevel)` — tanda anak kesulitan bahkan di soal termudah tingkat itu), muncul kotak saran: *"Sepertinya soal di tingkat ini masih agak sulit... mau coba tingkat di bawahnya?"* dengan tombol untuk pindah.

- Klik tombol itu menyimpan `tierOverride` ke profil anak (`updateProfile(id, { tierOverride: lowerTier })`) — field ini **menang atas tier hasil hitungan umur** di `tierForProfile()` (`src/data/ageTier.js`).
- `PlacementTest` diberi `key={tierForProfile(activeProfile)}` di `App.jsx`, sehingga begitu `tierOverride` berubah, komponennya **remount bersih** dan tes otomatis dimulai ulang dari awal untuk tingkat yang baru — tanpa kode reset manual.
- Tier A adalah lantai paling bawah (tidak punya `PREV_TIER`), jadi kalau anak masih kesulitan juga di sana, tidak ada saran turun lagi.
- `tierOverride` ini **tidak hilang sendiri** — supaya orang tua tetap pegang kendali, ada juga dropdown "Tingkat Kesulitan" di halaman Pengaturan (`Settings.jsx`) untuk mengatur manual (naik/turun) atau mengembalikannya ke "Otomatis (sesuai umur)" kapan saja, tanpa harus lewat tes lagi.

## Sistem Bintang & Reward

Dua sumber bintang, tergantung jenis game:

- **Game berjenjang** (`recordAnswer`): +1 bintang tiap jawaban benar, +3 bintang bonus tiap kali lulus satu set.
- **Game free-play** (`awardStar`, dipanggil manual dari komponennya):
  - Balloon Pop: +1 bintang tiap 5 balon pecah.
  - Animal Sounds: +1 bintang tiap 3 hewan *baru* (belum pernah ditap sesi ini) yang ditemukan.

Tidak ada leaderboard atau perbandingan antar-anak — bintang murni internal per-profil, ditampilkan di `star-bar` tiap layar game.

## Batas Waktu Harian

`src/hooks/useDailyTimer.js`, dipakai oleh `GameShell` di semua layar bermain (termasuk Tes Penempatan):

- Tiap detik, kalau `document.visibilityState === 'visible'` (tab/app aktif di layar), waktu terpakai bertambah 1 detik di UI **secara lokal** (responsif, tidak nunggu network).
- Detik yang belum tersimpan dikirim ke server (`POST /api/playtime/:profileId`) tiap ~10 detik, bukan tiap detik — supaya backend yang diakses lewat internet (Cloudflare Tunnel) tidak kebanjiran 60 request/menit per anak yang lagi main. Sisa detik juga langsung dikirim saat tab disembunyikan (`visibilitychange`) atau layar berpindah, jadi paling banyak ~10 detik yang berisiko tidak ke-flush kalau koneksi putus mendadak.
- Kalau tab di-minimize/pindah tab, hitungan **berhenti otomatis** (tidak menghukum anak untuk waktu yang tidak benar-benar dipakai main).
- Sisa waktu ≤ 5 menit → badge waktu berubah warna (peringatan).
- Sisa waktu habis → layar dikunci (`lock-screen`), hanya bisa kembali ke pilih profil, baru bisa main lagi besok (hitungan berbasis tanggal lokal, reset otomatis saat tanggal berganti — dideteksi tiap detik lewat `todayStr()`).
- Batas harian (30-60 menit, kelipatan 5) diatur per-profil oleh orang tua lewat gerbang PIN di halaman Pengaturan.

## Monitoring Progres (Laporan Orang Tua)

Di layar Pengaturan, tiap profil punya tombol **📊 Progres** yang membuka laporan per anak (`src/components/ProgressReport.jsx`). Isinya dua bagian:

**1. Waktu main 7 hari terakhir** — grafik batang harian dari `GET /api/playtime/:profileId/history?days=7`. Hari tanpa data ikut dikirim server sebagai `0` supaya grafiknya tidak bolong. Garis putus-putus oranye menandai batas harian anak tsb, dan batang yang menyentuh/melewati batas diwarnai merah muda — jadi orang tua langsung lihat hari mana anaknya main sampai mentok. Di bawahnya ada ringkasan total menit, berapa hari dari 7 yang dipakai main, dan rata-rata per hari main (dibagi hari yang benar-benar main, bukan dibagi 7 — supaya angkanya tidak menyesatkan kalau anak libur beberapa hari).

**2. Perkembangan per game** — dibaca dari `GET /api/progress/:profileId`, menampilkan untuk tiap game:

| Yang ditampilkan | Artinya buat orang tua |
|---|---|
| `Level X/maxLevel · <Tahapan>` + bar | Posisi anak di kurikulum game itu (lihat [Label Tahapan](#label-tahapan)) |
| `N/3 set lulus menuju level berikutnya` | Seberapa dekat naik level — butuh 3 set lulus berturut-turut |
| `sedang mengerjakan set (N soal)` | Ada set yang belum selesai, jadi angka di atas belum final |
| ⚠️ `Baru gagal 1 set` | Peringatan dini: satu kegagalan lagi dan levelnya turun (lihat [Naik & turun level](#naik--turun-level)) |
| `Main bebas · ⭐ N` | Game tanpa grading (Balon Angka, Animal Sounds) — hanya hitung bintang |
| `Belum pernah dimainkan` | Game di tingkatnya yang belum disentuh, ditampilkan redup |

Daftar game-nya = semua game di tier anak saat ini, **ditambah** game dari tier lain yang terlanjur punya progres (misalnya setelah [turun tingkat](#turun-tingkat-kalau-belum-siap)) — ditandai label "Tingkat B/C/D" supaya riwayatnya tidak hilang dari laporan.

## Model Data (Backend)

Semua data sekarang di server, bukan di browser lagi — lihat [Backend & Akses Internet](#backend--akses-internet) untuk detail lengkap. Ringkasan bentuknya (satu file `db.json`):

| Bagian | Isi |
|---|---|
| `parentPinHash`, `parentPinSalt` | Hash scrypt (bergaram) dari PIN 4-digit orang tua — PIN aslinya sendiri tidak pernah disimpan maupun dikirim balik ke client, verifikasi dilakukan di server (`POST /api/pin/verify`) |
| `profiles` | Array semua profil anak `{id, name, avatar, birthYear, dailyLimitMinutes, tierOverride}` — `tierOverride` (`null` atau salah satu `'A'\|'B'\|'C'\|'D'`) opsional, dipakai untuk override tier hasil hitungan umur (lihat [Turun Tingkat Kalau Belum Siap](#turun-tingkat-kalau-belum-siap)) |
| `progress.<profileId>` | `{ totalStars, games: { [gameId]: {level, stars, setsPassedAtLevel, consecutiveSetFails, setAnswered, setCorrect, setTotalTimeMs} } }` — sama persis bentuknya dengan versi localStorage sebelumnya |
| `playtime.<profileId>.<yyyy-mm-dd>` | Total detik bermain profil tsb pada tanggal tsb |

## Backend & Akses Internet

`server/index.js` (Express) meng-serve API di `/api/*` sekaligus file statis hasil build React — satu proses, satu port (`3000` secara default). `server/db.js` adalah datastore-nya: satu file JSON (`db.json`) di-load ke memori saat start, tiap tulis langsung disimpan lagi ke disk (tulis ke `.tmp` lalu rename, supaya tidak korup kalau proses mati di tengah tulis).

**Kenapa file JSON, bukan SQL database?** Data aplikasi ini kecil (segelintir profil anak, tiap profil cuma satu blob JSON progres) dan jarang ditulis bersamaan — database SQL beneran (mis. `better-sqlite3`) cuma nambah kerumitan build Docker (native module, sering bermasalah di Alpine/musl) tanpa manfaat nyata di skala ini.

**Kenapa optimistic write, bukan tunggu server tiap jawaban?** `useGameProgress`'s `recordAnswer()` dipakai game untuk langsung generate soal berikutnya (`const result = recordAnswer(...); setQuestion(makeQuestion(result.level))`) — kalau ini nunggu network, tiap jawaban akan terasa lag. Jadi state di React diupdate duluan (sinkron), baru `PUT /api/progress/:id` dikirim di belakang layar tanpa ditunggu. Kalau request itu gagal, progres di server bisa telat beberapa detik dari yang di layar — untuk game anak ini risikonya kecil dan bisa diterima.

### Backup data

`db.json` ada di volume Docker `/data` (nama volume `app-data` di `docker-compose.yml`). Backup = copy file itu:

```bash
docker compose cp app:/data/db.json ./backup-db.json
```

### Akses dari luar rumah (Cloudflare Tunnel)

Tunnel-nya di-setup manual di luar `docker-compose.yml` ini (bukan lewat `cloudflared` sebagai service compose) — arahkan public hostname-nya ke `http://<ip-host>:8081` (atau ke `app:3000` kalau `cloudflared`-nya dijalankan dalam network Docker yang sama).

### Keamanan masuk (login gate)

**Seluruh aplikasi sekarang di belakang PIN orang tua**, bukan cuma layar "Pengaturan" — begitu buka situsnya, wajib masukkan PIN 4-digit dulu sebelum profil anak atau data apa pun bisa diakses (`server/index.js`: semua route `/api/*` kecuali `/api/pin*` dan `/api/session` butuh `requireAuth`). Alurnya:

- PIN diverifikasi di server dan **disimpan sebagai hash scrypt bergaram**, bukan teks polos, di `db.json` (`server/db.js`) — kalau file backup-nya bocor, PIN aslinya tidak langsung ketahuan.
- Setelah PIN benar, server memberi **session cookie `httpOnly`** (`dc_session`, berlaku 30 hari, `SameSite=Lax`) — jadi tidak perlu login ulang tiap buka, dan cookie-nya tidak bisa dibaca lewat JavaScript di browser (mitigasi XSS). Cookie ini sengaja **tidak** ditandai `Secure` karena tunnel & akses LAN sama-sama nyambung ke server ini lewat HTTP biasa (TLS-nya berhenti di edge Cloudflare) — kalau ditandai `Secure`, browser malah akan diam-diam menolak kirim cookie-nya.
- `POST /api/pin/verify` tetap dibatasi **10 percobaan/15 menit per IP** (`express-rate-limit`, baca IP asli dari header `CF-Connecting-IP` kalau lewat tunnel) — PIN 4-digit cuma 10.000 kombinasi, jadi pembatasan ini penting begitu reachable dari internet terbuka.
- Ada tombol **Keluar** di layar Pengaturan (memanggil `POST /api/session/logout`) untuk device yang dipakai bersama.

**Peringatan setup pertama kali:** siapa pun yang lebih dulu memanggil `POST /api/pin` (yaitu, siapa pun yang lebih dulu mengisi layar "Buat PIN Orang Tua") akan langsung tercatat sebagai PIN yang sah dan langsung login. Karena itu, **set PIN-nya dulu lewat akses LAN sebelum mengaktifkan tunnel ke internet** — server juga akan mencetak peringatan ke log kalau start tanpa PIN sama sekali. Setelah PIN pertama dibuat, `POST /api/pin` akan selalu menolak dengan `409` (tidak bisa diubah lewat endpoint ini lagi).

Lapisan ini menggantikan rekomendasi **Cloudflare Access** yang sebelumnya didokumentasikan di sini. Cloudflare Access tetap boleh ditambahkan sebagai lapisan ekstra kalau mau (defense-in-depth di level edge, sebelum request sampai ke server sama sekali), tapi sekarang bukan keharusan karena app sendiri sudah punya gerbang login yang sesungguhnya.

## Keterbatasan & Roadmap

- **Ikon PWA** (`pwa-192.png`, `pwa-512.png`) belum dibuat — install-to-homescreen akan pakai ikon default browser.
- **Placement test hanya sekali jalan per klik** — kalau ingin tes ulang (misalnya beberapa bulan kemudian anak makin jago), tinggal buka lagi tombolnya, tidak ada pembatasan berapa kali boleh dites.
- **Tidak ada migrasi otomatis dari localStorage lama** — profil yang dibuat sebelum backend ini ada (di `localhost:5173`/`:8080` versi lama) tidak ikut pindah; ini keputusan sadar saat backend dibangun, bukan bug.
