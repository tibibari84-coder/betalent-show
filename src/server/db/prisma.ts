import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });
}

/**
 * Verify delegates exist. Stale singletons after `prisma generate` can leave
 * new models undefined on the cached client in dev.
 */
function hasExpectedDelegates(client: unknown): boolean {
  const c = client as Record<string, { findUnique?: unknown } | undefined>;
  return (
    typeof c.contestant?.findUnique === "function" &&
    typeof c.stageResult?.findUnique === "function"
  );
}

const PRISTINE_CLIENT_REMEDY =
  "Run `npx prisma generate` from the project root, then restart `npm run dev`.";

function resolvePrisma(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (cached && hasExpectedDelegates(cached)) {
    return cached;
  }

  if (cached) {
    void cached.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined;
  }

  const client = createPrismaClient();
  if (!hasExpectedDelegates(client)) {
    void client.$disconnect().catch(() => undefined);
    throw new Error(
      `Prisma Client is out of date (missing expected models). ${PRISTINE_CLIENT_REMEDY}`,
    );
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = resolvePrisma();
