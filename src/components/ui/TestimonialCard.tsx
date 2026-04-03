import Image from "next/image";

type TestimonialCardProps = {
  name: string;
  duration: string;
  text: string;
};

export default function TestimonialCard({ name, duration, text }: TestimonialCardProps) {
  return (
    <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl overflow-hidden">
      {/* Before/After photos */}
      <div className="h-[250px] flex">
        <div className="flex-1 relative">
          <Image
            src="/images/before.jpg"
            alt="Before transformation"
            fill
            className="object-cover"
          />
          <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold uppercase tracking-wider px-2 py-1 rounded">
            Before
          </span>
        </div>
        <div className="flex-1 relative">
          <Image
            src="/images/after.jpg"
            alt="After transformation"
            fill
            className="object-cover"
          />
          <span className="absolute bottom-2 right-2 bg-[#E51A1A]/90 text-white text-xs font-bold uppercase tracking-wider px-2 py-1 rounded">
            After
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="font-bold text-base uppercase tracking-wider text-white">{name}</div>
        <div className="text-[#E51A1A] text-[0.85rem] font-semibold mt-1">
          {duration}
        </div>
        <p className="mt-3 text-white/60 text-[0.9rem] leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
