import React, { useState, useMemo } from 'react';
import { Search, Plus, Clock, Info, CheckCircle2 } from 'lucide-react';
import { STANDARD_TASKS, StandardTask, BASE_HOURLY_RATE } from '@/lib/standardTasks';

interface StandardTaskCatalogProps {
  onSelectTask: (task: StandardTask, rate: number) => void;
}

export const StandardTaskCatalog: React.FC<StandardTaskCatalogProps> = ({ onSelectTask }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(STANDARD_TASKS.map(t => t.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const filteredTasks = useMemo(() => {
    return STANDARD_TASKS.filter(task => {
      const matchesSearch = task.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            task.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleSelect = (task: StandardTask) => {
    onSelectTask(task, BASE_HOURLY_RATE);
    setJustAdded(task.id);
    setTimeout(() => setJustAdded(null), 1500);
  };

  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden mt-4 shadow-xl">
      <div className="bg-[#181818] p-4 border-b border-[#2a2a2a]">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#78716c] absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search standard catalog..."
              className="w-full bg-[#111111] border border-[#333333] rounded-lg pl-9 pr-4 py-2 text-sm text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-[#fdfbf7] focus:outline-none focus:border-[#c5a059] sm:w-48"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 mt-3 text-[11px] text-[#78716c]">
          <Info className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>Calculated at Nailed It Property Solutions Base Rate: <strong className="text-[#fdfbf7] font-mono">$${BASE_HOURLY_RATE.toFixed(2)}/hr</strong></span>
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-[#78716c] text-sm">
            No matching tasks found. Try adjusting your search.
          </div>
        ) : (
          <ul className="divide-y divide-[#222222]">
            {filteredTasks.map(task => (
              <li key={task.id} className="p-3 hover:bg-[#161616] transition flex items-center justify-between group">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#c5a059] bg-[#c5a059]/10 px-2 py-0.5 rounded">
                      {task.category}
                    </span>
                    <span className="text-xs text-[#b8b0a5] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.estimatedHours} hrs
                    </span>
                  </div>
                  <div className="text-sm text-[#fdfbf7] font-medium">{task.description}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-[#fdfbf7]">
                      $${(task.estimatedHours * BASE_HOURLY_RATE).toFixed(2)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelect(task)}
                    className="p-2 rounded-lg bg-[#222222] text-[#fdfbf7] hover:bg-[#c5a059] hover:text-black transition flex-shrink-0"
                    title="Add to Estimate"
                  >
                    {justAdded === task.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
