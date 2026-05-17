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
      title: t('ama.title'),
      company: t('ama.company'),
      start: t('ama.start'),
      end: t('ama.end'),
      description: t('ama.description'),
    },
    {
      id: 2,
      title: t('ciancoder.title'),
      company: t('ciancoder.company'),
      start: t('ciancoder.start'),
      end: t('ciancoder.end'),
      description: t('ciancoder.description'),
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
      title: t('conocimiento.title'),
      company: t('conocimiento.company'),
      start: t('conocimiento.start'),
      end: t('conocimiento.end'),
      description: t('conocimiento.description'),
    },
    {
      id: 5,
      title: t('nivelics.title'),
      company: t('nivelics.company'),
      start: t('nivelics.start'),
      end: t('nivelics.end'),
      description: t('nivelics.description'),
    },
    {
      id: 6,
      title: t('ztgroup.title'),
      company: t('ztgroup.company'),
      start: t('ztgroup.start'),
      end: t('ztgroup.end'),
      description: t('ztgroup.description'),
    },
    {
      id: 7,
      title: t('hispano.title'),
      company: t('hispano.company'),
      start: t('hispano.start'),
      end: t('hispano.end'),
      description: t('hispano.description'),
    },
  ];
}
