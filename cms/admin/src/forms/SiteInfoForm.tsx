import { useState, type FormEvent } from 'react';
import { TextField } from '../components/Field';

export interface SiteInfoInput {
  name: string;
  jobTitle: string;
  url: string;
  telephone: string;
  logo: string;
  brandName: string;
  twitterHandle: string;
  sameAs: string[];
}

export function SiteInfoForm({
  initial,
  onSubmit,
  busy = false,
  submitLabel = 'Save site info',
}: {
  initial?: Partial<SiteInfoInput>;
  onSubmit: (v: SiteInfoInput) => void;
  busy?: boolean;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [jobTitle, setJobTitle] = useState(initial?.jobTitle ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [telephone, setTelephone] = useState(initial?.telephone ?? '');
  const [logo, setLogo] = useState(initial?.logo ?? '');
  const [brandName, setBrandName] = useState(initial?.brandName ?? '');
  const [twitterHandle, setTwitterHandle] = useState(initial?.twitterHandle ?? '');
  const [sameAs, setSameAs] = useState((initial?.sameAs ?? []).join(', '));

  function submit(e: FormEvent) {
    e.preventDefault();
    const list = sameAs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onSubmit({
      name: name.trim(),
      jobTitle: jobTitle.trim(),
      url: url.trim(),
      telephone: telephone.trim(),
      logo: logo.trim(),
      brandName: brandName.trim(),
      twitterHandle: twitterHandle.trim(),
      sameAs: list,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4" aria-label="site info form">
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Name" id="name" value={name} onChange={setName} />
        <TextField label="Job title" id="jobTitle" value={jobTitle} onChange={setJobTitle} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextField label="URL" id="url" value={url} onChange={setUrl} />
        <TextField label="Telephone" id="telephone" value={telephone} onChange={setTelephone} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Logo" id="logo" value={logo} onChange={setLogo} />
        <TextField label="Brand name" id="brandName" value={brandName} onChange={setBrandName} />
      </div>
      <TextField label="Twitter handle" id="twitterHandle" value={twitterHandle} onChange={setTwitterHandle} />
      <TextField label="sameAs (comma separated)" id="sameAs" value={sameAs} onChange={setSameAs} />
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}