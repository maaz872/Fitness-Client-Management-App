import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notifyAdmin } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { workoutCompleted, breakfastCompleted, lunchCompleted, snackCompleted, dinnerCompleted } = body;

    // Find active plan
    const plan = await prisma.clientPlan.findFirst({
      where: { userId: user.userId, status: "active" },
    });

    if (!plan) {
      return NextResponse.json({ error: "No active plan" }, { status: 404 });
    }

    // Today's date at midnight
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Build upsert data — only include fields that were sent
    const updateData: Record<string, boolean> = {};
    if (workoutCompleted !== undefined) updateData.workoutCompleted = workoutCompleted;
    if (breakfastCompleted !== undefined) updateData.breakfastCompleted = breakfastCompleted;
    if (lunchCompleted !== undefined) updateData.lunchCompleted = lunchCompleted;
    if (snackCompleted !== undefined) updateData.snackCompleted = snackCompleted;
    if (dinnerCompleted !== undefined) updateData.dinnerCompleted = dinnerCompleted;

    const progress = await prisma.dailyProgress.upsert({
      where: {
        userId_clientPlanId_date: {
          userId: user.userId,
          clientPlanId: plan.id,
          date: todayStart,
        },
      },
      update: updateData,
      create: {
        userId: user.userId,
        clientPlanId: plan.id,
        date: todayStart,
        workoutCompleted: workoutCompleted || false,
        breakfastCompleted: breakfastCompleted || false,
        lunchCompleted: lunchCompleted || false,
        snackCompleted: snackCompleted || false,
        dinnerCompleted: dinnerCompleted || false,
      },
    });

    // Send admin notifications
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { firstName: true },
    });
    const firstName = userData?.firstName || "A client";

    const allMealsDone = progress.breakfastCompleted && progress.lunchCompleted && progress.snackCompleted && progress.dinnerCompleted;

    if (progress.workoutCompleted && allMealsDone) {
      await notifyAdmin(
        "Full Adherence",
        `${firstName} crushed it today -- 100% adherence!`,
        "admin_alert",
        `/admin/users/${user.userId}`
      );
    } else if (workoutCompleted) {
      await notifyAdmin(
        "Workout Completed",
        `${firstName} completed today's workout`,
        "admin_alert",
        `/admin/users/${user.userId}`
      );
    }

    return NextResponse.json({
      workoutCompleted: progress.workoutCompleted,
      breakfastCompleted: progress.breakfastCompleted,
      lunchCompleted: progress.lunchCompleted,
      snackCompleted: progress.snackCompleted,
      dinnerCompleted: progress.dinnerCompleted,
    });
  } catch (error) {
    console.error("Progress POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
