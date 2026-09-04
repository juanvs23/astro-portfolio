import { describe, it, expect, expectTypeOf } from 'vitest';
import { ProjectSchema, type Project } from './project.js';

const validProject = {
  id: 'proj_01',
  name: 'Autopilot CRM',
  url: 'https://example.com/autopilot-crm',
  desc_es: 'CRM con automatizaciones de IA.',
  desc_en: 'CRM with AI automations.',
  imageUrl: '/img/autopilot-crm.jpg',
  order: 1,
  visible: true,
} as const;

describe('ProjectSchema', () => {
  it('parses a valid project and preserves its data', () => {
    const result = ProjectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Autopilot CRM');
      expect(result.data.order).toBe(1);
      expect(result.data.visible).toBe(true);
      expect(result.data.url).toBe('https://example.com/autopilot-crm');
    }
  });

  it('rejects a project missing a required field (name)', () => {
    const { name: _dropped, ...missingName } = validProject;
    const result = ProjectSchema.safeParse(missingName);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join('.'))).toContain('name');
    }
  });

  it('rejects a project whose order is not a number', () => {
    const result = ProjectSchema.safeParse({ ...validProject, order: '1' });
    expect(result.success).toBe(false);
  });

  it('rejects a project whose visible flag is not a boolean', () => {
    const result = ProjectSchema.safeParse({ ...validProject, visible: 'yes' });
    expect(result.success).toBe(false);
  });

  it('infers a Project type equal to the parsed output', () => {
    const parsed = ProjectSchema.parse(validProject);
    expectTypeOf(parsed).toEqualTypeOf<Project>();
    expect(parsed.id).toBe('proj_01');
  });
});