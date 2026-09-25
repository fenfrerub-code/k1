const customerRepository = require('../repositories/customerRepository');
const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

async function listCustomers(db, userId, query) {
  return customerRepository.findAllByUser(db, userId, { search: query.search });
}

async function getCustomer(db, userId, customerId) {
  const customer = await customerRepository.findById(db, userId, customerId);
  if (!customer) throw AppError.notFound('Khong tim thay khach hang');
  return customer;
}

async function getCustomerOrders(db, userId, customerId, query) {
  await getCustomer(db, userId, customerId); // dam bao customer thuoc user nay
  const pagination = parsePagination(query);
  const { rows, total } = await customerRepository.findOrdersByCustomer(db, userId, customerId, pagination);
  return { data: rows, pagination: buildPaginationMeta(pagination, total) };
}

async function createCustomer(db, userId, payload) {
  return customerRepository.create(db, userId, payload);
}

async function updateCustomer(db, userId, customerId, payload) {
  const updated = await customerRepository.update(db, userId, customerId, payload);
  if (!updated) throw AppError.notFound('Khong tim thay khach hang');
  return updated;
}

module.exports = { listCustomers, getCustomer, getCustomerOrders, createCustomer, updateCustomer };
