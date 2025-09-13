Backend — Digital Magazines (Fastify + TypeScript)

الجزء الخلفي من المنصّة مبني على:

Fastify 

TypeScript

Prisma ORM

قاعدة بيانات sqlite  (يمكن استبدالها بـسهولة)

1) تثبيت المكاتب

ادخل إلى مجلد الباك:
npm install

توليد Prisma Client
npx prisma generate


عمل Seed (إضافة بيانات أولية)
npx tsx prisma/seed.ts

سيتم إنشاء حسابات جاهزة:

Admin → admin@example.com / Admin@123

Publisher → publisher@example.com / Publisher@123

Subscriber → subscriber@example.com / Subscriber@123

تشغيل المشروع
npm run dev

الخادم يعمل على:
👉 http://localhost:3001/api


 ملاحظات


إذا أردت التحويل لـ SQL (Postgres) يكفي تعديل provider في prisma/schema.prisma + تغيير DATABASE_URL.

seed.ts يحتوي أمثلة لمستخدمين ومجلّة واحدة للانطلاق.
