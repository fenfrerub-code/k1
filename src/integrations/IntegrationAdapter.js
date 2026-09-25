/**
 * Interface chung cho MOI adapter ket noi san/hang van chuyen.
 * ShopeeAdapter, TikTokShopAdapter, LazadaAdapter... sau nay deu phai
 * implement dung 4 phuong thuc nay va tra ve dung format "Normalized Order"
 * (xem normalizeOrder.js). Nho vay OrderService/DashboardService khong
 * bao gio phai biet cau truc du lieu rieng cua tung san.
 *
 * KHONG duoc goi truc tiep - chi de lam "hop dong" (contract) cho adapter con.
 */
class IntegrationAdapter {
  /** Tra ve danh sach shop co the ket noi tren nen tang nay. */
  async getShops(/* credentials */) {
    throw new Error('getShops() chua duoc implement');
  }

  /** Tra ve danh sach don hang THO (raw) cua 1 shop, chua chuan hoa. */
  async getOrders(/* shopExternalId, options */) {
    throw new Error('getOrders() chua duoc implement');
  }

  /** Tra ve danh sach san pham THO cua 1 shop. */
  async getProducts(/* shopExternalId, options */) {
    throw new Error('getProducts() chua duoc implement');
  }

  /** Dong bo toan bo: goi getOrders/getProducts va tra ve du lieu da san sang de normalize. */
  async sync(/* shop */) {
    throw new Error('sync() chua duoc implement');
  }
}

module.exports = IntegrationAdapter;
