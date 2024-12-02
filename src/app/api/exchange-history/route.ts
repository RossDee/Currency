import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get('currency');

  if (!currency) {
    return NextResponse.json({ error: 'Currency parameter is required' }, { status: 400 });
  }

  try {
    const history = await prisma.exchangeRateHistory.findMany({
      where: {
        currency: currency,
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching exchange rate history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { currency, buyingRate, sellingRate, middleRate } = data;

    const history = await prisma.exchangeRateHistory.create({
      data: {
        currency,
        buyingRate,
        sellingRate,
        middleRate,
        timestamp: new Date(),
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error saving exchange rate history:', error);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}
