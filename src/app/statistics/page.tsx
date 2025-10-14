import { AppLayout } from '@/components/layout/app-layout';
import { RatingsTimelineChart } from '@/components/ratings-timeline-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { getStatistics } from '@/services/statistics';
import { Calendar, LineChart, Star, ThumbsDown, ThumbsUp, TrendingUp, Trophy, Users } from 'lucide-react';

export default async function StatisticsPage() {
  const stats = await getStatistics();

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Statistiken</h1>
      </div>

      {/* Overview Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Events</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">{stats.eventsThisYear} dieses Jahr</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Bewertungen</CardTitle>
            <Star className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRatings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalEvents > 0 ? (stats.totalRatings / stats.totalEvents).toFixed(1) : 0} pro Event
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durchschnittsbewertung</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(2)}</div>
              <Star className="size-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">Über alle Bewertungen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Benutzer</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registrierte Benutzer</p>
          </CardContent>
        </Card>
      </div>

      {/* Highlights */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-yellow-500" />
              <CardTitle>Best bewertet</CardTitle>
            </div>
            <CardDescription>Restaurant mit höchster Durchschnittsbewertung (mind. 3 Bewertungen)</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topRatedRestaurant ? (
              <div>
                <div className="text-xl font-bold">{stats.topRatedRestaurant.restaurant}</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-2xl font-bold text-yellow-600">
                    {stats.topRatedRestaurant.averageRating.toFixed(2)}
                  </span>
                  <Star className="size-5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Noch nicht genügend Bewertungen</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ThumbsUp className="size-5 text-green-500" />
              <CardTitle>Positivster Bewerter</CardTitle>
            </div>
            <CardDescription>Benutzer mit den höchsten Durchschnittsbewertungen (mind. 3 Bewertungen)</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.mostPositiveUser ? (
              <div>
                <div className="text-xl font-bold">{stats.mostPositiveUser.name}</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    {stats.mostPositiveUser.averageRating.toFixed(2)}
                  </span>
                  <Star className="size-5 fill-green-400 text-green-400" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{stats.mostPositiveUser.ratingCount} Bewertungen</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Noch nicht genügend Bewertungen</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ThumbsDown className="size-5 text-red-500" />
              <CardTitle>Kritischster Bewerter</CardTitle>
            </div>
            <CardDescription>Benutzer mit den niedrigsten Durchschnittsbewertungen (mind. 3 Bewertungen)</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.mostNegativeUser ? (
              <div>
                <div className="text-xl font-bold">{stats.mostNegativeUser.name}</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-2xl font-bold text-red-600">{stats.mostNegativeUser.averageRating.toFixed(2)}</span>
                  <Star className="size-5 text-red-400" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{stats.mostNegativeUser.ratingCount} Bewertungen</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Noch nicht genügend Bewertungen</p>
            )}
          </CardContent>
        </Card>

        {stats.worstRatedRestaurant && (
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground">Schlechteste Bewertung</CardTitle>
              <CardDescription>Restaurant mit niedrigster Durchschnittsbewertung (mind. 3 Bewertungen)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stats.worstRatedRestaurant.restaurant}</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-muted-foreground">
                  {stats.worstRatedRestaurant.averageRating.toFixed(2)}
                </span>
                <Star className="size-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ratings Timeline */}
      {stats.ratingsTimeline.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LineChart className="size-5 text-blue-500" />
              <CardTitle>Bewertungsverlauf</CardTitle>
            </div>
            <CardDescription>Durchschnittsbewertung im Zeitverlauf</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <RatingsTimelineChart data={stats.ratingsTimeline} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Bewertungsverteilung</CardTitle>
          <CardDescription>Verteilung der Bewertungen nach Sternen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.ratingDistribution.map(({ score, count }) => {
              const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;

              return (
                <div key={score} className="flex items-center gap-4">
                  <div className="flex w-20 items-center gap-1">
                    <span className="font-medium">{score}</span>
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="h-6 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-yellow-400 transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm text-muted-foreground">
                    {count} ({percentage.toFixed(1)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
