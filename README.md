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
10. [Model Data (localStorage)](#model-data-localstorage)
11. [Keterbatasan & Roadmap](#keterbatasan--roadmap)

---

## Menjalankan Project

```bash
npm install
npm run dev      # development server, http://localhost:5173
npm run build    # build produksi ke ./dist
npm run preview  # preview hasil build
```

Tidak butuh backend/server — semua data (profil, progres, waktu main) disimpan di `localStorage` milik browser/device tersebut. PWA (`vite-plugin-pwa`) membuat app bisa di-install ke homescreen dan jalan offline.

## Struktur Folder

```
src/
  data/
    storage.js          # baca/tulis localStorage: profil, progres, waktu main
    ageTier.js           # hitung tier (A/B/C/D) dari tahun lahir
    levelStage.js         # label tahapan (Pemanasan..Master) dari nomor level
    sound.js              # efek suara (Web Audio) + text-to-speech (Web Speech API)
  context/
    ProfileContext.jsx    # state profil aktif, daftar profil, CRUD profil
  hooks/
    useDailyTimer.js       # timer harian per profil + auto-lock
    useGameProgress.js      # mesin leveling/grading ala Kumon (lihat bab 5)
  components/
    ProfileSelect, Settings, ParentGate  # pemilihan profil, pengaturan ortu (PIN)
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
Pilih Profil ──▶ Menu Game (per tier) ──┬──▶ Main Game ──▶ (dinilai per set 10 soal)
                                        └──▶ Tes Penempatan ──▶ terapkan level awal
```

Layar Pengaturan Orang Tua (gerbang PIN 4-digit) dipakai untuk menambah/mengubah profil anak dan mengatur batas waktu harian (30-60 menit). Semua layar bermain dibungkus `GameShell`, yang menampilkan tombol home, badge waktu tersisa, dan mengunci layar otomatis kalau waktu harian habis.

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
| Tambah Ceria (Tier B) | 10 | 80% | 15.000 ms | 8 | 3 |
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

- Penjumlahan dua bilangan, `maxOperand = min(10, 1 + level)` → Level 1: angka 1-2 (jumlah maks 4), Level 8: angka 1-9 (jumlah bisa sampai 18) — sesuai kurikulum "penjumlahan sampai 20" TK-Kelas 1.
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

## Sistem Bintang & Reward

Dua sumber bintang, tergantung jenis game:

- **Game berjenjang** (`recordAnswer`): +1 bintang tiap jawaban benar, +3 bintang bonus tiap kali lulus satu set.
- **Game free-play** (`awardStar`, dipanggil manual dari komponennya):
  - Balloon Pop: +1 bintang tiap 5 balon pecah.
  - Animal Sounds: +1 bintang tiap 3 hewan *baru* (belum pernah ditap sesi ini) yang ditemukan.

Tidak ada leaderboard atau perbandingan antar-anak — bintang murni internal per-profil, ditampilkan di `star-bar` tiap layar game.

## Batas Waktu Harian

`src/hooks/useDailyTimer.js`, dipakai oleh `GameShell` di semua layar bermain (termasuk Tes Penempatan):

- Tiap detik, kalau `document.visibilityState === 'visible'` (tab/app aktif di layar), waktu terpakai bertambah 1 detik dan disimpan ke `localStorage` (`dc:playtime:<profileId>:<yyyy-mm-dd>`).
- Kalau tab di-minimize/pindah tab, hitungan **berhenti otomatis** (tidak menghukum anak untuk waktu yang tidak benar-benar dipakai main).
- Sisa waktu ≤ 5 menit → badge waktu berubah warna (peringatan).
- Sisa waktu habis → layar dikunci (`lock-screen`), hanya bisa kembali ke pilih profil, baru bisa main lagi besok (hitungan berbasis tanggal lokal, reset otomatis saat tanggal berganti — dideteksi tiap detik lewat `todayStr()`).
- Batas harian (30-60 menit, kelipatan 5) diatur per-profil oleh orang tua lewat gerbang PIN di halaman Pengaturan.

## Model Data (localStorage)

| Key | Isi |
|---|---|
| `dc:profiles` | Array semua profil anak `{id, name, avatar, birthYear, dailyLimitMinutes}` |
| `dc:parentPin` | PIN 4-digit orang tua (plain, karena hanya kontrol kenyamanan lokal — bukan data sensitif) |
| `dc:progress:<profileId>` | `{ totalStars, games: { [gameId]: {level, stars, setsPassedAtLevel, consecutiveSetFails, setAnswered, setCorrect, setTotalTimeMs} } }` |
| `dc:playtime:<profileId>:<yyyy-mm-dd>` | Total detik bermain profil tsb pada tanggal tsb |

Semua data lokal di device — tidak ada server/akun, sehingga tidak ada login, dan data tidak tersinkron antar-device.

## Keterbatasan & Roadmap

- **Ikon PWA** (`pwa-192.png`, `pwa-512.png`) belum dibuat — install-to-homescreen akan pakai ikon default browser.
- **Belum ada laporan mingguan untuk orang tua** (waktu main, topik yang dikuasai) — datanya sudah tersimpan (`dc:progress:*`, `dc:playtime:*`), tinggal dibuatkan tampilannya di layar Pengaturan.
- **Placement test hanya sekali jalan per klik** — kalau ingin tes ulang (misalnya beberapa bulan kemudian anak makin jago), tinggal buka lagi tombolnya, tidak ada pembatasan berapa kali boleh dites.
