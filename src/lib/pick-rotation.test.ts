import { describe, expect, it } from 'vitest';
import { determineNextPicker, pickRotation, type RotationCandidate } from './pick-rotation';

const users: RotationCandidate[] = pickRotation.map((label) => ({
  id: label.toLowerCase(),
  name: `${label} Muster`,
  firstName: label,
  email: `${label.toLowerCase()}@example.com`,
}));

/** Events are stored newest first, so the helper takes the chronological order and reverses it. */
const history = (...pickedByUserIds: (string | null)[]) =>
  pickedByUserIds.map((pickedByUserId) => ({ pickedByUserId })).reverse();

describe('determineNextPicker', () => {
  it('starts at the top of the rotation without any events', () => {
    expect(determineNextPicker(users, [])).toMatchObject({ name: 'Nino', isMakeUpTurn: false });
  });

  it('returns the matched user', () => {
    expect(determineNextPicker(users, []).user?.id).toBe('nino');
  });

  it('follows the regular order', () => {
    expect(determineNextPicker(users, history('nino'))).toMatchObject({ name: 'Kevin', isMakeUpTurn: false });
    expect(determineNextPicker(users, history('nino', 'kevin'))).toMatchObject({ name: 'Marc', isMakeUpTurn: false });
  });

  it('wraps around after the last person', () => {
    const full = history('nino', 'kevin', 'marc', 'jan', 'adi', 'remo');

    expect(determineNextPicker(users, full)).toMatchObject({ name: 'Nino', isMakeUpTurn: false });
  });

  it('gives the turn back to whoever was passed over', () => {
    // Marc was next in line but Jan picked instead.
    const events = history('nino', 'kevin', 'jan');

    expect(determineNextPicker(users, events)).toMatchObject({ name: 'Marc', isMakeUpTurn: true });
  });

  it('continues the regular order after the make-up turn is taken', () => {
    // Marc was passed over, took his make-up turn afterwards - Jan already picked, so Adi is next.
    const events = history('nino', 'kevin', 'jan', 'marc');

    expect(determineNextPicker(users, events)).toMatchObject({ name: 'Adi', isMakeUpTurn: false });
  });

  it('drops the make-up turn when the same person is passed over twice', () => {
    // Marc was passed over by Jan and then by Adi - the regular order resumes with Remo.
    const events = history('nino', 'kevin', 'jan', 'adi');

    expect(determineNextPicker(users, events)).toMatchObject({ name: 'Remo', isMakeUpTurn: false });
  });

  it('does not stall on events without a recorded picker', () => {
    // Nobody was recorded for the third dinner, so Marc is owed and the regular order moves on to Jan.
    expect(determineNextPicker(users, history('nino', 'kevin', null))).toMatchObject({ name: 'Marc', isMakeUpTurn: true });
    expect(determineNextPicker(users, history('nino', 'kevin', null, null))).toMatchObject({
      name: 'Jan',
      isMakeUpTurn: false,
    });
  });

  it('treats a picker outside the rotation like an unknown picker', () => {
    const events = history('nino', 'kevin', 'guest');

    expect(determineNextPicker(users, events)).toMatchObject({ name: 'Marc', isMakeUpTurn: true });
  });

  it('still names the person when no user account matches the rotation label', () => {
    const withoutKevin = users.filter((user) => user.id !== 'kevin');

    expect(determineNextPicker(withoutKevin, history('nino'))).toMatchObject({
      name: 'Kevin',
      user: null,
      isMakeUpTurn: false,
    });
  });

  it('matches users by full name or email when the first name is missing', () => {
    const [nino, kevin] = users;
    const sparse: RotationCandidate[] = [
      { ...nino, firstName: null },
      { ...kevin, firstName: null, name: null },
    ];

    expect(determineNextPicker(sparse, []).user?.id).toBe('nino');
    expect(determineNextPicker(sparse, history('nino')).user?.id).toBe('kevin');
  });

  it('reads the event list newest first', () => {
    const newestFirst = [{ pickedByUserId: 'kevin' }, { pickedByUserId: 'nino' }];

    expect(determineNextPicker(users, newestFirst)).toMatchObject({ name: 'Marc', isMakeUpTurn: false });
  });
});
