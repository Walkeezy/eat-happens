import { UtensilsCrossed } from 'lucide-react';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        <UtensilsCrossed />
      </div>
    ),
    {
      width: 512,
      height: 512,
    },
  );
}
