"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface FoodItem {
  id: number;
  name: string;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  servingSize: number | null;
  servingUnit: string | null;
}

interface Ingredient {
  foodItemId: number;
  name: string;
  weightGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealLog {
  id: number;
  description: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageData: string | null;
  ingredients: string | null;
  loggedDate: string;
  loggedTime: string;
}

interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

type Tab = "log" | "meals";
type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function nowTimeStr() {
  return new Date().toTimeString().slice(0, 5);
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function SnapMyMacrosPage() {
  const [tab, setTab] = useState<Tab>("log");

  /* ── Log a Meal state ──────────────────────────────────── */
  const [mealType, setMealType] = useState<MealType>("Breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [description, setDescription] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ── Meal Log state ────────────────────────────────────── */
  const [logDate, setLogDate] = useState(todayStr());
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [targets, setTargets] = useState<MacroTargets>({ calories: 2200, protein: 165, carbs: 220, fat: 60 });
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);

  /* ── Effects ───────────────────────────────────────────── */

  // Fetch macro targets on mount
  useEffect(() => {
    fetch("/api/user/macro-targets")
      .then((r) => r.json())
      .then((d) => {
        if (d.targets) setTargets(d.targets);
      })
      .catch(() => {});
  }, []);

  // Fetch meals when tab switches or date changes
  const fetchMeals = useCallback(async () => {
    setLoadingMeals(true);
    try {
      const res = await fetch(`/api/meals?date=${logDate}`);
      const data = await res.json();
      setMeals(data.meals || []);
    } catch {
      console.error("Failed to fetch meals");
    }
    setLoadingMeals(false);
  }, [logDate]);

  useEffect(() => {
    if (tab === "meals") fetchMeals();
  }, [tab, logDate, fetchMeals]);

  // Debounced food search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/food-items?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.items || []);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      }
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ── Helpers ───────────────────────────────────────────── */

  function calcMacro(food: FoodItem, grams: number) {
    return {
      calories: Math.round((food.caloriesPer100g * grams) / 100),
      protein: Math.round(((food.proteinPer100g * grams) / 100) * 10) / 10,
      carbs: Math.round(((food.carbsPer100g * grams) / 100) * 10) / 10,
      fat: Math.round(((food.fatPer100g * grams) / 100) * 10) / 10,
    };
  }

  function addIngredient(food: FoodItem) {
    const weight = food.servingSize || 100;
    const macros = calcMacro(food, weight);
    setIngredients((prev) => [
      ...prev,
      {
        foodItemId: food.id,
        name: food.name,
        weightGrams: weight,
        ...macros,
      },
    ]);
    setSearchQuery("");
    setShowDropdown(false);
    // Auto-gen description
    const names = [...ingredients.map((i) => i.name), food.name];
    setDescription(names.join(", "));
  }

  function updateIngredientWeight(idx: number, grams: number) {
    setIngredients((prev) =>
      prev.map((ing, i) => {
        if (i !== idx) return ing;
        const food = searchResults.find((f) => f.id === ing.foodItemId);
        // Recalc from per-100g stored in ingredient (reverse calc)
        const origPer100Cal = Math.round((ing.calories * 100) / ing.weightGrams);
        const origPer100P = Math.round(((ing.protein * 100) / ing.weightGrams) * 10) / 10;
        const origPer100C = Math.round(((ing.carbs * 100) / ing.weightGrams) * 10) / 10;
        const origPer100F = Math.round(((ing.fat * 100) / ing.weightGrams) * 10) / 10;
        if (food) {
          const macros = calcMacro(food, grams);
          return { ...ing, weightGrams: grams, ...macros };
        }
        return {
          ...ing,
          weightGrams: grams,
          calories: Math.round((origPer100Cal * grams) / 100),
          protein: Math.round((origPer100P * grams) / 100 * 10) / 10,
          carbs: Math.round((origPer100C * grams) / 100 * 10) / 10,
          fat: Math.round((origPer100F * grams) / 100 * 10) / 10,
        };
      })
    );
  }

  function removeIngredient(idx: number) {
    setIngredients((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      setDescription(next.map((i) => i.name).join(", "));
      return next;
    });
  }

  const totals = ingredients.reduce(
    (acc, ing) => ({
      calories: acc.calories + ing.calories,
      protein: acc.protein + ing.protein,
      carbs: acc.carbs + ing.carbs,
      fat: acc.fat + ing.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  async function handleLogMeal() {
    if (ingredients.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType,
          description: description || ingredients.map((i) => i.name).join(", "),
          calories: totals.calories,
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat,
          ingredients: JSON.stringify(ingredients),
          imageData,
          loggedDate: todayStr(),
          loggedTime: nowTimeStr(),
        }),
      });
      if (res.ok) {
        setIngredients([]);
        setDescription("");
        setImageData(null);
        setSearchQuery("");
        setTab("meals");
        setLogDate(todayStr());
      }
    } catch {
      alert("Failed to log meal");
    }
    setSaving(false);
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageData(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function deleteMeal(id: number) {
    if (!confirm("Delete this meal?")) return;
    try {
      await fetch(`/api/meals/${id}`, { method: "DELETE" });
      fetchMeals();
    } catch {
      alert("Failed to delete");
    }
  }

  /* ── Daily totals for Meal Log tab ─────────────────────── */

  const dayTotals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  /* ─── Render ─────────────────────────────────────────────── */

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Snap My Macros</h1>
        <p className="text-sm text-white/50 mt-1">
          Log meals with ingredient-based calorie tracking
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("log")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
            tab === "log"
              ? "bg-[#E51A1A] text-white"
              : "bg-[#1E1E1E] text-white/60 border border-[#2A2A2A]"
          }`}
        >
          Log a Meal
        </button>
        <button
          onClick={() => setTab("meals")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
            tab === "meals"
              ? "bg-[#E51A1A] text-white"
              : "bg-[#1E1E1E] text-white/60 border border-[#2A2A2A]"
          }`}
        >
          Meal Log
        </button>
      </div>

      {/* ── LOG A MEAL TAB ────────────────────────────────── */}
      {tab === "log" && (
        <div className="space-y-4">
          {/* Meal Type Selector */}
          <div className="flex gap-2">
            {MEAL_TYPES.map((mt) => (
              <button
                key={mt}
                onClick={() => setMealType(mt)}
                className={`flex-1 py-2 rounded-full text-xs font-semibold transition ${
                  mealType === mt
                    ? "bg-[#E51A1A] text-white"
                    : "bg-[#1E1E1E] text-white/50 border border-[#2A2A2A]"
                }`}
              >
                {mt}
              </button>
            ))}
          </div>

          {/* Running Totals */}
          {ingredients.length > 0 && (
            <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4">
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">
                Meal Totals
              </p>
              <div className="grid grid-cols-4 gap-3">
                <MacroStat label="Calories" value={totals.calories} unit="kcal" color="#E51A1A" />
                <MacroStat label="Protein" value={totals.protein} unit="g" color="#E51A1A" />
                <MacroStat label="Carbs" value={totals.carbs} unit="g" color="#FF6B00" />
                <MacroStat label="Fat" value={totals.fat} unit="g" color="#FFB800" />
              </div>
            </div>
          )}

          {/* Ingredient Search */}
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              placeholder="Search food to add (e.g. chicken breast, rice)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E51A1A] text-sm"
            />
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl max-h-60 overflow-y-auto z-20 shadow-xl">
                {searchResults.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => addIngredient(food)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#2A2A2A] transition text-left border-b border-[#2A2A2A]/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-white font-medium">{food.name}</p>
                      <p className="text-[10px] text-white/40">
                        {food.category}
                        {food.servingSize ? ` | 1 ${food.servingUnit || "serving"} = ${food.servingSize}g` : ""}
                      </p>
                    </div>
                    <span className="text-xs text-[#E51A1A] font-semibold shrink-0 ml-2">
                      {food.caloriesPer100g} kcal/100g
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Added Ingredients */}
          {ingredients.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-white/40 uppercase tracking-wider">
                Ingredients
              </p>
              {ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {ing.name}
                    </p>
                    <p className="text-[10px] text-white/40">
                      {ing.calories} kcal | P: {ing.protein}g | C: {ing.carbs}g | F: {ing.fat}g
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      value={ing.weightGrams}
                      onChange={(e) =>
                        updateIngredientWeight(idx, parseInt(e.target.value) || 0)
                      }
                      className="w-16 px-2 py-1 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white text-xs text-center focus:outline-none focus:border-[#E51A1A]"
                    />
                    <span className="text-[10px] text-white/40">g</span>
                  </div>
                  <button
                    onClick={() => removeIngredient(idx)}
                    className="text-white/30 hover:text-red-400 transition text-lg leading-none"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-xs text-white/40 mb-1 block">
              Meal Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Grilled Chicken Salad"
              className="w-full px-4 py-2.5 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E51A1A]"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="text-xs text-white/40 mb-1 block">
              Meal Photo (optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="px-4 py-2 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white/60 text-sm cursor-pointer hover:border-[#E51A1A] transition">
                {imageData ? "Change Photo" : "Add Photo"}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhoto}
                  className="hidden"
                />
              </label>
              {imageData && (
                <div className="relative">
                  <img
                    src={imageData}
                    alt="Meal preview"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <button
                    onClick={() => setImageData(null)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center"
                  >
                    x
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Log Button */}
          <button
            onClick={handleLogMeal}
            disabled={saving || ingredients.length === 0}
            className="w-full py-3 bg-[#E51A1A] text-white rounded-xl font-semibold text-sm hover:bg-[#E51A1A]/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Logging..." : "Log Meal"}
          </button>
        </div>
      )}

      {/* ── MEAL LOG TAB ──────────────────────────────────── */}
      {tab === "meals" && (
        <div className="space-y-4">
          {/* Date Picker */}
          <input
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            className="w-full max-w-full box-border px-3 py-2.5 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white text-sm focus:outline-none focus:border-[#E51A1A] [color-scheme:dark] appearance-none min-h-[44px]"
          />

          {/* Daily Totals */}
          {meals.length > 0 && (
            <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4">
              <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">
                Daily Progress
              </p>
              <div className="space-y-3">
                <ProgressBar
                  label="Calories"
                  current={dayTotals.calories}
                  target={targets.calories}
                  unit="kcal"
                  color="#E51A1A"
                />
                <ProgressBar
                  label="Protein"
                  current={Math.round(dayTotals.protein)}
                  target={targets.protein}
                  unit="g"
                  color="#E51A1A"
                />
                <ProgressBar
                  label="Carbs"
                  current={Math.round(dayTotals.carbs)}
                  target={targets.carbs}
                  unit="g"
                  color="#FF6B00"
                />
                <ProgressBar
                  label="Fat"
                  current={Math.round(dayTotals.fat)}
                  target={targets.fat}
                  unit="g"
                  color="#FFB800"
                />
              </div>
            </div>
          )}

          {loadingMeals ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#E51A1A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : meals.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <p className="text-lg mb-1">No meals logged for this date.</p>
              <p className="text-sm">Start by logging your breakfast.</p>
            </div>
          ) : (
            /* Meals grouped by type */
            MEAL_TYPES.map((mt) => {
              const mtMeals = meals.filter((m) => m.mealType === mt);
              if (mtMeals.length === 0) return null;
              return (
                <div key={mt}>
                  <h3 className="text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">
                    {mt}
                  </h3>
                  <div className="space-y-2">
                    {mtMeals.map((meal) => {
                      const isExpanded = expandedMeal === meal.id;
                      let parsedIngredients: Ingredient[] = [];
                      try {
                        if (meal.ingredients)
                          parsedIngredients = JSON.parse(meal.ingredients);
                      } catch {}
                      return (
                        <div
                          key={meal.id}
                          className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl overflow-hidden"
                        >
                          <button
                            onClick={() =>
                              setExpandedMeal(isExpanded ? null : meal.id)
                            }
                            className="w-full p-3 flex items-center gap-3 text-left"
                          >
                            {meal.imageData && (
                              <img
                                src={meal.imageData}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white font-medium truncate">
                                {meal.description}
                              </p>
                              <p className="text-[10px] text-white/40">
                                {meal.loggedTime} |{" "}
                                {meal.calories} kcal | P:{" "}
                                {Math.round(meal.protein)}g | C:{" "}
                                {Math.round(meal.carbs)}g | F:{" "}
                                {Math.round(meal.fat)}g
                              </p>
                            </div>
                            <span className="text-white/20 text-xs shrink-0">
                              {isExpanded ? "^" : "v"}
                            </span>
                          </button>
                          {isExpanded && (
                            <div className="px-3 pb-3 border-t border-[#2A2A2A]">
                              {parsedIngredients.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {parsedIngredients.map((ing, i) => (
                                    <div
                                      key={i}
                                      className="flex justify-between text-[11px] text-white/50"
                                    >
                                      <span>
                                        {ing.name} ({ing.weightGrams}g)
                                      </span>
                                      <span>
                                        {ing.calories} kcal
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <button
                                onClick={() => deleteMeal(meal.id)}
                                className="mt-3 px-3 py-1.5 bg-red-900/30 text-red-400 text-xs rounded-lg hover:bg-red-900/50 transition"
                              >
                                Delete Meal
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────────── */

function MacroStat({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold" style={{ color }}>
        {Math.round(value)}
      </p>
      <p className="text-[10px] text-white/40">
        {unit} {label}
      </p>
    </div>
  );
}

function ProgressBar({
  label,
  current,
  target,
  unit,
  color,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/60">{label}</span>
        <span className="text-white/40">
          {current} / {target} {unit}
        </span>
      </div>
      <div className="h-2 bg-[#0A0A0A] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
