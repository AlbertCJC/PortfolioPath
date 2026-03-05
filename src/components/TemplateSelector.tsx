import { TemplateType } from '../resumeTypes';
import { Check } from 'lucide-react';

interface TemplateSelectorProps {
  currentTemplate: TemplateType;
  onSelect: (template: TemplateType) => void;
}

export default function TemplateSelector({ currentTemplate, onSelect }: TemplateSelectorProps) {
  const templates: { id: TemplateType; name: string; description: string; color: string }[] = [
    { id: 'professional', name: 'Professional', description: 'Dark blue theme with a structured sidebar layout.', color: 'bg-slate-800' },
    { id: 'elegant', name: 'Elegant', description: 'Sophisticated beige theme with geometric accents.', color: 'bg-[#d6d3d1]' },
    { id: 'bold', name: 'Bold', description: 'High-contrast orange and brown design.', color: 'bg-amber-500' },
    { id: 'creative', name: 'Creative', description: 'Two-column layout with a profile photo and modern typography.', color: 'bg-stone-100' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`relative p-4 rounded-xl border-2 transition-all text-left group ${
            currentTemplate === t.id
              ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 ring-offset-2 ring-offset-[#0A0A0B]'
              : 'border-slate-800 bg-slate-900/50 hover:border-emerald-500/50 hover:bg-slate-800'
          }`}
        >
          <div className={`h-24 w-full rounded-md mb-3 ${t.color} shadow-sm flex items-center justify-center overflow-hidden`}>
             {/* Simple visual representation of the template */}
             {t.id === 'professional' && (
                <div className="w-full h-full flex">
                    <div className="w-1/3 h-full bg-slate-900 flex flex-col items-center pt-2 gap-1">
                        <div className="w-8 h-8 rounded-full bg-slate-700"></div>
                        <div className="w-3/4 h-1 bg-slate-700 opacity-50"></div>
                    </div>
                    <div className="w-2/3 h-full bg-white p-2">
                        <div className="w-full h-2 bg-slate-900 mb-1"></div>
                        <div className="w-1/2 h-1 bg-slate-400"></div>
                    </div>
                </div>
             )}
             {t.id === 'elegant' && (
                <div className="w-full h-full flex flex-col bg-[#f5f5f0]">
                    <div className="w-full h-1/3 bg-[#5d4037] transform -skew-y-3 origin-top-right"></div>
                    <div className="flex-1 flex p-1 gap-1">
                        <div className="w-1/3 h-full bg-gray-200 opacity-50"></div>
                        <div className="w-2/3 h-full bg-white"></div>
                    </div>
                </div>
             )}
             {t.id === 'bold' && (
                <div className="w-full h-full flex">
                    <div className="w-1/3 h-full flex flex-col">
                        <div className="h-1/2 bg-amber-500"></div>
                        <div className="h-1/2 bg-[#451a03]"></div>
                    </div>
                    <div className="w-2/3 h-full bg-white p-1">
                        <div className="w-full h-2 bg-amber-500 mb-1"></div>
                    </div>
                </div>
             )}
             {t.id === 'creative' && (
                <div className="w-full h-full flex">
                    <div className="w-1/3 h-full bg-stone-200 flex flex-col items-center pt-2 gap-1">
                        <div className="w-8 h-8 rounded-full bg-stone-400 opacity-50"></div>
                        <div className="w-1/2 h-1 bg-stone-400 opacity-40"></div>
                        <div className="w-1/2 h-1 bg-stone-400 opacity-30"></div>
                    </div>
                    <div className="w-2/3 h-full bg-white p-2 flex flex-col gap-1">
                         <div className="w-full h-2 bg-black opacity-10"></div>
                         <div className="w-full h-8 bg-black opacity-5"></div>
                    </div>
                </div>
             )}
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-white">{t.name}</span>
            {currentTemplate === t.id && <Check size={18} className="text-emerald-500" />}
          </div>
          <p className="text-xs text-slate-400 mt-1">{t.description}</p>
        </button>
      ))}
    </div>
  );
}
