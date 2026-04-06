"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CategoryOption {
  id: number;
  name: string;
}

interface TagOption {
  id: number;
  name: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Options from API
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [allTags, setAllTags] = useState<TagOption[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(true);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<Set<number>>(new Set());
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [videoUrl, setVideoUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fat, setFat] = useState<number>(0);
  const [servings, setServings] = useState<number>(1);
  const [prepTimeMins, setPrepTimeMins] = useState<number>(0);
  const [cookTimeMins, setCookTimeMins] = useState<number>(0);
  const [isPublished, setIsPublished] = useState(false);

  // Fetch categories/tags and recipe data
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/recipes").then((r) => r.json()),
      fetch(`/api/admin/recipes/${id}`).then((r) => r.json()),
    ])
      .then(([listData, recipeData]) => {
        // Set categories and tags
        if (listData.categories) setCategories(listData.categories);
        if (listData.tags) setAllTags(listData.tags);

        // Populate form with recipe data
        const r = recipeData.recipe;
        if (!r) {
          setError("Recipe not found");
          return;
        }

        setTitle(r.title || "");
        setSlug(r.slug || "");
        setDescription(r.description || "");
        setCategoryId(r.categoryId || 0);
        setVideoUrl(r.videoUrl || "");
        setImagePreview(r.imageUrl || null);
        setCalories(r.calories || 0);
        setProtein(r.protein || 0);
        setCarbs(r.carbs || 0);
        setFat(r.fat || 0);
        setServings(r.servings || 1);
        setPrepTimeMins(r.prepTimeMins || 0);
        setCookTimeMins(r.cookTimeMins || 0);
        setIsPublished(r.isPublished || false);

        // Parse ingredients
        try {
          const parsedIngredients =
            typeof r.ingredients === "string"
              ? JSON.parse(r.ingredients)
              : r.ingredients;
          if (Array.isArray(parsedIngredients) && parsedIngredients.length > 0) {
            setIngredients(parsedIngredients);
          }
        } catch {
          /* keep default */
        }

        // Parse instructions
        try {
          const parsedInstructions =
            typeof r.instructions === "string"
              ? JSON.parse(r.instructions)
              : r.instructions;
          if (Array.isArray(parsedInstructions) && parsedInstructions.length > 0) {
            setInstructions(parsedInstructions);
          }
        } catch {
          /* keep default */
        }

        // Set tags
        if (r.dietaryTags && Array.isArray(r.dietaryTags)) {
          setSelectedTags(new Set(r.dietaryTags.map((dt: { tagId: number }) => dt.tagId)));
        }
      })
      .catch(() => setError("Failed to load recipe"))
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-slug from title
  useEffect(() => {
    if (!slugManual) {
      setSlug(slugify(title));
    }
  }, [title, slugManual]);

  function toggleTag(tagId: number) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  }

  // Ingredients helpers
  function addIngredient() {
    setIngredients((prev) => [...prev, ""]);
  }
  function removeIngredient(i: number) {
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateIngredient(i: number, val: string) {
    setIngredients((prev) => prev.map((v, idx) => (idx === i ? val : v)));
  }

  // Instructions helpers
  function addInstruction() {
    setInstructions((prev) => [...prev, ""]);
  }
  function removeInstruction(i: number) {
    setInstructions((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateInstruction(i: number, val: string) {
    setInstructions((prev) => prev.map((v, idx) => (idx === i ? val : v)));
  }
  function moveInstruction(from: number, to: number) {
    if (to < 0 || to >= instructions.length) return;
    setInstructions((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  // Image upload to base64
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!categoryId) {
      setError("Please select a category");
      return;
    }

    const cleanIngredients = ingredients.filter((s) => s.trim());
    const cleanInstructions = instructions.filter((s) => s.trim());

    if (cleanIngredients.length === 0) {
      setError("Add at least one ingredient");
      return;
    }
    if (cleanInstructions.length === 0) {
      setError("Add at least one instruction");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/recipes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug || slugify(title),
          description: description.trim(),
          categoryId,
          tagIds: Array.from(selectedTags),
          ingredients: cleanIngredients,
          instructions: cleanInstructions,
          videoUrl: videoUrl.trim() || null,
          imageUrl: imagePreview || null,
          calories,
          protein,
          carbs,
          fat,
          servings,
          prepTimeMins,
          cookTimeMins,
          isPublished,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update recipe");
        return;
      }

      router.push("/admin/recipes");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#E51A1A]";
  const labelClass = "block text-sm font-semibold text-white mb-1.5";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#E51A1A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/admin/recipes"
            className="text-sm text-white/60 hover:text-[#E51A1A] transition-colors mb-2 inline-block"
          >
            &larr; Back to Recipes
          </Link>
          <h1 className="text-2xl font-bold text-white">Edit Recipe</h1>
        </div>
        {slug && (
          <Link
            href={`/hub/recipes/${slug}`}
            target="_blank"
            className="text-xs px-4 py-2 bg-[#FF6B00]/10 text-[#FF6B00] rounded-lg font-semibold hover:bg-[#FF6B00]/20 transition-colors shrink-0"
          >
            Preview as User
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Card */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-white mb-2">Basic Info</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setSlugManual(false); }}
                placeholder="e.g. Chicken Tikka Bowl"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManual(true);
                }}
                placeholder="auto-generated-from-title"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of the recipe..."
              className={inputClass + " resize-y"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className={inputClass}
              >
                <option value={0} disabled>
                  Select category
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>YouTube Video URL</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste video URL (YouTube, Instagram, TikTok, Facebook)"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Dietary Tags */}
        {allTags.length > 0 && (
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Dietary Tags</h2>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    selectedTags.has(tag.id)
                      ? "bg-[#E51A1A] text-white"
                      : "bg-[#0A0A0A] text-white/60 border border-[#2A2A2A] hover:border-[#E51A1A]/30"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Ingredients *</h2>
            <button
              type="button"
              onClick={addIngredient}
              className="text-xs px-3 py-1.5 bg-[#E51A1A] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              + Add
            </button>
          </div>
          <div className="space-y-3">
            {ingredients.map((val, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={val}
                  onChange={(e) => updateIngredient(i, e.target.value)}
                  placeholder={`Ingredient ${i + 1}`}
                  className={inputClass}
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors text-sm"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Instructions *</h2>
            <button
              type="button"
              onClick={addInstruction}
              className="text-xs px-3 py-1.5 bg-[#E51A1A] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              + Add Step
            </button>
          </div>
          <div className="space-y-3">
            {instructions.map((val, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-sm font-bold text-white/40">
                  {i + 1}.
                </span>
                <textarea
                  value={val}
                  onChange={(e) => updateInstruction(i, e.target.value)}
                  placeholder={`Step ${i + 1}`}
                  rows={2}
                  className={inputClass + " resize-y"}
                />
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveInstruction(i, i - 1)}
                    disabled={i === 0}
                    className="text-white/30 hover:text-white disabled:opacity-20 text-xs"
                  >
                    &uarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => moveInstruction(i, i + 1)}
                    disabled={i === instructions.length - 1}
                    className="text-white/30 hover:text-white disabled:opacity-20 text-xs"
                  >
                    &darr;
                  </button>
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(i)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Recipe Image</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#E51A1A] file:text-white hover:file:opacity-90"
          />
          {imagePreview && (
            <div className="mt-4 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-xs rounded-xl border border-[#2A2A2A]"
              />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/80"
              >
                &times;
              </button>
            </div>
          )}
        </div>

        {/* Nutrition */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">
            Nutrition &amp; Timing
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Calories</label>
              <input
                type="number"
                min={0}
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <span className="text-[#E51A1A]">Protein</span> (g)
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <span className="text-[#FF6B00]">Carbs</span> (g)
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <span className="text-[#FFB800]">Fat</span> (g)
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={fat}
                onChange={(e) => setFat(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className={labelClass}>Servings</label>
              <input
                type="number"
                min={1}
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Prep (min)</label>
              <input
                type="number"
                min={0}
                value={prepTimeMins}
                onChange={(e) => setPrepTimeMins(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Cook (min)</label>
              <input
                type="number"
                min={0}
                value={cookTimeMins}
                onChange={(e) => setCookTimeMins(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Published Toggle + Submit */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPublished((p) => !p)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                  isPublished ? "bg-[#E51A1A]" : "bg-[#2A2A2A]"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-[#1E1E1E] rounded-full transition-transform duration-200 ${
                    isPublished ? "translate-x-5" : ""
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-white">
                {isPublished ? "Published" : "Draft"}
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-[#E51A1A] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Update Recipe"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
