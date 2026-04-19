import type { EditorialPageScope } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

type DefaultSlotDef = {
  slotKey: string;
  title: string;
  description: string | null;
  pageScope: EditorialPageScope;
};

const DEFAULT_SLOTS: DefaultSlotDef[] = [
  {
    slotKey: "HOME_HERO",
    title: "Home hero",
    description: "Primary curated message on the member home surface.",
    pageScope: "HOME",
  },
  {
    slotKey: "HOME_SPOTLIGHT",
    title: "Home spotlight",
    description: "Secondary spotlight on the member home surface.",
    pageScope: "HOME",
  },
  {
    slotKey: "SHOW_HERO",
    title: "Show hero",
    description: "Hero emphasis on the Show surface.",
    pageScope: "SHOW",
  },
  {
    slotKey: "SHOW_SPOTLIGHT",
    title: "Show spotlight",
    description: "Spotlight band on the Show surface.",
    pageScope: "SHOW",
  },
  {
    slotKey: "RESULTS_HERO",
    title: "Results hero",
    description: "Hero framing above official results content.",
    pageScope: "RESULTS",
  },
  {
    slotKey: "RESULTS_SPOTLIGHT",
    title: "Results spotlight",
    description: "Secondary framing on Results.",
    pageScope: "RESULTS",
  },
];

/** Idempotent seed for manual editorial control — does not change existing slots. */
export async function ensureDefaultEditorialSlots(): Promise<number> {
  let created = 0;
  for (const def of DEFAULT_SLOTS) {
    const existing = await prisma.editorialSlot.findUnique({
      where: { slotKey: def.slotKey },
    });
    if (existing) continue;
    await prisma.editorialSlot.create({
      data: {
        slotKey: def.slotKey,
        title: def.title,
        description: def.description,
        pageScope: def.pageScope,
        status: "ACTIVE",
      },
    });
    created += 1;
  }
  return created;
}

export async function getEditorialSlotByKey(slotKey: string) {
  return prisma.editorialSlot.findUnique({
    where: { slotKey },
  });
}

export async function listActiveSlotsForScope(pageScope: EditorialPageScope) {
  return prisma.editorialSlot.findMany({
    where: { pageScope, status: "ACTIVE" },
    orderBy: { slotKey: "asc" },
  });
}
