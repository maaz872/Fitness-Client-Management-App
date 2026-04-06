import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const templateId = parseInt(id);

    const days = await prisma.planTemplateDay.findMany({
      where: { templateId },
      include: {
        workout: { select: { id: true, title: true, slug: true } },
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
      orderBy: [{ weekNumber: "asc" }, { dayOfWeek: "asc" }],
    });

    return NextResponse.json(days);
  } catch (error) {
    console.error("Get template days error:", error);
    return NextResponse.json(
      { error: "Failed to fetch template days" },
      { status: 500 }
    );
  }
}

interface MealInput {
  mealType: string;
  recipeId: number;
  servings?: number;
  sortOrder?: number;
}

interface DayInput {
  dayOfWeek: number;
  weekNumber: number;
  workoutId?: number | null;
  workoutNotes?: string | null;
  mealPlan?: string | null;
  calorieTarget?: number | null;
  proteinTarget?: number | null;
  carbsTarget?: number | null;
  fatTarget?: number | null;
  notes?: string | null;
  meals?: MealInput[];
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const templateId = parseInt(id);
    const body = await request.json();
    const { days } = body as { days: DayInput[] };

    if (!days || !Array.isArray(days)) {
      return NextResponse.json(
        { error: "days array is required" },
        { status: 400 }
      );
    }

    // Verify template exists
    const template = await prisma.planTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Bulk replace in a transaction (needed for nested meal creates)
    await prisma.$transaction(async (tx) => {
      // Cascade delete handles PlanDayMeal cleanup
      await tx.planTemplateDay.deleteMany({ where: { templateId } });

      for (const d of days) {
        await tx.planTemplateDay.create({
          data: {
            templateId,
            dayOfWeek: d.dayOfWeek,
            weekNumber: d.weekNumber || 1,
            workoutId: d.workoutId || null,
            workoutNotes: d.workoutNotes || null,
            mealPlan: d.mealPlan || null,
            calorieTarget: d.calorieTarget || null,
            proteinTarget: d.proteinTarget || null,
            carbsTarget: d.carbsTarget || null,
            fatTarget: d.fatTarget || null,
            notes: d.notes || null,
            meals: {
              create: (d.meals || []).map((m, idx) => ({
                mealType: m.mealType,
                recipeId: m.recipeId,
                servings: m.servings || 1,
                sortOrder: m.sortOrder ?? idx,
              })),
            },
          },
        });
      }
    });

    return NextResponse.json({ success: true, count: days.length });
  } catch (error) {
    console.error("Set template days error:", error);
    return NextResponse.json(
      { error: "Failed to set template days" },
      { status: 500 }
    );
  }
}
