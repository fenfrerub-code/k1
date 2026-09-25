// Cac query o day deu dung COUNT/SUM/GROUP BY ngay trong Postgres (khong
// keo du lieu ve roi tinh bang JS) de tan dung index va khong bi cham khi
// so luong don hang lon.

async function summary(db, userId, { dateFrom, dateTo }) {
  const params = [userId, dateFrom, dateTo];
  const { rows } = await db.query(
    `SELECT
        count(*)::int AS total_orders,
        count(*) FILTER (WHERE status = 'new')::int AS new_orders,
        count(*) FILTER (WHERE status IN ('pending','confirmed','picked_up'))::int AS pending_orders,
        count(*) FILTER (WHERE status IN ('shipping','out_for_delivery'))::int AS shipping_orders,
        count(*) FILTER (WHERE status = 'delivered')::int AS delivered_orders,
        count(*) FILTER (WHERE status = 'cancelled')::int AS cancelled_orders,
        count(*) FILTER (WHERE status = 'returned')::int AS returned_orders,
        COALESCE(sum(total_amount), 0)::numeric AS total_order_value
     FROM orders
     WHERE user_id = $1 AND order_created_at BETWEEN $2 AND $3`,
    params
  );
  return rows[0];
}

async function byPlatform(db, userId, { dateFrom, dateTo }) {
  const { rows } = await db.query(
    `SELECT pl.code AS platform, pl.name AS platform_name,
            count(*)::int AS orders,
            count(*) FILTER (WHERE o.status = 'delivered')::int AS delivered,
            count(*) FILTER (WHERE o.status IN ('shipping','out_for_delivery'))::int AS shipping,
            COALESCE(sum(o.total_amount), 0)::numeric AS total_value
     FROM orders o JOIN platforms pl ON pl.id = o.platform_id
     WHERE o.user_id = $1 AND o.order_created_at BETWEEN $2 AND $3
     GROUP BY pl.code, pl.name
     ORDER BY orders DESC`,
    [userId, dateFrom, dateTo]
  );
  return rows;
}

const BUCKET_TRUNC = { day: 'day', week: 'week', month: 'month' };

async function ordersOverTime(db, userId, { dateFrom, dateTo, granularity }) {
  const trunc = BUCKET_TRUNC[granularity] || 'day';
  const { rows } = await db.query(
    `SELECT date_trunc('${trunc}', order_created_at) AS bucket,
            count(*)::int AS orders,
            COALESCE(sum(total_amount), 0)::numeric AS total_value
     FROM orders
     WHERE user_id = $1 AND order_created_at BETWEEN $2 AND $3
     GROUP BY bucket
     ORDER BY bucket ASC`,
    [userId, dateFrom, dateTo]
  );
  return rows;
}

module.exports = { summary, byPlatform, ordersOverTime };
