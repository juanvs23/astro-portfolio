import { useState, type FormEvent } from 'react';
import { TextField, NumberField, ToggleField } from '../components/Field';

export interface JobInput {
  title_es: string;
  title_en: string;
  company_es: string;
  company_en: string;
  start: string;
  end: string;
  description_es: string;
  description_en: string;
  order: number;
  visible: boolean;
}

export function JobForm({
  initial,
  onSubmit,
  busy = false,
  submitLabel = 'Save',
}: {
  initial?: Partial<JobInput>;
  onSubmit: (v: JobInput) => void;
  busy?: boolean;
  submitLabel?: string;
}) {
  const [titleEs, setTitleEs] = useState(initial?.title_es ?? '');
  const [titleEn, setTitleEn] = useState(initial?.title_en ?? '');
  const [companyEs, setCompanyEs] = useState(initial?.company_es ?? '');
  const [companyEn, setCompanyEn] = useState(initial?.company_en ?? '');
  const [start, setStart] = useState(initial?.start ?? '');
  const [end, setEnd] = useState(initial?.end ?? '');
  const [descEs, setDescEs] = useState(initial?.description_es ?? '');
  const [descEn, setDescEn] = useState(initial?.description_en ?? '');
  const [order, setOrder] = useState(initial?.order != null ? String(initial.order) : '0');
  const [visible, setVisible] = useState(initial?.visible ?? true);

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      title_es: titleEs,
      title_en: titleEn,
      company_es: companyEs,
      company_en: companyEn,
      start,
      end,
      description_es: descEs,
      description_en: descEn,
      order: Number(order) || 0,
      visible,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4" aria-label="job form">
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Title (es)" id="title_es" value={titleEs} onChange={setTitleEs} required />
        <TextField label="Title (en)" id="title_en" value={titleEn} onChange={setTitleEn} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Company (es)" id="company_es" value={companyEs} onChange={setCompanyEs} required />
        <TextField label="Company (en)" id="company_en" value={companyEn} onChange={setCompanyEn} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Start" id="start" value={start} onChange={setStart} placeholder="2024" />
        <TextField label="End" id="end" value={end} onChange={setEnd} placeholder="Present / ''" />
      </div>
      <TextField label="Description (es)" id="description_es" value={descEs} onChange={setDescEs} textarea />
      <TextField label="Description (en)" id="description_en" value={descEn} onChange={setDescEn} textarea />
      <div className="flex items-end gap-6">
        <div className="w-28">
          <NumberField label="Order" id="order" value={order} onChange={setOrder} />
        </div>
        <ToggleField label="Visible" id="visible" checked={visible} onChange={setVisible} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}