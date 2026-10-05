import * as React from 'react';
import { Plus, X } from 'lucide-react';
import type { ProductAttributeDefinition, ProductAttributeValue } from '../product-model';

interface Props { definition: ProductAttributeDefinition; value?: ProductAttributeValue; onChange: (value: ProductAttributeValue) => void; error?: string; }
export function AttributeField({ definition, value, onChange, error }: Props) {
  const current = value?.value;
  const [entry, setEntry] = React.useState('');
  const set = (next: ProductAttributeValue['value']) => onChange({ definitionId: definition.id, name: definition.name, type: definition.type, value: next, unit: definition.unit, required: definition.required, allowsVariants: definition.allowsVariants, custom: value?.custom });
  const base = `w-full px-3 py-2 bg-white border ${error ? 'border-[#DC2626]' : 'border-[#CBD5E1]'} rounded-[6px] focus:outline-none focus:border-[#2563EB]`;
  const values = Array.isArray(current) ? current : [];
  const addValue = () => { const next = entry.trim(); if (next && !values.includes(next)) set([...values, next]); setEntry(''); };
  const singleChoice = definition.type === 'SELECT';
  return <div className="space-y-1.5"><div className="flex items-baseline justify-between gap-3"><label className="font-semibold text-[#111827]">{definition.label || definition.name}</label><span className="shrink-0 text-[10px] text-[#94A3B8]">{definition.required ? 'Obligatoria' : 'Opcional'}</span></div>
    {definition.type === 'BOOLEAN' ? <div className="flex gap-2"><button type="button" onClick={() => set(true)} className={`px-3 py-2 border rounded-[6px] font-medium ${current === true ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]' : 'border-[#CBD5E1] text-[#475569]'}`}>Sí</button><button type="button" onClick={() => set(false)} className={`px-3 py-2 border rounded-[6px] font-medium ${current === false ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]' : 'border-[#CBD5E1] text-[#475569]'}`}>No</button></div>
      : definition.type === 'MULTI_SELECT' ? <div className="space-y-2"><div className="flex min-h-7 flex-wrap items-center gap-1.5">{values.map((item) => <button key={item} type="button" onClick={() => set(values.filter((itemValue) => itemValue !== item))} className="inline-flex items-center gap-1 px-2 py-1 border border-[#CBD5E1] rounded-[4px] bg-white text-[#475569] font-medium">{item}<X className="w-3 h-3 text-[#94A3B8]"/></button>)}{values.length === 0 && <span className="text-[11px] text-[#94A3B8]">Aún no hay valores.</span>}</div><div className="flex gap-2"><input className={base} value={entry} placeholder="Escribe un valor" onChange={(e) => setEntry(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addValue(); } }}/><button type="button" onClick={addValue} className="inline-flex shrink-0 items-center gap-1 px-3 py-2 border border-[#CBD5E1] rounded-[6px] text-[#475569] font-semibold hover:border-[#64748B]"><Plus className="w-3.5 h-3.5"/>Agregar valor</button></div></div>
      : singleChoice ? <input className={base} value={String(current || '')} placeholder="Escribe la opción disponible" onChange={(e) => set(e.target.value)}/>
      : <div className="flex gap-2"><input className={base} type={definition.type === 'NUMBER' || definition.type === 'NUMBER_UNIT' ? 'number' : 'text'} value={current === undefined ? '' : String(current)} onChange={(e) => set(definition.type === 'NUMBER' || definition.type === 'NUMBER_UNIT' ? Number(e.target.value) : e.target.value)}/>{definition.type === 'NUMBER_UNIT' && <span className="px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-[6px] text-[#475569] whitespace-nowrap">{definition.unit || 'Unidad'}</span>}</div>}
    {error && <p className="text-[11px] text-[#B91C1C]">{error}</p>}</div>;
}
