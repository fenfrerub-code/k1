async function findByOrder(db, orderId) {
  const { rows } = await db.query(
    'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC',
    [orderId]
  );
  return rows;
}

async function createMany(db, userId, orderId, items) {
  const inserted = [];
  for (const item of items) {
    const totalPrice = item.totalPrice ?? item.quantity * item.unitPrice;
    const { rows } = await db.query(
      `INSERT INTO order_items
         (order_id, user_id, product_id, external_product_id, product_name, sku, quantity, unit_price, total_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [orderId, userId, item.productId || null, item.externalProductId || null,
        item.productName, item.sku || null, item.quantity, item.unitPrice, totalPrice]
    );
    inserted.push(rows[0]);
  }
  return inserted;
}

module.exports = { findByOrder, createMany };
