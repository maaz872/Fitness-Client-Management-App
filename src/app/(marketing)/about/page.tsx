import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "About | Level Up",
  description:
    "Meet the coach behind Level Up. Learn about the science-backed approach to fat loss and body recomposition.",
};

export default async function AboutPage() {
  let coachName = "Coach Raheel";
  let siteName = "Level Up";

  try {
    const settings = await prisma.siteContent.findMany({
      where: { contentKey: { in: ["coach_name", "site_name"] } },
    });
    for (const s of settings) {
      if (s.contentKey === "coach_name") coachName = s.contentValue;
      if (s.contentKey === "site_name") siteName = s.contentValue;
    }
  } catch {
    // use defaults
  }

  return (
    <>
      {/* Hero Banner */}
      <section className="relative h-[400px]">
        <Image
          src="/images/Coach_4.jpeg"
          alt={coachName}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/60 to-black/30" />
        <div className="relative z-10 h-full flex items-end">
          <div className="max-w-[1200px] mx-auto px-6 pb-12 w-full">
            <span className="inline-block bg-[#E51A1A]/10 border border-[#E51A1A]/30 text-[#E51A1A] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-4">
              About
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white">Meet {coachName}</h1>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="bg-[#0A0A0A] py-20 px-6">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-12 items-start">
          {/* Coach Image */}
          <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden border border-[#2A2A2A]">
            <Image
              src="/images/Coach_1.jpeg"
              alt={`${coachName} - back muscles`}
              fill
              className="object-cover"
            />
          </div>

          {/* Bio Text */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              The Coach Behind {siteName}
            </h2>

            <p className="text-white/70 leading-relaxed">
              {coachName} is a qualified Athletic Therapist (B.Sc Hons) and certified
              Personal Trainer with years of hands-on experience in fat loss, body
              recomposition, and performance training. His background in both clinical
              rehabilitation and strength training gives him a unique edge when it comes
              to designing programmes that are safe, effective, and built to last.
            </p>

            <p className="text-white/70 leading-relaxed">
              His philosophy is straightforward: no fad diets, no extreme restrictions,
              no quick fixes. Everything is rooted in science-backed nutrition and
              training principles that fit your real life. Whether you work long hours,
              travel regularly, or have family commitments, {coachName.split(" ").pop()} designs programmes
              that work around your lifestyle — not the other way around.
            </p>

            <p className="text-white/70 leading-relaxed">
              Since founding {siteName}, {coachName} has helped hundreds of people
              transform their bodies and their confidence. His clients range from
              complete beginners stepping into the gym for the first time to advanced
              lifters looking to break through plateaus — men and women of all ages
              and backgrounds, across more than 15 countries worldwide.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-5 text-center">
                <p className="text-2xl font-black text-white">500+</p>
                <p className="text-white/50 text-sm">Transformations</p>
              </div>
              <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-5 text-center">
                <p className="text-2xl font-black text-white">15+</p>
                <p className="text-white/50 text-sm">Countries</p>
              </div>
              <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-5 text-center">
                <p className="text-2xl font-black text-white">B.Sc Hons</p>
                <p className="text-white/50 text-sm">Athletic Therapy</p>
              </div>
              <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-5 text-center">
                <p className="text-2xl font-black text-white">4.9</p>
                <p className="text-white/50 text-sm">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="bg-[#111111] py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-14">
            What We Offer
          </h2>

          <div className="max-w-[500px] mx-auto">
            {/* The Hub Card */}
            <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8">
              <div className="inline-block bg-[#FF6B00]/10 text-[#FF6B00] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
                Your Nutrition Toolkit
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">The Hub</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                400+ macro-friendly recipes, a smart calorie calculator, daily meal
                tracker, restaurant guides, and progress tracking tools. Everything
                you need to take control of your nutrition — for a one-time payment
                of &euro;79.
              </p>
              <Link
                href="/checkout"
                className="inline-block bg-[#E51A1A] hover:bg-[#C41010] text-white font-bold px-6 py-3 rounded-xl text-sm uppercase tracking-wider transition-colors"
              >
                Get The Hub
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#0A0A0A] py-20 px-6">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready To Get Started?
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-10">
            Take control of your nutrition with The Hub. Your transformation
            starts today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/checkout"
              className="bg-[#E51A1A] hover:bg-[#C41010] text-white font-bold px-8 py-4 rounded-xl text-sm uppercase tracking-wider transition-colors"
            >
              Get The Hub &mdash; &euro;79
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
