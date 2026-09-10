import { formatCurrency } from './format';
import {
  type CategoryScoreKey,
  computePickerBias,
  eventOverall,
  mean,
  median,
  type RatingScores,
  ratingOverall,
  scoreAverage,
  scoreRange,
} from './scores';

/**
 * A picker needs at least this many picks before they can win the "Bester Picker" award.
 * Without it a single lucky 5.0 outranks a whole year of consistently good choices.
 */
const MIN_PICKS_FOR_AWARD = 2;

/** How many entries the "most controversial" list shows. */
const DISAGREEMENT_LIMIT = 5;

/** How many entries the personal and group top lists show. */
const TOP_LIST_LIMIT = 5;

export type StatisticsRating = RatingScores & {
  userId: string;
  raterName?: string | null;
};

export type StatisticsEvent = {
  id: string;
  date: string;
  restaurant: string;
  totalCost: string | null;
  pickedByUserId: string | null;
  pickerName: string | null;
  ratings: StatisticsRating[];
  assignedUserIds: string[];
};

export type StatisticsPerson = {
  id: string;
  name: string;
  createdOn: string;
};

export type RankedRestaurant = {
  id: string;
  restaurant: string;
  average: number;
  ratingCount: number;
};

export type EventCostRow = {
  id: string;
  restaurant: string;
  totalCost: string | null;
  attendeeCount: number;
  costPerPerson: number | null;
};

export type CostVsPriceRow = {
  id: string;
  restaurant: string;
  costPerPerson: number;
  pricePerformance: number;
};

export type YearTotals = {
  totalSpend: number | null;
  averageCostPerPerson: number | null;
  mostExpensive: EventCostRow | null;
  leastExpensive: EventCostRow | null;
};

export type NamedStat = {
  userId: string;
  name: string;
};

export type RaterStat = NamedStat & {
  averageGiven: number;
  ratingCount: number;
  eligible: number;
};

export type AttendanceStat = NamedStat & {
  attended: number;
  eligible: number;
  rate: number;
};

export type CompletionStat = NamedStat & {
  assigned: number;
  rated: number;
  open: number;
};

export type PickCountStat = NamedStat & {
  pickCount: number;
};

export type PickerBiasStat = NamedStat & {
  pickCount: number;
  groupAverage: number;
  ownAverage: number | undefined;
  delta: number | undefined;
};

export type DisagreementStat = {
  id: string;
  restaurant: string;
  spread: number;
  min: number;
  max: number;
  ratingCount: number;
};

export type TopRestaurant = {
  id: string;
  restaurant: string;
  score: number;
};

type RevealHighlight = {
  key: string;
  title: string;
  name: string;
  detail: string;
};

/**
 * Every section is optional and stays undefined whenever there is nothing to show for the year,
 * so the statistics pages can hide it instead of rendering an empty table or a row of dashes.
 */
export type YearStatistics = {
  isClosed: boolean;
  costs?: EventCostRow[];
  yearTotals?: YearTotals;
  attendance?: AttendanceStat[];
  completion?: CompletionStat[];
  pickCounts?: PickCountStat[];
  personalTop5?: TopRestaurant[];
  overallRanking?: RankedRestaurant[];
  categoryRankings?: {
    food?: RankedRestaurant[];
    ambience?: RankedRestaurant[];
    pricePerformance?: RankedRestaurant[];
  };
  costVsPricePerformance?: {
    rows: CostVsPriceRow[];
    expensiveAndGood: CostVsPriceRow | null;
    cheapAndDisappointing: CostVsPriceRow | null;
  };
  raters?: RaterStat[];
  pickerBias?: PickerBiasStat[];
  disagreement?: DisagreementStat[];
  groupTop5?: TopRestaurant[];
};

/** Drops a section that ended up without a single row. */
function nonEmpty<T>(rows: T[]): T[] | undefined {
  return rows.length > 0 ? rows : undefined;
}

function compareRanked(a: RankedRestaurant, b: RankedRestaurant) {
  return b.average - a.average || b.ratingCount - a.ratingCount || a.restaurant.localeCompare(b.restaurant);
}

function costPerPerson(totalCost: string | null, attendeeCount: number): number | null {
  if (totalCost === null || attendeeCount === 0) {
    return null;
  }

  const amount = Number(totalCost);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return amount / attendeeCount;
}

function rankedByCategory(events: StatisticsEvent[], field: CategoryScoreKey): RankedRestaurant[] {
  return events
    .map((event) => {
      const average = scoreAverage(event.ratings, field);
      if (average === undefined) {
        return null;
      }

      return {
        id: event.id,
        restaurant: event.restaurant,
        average,
        ratingCount: event.ratings.filter((rating) => rating[field] !== null).length,
      };
    })
    .filter((row): row is RankedRestaurant => row !== null)
    .sort(compareRanked);
}

function rankedOverall(events: StatisticsEvent[]): RankedRestaurant[] {
  return events
    .map((event) => {
      const average = eventOverall(event.ratings);
      if (average === undefined) {
        return null;
      }

      return {
        id: event.id,
        restaurant: event.restaurant,
        average,
        ratingCount: event.ratings.filter((rating) => ratingOverall(rating) !== null).length,
      };
    })
    .filter((row): row is RankedRestaurant => row !== null)
    .sort(compareRanked);
}

function buildCosts(events: StatisticsEvent[]): EventCostRow[] {
  return events
    .map((event) => {
      const attendeeCount = event.assignedUserIds.length;
      return {
        id: event.id,
        restaurant: event.restaurant,
        totalCost: event.totalCost,
        attendeeCount,
        costPerPerson: costPerPerson(event.totalCost, attendeeCount),
      };
    })
    .sort((a, b) => {
      if (a.costPerPerson === null && b.costPerPerson === null) {
        return a.restaurant.localeCompare(b.restaurant);
      }
      if (a.costPerPerson === null) {
        return 1;
      }
      if (b.costPerPerson === null) {
        return -1;
      }

      return b.costPerPerson - a.costPerPerson;
    });
}

function buildYearTotals(costs: EventCostRow[]): YearTotals | undefined {
  const priced = costs.filter((row): row is EventCostRow & { costPerPerson: number } => row.costPerPerson !== null);
  const spendValues = costs
    .map((row) => (row.totalCost === null ? null : Number(row.totalCost)))
    .filter((value): value is number => value !== null && Number.isFinite(value));

  if (spendValues.length === 0) {
    return undefined;
  }

  return {
    totalSpend: spendValues.reduce((sum, value) => sum + value, 0),
    averageCostPerPerson: mean(priced.map((row) => row.costPerPerson)) ?? null,
    mostExpensive: priced[0] ?? null,
    leastExpensive: priced.length > 0 ? priced[priced.length - 1] : null,
  };
}

function buildCostVsPrice(events: StatisticsEvent[]) {
  const rows: CostVsPriceRow[] = events
    .map((event) => {
      const perPerson = costPerPerson(event.totalCost, event.assignedUserIds.length);
      const pricePerformance = scoreAverage(event.ratings, 'pricePerformanceScore');
      if (perPerson === null || pricePerformance === undefined) {
        return null;
      }

      return {
        id: event.id,
        restaurant: event.restaurant,
        costPerPerson: perPerson,
        pricePerformance,
      };
    })
    .filter((row): row is CostVsPriceRow => row !== null)
    .sort((a, b) => b.pricePerformance - a.pricePerformance || a.costPerPerson - b.costPerPerson);

  if (rows.length === 0) {
    return undefined;
  }

  const costMedian = median(rows.map((row) => row.costPerPerson));
  const expensive = costMedian === undefined ? [] : rows.filter((row) => row.costPerPerson > costMedian);
  const cheap = costMedian === undefined ? [] : rows.filter((row) => row.costPerPerson < costMedian);

  return {
    rows,
    expensiveAndGood: [...expensive].sort((a, b) => b.pricePerformance - a.pricePerformance)[0] ?? null,
    cheapAndDisappointing: [...cheap].sort((a, b) => a.pricePerformance - b.pricePerformance)[0] ?? null,
  };
}

/**
 * The dinners someone could have been part of, as far as the data can tell.
 *
 * The account creation date on its own is misleading: the dinner history is older than the app,
 * so every imported dinner lands before the signup of the very people who sat at the table and
 * would drop out of their quota - a year with a dozen dinners then reads as "2 / 2" for everyone.
 * Whatever came first, the account or their first recorded dinner, is the honest starting point.
 */
function eligibleEventsFor(userId: string, createdOn: string | undefined, events: StatisticsEvent[]): StatisticsEvent[] {
  const appearances = events
    .filter((event) => event.assignedUserIds.includes(userId) || event.ratings.some((rating) => rating.userId === userId))
    .map((event) => event.date);
  const candidates = createdOn === undefined ? appearances : [createdOn, ...appearances];
  if (candidates.length === 0) {
    return [];
  }

  const joinedOn = candidates.reduce((earliest, date) => (date < earliest ? date : earliest));

  return events.filter((event) => event.date >= joinedOn);
}

function formatScore(value: number): string {
  return value.toFixed(1);
}

export function buildYearStatistics(input: {
  isClosed: boolean;
  events: StatisticsEvent[];
  people: StatisticsPerson[];
  currentUserId: string;
}): YearStatistics {
  const { isClosed, events, people, currentUserId } = input;
  const names = new Map(people.map((person) => [person.id, person.name]));
  for (const event of events) {
    if (event.pickedByUserId && event.pickerName && !names.has(event.pickedByUserId)) {
      names.set(event.pickedByUserId, event.pickerName);
    }
    for (const rating of event.ratings) {
      if (rating.raterName && !names.has(rating.userId)) {
        names.set(rating.userId, rating.raterName);
      }
    }
  }

  const nameOf = (userId: string) => names.get(userId) ?? 'Unbekannt';
  const createdOnById = new Map(people.map((person) => [person.id, person.createdOn]));

  const costs = buildCosts(events);
  const personalTop5: TopRestaurant[] = events
    .map((event) => {
      const rating = event.ratings.find((item) => item.userId === currentUserId);
      if (!rating) {
        return null;
      }
      const score = ratingOverall(rating);
      if (score === null) {
        return null;
      }

      return { id: event.id, restaurant: event.restaurant, score };
    })
    .filter((row): row is TopRestaurant => row !== null)
    .sort((a, b) => b.score - a.score || a.restaurant.localeCompare(b.restaurant))
    .slice(0, TOP_LIST_LIMIT);

  const attendance: AttendanceStat[] = people
    .map((person) => {
      const eligibleEvents = eligibleEventsFor(person.id, person.createdOn, events);
      const attended = eligibleEvents.filter((event) => event.assignedUserIds.includes(person.id)).length;
      const eligible = eligibleEvents.length;
      if (eligible === 0) {
        return null;
      }

      return {
        userId: person.id,
        name: person.name,
        attended,
        eligible,
        rate: attended / eligible,
      };
    })
    .filter((row): row is AttendanceStat => row !== null)
    .sort((a, b) => b.rate - a.rate || b.attended - a.attended || a.name.localeCompare(b.name));

  const completion: CompletionStat[] = people
    .map((person) => {
      const assignedEvents = events.filter((event) => event.assignedUserIds.includes(person.id));
      if (assignedEvents.length === 0) {
        return null;
      }
      const rated = assignedEvents.filter((event) => event.ratings.some((rating) => rating.userId === person.id)).length;

      return {
        userId: person.id,
        name: person.name,
        assigned: assignedEvents.length,
        rated,
        open: assignedEvents.length - rated,
      };
    })
    .filter((row): row is CompletionStat => row !== null)
    .sort((a, b) => b.open - a.open || a.name.localeCompare(b.name));

  const pickCountMap = new Map<string, number>();
  for (const event of events) {
    if (!event.pickedByUserId) {
      continue;
    }
    pickCountMap.set(event.pickedByUserId, (pickCountMap.get(event.pickedByUserId) ?? 0) + 1);
  }

  const pickCounts: PickCountStat[] = [...pickCountMap.entries()]
    .map(([userId, pickCount]) => ({ userId, name: nameOf(userId), pickCount }))
    .sort((a, b) => b.pickCount - a.pickCount || a.name.localeCompare(b.name));

  const yearTotals = buildYearTotals(costs);
  const base: YearStatistics = {
    isClosed,
    // The cost table is nothing but dashes until at least one dinner has a recorded cost.
    costs: yearTotals ? costs : undefined,
    yearTotals,
    attendance: nonEmpty(attendance),
    completion: nonEmpty(completion),
    pickCounts: nonEmpty(pickCounts),
    personalTop5: nonEmpty(personalTop5),
  };

  if (!isClosed) {
    return base;
  }

  const overallRanking = rankedOverall(events);
  const pickerPicks = events.flatMap((event) => {
    if (!event.pickedByUserId) {
      return [];
    }
    const group = eventOverall(event.ratings);
    if (group === undefined) {
      return [];
    }
    const pickerRating = event.ratings.find((rating) => rating.userId === event.pickedByUserId);

    return [
      {
        pickerId: event.pickedByUserId,
        groupOverall: group,
        pickerOverall: pickerRating ? ratingOverall(pickerRating) : null,
      },
    ];
  });

  const categoryRankings = {
    food: nonEmpty(rankedByCategory(events, 'foodScore')),
    ambience: nonEmpty(rankedByCategory(events, 'ambienceScore')),
    pricePerformance: nonEmpty(rankedByCategory(events, 'pricePerformanceScore')),
  };

  const raters: RaterStat[] = [...new Set(events.flatMap((event) => event.ratings.map((rating) => rating.userId)))]
    .map((userId) => {
      const scores = events.flatMap((event) => {
        const rating = event.ratings.find((item) => item.userId === userId);
        if (!rating) {
          return [];
        }
        const overall = ratingOverall(rating);
        return overall === null ? [] : [overall];
      });
      const averageGiven = mean(scores);
      if (averageGiven === undefined) {
        return null;
      }

      return {
        userId,
        name: nameOf(userId),
        averageGiven,
        ratingCount: scores.length,
        eligible: eligibleEventsFor(userId, createdOnById.get(userId), events).length,
      };
    })
    .filter((row): row is RaterStat => row !== null)
    .sort((a, b) => b.averageGiven - a.averageGiven || a.name.localeCompare(b.name));

  const disagreement: DisagreementStat[] = events
    .map((event) => {
      const range = scoreRange(event.ratings);
      if (!range) {
        return null;
      }

      return {
        id: event.id,
        restaurant: event.restaurant,
        ...range,
        ratingCount: event.ratings.filter((rating) => ratingOverall(rating) !== null).length,
      };
    })
    .filter((row): row is DisagreementStat => row !== null)
    .sort((a, b) => b.spread - a.spread || a.restaurant.localeCompare(b.restaurant))
    .slice(0, DISAGREEMENT_LIMIT);

  const pickerBias: PickerBiasStat[] = computePickerBias(pickerPicks).map((row) => ({
    ...row,
    userId: row.pickerId,
    name: nameOf(row.pickerId),
  }));

  const groupTop5: TopRestaurant[] = overallRanking.slice(0, TOP_LIST_LIMIT).map((row) => ({
    id: row.id,
    restaurant: row.restaurant,
    score: row.average,
  }));

  return {
    ...base,
    overallRanking: nonEmpty(overallRanking),
    categoryRankings: Object.values(categoryRankings).some((ranking) => ranking !== undefined)
      ? categoryRankings
      : undefined,
    costVsPricePerformance: buildCostVsPrice(events),
    raters: nonEmpty(raters),
    pickerBias: nonEmpty(pickerBias),
    disagreement: nonEmpty(disagreement),
    groupTop5: nonEmpty(groupTop5),
  };
}

/** Whether the year has anything at all to show, so the pages can fall back to an empty state. */
export function hasYearStatisticsData(stats: YearStatistics): boolean {
  return Object.entries(stats).some(([section, value]) => section !== 'isClosed' && value !== undefined);
}

export function buildRevealHighlights(stats: YearStatistics): RevealHighlight[] {
  if (!stats.isClosed) {
    return [];
  }

  const highlights: RevealHighlight[] = [];
  const winner = stats.overallRanking?.[0];
  const flop = stats.overallRanking?.at(-1);
  const controversial = stats.disagreement?.[0];
  const bestPicker = stats.pickerBias?.find((row) => row.pickCount >= MIN_PICKS_FOR_AWARD) ?? stats.pickerBias?.[0];

  if (winner) {
    highlights.push({
      key: 'winner',
      title: 'Gewinner',
      name: winner.restaurant,
      detail: `${formatScore(winner.average)} Sterne`,
    });
  }

  if (flop && flop.id !== winner?.id) {
    highlights.push({
      key: 'flop',
      title: 'Grösster Flop',
      name: flop.restaurant,
      detail: `${formatScore(flop.average)} Sterne`,
    });
  }

  if (stats.yearTotals?.mostExpensive) {
    highlights.push({
      key: 'expensive',
      title: 'Teuerster Abend',
      name: stats.yearTotals.mostExpensive.restaurant,
      detail: `${formatCurrency(stats.yearTotals.mostExpensive.costPerPerson)} / Person`,
    });
  }

  if (controversial) {
    highlights.push({
      key: 'controversial',
      title: 'Umstrittenster Abend',
      name: controversial.restaurant,
      detail: `Spannweite ${formatScore(controversial.spread)} (${formatScore(controversial.min)}–${formatScore(controversial.max)})`,
    });
  }

  if (bestPicker) {
    highlights.push({
      key: 'picker',
      title: 'Bester Picker',
      name: bestPicker.name,
      detail: `Gruppe Ø ${formatScore(bestPicker.groupAverage)} · ${bestPicker.pickCount} ${bestPicker.pickCount === 1 ? 'Auswahl' : 'Auswählen'}`,
    });
  }

  return highlights;
}

export function categoryWinnerHighlights(stats: YearStatistics): RevealHighlight[] {
  if (!stats.categoryRankings) {
    return [];
  }

  const winners: Array<{ key: string; title: string; ranking?: RankedRestaurant[] }> = [
    { key: 'food', title: 'Bestes Essen', ranking: stats.categoryRankings.food },
    { key: 'ambience', title: 'Bestes Ambiente', ranking: stats.categoryRankings.ambience },
    { key: 'price', title: 'Beste Preis-Leistung', ranking: stats.categoryRankings.pricePerformance },
  ];

  return winners.flatMap(({ key, title, ranking }) => {
    const winner = ranking?.[0];
    if (!winner) {
      return [];
    }

    return [
      {
        key,
        title,
        name: winner.restaurant,
        detail: `${formatScore(winner.average)} Sterne`,
      },
    ];
  });
}
