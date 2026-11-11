import { NextResponse } from 'next/server';
import { getStockSummary, getAuditLogs, getConsumptionLogs } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const [summary, allAudit, allConsumption] = await Promise.all([
      getStockSummary(),
      getAuditLogs(),
      getConsumptionLogs(),
    ]);
    const recentAudit = allAudit.slice(0, 10);
    const recentConsumption = allConsumption.slice(0, 10);

    return NextResponse.json(
      {
        success: true,
        data: {
          summary,
          recentAudit,
          recentConsumption,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
          'Surrogate-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
