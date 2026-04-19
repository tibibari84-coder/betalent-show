import { StageStatus, type Stage } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

function inWindow(now: Date, start: Date | null, end: Date | null): boolean {
  const startOk = !start || start.getTime() <= now.getTime();
  const endOk = !end || now.getTime() <= end.getTime();
  return startOk && endOk;
}

export async function getCurrentStage(
  seasonId: string,
  now: Date = new Date(),
): Promise<Stage | null> {
  const stages = await prisma.stage.findMany({
    where: { seasonId },
    orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
  });

  if (stages.length === 0) {
    return null;
  }

  const activeStatuses: StageStatus[] = [
    StageStatus.OPEN,
    StageStatus.JUDGING,
    StageStatus.VOTING,
    StageStatus.RESULTS,
  ];
  const byStatus = stages.find((stage) => activeStatuses.includes(stage.status));
  if (byStatus) {
    return byStatus;
  }

  const byTime =
    stages.find((stage) => inWindow(now, stage.submissionsOpenAt, stage.submissionsCloseAt)) ||
    stages.find((stage) => inWindow(now, stage.judgingOpenAt, stage.judgingCloseAt)) ||
    stages.find((stage) => inWindow(now, stage.votingOpenAt, stage.votingCloseAt));

  if (byTime) {
    return byTime;
  }

  return stages.find((stage) => stage.status === StageStatus.UPCOMING) ?? null;
}
