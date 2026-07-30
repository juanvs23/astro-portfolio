import { describe, it, expect } from 'vitest';
import { getSectionButtonDefs } from './section-buttons';

describe('getSectionButtonDefs', () => {
  it('should define exactly 6 section buttons', () => {
    const defs = getSectionButtonDefs();
    expect(defs).toHaveLength(6);
  });

  it('should order buttons matching nav bar: About, Skills, Services, Works, Projects, Contact', () => {
    const defs = getSectionButtonDefs();
    const keys = defs.map((d) => d.key);
    expect(keys).toEqual([
      'menu.about',
      'menu.skills',
      'menu.services',
      'menu.works',
      'menu.projects',
      'menu.contact',
    ]);
  });

  it('should have valid path segments (no slashes, non-empty) for all buttons', () => {
    const defs = getSectionButtonDefs();
    for (const def of defs) {
      expect(def.path).toBeTruthy();
      expect(def.path).not.toContain('/');
    }
  });

  it('should have Servicios button (key=menu.services) with path=services', () => {
    const defs = getSectionButtonDefs();
    const serviciosDef = defs.find((d) => d.key === 'menu.services');
    expect(serviciosDef).toBeDefined();
    expect(serviciosDef!.path).toBe('services');
  });

  it('should have valid SVG icons (contain <svg> tag) for all buttons', () => {
    const defs = getSectionButtonDefs();
    for (const def of defs) {
      expect(def.icon).toContain('<svg');
      expect(def.icon).toContain('</svg>');
    }
  });

  it('should have non-empty icon and key for every button', () => {
    const defs = getSectionButtonDefs();
    for (const def of defs) {
      expect(def.key).toBeTruthy();
      expect(def.icon).toBeTruthy();
    }
  });

  it('should match existing About button: icon uses user SVG, path is about', () => {
    const defs = getSectionButtonDefs();
    const aboutDef = defs.find((d) => d.key === 'menu.about');
    expect(aboutDef).toBeDefined();
    expect(aboutDef!.path).toBe('about');
    expect(aboutDef!.icon).toContain('circle cx="12" cy="7"');
  });

  it('should match existing Projects button: icon uses grid rectangles, path is projects', () => {
    const defs = getSectionButtonDefs();
    const projectsDef = defs.find((d) => d.key === 'menu.projects');
    expect(projectsDef).toBeDefined();
    expect(projectsDef!.path).toBe('projects');
    expect(projectsDef!.icon).toContain('width="7" height="9"');
  });

  it('should have valid position keys for all 6 buttons (star shape + center)', () => {
    const defs = getSectionButtonDefs();
    const validPositions = ['top', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'];
    for (const def of defs) {
      expect(def.position).toBeTruthy();
      expect(validPositions).toContain(def.position);
    }
  });

  it('should have Servicios at center, 5 star points around it', () => {
    const defs = getSectionButtonDefs();
    const servicesDef = defs.find((d) => d.key === 'menu.services');
    expect(servicesDef!.position).toBe('center');
    const starPoints = defs.filter((d) => d.key !== 'menu.services');
    expect(starPoints).toHaveLength(5);
    const starPositions = starPoints.map((d) => d.position);
    expect(starPositions).not.toContain('center');
  });
});
