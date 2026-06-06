import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bold,
  List,
  Paperclip,
  Plus,
  Trash2,
  ArrowRight,
  Calendar,
  Sparkle,
  UploadCloud,
  File,
  X
} from 'lucide-react';

interface RfqItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
}

interface MockFile {
  name: string;
  size: string;
}

interface RfqComponentsProps {
  onPublish: (title: string, category: string, itemsCount: number) => void;
  onCancel: () => void;
}

export default function Rfqcomponents({ onPublish, onCancel }: RfqComponentsProps) {
  const [title, setTitle] = useState('Q3 IT Infrastructure Hardware Refresh');
  const [category, setCategory] = useState('Hardware & Electronics');
  const [deadline, setDeadline] = useState('2024-11-15');
  const [description, setDescription] = useState(
    'We are seeking quotes for the comprehensive hardware refresh for our North American regional offices. This includes high-performance laptops, secondary monitors, and associated peripheral equipment. Delivery must be phased over Q3.'
  );

  const [items, setItems] = useState<RfqItem[]>([
    { id: '1', description: 'Enterprise-grade Laptops (16GB RAM, 512GB SSD)', qty: 150, unit: 'EA' },
    { id: '2', description: '27-inch 4K USB-C Monitors', qty: 300, unit: 'EA' }
  ]);

  const [selectedVendors, setSelectedVendors] = useState<string[]>(['TechSupply Corp']);
  const [attachments, setAttachments] = useState<MockFile[]>([
    { name: 'it_hardware_specs_2026.pdf', size: '2.4 MB' }
  ]);

  // AI Spec Generator states
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);

  const genStepsMessages = [
    'Scanning category databases...',
    'Matching item specifications...',
    'Optimizing technical parameters...',
    'Writing requirements sheet...'
  ];

  const handleTriggerAiGenerator = () => {
    setIsGenerating(true);
    setGenStep(0);
  };

  useEffect(() => {
    if (!isGenerating) return;
    if (genStep < genStepsMessages.length) {
      const timer = setTimeout(() => {
        setGenStep(prev => prev + 1);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      // Finished generating - Add high quality specifications
      const generatedItems: RfqItem[] = [
        { id: Math.random().toString(), description: 'Gigabit PoE Network Switch (24-Port)', qty: 12, unit: 'EA' },
        { id: Math.random().toString(), description: 'Cat6a Shielded Ethernet Spool (1000ft)', qty: 8, unit: 'LOT' },
        { id: Math.random().toString(), description: 'Enterprise Server Rack UPS (1500VA)', qty: 4, unit: 'EA' }
      ];
      setItems(prev => [...prev, ...generatedItems]);
      setIsGenerating(false);
    }
  }, [isGenerating, genStep]);

  const handleAddItem = () => {
    const newItem: RfqItem = {
      id: Math.random().toString(),
      description: '',
      qty: 1,
      unit: 'EA'
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof RfqItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleToggleVendor = (name: string) => {
    if (selectedVendors.includes(name)) {
      setSelectedVendors(selectedVendors.filter(v => v !== name));
    } else {
      setSelectedVendors([...selectedVendors, name]);
    }
  };

  const handleAddMockAttachment = () => {
    const files = [
      { name: 'procurement_guidelines.pdf', size: '1.1 MB' },
      { name: 'office_schematic_floor3.dwg', size: '5.8 MB' },
      { name: 'target_budget_allocations.xlsx', size: '450 KB' }
    ];
    const randomFile = files[Math.floor(Math.random() * files.length)];
    if (!attachments.some(f => f.name === randomFile.name)) {
      setAttachments([...attachments, randomFile]);
    }
  };

  const handleRemoveAttachment = (name: string) => {
    setAttachments(attachments.filter(f => f.name !== name));
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onPublish(title, category, 15);
  };

  return (
    <div className="w-full mx-auto max-w-7xl animate-fade-in space-y-6">
      {/* CSS Styles (Zero Border Radius applied globally) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flowLeftToRight {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        .flow-path {
          stroke-dasharray: 6, 6;
          animation: flowLeftToRight 1.5s linear infinite;
        }
      `}} />

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dedede] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="size-3" />
              AI-Assisted Draft
            </span>
            <span className="text-xs text-neutral-400 font-medium">Drafting Stage</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Initiate Request for Quotation</h1>
          <p className="text-xs text-neutral-500">
            Define requirements and let AI match you with optimal suppliers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-[#dedede] bg-white text-neutral-700 hover:bg-neutral-50 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="flex items-center gap-2 px-5 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span>Publish RFQ</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core Requirements */}
          <div className="bg-white border border-[#dedede] p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-100 pb-3">
              <span className="flex size-5 items-center justify-center bg-neutral-100 text-neutral-600 font-mono text-[10px]">1</span>
              <span>Core Requirements</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 font-mono">
                  RFQ Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 IT Infrastructure Hardware Refresh"
                  className="w-full text-xs p-3 bg-white border border-[#dedede] outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 font-mono">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-3 bg-white border border-[#dedede] outline-none focus:border-black font-semibold transition-colors cursor-pointer"
                  >
                    <option value="Hardware & Electronics">Hardware & Electronics</option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Industrial Supplies">Industrial Supplies</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 font-mono">
                    Submission Deadline
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full text-xs p-3 pl-10 bg-white border border-[#dedede] outline-none focus:border-black transition-colors cursor-pointer"
                    />
                    <Calendar className="absolute left-3 top-3.5 size-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scope of Work / Description */}
          <div className="bg-white border border-[#dedede] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800">
                <span className="flex size-5 items-center justify-center bg-neutral-100 text-neutral-600 font-mono text-[10px]">2</span>
                <span>Scope of Work / Description</span>
              </div>
              <div className="flex items-center gap-1 text-neutral-400">
                <button type="button" className="p-1 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer" title="Bold">
                  <Bold className="size-3.5" />
                </button>
                <button type="button" className="p-1 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer" title="Bullet List">
                  <List className="size-3.5" />
                </button>
                <button type="button" className="p-1 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer" title="Attach Document">
                  <Paperclip className="size-3.5" />
                </button>
              </div>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Provide a detailed description of the scope of work..."
              className="w-full text-xs p-3 bg-white border border-[#dedede] outline-none focus:border-black transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Interactive Uploader Zone */}
          <div className="bg-white border border-[#dedede] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-100 pb-3">
              <span className="flex size-5 items-center justify-center bg-neutral-100 text-neutral-600 font-mono text-[10px]">3</span>
              <span>Attachments & Specs Sheet</span>
            </div>

            <div
              onClick={handleAddMockAttachment}
              className="border-2 border-dashed border-[#dedede] hover:border-black p-6 text-center cursor-pointer bg-neutral-50/50 hover:bg-neutral-50 transition-colors flex flex-col items-center justify-center gap-2"
            >
              <UploadCloud className="size-8 text-neutral-400 cursor-pointer" />
              <p className="text-xs font-bold text-neutral-700 cursor-pointer">Drag files here or click to browse</p>
              <p className="text-[10px] text-neutral-400 font-mono cursor-pointer">Accepts PDF, XLSX, DWG up to 20MB</p>
            </div>

            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {attachments.map((file) => (
                  <div key={file.name} className="flex items-center justify-between p-3 border border-[#dedede] bg-white">
                    <div className="flex items-center gap-2 min-w-0">
                      <File className="size-4 text-neutral-500 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-black truncate">{file.name}</p>
                        <p className="text-[9px] text-neutral-400 font-mono">{file.size}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveAttachment(file.name); }}
                      className="p-1 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (Smart Sourcing recommendations) */}
        <div className="space-y-6">
          <div className="bg-white border border-[#dedede] p-6 shadow-sm space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-black">
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
                </svg>
                <h3 className="text-sm tracking-tight font-extrabold">Smart Sourcing</h3>
              </div>
              <p className="text-[11px] text-neutral-500 leading-normal">
                AI has analyzed your requirements and historical data to recommend these vendors.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-0.5 bg-neutral-50 border border-neutral-200 text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                Compliance Checked
              </span>
              <span className="px-2.5 py-0.5 bg-neutral-50 border border-neutral-200 text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                Capacity Verified
              </span>
            </div>

            {/* Recommended Vendor Cards */}
            <div className="space-y-3">
              {[
                { name: 'TechSupply Corp', match: '98%', risk: 'Low Risk', riskColor: 'text-emerald-600 bg-emerald-50 border-emerald-100', spend: '$1.2M' },
                { name: 'Global IT Solutions', match: '85%', risk: 'Low Risk', riskColor: 'text-emerald-600 bg-emerald-50 border-emerald-100', spend: '$458k' },
                { name: 'Nexus Hardware', match: '72%', risk: 'Medium Risk', riskColor: 'text-amber-600 bg-amber-50 border-amber-100', spend: null }
              ].map((v) => {
                const isSelected = selectedVendors.includes(v.name);
                return (
                  <div
                    key={v.name}
                    className={`p-4 border transition-all space-y-3 ${
                      isSelected ? 'border-black bg-neutral-50/50' : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <div className="size-6 bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-xs text-neutral-700">
                            {v.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-black">{v.name}</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">Preferred Tier 1 Supplier</span>
                      </div>
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                        {v.match} Match
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-medium">
                      <span className={`inline-flex px-1.5 py-0.5 border text-[9px] font-bold uppercase tracking-wider ${v.riskColor}`}>
                        • {v.risk}
                      </span>
                      {v.spend && (
                        <span>
                          Prev. Spend: <strong className="text-black">{v.spend}</strong>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleVendor(v.name)}
                      className={`w-full py-2 border text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-black'
                          : 'border-neutral-200 hover:border-black bg-white text-neutral-700'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select for RFQ'}
                    </button>
                  </div>
                );
              })}
            </div>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Redirecting to Full Supplier Directory');
              }}
              className="group flex items-center justify-center gap-1 text-[11px] font-bold text-black hover:underline pt-2 cursor-pointer"
            >
              <span className="cursor-pointer">Browse Full Directory</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 cursor-pointer" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
