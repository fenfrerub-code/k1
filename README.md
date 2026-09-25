# OrderHub Backend (MVP)

Backend REST API cho SaaS quan ly don hang da san (Shopee, TikTok Shop,
Lazada). Giai doan MVP: chua ket noi API that cua cac san/hang van chuyen,
dung `MockIntegrationAdapter` de mo phong dong bo don hang.

## 1. Yeu cau

- Node.js 18+
- PostgreSQL 14+ da chay `database-schema.sql` + `mock-data.sql` (2 file o
  buoc truoc - dat cung cap voi thu muc `backend/` nay, hoac sua duong dan
  trong `package.json` neu de o cho khac).

## 2. Cai dat

```bash
cd backend
cp .env.example .env
# mo .env, dien DATABASE_URL that va doi JWT_SECRET thanh chuoi ngau nhien dai
npm install
npm start
```

Server chay tai `http://localhost:4000` (doi bang `PORT` trong `.env`).
Tai lieu API (Swagger UI): `http://localhost:4000/api/docs`.

## 3. Chay test

```bash
npm test
```

Test dung Jest + mock repository (khong can ket noi database that) - kiem
tra rieng cac logic quan trong: dang ky/dang nhap, chuyen trang thai don
hang hop le/khong hop le, **tenant isolation** (user nay khong xem duoc don
cua user khac), chong duplicate khi sync, thong ke dashboard.

## 4. Kien truc

```
Frontend
  |  REST API (JWT Bearer token)
  v
Routes  (src/routes)        - dinh nghia endpoint + validate input
  v
Controllers (src/controllers) - nhan request, goi service, tra response
  v
Services (src/services)     - logic nghiep vu (vd: kiem tra chuyen trang thai)
  v
Repositories (src/repositories) - cau truc cau SQL, KHONG chua logic nghiep vu
  v
PostgreSQL (Row Level Security bat tren cac bang thuoc tenant)
```

`src/integrations/` chua `IntegrationAdapter` (interface chung) va
`MockIntegrationAdapter` (trien khai gia lap cho MVP). Sau nay them
`ShopeeAdapter`, `TikTokShopAdapter`, `LazadaAdapter`... implement cung
interface do, roi sua 1 dong trong `src/services/syncService.js`
(ham `resolveAdapter`) - khong phai sua Order Service hay Dashboard Service.

## 5. Multi-tenant security

Moi request da dang nhap chay trong 1 transaction rieng
(`src/middleware/tenantContext.js`), voi lenh:

```sql
SET LOCAL app.current_user_id = '<uuid cua user dang dang nhap>';
```

Nho Row Level Security cua Postgres (da bat trong `database-schema.sql`),
MOI query tren cac bang shops/orders/customers/products/shipments/... tu
dong chi thay du lieu cua dung tenant, ke ca neu code co lo quen loc
`WHERE user_id = ...`. Repository van them dieu kien do tuong minh nhu 1
lop bao ve thu 2 (defense in depth).

## 6. Bien moi truong quan trong (.env)

| Bien | Y nghia |
|---|---|
| `DATABASE_URL` | chuoi ket noi PostgreSQL |
| `JWT_SECRET` | khoa ky JWT - PHAI la chuoi ngau nhien, dai, giu bi mat |
| `JWT_EXPIRES_IN` | thoi han token, mac dinh 7 ngay |
| `CORS_ORIGIN` | domain frontend duoc phep goi API |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` | gioi han so request/IP |

Khong bao gio commit file `.env` that len git - chi commit `.env.example`.
