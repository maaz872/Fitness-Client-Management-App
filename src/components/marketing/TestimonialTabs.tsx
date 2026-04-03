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

export default function TestimonialTabs({ testimonials }: TestimonialTabsProps) {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? testimonials : testimonials.slice(0, 6);

  return (
    <section className="bg-[#111111] py-20 px-6">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-4">
          Real Results From Real People
        </h2>
        <p className="text-white/50 text-center mb-12 max-w-[600px] mx-auto">
          Our members are losing fat, building lean muscle, and transforming their lives.
        </p>

        {visible.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((t) => (
              <div
                key={t.id}
                className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl overflow-hidden"
              >
                {/* Before/After images */}
                <div className="relative h-48 flex">
                  <div className="flex-1 relative">
                    <Image
                      src="/images/before.jpg"
                      alt="Before"
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      Before
                    </span>
                  </div>
                  <div className="flex-1 relative">
                    <Image
                      src="/images/after.jpg"
                      alt="After"
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-2 right-2 bg-[#E51A1A]/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      After
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="font-bold text-white text-sm">{t.clientName}</p>
                  <p className="text-[#E51A1A] text-xs font-semibold mt-0.5">
                    {t.duration}
                  </p>
                  <p className="text-white/50 text-sm mt-2 leading-relaxed line-clamp-3">
                    {t.quote}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-white/30 py-12">
            No testimonials yet.
          </p>
        )}

        {testimonials.length > 6 && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="bg-[#1E1E1E] border border-[#2A2A2A] text-white/70 hover:text-white hover:border-[#E51A1A]/30 px-8 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer"
            >
              {showAll
                ? "Show Less"
                : `Show All ${testimonials.length} Testimonials`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
