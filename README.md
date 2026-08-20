# 🖥️ Sinter Frontend

Sinter, modern iletişim ihtiyaçları için geliştirilmiş; yüksek performanslı, güvenli ve gerçek zamanlı masaüstü ve web tabanlı sohbet istemcisidir. 

Bu istemci, [Sinter Backend](https://github.com/hardhus/sinter_backend) motoru ile tam uyumlu olarak çalışır ve RESTful API entegrasyonu ile WebSocket tabanlı canlı veri akışını birleştirir.

---

## 🛠️ Teknoloji Yığını

* **Çerçeve & Masaüstü:** Tauri v2, React 19, TypeScript, Vite
* **Yönlendirme (Routing):** TanStack Router (File-based routing)
* **Veri Yönetimi & İstemci:** TanStack Query (React Query) + `@hey-api/openapi-ts` (Otomatik SDK & Zod Şemaları)
* **Arayüz & Tasarım:** Tailwind CSS, Shadcn UI / Radix primitives, Lucide Icons
* **Gerçek Zamanlı İletişim:** Özel WebSocket Client (Oda abonelikleri, yazıyor göstergesi, iyimser önbellekleme)

---

## 🚀 Temel Özellikler

### 🔐 1. Kimlik Doğrulama & Oturum Yönetimi
* Güvenli kayıt olma ve giriş yapma ekranları.
* Cihaz tanıma (`device_name`) ve oturum takibi.
* JWT tabanlı yetkilendirme ve otomatik token yönetimi.

### 🏢 2. Sunucu & Kanal Yönetimi
* Discord tarzı sol sunucu ve kanal gezinti paneli (`ServerSidebar`, `ChannelSidebar`).
* Herkese açık sunucuları keşfetme (`/app/discover`) ve tek tıkla katılma.
* Sunucu sahibi / yöneticileri için rol yönetimi, üye listeleme ve yetki atama modalları (`ServerSettingsModal`).

### 💬 3. Gerçek Zamanlı Mesajlaşma
* Kanal bazlı sonsuz kaydırma (Cursor-based infinite query) ile mesaj geçmişi.
* Anlık WebSocket tabanlı mesaj iletimi, düzenleme ve silme.
* "Birisi yazıyor..." (`TypingIndicator`) anlık durum takibi.

### 👥 4. Sosyal Ağ, DM ve Bildirimler
* Arkadaş listesi yönetimi, arkadaşlık istekleri ve kullanıcı engelleme.
* Birebir Direkt Mesajlaşma (DM) odaları.
* Okunmamış bildirim zili (`NotificationBell`) ve anlık bildirim kuyruğu.

---

## 📡 Backend Entegrasyonu

Bu arayüz, [sinter_backend](https://github.com/hardhus/sinter_backend) tarafından sunulan OpenAPI (Swagger) spesifikasyonuna göre otomatik olarak tiplendirilmiştir. Tüm API çağrıları `@hey-api/openapi-ts` ile üretilen güvenli istemci üzerinden gerçekleştirilir.

---

## 🛠️ Kurulum & Geliştirme

### Gereksinimler
* Node.js / Bun
* Rust (Tauri v2 derlemesi için)

### 1. Depoyu Klonlayın
```bash
git clone [https://github.com/hardhus/sinter_frontend.git](https://github.com/hardhus/sinter_frontend.git)
cd sinter_frontend

```

### 2. Bağımlılıkları Yükleyin

```bash
bun install

```

### 3. Geliştirme Sunucusunu Başlatın (Tauri)

```bash
bun run tauri dev

```
