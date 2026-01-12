const Order = require('../models/Order');

// Helper: Get IST date range for yesterday, this month, last month
const getISTDateRange = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istNow = new Date(now.getTime() + istOffset);

  // Yesterday
  const startOfYesterday = new Date(istNow);
  startOfYesterday.setDate(istNow.getDate() - 1);
  startOfYesterday.setHours(0, 0, 0, 0);
  const endOfYesterday = new Date(istNow);
  endOfYesterday.setHours(0, 0, 0, 0);

  // This month
  const startOfThisMonth = new Date(istNow);
  startOfThisMonth.setDate(1);
  startOfThisMonth.setHours(0, 0, 0, 0);

  // Last month
  const startOfLastMonth = new Date(istNow);
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1, 1);
  startOfLastMonth.setHours(0, 0, 0, 0);
  const endOfLastMonth = new Date(istNow);
  endOfLastMonth.setDate(0);
  endOfLastMonth.setHours(23, 59, 59, 999);

  return {
    yesterday: { start: startOfYesterday, end: endOfYesterday },
    thisMonth: { start: startOfThisMonth, end: istNow },
    lastMonth: { start: startOfLastMonth, end: endOfLastMonth },
  };
};

exports.getDashboardEarnings = async (req, res) => {
  try {
    const { yesterday, thisMonth, lastMonth } = getISTDateRange();

    // 1. Total Earned (all time)
    const totalEarned = await Order.aggregate([
      { $match: { paid: true } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$amount", "$quantity"] } } } }
    ]);

    // 2. Yesterday's Earnings
    const yesterdayEarnings = await Order.aggregate([
      {
        $match: {
          paid: true,
          trackedAt: { $gte: yesterday.start, $lt: yesterday.end }
        }
      },
      { $group: { _id: null, total: { $sum: { $multiply: ["$amount", "$quantity"] } } } }
    ]);

    // 3. This Month's Earnings
    const thisMonthEarnings = await Order.aggregate([
      {
        $match: {
          paid: true,
          trackedAt: { $gte: thisMonth.start, $lte: thisMonth.end }
        }
      },
      { $group: { _id: null, total: { $sum: { $multiply: ["$amount", "$quantity"] } } } }
    ]);

    // 4. Last Month's Earnings
    const lastMonthEarnings = await Order.aggregate([
      {
        $match: {
          paid: true,
          trackedAt: { $gte: lastMonth.start, $lte: lastMonth.end }
        }
      },
      { $group: { _id: null, total: { $sum: { $multiply: ["$amount", "$quantity"] } } } }
    ]);

    // 5. All-Time Sales Earnings (same as totalEarned)
    const allTimeSalesEarnings = totalEarned;

    res.json({
      success: true,
      data: {
        totalEarned: totalEarned[0]?.total || 0,
        yesterdayEarnings: yesterdayEarnings[0]?.total || 0,
        thisMonthEarnings: thisMonthEarnings[0]?.total || 0,
        lastMonthEarnings: lastMonthEarnings[0]?.total || 0,
        allTimeSalesEarnings: allTimeSalesEarnings[0]?.total || 0,
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

const getISTDateRangeForWeek = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() + istOffset);
    date.setDate(now.getDate() - i);
    date.setHours(0, 0, 0, 0);
    dates.push(date);
  }
  return dates;
};

exports.getWeeklySalesAndOrders = async (req, res) => {
  try {
    const dates = getISTDateRangeForWeek();
    const result = await Order.aggregate([
      {
        $match: {
          paid: true,
          trackedAt: { $gte: dates[0], $lte: dates[dates.length - 1] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$trackedAt", timezone: "Asia/Kolkata" } },
          sales: { $sum: { $multiply: ["$amount", "$quantity"] } },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          date: "$_id",
          sales: 1,
          orders: 1,
          _id: 0
        }
      }
    ]);

    // Fill in missing dates with 0
    const filledResult = dates.map((date) => {
      const dateStr = date.toISOString().split('T')[0];
      const found = result.find(item => item.date === dateStr);
      return {
        date: dateStr,
        sales: found ? found.sales : 0,
        orders: found ? found.orders : 0
      };
    });

    res.json({
      success: true,
      data: {
        sales: filledResult.map(item => ({ date: item.date, value: item.sales })),
        orders: filledResult.map(item => ({ date: item.date, value: item.orders }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
