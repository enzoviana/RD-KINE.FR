import { describe, expect, it } from 'vitest';
import { cabinet, technologies } from '../lib/cabinet';
describe('Informations du cabinet fournies', () => {
 it('Hydrojet est accessible sans ordonnance', () => { expect(technologies.find(t => t.name === 'Hydrojet')?.withoutPrescription).toBe(true); });
 it('Stendo est accessible sans ordonnance', () => { expect(technologies.find(t => t.name === 'Stendo')?.withoutPrescription).toBe(true); });
 it('La gare RER C est à trois minutes à pied', () => { expect(cabinet.stationMinutes).toBe(3); });
 it('La Grande Rue est à une minute à pied', () => { expect(cabinet.mainStreetMinutes).toBe(1); });
});
