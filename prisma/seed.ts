import { PrismaClient, SeasonStatus, StageType, StageStatus, EpisodeStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const season = await prisma.season.upsert({
    where: { slug: 'season-1' },
    update: {
      title: 'BETALENT Season 1',
      description: 'The first season of BETALENT originals',
      status: SeasonStatus.UPCOMING,
      startAt: new Date('2026-05-01'),
      endAt: null,
    },
    create: {
      slug: 'season-1',
      title: 'BETALENT Season 1',
      description: 'The first season of BETALENT originals',
      status: SeasonStatus.UPCOMING,
      startAt: new Date('2026-05-01'),
    },
  });

  await prisma.stage.upsert({
    where: {
      seasonId_slug: {
        seasonId: season.id,
        slug: 'auditions',
      },
    },
    update: {
      title: 'Auditions',
      description: 'Open auditions for Season 1',
      orderIndex: 1,
      stageType: StageType.AUDITION,
      status: StageStatus.UPCOMING,
    },
    create: {
      seasonId: season.id,
      slug: 'auditions',
      title: 'Auditions',
      description: 'Open auditions for Season 1',
      orderIndex: 1,
      stageType: StageType.AUDITION,
      status: StageStatus.UPCOMING,
    },
  });

  await prisma.stage.upsert({
    where: {
      seasonId_slug: {
        seasonId: season.id,
        slug: 'callbacks',
      },
    },
    update: {
      title: 'Callbacks',
      description: 'Callback round',
      orderIndex: 2,
      stageType: StageType.CALLBACK,
      status: StageStatus.DRAFT,
    },
    create: {
      seasonId: season.id,
      slug: 'callbacks',
      title: 'Callbacks',
      description: 'Callback round',
      orderIndex: 2,
      stageType: StageType.CALLBACK,
      status: StageStatus.DRAFT,
    },
  });

  await prisma.stage.upsert({
    where: {
      seasonId_slug: {
        seasonId: season.id,
        slug: 'semifinals',
      },
    },
    update: {
      title: 'Semifinals',
      description: 'Semifinal performances',
      orderIndex: 3,
      stageType: StageType.SEMIFINAL,
      status: StageStatus.DRAFT,
    },
    create: {
      seasonId: season.id,
      slug: 'semifinals',
      title: 'Semifinals',
      description: 'Semifinal performances',
      orderIndex: 3,
      stageType: StageType.SEMIFINAL,
      status: StageStatus.DRAFT,
    },
  });

  await prisma.episode.upsert({
    where: {
      seasonId_slug: {
        seasonId: season.id,
        slug: 'audition-episode-1',
      },
    },
    update: {
      title: 'Audition Episode 1',
      description: 'First audition episode',
      orderIndex: 1,
      status: EpisodeStatus.DRAFT,
      premiereAt: new Date('2026-05-15'),
    },
    create: {
      seasonId: season.id,
      slug: 'audition-episode-1',
      title: 'Audition Episode 1',
      description: 'First audition episode',
      orderIndex: 1,
      status: EpisodeStatus.DRAFT,
      premiereAt: new Date('2026-05-15'),
    },
  });

  await prisma.episode.upsert({
    where: {
      seasonId_slug: {
        seasonId: season.id,
        slug: 'audition-episode-2',
      },
    },
    update: {
      title: 'Audition Episode 2',
      description: 'Second audition episode',
      orderIndex: 2,
      status: EpisodeStatus.DRAFT,
      premiereAt: new Date('2026-05-22'),
    },
    create: {
      seasonId: season.id,
      slug: 'audition-episode-2',
      title: 'Audition Episode 2',
      description: 'Second audition episode',
      orderIndex: 2,
      status: EpisodeStatus.DRAFT,
      premiereAt: new Date('2026-05-22'),
    },
  });

  await prisma.episode.upsert({
    where: {
      seasonId_slug: {
        seasonId: season.id,
        slug: 'callback-episode-1',
      },
    },
    update: {
      title: 'Callback Episode 1',
      description: 'First callback episode',
      orderIndex: 3,
      status: EpisodeStatus.DRAFT,
      premiereAt: new Date('2026-06-01'),
    },
    create: {
      seasonId: season.id,
      slug: 'callback-episode-1',
      title: 'Callback Episode 1',
      description: 'First callback episode',
      orderIndex: 3,
      status: EpisodeStatus.DRAFT,
      premiereAt: new Date('2026-06-01'),
    },
  });

  console.log('Seed data ensured successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
