import { z } from 'zod';

/**
 * What a server action hands back to its form.
 *
 * Expected failures (validation, authorization, "already rated") travel as a result instead of a thrown
 * error: in production Next replaces the message of an error thrown inside a server action with a
 * generic one, so a thrown German message would never reach the person who submitted the form.
 */
export type ActionResult = { success: true } | { success: false; error: string };

/** A failure with a message meant for the person using the app, as opposed to a bug or an outage. */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

/** Turns a caught error into a failed result; unexpected errors are logged and replaced by the fallback text. */
export function actionFailure(error: unknown, fallback: string): ActionResult {
  if (error instanceof AppError) {
    return { success: false, error: error.message };
  }
  if (error instanceof z.ZodError) {
    return { success: false, error: error.issues[0]?.message ?? fallback };
  }

  console.error(fallback, error);
  return { success: false, error: fallback };
}
