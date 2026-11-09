# Mass SMS

Монголын байгууллагуудад зориулсан зөвшөөрөлд суурилсан бөөн SMS илгээх веб платформ.

## Технологи
- Next.js App Router + TypeScript
- WeSend REST API — SMS илгээлт
- Wire Payment API — MNT төлбөр, hosted checkout, webhook
- PostgreSQL — хэрэглэгч, кампанит ажил, кредитийн ledger, зөвшөөрөл, гүйлгээ

## Эхлүүлэх
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Орчны хувьсагч
`.env.example`-ийг үзнэ үү. Нууц түлхүүрүүдийг зөвхөн сервер талд хадгална. Client bundle-д API key оруулахыг хориглоно.

## Үндсэн урсгал
1. Хэрэглэгч бүртгүүлж байгууллагын мэдээллээ баталгаажуулна.
2. Харилцагчдын жагсаалтыг CSV-ээр импортолж, SMS авах зөвшөөрлийн эх сурвалжийг бүртгэнэ.
3. Дугаар, давхардал, оператор, opt-out жагсаалтыг шалгана.
4. SMS текстийн хэсэг болон үнийг урьдчилан тооцно.
5. Wire hosted checkout-оор кредит худалдан авна. Зөвхөн signature шалгасан `payment_intent.succeeded` webhook кредит нэмнэ.
6. Сервер тал WeSend bulk API руу 1,000 хүртэл дугаартай batch илгээнэ.
7. Batch төлөв, хүргэлтийн тайлан болон буцаалтыг синк хийнэ.

## Аюулгүй ажиллагааны шаардлага
- Зөвшөөрөлгүй маркетингийн дугаар руу илгээхгүй; зөвшөөрлийн эх сурвалж, огноог хадгална.
- STOP/татгалзсан дугааруудыг suppression list-д оруулж бүх кампанит ажлаас хасна.
- Bulk илгээлтэд урьдчилсан баталгаажуулалт, өдөр тутмын лимит, хэрэглэгчийн rate limit хэрэгжүүлнэ.
- Кредитийн хөдөлгөөнийг append-only ledger болон DB transaction ашиглан бүртгэнэ.
- Wire webhook signature, event ID давхардал, Idempotency-Key шалгана.
- WeSend/Wire түлхүүрүүдийг зөвхөн серверийн орчны хувьсагчид хадгална.
- Production илгээлтийг зөвхөн хэрэглэгчийн ил тод баталгаажуулалт болон төлбөрийн үлдэгдэл хүрэлцсэн үед зөвшөөрнө.

## Интеграцийн лавлах
- WeSend SMS: https://wesend.mn/docs/sms
- Wire Quickstart: https://docs.wire.mn/docs/quickstart
- Wire Webhooks: https://docs.wire.mn/en/docs/guides/webhooks

## Одоогийн төлөв
Эхний UI scaffold болон SMS өртгийн урьдчилсан тооцоолуур нэмэгдсэн. Бүртгэл, өгөгдлийн сан, бодит SMS API, Wire checkout/webhook холболтууд дараагийн хэрэгжүүлэлтийн шатанд.
