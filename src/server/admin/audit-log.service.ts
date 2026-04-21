"use server";

import { Prisma } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

export type AuditDetails = Record<string, unknown> | null | undefined;

function toAuditDetails(details: AuditDetails): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (details == null) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(details)) as Prisma.InputJsonValue;
}

export async function writeAuditLog(input: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details?: AuditDetails;
}) {
  return prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      details: toAuditDetails(input.details),
    },
  });
}

export async function listRecentAuditLogs(limit = 12) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          username: true,
        },
      },
    },
  });
}
