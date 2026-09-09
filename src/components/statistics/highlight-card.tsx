import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';

export function HighlightCard({ title, name, detail }: { title: string; name: string; detail: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-xl">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
