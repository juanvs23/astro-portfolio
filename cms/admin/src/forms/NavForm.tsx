import { useState, type FormEvent } from 'react';
import { TextField, NumberField, ToggleField } from '../components/Field';

export interface NavInput {
  key: string;
  path: string;
  order: number;
  visible: boolean;
}

export function NavForm({
  initial,
  onSubmit,
  busy = false,
  submitLabel = 'Save',
}: {
  initial?: Partial<NavInput>;
  onSubmit: (v: NavInput) => void;
  busy?: boolean;
  submitLabel?: string;
}) {
  const [key, setKey] = useState(initial?.key ?? '');
  const [path, setPath] = useState(initial?.path ?? '');
  const [order, setOrder] = useState(initial?.order != null ? String(initial.order) : '0');
  const [visible, setVisible] = useState(initial?.visible ?? true);

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ key: key.trim(), path: path.trim(), order: Number(order) || 0, visible });
  }

  return (
    <form onSubmit={submit} className="space-y-4" aria-label="nav form">
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Key" id="key" value={key} onChange={setKey} required placeholder="menu.home" />
        <TextField label="Path" id="path" value={path} onChange={setPath} required placeholder="/" />
      </div>
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