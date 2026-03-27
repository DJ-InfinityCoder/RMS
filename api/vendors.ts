import { ExpoRequest, ExpoResponse } from 'expo-router/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: ExpoRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || "";

  try {
    let vendors;
    
    if (search) {
      // Prisma doesn't natively support case-insensitive scalar array search easily without raw SQL
      // For this demo/implementation, we'll fetch then filter if array match is needed or use simple name search
      vendors = await prisma.vendor.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            // For Postgres scalar arrays, we might use a raw query if performance was critical,
            // but for 10-100 vendors, filtering in memory is fine or just using name search is enough.
          ],
        },
        orderBy: { critic_score: 'desc' },
      });
    } else {
      vendors = await prisma.vendor.findMany({
        orderBy: { critic_score: 'desc' },
      });
    }

    return Response.json({ success: true, data: vendors });
  } catch (error: any) {
    console.error('API Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
