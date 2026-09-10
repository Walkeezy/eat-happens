/**
 * The group picks restaurants in a fixed rotation. The order lives here as first names because there is no
 * rotation data in the database - people are created by Google OAuth sign-in, so the labels below are matched
 * against the first name, the first token of the full name, or the email local part of a confirmed user.
 * If someone signs in with a name that does not match (e.g. "Antonino" instead of "Nino"), adjust the label here.
 */
export const pickRotation = ['Nino', 'Kevin', 'Marc', 'Jan', 'Adrian', 'Remo'] as const;

export type RotationCandidate = {
  id: string;
  name: string | null;
  firstName: string | null;
  email: string;
  image?: string | null;
};

export type NextPicker = {
  /** The rotation label. Always set, even when no user could be matched to it. */
  name: string;
  /** The matched user, or null when nobody in the group carries that name. */
  user: RotationCandidate | null;
  /** True when this turn is owed because the person was passed over in the previous round. */
  isMakeUpTurn: boolean;
};

type PickedEvent = { pickedByUserId: string | null };

const normalize = (value: string | null | undefined) => value?.trim().toLowerCase() ?? '';

function matchesLabel(user: RotationCandidate, label: string): boolean {
  const candidates = [normalize(user.firstName), normalize(user.name).split(/\s+/)[0], normalize(user.email).split('@')[0]];

  return candidates.includes(normalize(label));
}

/** Resolves every rotation label to a user, index-aligned with `pickRotation`. Unmatched labels stay null. */
function resolveRotationSlots(users: RotationCandidate[]): (RotationCandidate | null)[] {
  return pickRotation.map((label) => users.find((user) => matchesLabel(user, label)) ?? null);
}

/**
 * Derives whose turn it is from the picker history.
 *
 * The regular order is `pickRotation`. When the person whose turn it was got passed over, they are owed the
 * next turn ("make-up turn"). If they are passed over a second time, that debt is dropped and the regular
 * order continues. Because the regular cursor resyncs to whoever actually picked, only the last one or two
 * events influence the result - older, messier history is self-correcting.
 */
export function determineNextPicker(users: RotationCandidate[], eventsNewestFirst: PickedEvent[]): NextPicker {
  const slots = resolveRotationSlots(users);
  const size = pickRotation.length;

  let cursor = 0;
  let owed: number | null = null;

  for (const event of [...eventsNewestFirst].reverse()) {
    const pickerIndex = event.pickedByUserId ? slots.findIndex((slot) => slot?.id === event.pickedByUserId) : -1;
    const expected: number = owed ?? cursor;

    if (pickerIndex === expected) {
      if (owed === null) {
        cursor = (cursor + 1) % size;
      } else {
        // The make-up turn was taken - the regular order picks up where it left off.
        owed = null;
      }

      continue;
    }

    // Someone other than the expected person picked. They are owed a turn unless they already were,
    // in which case the debt is dropped and the regular order simply continues.
    owed = owed === null ? expected : null;
    // An unknown picker (no picker recorded, or someone outside the rotation) must not stall the rotation,
    // so the regular order advances past the person who was passed over instead.
    cursor = (pickerIndex === -1 ? expected + 1 : pickerIndex + 1) % size;
  }

  const index = owed ?? cursor;

  return {
    name: pickRotation[index],
    user: slots[index],
    isMakeUpTurn: owed !== null,
  };
}
