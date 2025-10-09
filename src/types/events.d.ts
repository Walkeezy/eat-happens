export interface Event {
  id: string;
  date: Date;
  restaurant: string;
  createdAt: Date;
  ratings?: Rating[];
  averageRating?: number;
  totalRatings?: number;
  assignments?: EventAssignment[];
  assignedUsers?: User[];
}

export interface Rating {
  id: string;
  userId: string;
  eventId: string;
  score: number;
  comment?: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface CreateEventData {
  restaurant: string;
  date: Date;
}

export interface UpdateEventData {
  restaurant?: string;
  date?: Date;
}

export interface CreateRatingData {
  eventId: string;
  score: number;
  comment?: string;
}

export interface UpdateRatingData {
  score?: number;
  comment?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  isAdmin: boolean;
  isConfirmed: boolean;
}

export interface EventAssignment {
  id: string;
  userId: string;
  eventId: string;
  createdAt: Date;
  assignedBy: string;
  user?: User;
  assignedByUser?: User;
}

export interface CreateAssignmentData {
  eventId: string;
  userId: string;
}

export interface AssignmentWithUsers extends EventAssignment {
  user: User;
  assignedByUser: User;
}
