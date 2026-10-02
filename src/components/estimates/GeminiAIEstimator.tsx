import React, { useState } from 'react';
import { EstimateItem } from '@/types';
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, ShieldCheck, Star } from 'lucide-react';

interface GeminiAIEstimatorProps {
  propertyAddress?: string;
  onSelectOption: (items: EstimateItem[], tierLabel: string) => void;
}

export const GeminiAIEstimator: React.FC<GeminiAIEstimatorProps> = ({ 
  propertyAddress, 
  onSelectOption 
}) => {
  const [scope, setScope] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<any[] | null>(null);

  const handleGenerate = async () => {
    if (!scope.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scopeOfWork: scope,
          propertyContext: propertyAddress
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate estimates from Gemini API');
      }

      if (data.options) {
        setOptions(data.options);
      } else {
        throw new Error('Invalid response structure from Gemini API');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTierIcon = (tier: string) => {
    if (tier === 'Good') return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    if (tier === 'Better') return <CheckCircle2 className="w-5 h-5 text-blue-400" />;
    if (tier === 'Best') return <Star className="w-5 h-5 text-[#c5a059]" />;
    return <Sparkles className="w-5 h-5 text-purple-400" />;
  };

  const getTierColor = (tier: string) => {
    if (tier === 'Good') return 'border-emerald-500/40 bg-emerald-950/20';
    if (tier === 'Better') return 'border-blue-500/40 bg-blue-950/20';
    if (tier === 'Best') return 'border-[#c5a059]/40 bg-[#c5a059]/10 shadow-[0_0_15px_rgba(197,160,89,0.15)]';
    return 'border-[#333] bg-[#1a1a1a]';
  };

  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-[#222]">
        <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-[#fdfbf7] text-sm">Gemini AI Estimation Engine</h4>
          <p className="text-[11px] text-[#78716c]">Generate Good, Better, Best options instantly using localized Rome, GA pricing logic.</p>
        </div>
      </div>

      {/* Input Form */}
      {!options && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#b8b0a5] mb-1.5">
              Scope of Work & Measurements *
            </label>
            <textarea
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="e.g. 12x15 bedroom floor. Replacing damaged carpet with LVP. Baseboards need painting."
              rows={4}
              className="w-full bg-[#161616] border border-[#333] rounded-xl p-3 text-xs text-[#fdfbf7] focus:outline-none focus:border-purple-500/50 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-3 flex items-start gap-2 text-xs text-red-200">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!scope.trim() || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Consulting Gemini API...' : 'Generate AI Estimates'}</span>
          </button>
        </div>
      )}

      {/* Results */}
      {options && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-[#b8b0a5] uppercase tracking-wider">Select an Option to Apply:</h5>
            <button 
              onClick={() => setOptions(null)}
              className="text-[10px] text-purple-400 hover:text-purple-300 underline"
            >
              Start Over
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {options.map((opt, idx) => (
              <div 
                key={idx} 
                className={`border rounded-xl p-4 flex flex-col justify-between transition cursor-pointer hover:-translate-y-1 hover:shadow-xl ${getTierColor(opt.tier)}`}
                onClick={() => {
                  const items: EstimateItem[] = opt.items.map((i: any, index: number) => ({
                    id: `ai-${Date.now()}-${index}`,
                    type: i.type,
                    description: i.description,
                    quantity: Number(i.quantity) || 1,
                    unitPrice: Number(i.unitPrice) || 0,
                    total: Number(i.total) || (Number(i.quantity) * Number(i.unitPrice))
                  }));
                  onSelectOption(items, opt.title);
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {getTierIcon(opt.tier)}
                    <h4 className="font-bold text-[#fdfbf7] text-sm">{opt.tier}: {opt.title}</h4>
                  </div>
                  <p className="text-[11px] text-[#a8a095] leading-relaxed">
                    {opt.description}
                  </p>
                  
                  <div className="pt-3 border-t border-[#333] space-y-1.5">
                    {opt.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-[10px]">
                        <span className="text-[#78716c] truncate pr-2" title={item.description}>
                          {item.quantity}x {item.description}
                        </span>
                        <span className="font-mono text-[#b8b0a5] whitespace-nowrap">
                          ${Number(item.total).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#333] flex justify-between items-end">
                  <span className="text-[10px] text-[#78716c] font-bold uppercase tracking-wider">Option Total</span>
                  <span className="font-mono font-bold text-lg text-[#fdfbf7]">
                    ${Number(opt.totalOptionCost).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
