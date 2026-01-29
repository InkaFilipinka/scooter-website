import { ReactNode } from "react";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-8 text-center hover:shadow-xl transition-all border-2 border-teal-100 hover:border-teal-300 relative overflow-hidden">
      <div className="absolute top-2 right-2 text-3xl opacity-30">🌊</div>
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-600 rounded-full mb-4 shadow-md">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
