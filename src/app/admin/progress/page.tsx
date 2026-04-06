export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import ProgressOverviewClient from "./ProgressOverviewClient";

export default async function AdminProgressPage() {
  // Get all users with role=USER
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      activePlanId: true,
      currentWeightKg: true,
    },
    orderBy: { firstName: "asc" },
  });

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Calculate week boundaries (Mon-Sun)
  const dayOfWeek = now.getDay();
  const diffToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - diffToMon);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const results = await Promise.all(
    users.map(
      async (u: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        activePlanId: number | null;
        currentWeightKg: number | null;
      }) => {
        // Active plan
        let activePlanName: string | null = null;
        let planStatus = "none";
        let adherencePercent = 0;

        if (u.activePlanId) {
          const plan = await prisma.clientPlan.findUnique({
            where: { id: u.activePlanId },
            select: {
              id: true,
              name: true,
              status: true,
              days: { select: { dayOfWeek: true } },
            },
          });
          if (plan) {
            activePlanName = plan.name;
            planStatus = plan.status;
            const totalDaysThisWeek = Math.min(
              (plan.days as { dayOfWeek: number }[]).length || 7,
              7
            );
            const completedDays = await prisma.dailyProgress.count({
              where: {
                userId: u.id,
                clientPlanId: plan.id,
                date: { gte: weekStart, lt: weekEnd },
                OR: [{ workoutCompleted: true }, { breakfastCompleted: true }, { lunchCompleted: true }, { snackCompleted: true }, { dinnerCompleted: true }],
              },
            });
            adherencePercent =
              totalDaysThisWeek > 0
                ? Math.round((completedDays / totalDaysThisWeek) * 100)
                : 0;
          }
        }

        // Weight change
        const recentWeights = await prisma.weightLog.findMany({
          where: { userId: u.id, loggedDate: { gte: sevenDaysAgo } },
          orderBy: { loggedDate: "asc" },
          select: { weightKg: true },
        });
        let weightChange: number | null = null;
        if (recentWeights.length >= 2) {
          const first = recentWeights[0] as { weightKg: number };
          const last = recentWeights[recentWeights.length - 1] as { weightKg: number };
          weightChange = parseFloat((last.weightKg - first.weightKg).toFixed(1));
        }

        // Last activity
        const lastMeal = await prisma.mealLog.findFirst({
          where: { userId: u.id },
          orderBy: { loggedDate: "desc" },
          select: { loggedDate: true },
        });
        const lastWeight = await prisma.weightLog.findFirst({
          where: { userId: u.id },
          orderBy: { loggedDate: "desc" },
          select: { loggedDate: true },
        });

        let lastActivity: Date | null = null;
        if (lastMeal && lastWeight) {
          const mealDate = lastMeal.loggedDate as Date;
          const weightDate = lastWeight.loggedDate as Date;
          lastActivity = mealDate > weightDate ? mealDate : weightDate;
        } else if (lastMeal) {
          lastActivity = lastMeal.loggedDate as Date;
        } else if (lastWeight) {
          lastActivity = lastWeight.loggedDate as Date;
        }

        const hoursSinceLastActivity = lastActivity
          ? Math.round(
              (now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60)
            )
          : null;

        return {
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          activePlanName,
          planStatus,
          adherencePercent,
          weightChange,
          lastActivity: lastActivity ? (lastActivity as Date).toISOString() : null,
          hoursSinceLastActivity,
        };
      }
    )
  );

  return <ProgressOverviewClient clients={results} />;
}
