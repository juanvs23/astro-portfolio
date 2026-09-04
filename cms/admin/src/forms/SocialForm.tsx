import { useState, type FormEvent } from 'react';
import { TextField, NumberField, ToggleField } from '../components/Field';

export interface SocialInput {
  name: string;
  href: string;
  icon: string;
  order: number;
  visible: boolean;
}

export function SocialForm({
  initial,
  onSubmit,
  busy = false,
  submitLabel = 'Save',
}: {
  initial?: Partial<SocialInput>;
  onSubmit: (v: SocialInput) => void;
  busy?: boolean;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [href, setHref] = useState(initial?.href ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [order, setOrder] = useState(initial?.order != null ? String(initial.order) : '0');
  const [visible, setVisible] = useState(initial?.visible ?? true);

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ name: name.trim(), href: href.trim(), icon: icon.trim(), order: Number(order) || 0, visible });
  }

  return (
    <form onSubmit={submit} className="space-y-4" aria-label="social form">
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Name" id="name" value={name} onChange={setName} required placeholder="GitHub" />
        <TextField label="Icon" id="icon" value={icon} onChange={setIcon} placeholder="github" />
      </div>
      <TextField label="Href" id="href" value={href} onChange={setHref} required placeholder="https://github.com/user" />
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