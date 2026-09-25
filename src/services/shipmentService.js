const shipmentRepository = require('../repositories/shipmentRepository');
const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

async function listShipments(db, userId, query) {
  const pagination = parsePagination(query);
  const { rows, total } = await shipmentRepository.findAllByUser(db, userId, pagination);
  return { data: rows, pagination: buildPaginationMeta(pagination, total) };
}

async function getShipment(db, userId, shipmentId) {
  const shipment = await shipmentRepository.findById(db, userId, shipmentId);
  if (!shipment) throw AppError.notFound('Khong tim thay thong tin van chuyen');
  return shipment;
}

module.exports = { listShipments, getShipment };
