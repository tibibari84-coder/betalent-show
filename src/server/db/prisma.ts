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
 * `"contestant" in client` is not reliable across Prisma versions; verify the delegate.
 * Stale singletons after `prisma generate` can leave `prisma.contestant` undefined in dev.
 */
function hasContestantDelegate(client: unknown): boolean {
  const delegate = (client as { contestant?: { findUnique?: unknown } })
    .contestant;
  return typeof delegate?.findUnique === "function";
}

const PRISTINE_CLIENT_REMEDY =
  "Run `npx prisma generate` from the project root, then restart `npm run dev`.";

function resolvePrisma(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (cached && hasContestantDelegate(cached)) {
    return cached;
  }

  if (cached) {
    void cached.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined;
  }

  const client = createPrismaClient();
  if (!hasContestantDelegate(client)) {
    void client.$disconnect().catch(() => undefined);
    throw new Error(
      `Prisma Client is missing the Contestant model (out of date). ${PRISTINE_CLIENT_REMEDY}`,
    );
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = resolvePrisma();
