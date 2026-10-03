import { todayCalendarDate } from '@/lib/calendar-date';
import { buildRestaurantRows, type RestaurantRow } from '@/lib/restaurants';
import { displayName } from '@/lib/user';
import { getEvents } from '@/services/events';

export async function getRestaurantRows(currentUserId: string): Promise<RestaurantRow[]> {
  const events = await getEvents({ upToDate: todayCalendarDate(), currentUserId });

  return buildRestaurantRows(
    events.map((event) => ({
      id: event.id,
      date: event.date,
      restaurant: event.restaurant,
      totalCost: event.totalCost,
      pickerName: event.pickedByUser ? displayName(event.pickedByUser) : null,
      attendeeCount: event.assignedUsers?.length ?? 0,
      ratings: event.ratings ?? [],
    })),
  );
}
