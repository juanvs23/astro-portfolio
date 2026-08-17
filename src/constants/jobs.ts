export interface JobItem {
  id: number;
  title: string;
  company: string;
  start: string;
  end: string;
  description: string;
}

export function getJobs(t: (key: string) => string): JobItem[] {
  return [
    {
      id: 1,
      title: t('newmovement.title'),
      company: t('newmovement.company'),
      start: t('newmovement.start'),
      end: t('newmovement.end'),
      description: t('newmovement.description'),
    },
    {
      id: 2,
      title: t('ama.title'),
      company: t('ama.company'),
      start: t('ama.start'),
      end: t('ama.end'),
      description: t('ama.description'),
    },
    {
      id: 3,
      title: t('tremgroup.title'),
      company: t('tremgroup.company'),
      start: t('tremgroup.start'),
      end: t('tremgroup.end'),
      description: t('tremgroup.description'),
    },
    {
      id: 4,
      title: t('naciondigital.title'),
      company: t('naciondigital.company'),
      start: t('naciondigital.start'),
      end: t('naciondigital.end'),
      description: t('naciondigital.description'),
    },
    {
      id: 5,
      title: t('scm255.title'),
      company: t('scm255.company'),
      start: t('scm255.start'),
      end: t('scm255.end'),
      description: t('scm255.description'),
    },
    {
      id: 6,
      title: t('selfemployed.title'),
      company: t('selfemployed.company'),
      start: t('selfemployed.start'),
      end: t('selfemployed.end'),
      description: t('selfemployed.description'),
    },
  ];
}