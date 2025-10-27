/**
 * Determines whether ratings should be hidden based on the RATINGS_REVEAL_DATE environment variable.
 * @returns true if ratings should be hidden, false if they should be visible
 */
export function shouldHideRatings(): boolean {
  const revealDate = process.env.RATINGS_REVEAL_DATE;

  // If no reveal date is set, show ratings (default behavior)
  if (!revealDate) {
    return false;
  }

  try {
    const revealDateTime = new Date(revealDate);
    const now = new Date();

    // Hide ratings if current time is before reveal date
    return now < revealDateTime;
  } catch {
    // If date parsing fails, show ratings as fallback
    return false;
  }
}
