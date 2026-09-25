/**
 * "Normalized Order" - cau truc don hang CHUAN, dung chung cho moi nen tang.
 *
 *   Shopee/TikTok/Lazada API (that hoac mock)
 *        -> Integration Adapter (tra ve raw data theo format rieng cua san)
 *        -> normalizeOrder()  <-- BUOC NAY
 *        -> OrderService.importNormalizedOrder()
 *        -> Database
 *
 * Khi noi Shopee/TikTok/Lazada that vao, chi can viet 1 ham map(raw) rieng
 * cho tung san de ra dung shape ben duoi - KHONG phai sua OrderService hay
 * DashboardService.
 */
function normalizeOrder(raw) {
  return {
    externalOrderId: String(raw.externalOrderId),
    customer: {
      name: raw.customer?.name || 'Khach le',
      phone: raw.customer?.phone || null,
      email: raw.customer?.email || null,
      address: raw.customer?.address || null,
    },
    items: (raw.items || []).map((it) => ({
      externalProductId: it.externalProductId ? String(it.externalProductId) : null,
      productName: it.productName,
      sku: it.sku || null,
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice) || 0,
      totalPrice: Number(it.totalPrice ?? (it.quantity * it.unitPrice)) || 0,
    })),
    totalAmount: Number(raw.totalAmount) || 0,
    paymentStatus: raw.paymentStatus || 'unpaid',
    status: raw.status || 'new',
    shipment: raw.shipment
      ? {
          providerCode: raw.shipment.providerCode,
          trackingNumber: raw.shipment.trackingNumber,
          status: raw.shipment.status || 'pending',
        }
      : null,
    orderCreatedAt: raw.orderCreatedAt ? new Date(raw.orderCreatedAt) : new Date(),
  };
}

module.exports = { normalizeOrder };
