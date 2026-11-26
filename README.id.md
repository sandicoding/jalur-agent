# skill-metro

**Peta MRT live buat skill Claude Code lu.** Lihat agent lagi di fase mana, kapan dia pindah ke skill lain atau subagent, berapa lama tiap tool call, dan putar ulang run mana pun, dalam tampilan yang memang dibikin buat ditunjukin di layar.

[English](README.md)

> 📸 *GIF demo menyusul.*

## Kenapa bikin dashboard agent lagi?

Udah ada beberapa dashboard open-source yang bagus buat Claude Code (lihat [Proyek terkait](#proyek-terkait)). Mereka nampilin **tool call**. skill-metro nampilin **proses kerja lu**:

| | Dashboard agent umumnya | skill-metro |
|---|---|---|
| Yang ditampilin | Tool call per agent | **Fase pipeline skill** yang lu tentuin sendiri (stasiun di satu jalur) |
| Skill pindah ke skill lain | Nggak digambar | Digambar sebagai **jalur transfer** di stasiun tempat kejadiannya |
| Buat jelasin ke orang lain | Daftar event mentah | Tiap stasiun ada *alasan kenapa ada*, tiap skill ada *fungsinya*, plus **mode presentasi** dan **replay** |
| Yang disimpan | Sering payload penuh | **Cuma ringkasan**: isi prompt dan isi file nggak disimpan, token disensor |
| Instalasi | Sering butuh Docker | Cukup Node, tanpa dependency |

## Instalasi

```bash
claude plugin marketplace add sandicoding/skill-metro
claude plugin install skill-metro@skill-metro
```

Terus di Claude Code:

```
/skill-metro:board            # nyalain board, muncul http://localhost:4321
```

Jalanin contoh skill bawaan buat lihat run jalan di sepanjang jalur:

```
/skill-metro:feature-flow tambahin toggle dark mode di halaman settings
```

Butuh Node.js 18+. Data disimpan di `~/.skill-metro` (bisa diganti lewat `SKILL_METRO_DATA`). Board pakai Bahasa Indonesia: `http://localhost:4321/?lang=id`.

## Fitur

- **Peta MRT per fase.** Stasiun nyala satu per satu, yang aktif berdenyut.
- **Transfer.** Pas skill lu manggil skill lain atau subagent, muncul cabang jalur berwarna di stasiun itu.
- **Tool call lengkap sama durasi dan status.** Event Pre/Post digabung jadi satu baris, yang gagal ditandai.
- **Riwayat run dan replay.** Pilih run lama, terus putar ulang dengan kecepatan presentasi.
- **Cari dan filter** log perjalanan.
- **Statistik:** durasi, tool call, file diubah, transfer, gagal, dan durasi per fase di akhir.
- **Mode presentasi** dan **English / Bahasa Indonesia**.

## Pipeline sendiri

Copy `pipelines/feature-flow.json` ke `~/.skill-metro/pipelines/<nama>.json`, terus buka `http://localhost:4321/?pipeline=<nama>`. Format lengkapnya ada di [README.md](README.md#your-own-pipeline).

**Batasan yang perlu lu tau:** fase ditebak dari tool call. Cara ini akurat buat langkah yang khas (panggil skill, `git commit`, perintah tes), tapi kurang akurat buat langkah yang mirip-mirip. Aturannya perlu disesuaiin sama cara kerja agent lu.

## Bonus: tiga skill spesialis

Skill pengganti teman spesialis yang biasanya lu mintain tolong: `specialist-visual-designer`, `specialist-pitch-storyteller`, `specialist-business-strategist`. Sumbernya bisa dilihat di [README.md](README.md#bonus-three-specialist-skills).

## Privasi

Semua data tetap di laptop lu, dan server cuma bisa diakses dari `127.0.0.1`. Yang disimpan cuma jenis tool plus ringkasan pendek. Isi prompt, isi file, dan diff nggak pernah disimpan, dan token disensor.

## Proyek terkait

[agents-observe](https://github.com/simple10/agents-observe) ·
[claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability) ·
[Claude-Code-Agent-Monitor](https://github.com/hoangsonww/Claude-Code-Agent-Monitor) ·
[Mohano](https://hulryung.github.io/mohano/). Beberapa ide board-nya terinspirasi dari agents-observe, tapi kodenya ditulis sendiri dari nol.

## Lisensi

MIT. Lihat [NOTICE](NOTICE) buat atribusi skill visual designer.
