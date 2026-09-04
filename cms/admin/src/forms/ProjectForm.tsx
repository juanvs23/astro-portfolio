import { useState, type FormEvent } from 'react';
import { TextField, NumberField, ToggleField } from '../components/Field';
import { ImageUpload } from '../components/ImageUpload';

export interface ProjectInput {
  name: string;
  url: string;
  desc_es: string;
  desc_en: string;
  imageUrl: string;
  order: number;
  visible: boolean;
}

export function ProjectForm({
  initial,
  onSubmit,
  busy = false,
  submitLabel = 'Save',
}: {
  initial?: Partial<ProjectInput>;
  onSubmit: (v: ProjectInput) => void;
  busy?: boolean;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [descEs, setDescEs] = useState(initial?.desc_es ?? '');
  const [descEn, setDescEn] = useState(initial?.desc_en ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [order, setOrder] = useState(initial?.order != null ? String(initial.order) : '0');
  const [visible, setVisible] = useState(initial?.visible ?? true);

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      url: url.trim(),
      desc_es: descEs,
      desc_en: descEn,
      imageUrl: imageUrl.trim(),
      order: Number(order) || 0,
      visible,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4" aria-label="project form">
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Name" id="name" value={name} onChange={setName} required />
        <TextField label="URL" id="url" value={url} onChange={setUrl} required />
      </div>
      <TextField label="Description (es)" id="desc_es" value={descEs} onChange={setDescEs} textarea />
      <TextField label="Description (en)" id="desc_en" value={descEn} onChange={setDescEn} textarea />
      <ImageUpload label="Image" value={imageUrl} onChange={setImageUrl} />
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