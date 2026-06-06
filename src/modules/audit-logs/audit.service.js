import prisma from '../../config/db.js';

export const getAllAuditLogs = async () => {
  return prisma.auditLog.findMany({
    include: {
      user: { select: { id: true, name: true, role: true } },
    },
    orderBy: { timestamp: 'desc' },
  });
};

export const getDashboardAnalytics = async () => {
  const now = new Date();

  // 1. KPI Counts
  const activeRfqsCount = await prisma.rFQ.count({
    where: { status: 'PUBLISHED' },
  });

  const pendingApprovalsCount = await prisma.approvalWorkflow.count({
    where: {
      currentStep: { in: ['L1_PENDING', 'L2_PENDING'] },
    },
  });

  const overdueInvoicesCount = await prisma.invoice.count({
    where: {
      status: 'PENDING_PAYMENT',
      dueDate: { lt: now },
    },
  });

  const totalSpendAgg = await prisma.purchaseOrder.aggregate({
    _sum: { totalAmount: true },
  });
  const totalSpend = totalSpendAgg._sum.totalAmount || 0;

  // 2. Recent POs
  const recentPOs = await prisma.purchaseOrder.findMany({
    take: 5,
    include: {
      vendor: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // 3. Spend by Category
  const pos = await prisma.purchaseOrder.findMany({
    include: {
      rfq: { select: { category: true } },
    },
  });

  const categorySpendMap = {};
  pos.forEach((po) => {
    const category = po.rfq.category || 'Other';
    categorySpendMap[category] = (categorySpendMap[category] || 0) + po.totalAmount;
  });

  const spendByCategory = Object.keys(categorySpendMap).map((key) => ({
    category: key,
    amount: categorySpendMap[key],
  }));

  // 4. Top Vendors by Spend
  const vendorSpendMap = {};
  const vendorsMap = {};
  const vendorPoCountMap = {};

  const posWithVendor = await prisma.purchaseOrder.findMany({
    include: {
      vendor: { select: { id: true, name: true } },
    },
  });

  posWithVendor.forEach((po) => {
    const vId = po.vendor.id;
    vendorsMap[vId] = po.vendor.name;
    vendorSpendMap[vId] = (vendorSpendMap[vId] || 0) + po.totalAmount;
    vendorPoCountMap[vId] = (vendorPoCountMap[vId] || 0) + 1;
  });

  const topVendors = Object.keys(vendorSpendMap)
    .map((vId) => ({
      vendorId: parseInt(vId),
      name: vendorsMap[vId],
      spend: vendorSpendMap[vId],
      poCount: vendorPoCountMap[vId],
    }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);

  // 5. Monthly Spend Trend (Last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-indexed

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const spendAgg = await prisma.purchaseOrder.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: { totalAmount: true },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthlyTrend.push({
      month: `${monthNames[month]} ${year}`,
      spend: spendAgg._sum.totalAmount || 0,
    });
  }

  // Active Vendors count
  const activeVendorsCount = await prisma.vendor.count({
    where: { status: 'ACTIVE' },
  });

  // PO fulfillment percentage (Completed POs / Total POs)
  const totalPOs = await prisma.purchaseOrder.count();
  const completedPOs = await prisma.purchaseOrder.count({
    where: { status: 'COMPLETED' },
  });
  const poFulfillmentRate = totalPOs > 0 ? Math.round((completedPOs / totalPOs) * 100) : 0;

  return {
    kpis: {
      activeRfqsCount,
      pendingApprovalsCount,
      overdueInvoicesCount,
      totalSpend,
      activeVendorsCount,
      poFulfillmentRate,
    },
    recentPOs: recentPOs.map((po) => ({
      id: po.id,
      poNumber: po.poNumber,
      vendorName: po.vendor.name,
      amount: po.totalAmount,
      status: po.status,
    })),
    spendByCategory,
    topVendors,
    monthlyTrend,
  };
};
