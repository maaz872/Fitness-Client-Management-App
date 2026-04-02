"use client";

import { useState } from "react";
import Image from "next/image";

interface Testimonial {
  id: number;
  clientName: string;
  duration: string;
  quote: string;
  profilePhoto: string | null;
}

interface TestimonialTabsProps {
  testimonials: Testimonial[];
}

const fallbackPhotos = [
  "/images/Coach_1.jpeg",
  "/images/Coach_2.jpeg",
  "/images/Coach_3.jpeg",
  "/images/Coach_4.jpeg",
];

export default function TestimonialTabs({ testimonials }: TestimonialTabsProps) {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? testimonials : testimonials.slice(0, 6);

  return (
    <section className="bg-[#111111] py-20 px-6">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
          Real Results From Real People
        </h2>

        {/* Testimonial Grid */}
        {visible.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((t, i) => (
              <div
                key={t.id}
                className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6"
              >
                <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                  <Image
                    src={t.profilePhoto || fallbackPhotos[i % fallbackPhotos.length]}
                    alt={t.clientName}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="font-bold text-white mb-1">{t.clientName}</p>
                <p className="text-[#E51A1A] text-sm font-semibold mb-3">{t.duration}</p>
                <p className="text-white/60 text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-white/40">No testimonials yet.</p>
        )}

        {/* Show More / Show Less */}
        {testimonials.length > 6 && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-[#E51A1A] hover:text-[#FF6B00] font-bold text-sm uppercase tracking-wider transition-colors"
            >
              {showAll ? "Show Less" : "Show More"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
