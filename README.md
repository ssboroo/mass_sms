# Mass SMS

Монголын хэрэглэгч, байгууллагуудад зориулсан зөвшөөрөлд суурилсан бөөн SMS платформ. Эхлээд вебээр ажиллаж, дараа нь ижил backend API-гаар iOS болон Android апп холбох API-first бүтэцтэй.

## Технологи
- Web: Next.js App Router + TypeScript
- Future mobile: Expo + React Native (нэгдсэн API ашиглана)
- API: versioned REST API, `/api/v1`
- Database: Railway PostgreSQL + Prisma
- SMS: WeSend REST API
- Payments: Wire hosted checkout + verified webhook

## Local development
```bash
npm install
cp .env.example .env.local
npm run db:generate
npm run dev
```

Railway PostgreSQL-ийн `DATABASE_URL` утгыг Railway service Variables хэсэгт тохируулна. Production deployment-д migration-ийг `npm run db:migrate:deploy` командаар хяналттай ажиллуулна. Production өгөгдөл дээр `prisma migrate reset` бүү ажиллуул.

## Database model
Prisma schema: `prisma/schema.prisma`

Үндсэн домэйн:
- Users, sessions, API tokens
- Credit accounts болон append-only credit ledger
- Wire payments, webhook event deduplication
- Tenant-scoped contacts, consent evidence, suppression list
- SMS campaigns, recipients, provider batches
- Монголын дугаарын prefix/operator лавлах, эх сурвалж ба хүчинтэй хугацааны provenance

## Mobile-ready API
Веб, iOS, Android нь ижил HTTPS JSON API хэрэглэнэ. API-ийн төлөвлөсөн endpoint-ууд болон аюулгүй байдлын invariants: [docs/architecture.md](docs/architecture.md).

## Монгол дугаарын лавлахын чухал зарчим
Энэ сан нь бүх иргэний утасны дугаарын жагсаалт биш. Зөвхөн улсын дугаарлалтын төлөвлөгөө, prefix allocation, операторын лавлах зэрэг нийтийн metadata хадгална. Prefix нь дугаар зөөвөрлөлтийн дараа одоогийн операторыг батлахгүй. Иймээс албан ёсны эх сурвалжаар баталгаажсан prefix-үүдийг л seed хийнэ. Хэрэглэгчийн харилцагчийн жагсаалт тусдаа, зөвхөн тухайн хэрэглэгчид харагдах ба SMS зөвшөөрлийн нотолгоотой байна.

## Billing and SMS safety
- Wire төлбөр баталгаажсан webhook-оор орж ирсний дараа л credit нэмнэ.
- Бүх credit өөрчлөлт unique idempotency key-тэй ledger entry үүсгэнэ.
- Кампанит ажлын credit reservation DB transaction дотор хийгдэнэ.
- WeSend болон Wire API түлхүүрүүд сервер талд хадгалагдана.
- Consent болон suppression list шалгалтгүй SMS campaign илгээхгүй.
- Provider batch-ийн төлөвийг reconcile хийж, баталгаажсан амжилтгүй илгээлтийн credit-ийг дүрмийн дагуу буцаана.

## Environment
`.env.example`-ийг үзнэ үү. Нууц утгуудыг GitHub-д commit хийхгүй.
