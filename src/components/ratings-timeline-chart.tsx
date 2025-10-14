'use client';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/shadcn/chart';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

interface RatingsTimelineChartProps {
  data: { date: string; averageRating: number; count: number }[];
}

const chartConfig = {
  averageRating: {
    label: 'Durchschnittsbewertung',
    color: '#3b82f6',
  },
};

export function RatingsTimelineChart({ data }: RatingsTimelineChartProps) {
  if (data.length === 0) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Keine Daten verfügbar</div>;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={formatDate}
          interval={data.length > 10 ? Math.ceil(data.length / 8) : 0}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                return new Date(value).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                });
              }}
              formatter={(value, name, item) => {
                return (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className="font-bold">{Number(value).toFixed(2)}</span>
                      <span className="text-[0.70rem] text-muted-foreground">{item.payload.count} Bewertungen</span>
                    </div>
                  </div>
                );
              }}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="averageRating"
          stroke="var(--color-averageRating)"
          strokeWidth={2}
          dot={{
            fill: 'var(--color-averageRating)',
            r: 4,
          }}
          activeDot={{
            r: 6,
          }}
        />
      </LineChart>
    </ChartContainer>
  );
}
