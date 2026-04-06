import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find active plan
    const plan = await prisma.clientPlan.findFirst({
      where: { userId: user.userId, status: "active" },
      include: {
        days: {
          include: {
            workout: {
              select: { id: true, title: true, videoUrl: true, description: true, slug: true },
            },
            meals: {
              include: {
                recipe: {
                  select: {
                    id: true, title: true, slug: true, imageUrl: true,
                    calories: true, protein: true, carbs: true, fat: true, servings: true,
                  },
                },
              },
              orderBy: [{ mealType: "asc" }, { sortOrder: "asc" }],
            },
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ plan: null });
    }

    // Calculate current week and day
    const now = new Date();
    const startDate = new Date(plan.startDate);
    const diffMs = now.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffDays / 7) + 1;

    // Day of week: 1=Mon, 7=Sun
    const jsDay = now.getDay(); // 0=Sun, 1=Mon...6=Sat
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;

    // Total weeks from plan days
    const maxWeek = plan.days.reduce((max, d) => Math.max(max, d.weekNumber), 1);

    // Find today's plan day
    const todayPlanDay = plan.days.find(
      (d) => d.weekNumber === weekNumber && d.dayOfWeek === dayOfWeek
    );

    // Get today's date at midnight UTC
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // Get today's progress
    const todayProgress = await prisma.dailyProgress.findFirst({
      where: {
        userId: user.userId,
        clientPlanId: plan.id,
        date: { gte: todayStart, lt: todayEnd },
      },
    });

    // Get this week's progress (Mon-Sun)
    const mondayOffset = dayOfWeek - 1;
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - mondayOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekProgress = await prisma.dailyProgress.findMany({
      where: {
        userId: user.userId,
        clientPlanId: plan.id,
        date: { gte: weekStart, lt: weekEnd },
      },
      orderBy: { date: "asc" },
    });

    // Parse mealPlan JSON if it exists
    let mealPlan = null;
    if (todayPlanDay?.mealPlan) {
      try {
        mealPlan = typeof todayPlanDay.mealPlan === "string"
          ? JSON.parse(todayPlanDay.mealPlan)
          : todayPlanDay.mealPlan;
      } catch {
        mealPlan = todayPlanDay.mealPlan;
      }
    }

    return NextResponse.json({
      plan: {
        id: plan.id,
        name: plan.name,
        type: plan.type,
        startDate: plan.startDate,
        weekNumber,
        dayOfWeek,
        totalWeeks: maxWeek,
      },
      today: {
        workout: todayPlanDay?.workout || null,
        mealPlan,
        meals: (todayPlanDay?.meals || []).map((m) => ({
          id: m.id,
          mealType: m.mealType,
          servings: m.servings,
          sortOrder: m.sortOrder,
          recipe: m.recipe,
        })),
        calorieTarget: todayPlanDay?.calorieTarget || null,
        proteinTarget: todayPlanDay?.proteinTarget || null,
        carbsTarget: todayPlanDay?.carbsTarget || null,
        fatTarget: todayPlanDay?.fatTarget || null,
        notes: todayPlanDay?.notes || null,
        workoutNotes: todayPlanDay?.workoutNotes || null,
      },
      todayProgress: todayProgress
        ? {
            workoutCompleted: todayProgress.workoutCompleted,
            mealsCompleted: todayProgress.mealsCompleted,
          }
        : { workoutCompleted: false, mealsCompleted: false },
      weekProgress: weekProgress.map((p) => ({
        date: p.date,
        workoutCompleted: p.workoutCompleted,
        mealsCompleted: p.mealsCompleted,
      })),
    });
  } catch (error) {
    console.error("Plan GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
