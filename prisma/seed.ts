/**
 * SEED_PUBLISHERS=5
 * SEED_SUBSCRIBERS=10
 * SEED_MAGAZINES_PER_PUBLISHER=8
 * SEED_ARTICLES_PER_MAG=4
 * SEED_COMMENTS_MIN=2
 * SEED_COMMENTS_MAX=10
 * SEED_SUBSCRIBER_RATE=0.6
 */
import { PrismaClient, Role, SubscriptionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const PUBLISHER_COUNT = 5;
const SUBSCRIBER_COUNT = 10;
const MAGS_PER_PUBLISHER = 8;
const ARTICLES_PER_MAG = 4;
const COMMENTS_MIN = 2;
const COMMENTS_MAX = 10;
const SUBSCRIBER_RATE = 0.6;

const PUBLISH_RATIO = 0.7; // 70% Published, 30% Draft
const SUB_STATUS_DIST: Array<{ status: SubscriptionStatus; weight: number }> = [
  { status: 'ACTIVE', weight: 0.6 },
  { status: 'EXPIRED', weight: 0.25 },
  { status: 'CANCELED', weight: 0.15 },
];

const pickWeighted = <T extends { weight: number }>(arr: T[]) => {
  const sum = arr.reduce((s, a) => s + a.weight, 0);
  let r = Math.random() * sum;
  for (const a of arr) {
    if ((r -= a.weight) <= 0) return a;
  }
  return arr[arr.length - 1];
};

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

type MagRow = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  publisherId: string;
  createdAt: Date;
  updatedAt: Date;
};

type ArticleRow = {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
  magazineId: string;
  authorId: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type SubRow = {
  id: string;
  userId: string;
  magazineId: string;
  startAt: Date;
  endAt: Date;
  status: SubscriptionStatus;
  createdAt: Date;
};

type CommentRow = {
  id: string;
  body: string;
  articleId: string;
  userId: string;
  createdAt: Date;
};

// ======================================================

async function main() {
  console.time('seed:all');

  const [adminHash, publisherHash, subscriberHash] = await Promise.all([
    bcrypt.hash('Admin@123', 10),
    bcrypt.hash('Publisher@123', 10),
    bcrypt.hash('Subscriber@123', 10),
  ]);

  await prisma.$transaction(async (tx) => {
    await tx.comment.deleteMany();
    await tx.subscription.deleteMany();
    await tx.article.deleteMany();
    await tx.magazine.deleteMany();
    await tx.user.deleteMany();

    const adminId = faker.string.uuid();
    const knownPublisherId = faker.string.uuid();
    const knownSubscriberId = faker.string.uuid();

    const baseUsers: UserRow[] = [
      {
        id: adminId,
        email: 'admin@example.com',
        name: 'Admin',
        role: Role.ADMIN,
        passwordHash: adminHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: knownPublisherId,
        email: 'publisher@example.com',
        name: 'Publisher',
        role: Role.PUBLISHER,
        passwordHash: publisherHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: knownSubscriberId,
        email: 'subscriber@example.com',
        name: 'Subscriber',
        role: Role.SUBSCRIBER,
        passwordHash: subscriberHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const publishers: UserRow[] = [];
    for (let i = 0; i < PUBLISHER_COUNT; i++) {
      publishers.push({
        id: faker.string.uuid(),
        email: `publisher${i + 1}@example.com`,
        name: faker.person.fullName(),
        role: Role.PUBLISHER,
        passwordHash: publisherHash,
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: new Date(),
      });
    }

    const subscribers: UserRow[] = [];
    for (let i = 0; i < SUBSCRIBER_COUNT; i++) {
      subscribers.push({
        id: faker.string.uuid(),
        email: `subscriber${i + 1}@example.com`,
        name: faker.person.fullName(),
        role: Role.SUBSCRIBER,
        passwordHash: subscriberHash,
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: new Date(),
      });
    }

    const allUsers: UserRow[] = [...baseUsers, ...publishers, ...subscribers];
    for (const part of chunk(allUsers, 1000)) {
      await tx.user.createMany({ data: part });
    }

    const magazines: MagRow[] = [];
    const allPublisherIds = [knownPublisherId, ...publishers.map((p) => p.id)];
    for (const pubId of allPublisherIds) {
      for (let j = 0; j < MAGS_PER_PUBLISHER; j++) {
        const title =
          `${faker.commerce.department()} ${faker.word.words({ count: { min: 1, max: 2 } })}`.replace(
            /\b\w/g,
            (c) => c.toUpperCase(),
          );
        magazines.push({
          id: faker.string.uuid(),
          title,
          description: faker.lorem.sentences({ min: 2, max: 4 }),
          coverUrl: faker.image.urlPicsumPhotos({ width: 800, height: 500 }),
          publisherId: pubId,
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: new Date(),
        });
      }
    }
    for (const part of chunk(magazines, 1000)) {
      await tx.magazine.createMany({ data: part });
    }

    const magToPublisher = new Map<string, string>();
    for (const m of magazines) magToPublisher.set(m.id, m.publisherId);

    const articles: ArticleRow[] = [];
    for (const m of magazines) {
      for (let k = 0; k < ARTICLES_PER_MAG; k++) {
        const isPublished = Math.random() < PUBLISH_RATIO;
        const status: 'DRAFT' | 'PUBLISHED' = isPublished ? 'PUBLISHED' : 'DRAFT';
        const createdAt = faker.date.past({ years: 1 });
        const publishedAt = isPublished
          ? faker.date.between({ from: faker.date.recent({ days: 180 }), to: new Date() })
          : null;

        const paragraphs = Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, () =>
          faker.lorem.paragraphs({ min: 1, max: 2 }),
        ).join('\n\n');

        const content = `## ${faker.lorem.words({ min: 3, max: 7 })}

${paragraphs}

### ${faker.lorem.words({ min: 3, max: 6 })}
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}

${faker.lorem.paragraphs({ min: 2, max: 4 })}

> ${faker.lorem.sentence()}

${faker.lorem.paragraphs({ min: 1, max: 3 })}`;

        articles.push({
          id: faker.string.uuid(),
          title: faker.lorem.sentence({ min: 3, max: 8 }),
          summary: faker.lorem.sentences({ min: 1, max: 2 }),
          content,
          status,
          magazineId: m.id,
          authorId: magToPublisher.get(m.id)!,
          publishedAt,
          createdAt,
          updatedAt: new Date(),
        });
      }
    }
    for (const part of chunk(articles, 1000)) {
      await tx.article.createMany({ data: part });
    }

    const subs: SubRow[] = [];
    const allSubscriberIds = [knownSubscriberId, ...subscribers.map((s) => s.id)];

    for (const m of magazines) {
      const countForMag = Math.max(1, Math.floor(allSubscriberIds.length * SUBSCRIBER_RATE));
      const chosen = faker.helpers.shuffle(allSubscriberIds).slice(0, countForMag);

      for (const subId of chosen) {
        const picked = pickWeighted(SUB_STATUS_DIST).status;
        const now = new Date();

        let startAt: Date;
        let endAt: Date;

        if (picked === 'ACTIVE') {
          startAt = faker.date.recent({ days: 20 });
          endAt = faker.date.soon({ days: 40 });
        } else if (picked === 'EXPIRED') {
          endAt = faker.date.recent({ days: 60 });
          startAt = faker.date.past({ years: 1, refDate: endAt });
        } else {
          // CANCELED
          startAt = faker.date.past({ years: 1 });
          endAt = faker.date.soon({ days: 30 });
        }

        subs.push({
          id: faker.string.uuid(),
          userId: subId,
          magazineId: m.id,
          startAt,
          endAt,
          status: picked,
          createdAt: now,
        });
      }
    }
    for (const part of chunk(subs, 1000)) {
      await tx.subscription.createMany({ data: part });
    }

    const comments: CommentRow[] = [];
    const publishedArticles = articles.filter((a) => a.status === 'PUBLISHED');

    for (const a of publishedArticles) {
      const count = faker.number.int({ min: COMMENTS_MIN, max: COMMENTS_MAX });
      for (let c = 0; c < count; c++) {
        const commenter = faker.helpers.arrayElement(allSubscriberIds);
        comments.push({
          id: faker.string.uuid(),
          articleId: a.id,
          userId: commenter,
          body: faker.lorem.paragraphs({ min: 1, max: 2 }),
          createdAt: faker.date.between({ from: a.publishedAt ?? a.createdAt, to: new Date() }),
        });
      }
    }
    for (const part of chunk(comments, 1000)) {
      await tx.comment.createMany({ data: part });
    }

    await tx.magazine.upsert({
      where: { id: 'seed-mag-1' },
      update: {},
      create: {
        id: 'seed-mag-1',
        title: 'Tech Weekly',
        description: 'Latest in software & AI',
        coverUrl: 'https://picsum.photos/seed/tech-weekly/800/500',
        publisherId: knownPublisherId,
      },
    });
  });

  const [u, m, a, s, c] = await Promise.all([
    prisma.user.count(),
    prisma.magazine.count(),
    prisma.article.count(),
    prisma.subscription.count(),
    prisma.comment.count(),
  ]);

  console.log('✅ Seed done.');
  console.table({ users: u, magazines: m, articles: a, subscriptions: s, comments: c });
  console.log('🔐 Admin      : admin@example.com / Admin@123');
  console.log('🧑‍💼 Publisher : publisher@example.com / Publisher@123');
  console.log('👤 Subscriber : subscriber@example.com / Subscriber@123');

  console.timeEnd('seed:all');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
