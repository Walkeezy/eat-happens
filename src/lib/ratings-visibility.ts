export function shouldHideRatings(eventDate: Date | string): boolean {
  try {
    const eventDateTime = new Date(eventDate);
    const eventYear = eventDateTime.getFullYear();
    const currentYear = new Date().getFullYear();

    // Hide ratings if event is in the current year
    return eventYear === currentYear;
  } catch {
    // If date parsing fails, show ratings as fallback
    return false;
  }
}
