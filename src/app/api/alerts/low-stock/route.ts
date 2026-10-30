import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const reels = await prisma.reel.findMany({
      where: {
        status: { in: ['IN_STOCK', 'PARTIAL'] },
      },
      orderBy: { balanceWeight: 'asc' },
    });

    // Filter reels where balance weight is 20% or less of inward weight
    const lowStockReels = reels
      .map((r) => {
        const percentage = r.weight > 0 ? Number(((r.balanceWeight / r.weight) * 100).toFixed(1)) : 0;
        return {
          id: r.id,
          reelNo: r.reelNo,
          millName: r.millName,
          sizeDesc: r.sizeDesc,
          gsm: r.gsm,
          bf: r.bf,
          weight: r.weight,
          usedWeight: r.usedWeight,
          balanceWeight: r.balanceWeight,
          balancePercentage: percentage,
          status: r.status,
          isLowStock: percentage <= 20,
        };
      })
      .filter((r) => r.isLowStock);

    const totalWeight = reels.reduce((acc, r) => acc + r.weight, 0);
    const balanceWeight = reels.reduce((acc, r) => acc + r.balanceWeight, 0);
    const overallBalancePercentage = totalWeight > 0 ? Number(((balanceWeight / totalWeight) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      success: true,
      notificationType: 'IN_APP',
      thresholdPercentage: 20,
      lowStockCount: lowStockReels.length,
      lowStockReels,
      overallStock: {
        totalInwardWeight: totalWeight,
        totalBalanceWeight: balanceWeight,
        overallBalancePercentage,
        isOverallLowStock: overallBalancePercentage <= 20,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const reelId = body.reelId;

    let targetReel;
    if (reelId) {
      targetReel = await prisma.reel.findFirst({
        where: { OR: [{ id: reelId }, { reelNo: reelId }] },
      });
      if (!targetReel) {
        return NextResponse.json({ success: false, error: `Reel #${reelId} not found` }, { status: 404 });
      }
    } else {
      // Find the first reel with lowest balance percentage
      const candidate = await prisma.reel.findFirst({
        where: { status: { in: ['IN_STOCK', 'PARTIAL'] } },
        orderBy: { balanceWeight: 'asc' },
      });
      targetReel = candidate;
    }

    if (!targetReel) {
      return NextResponse.json({ success: false, error: 'No active reels found' }, { status: 404 });
    }

    const balancePercentage = targetReel.weight > 0
      ? Number(((targetReel.balanceWeight / targetReel.weight) * 100).toFixed(1))
      : 0;

    const notificationPayload = {
      triggered: true,
      reelNo: targetReel.reelNo,
      millName: targetReel.millName,
      sizeDesc: targetReel.sizeDesc,
      gsm: targetReel.gsm,
      weight: targetReel.weight,
      balanceWeight: targetReel.balanceWeight,
      balancePercentage,
      message: `In-App Notification: Reel #${targetReel.reelNo} reached ${balancePercentage}% balance weight (${targetReel.balanceWeight} KG remaining)!`,
    };

    return NextResponse.json({
      success: true,
      data: {
        reelNo: targetReel.reelNo,
        balanceWeight: targetReel.balanceWeight,
        balancePercentage,
        notification: notificationPayload,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
