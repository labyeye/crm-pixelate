import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Basic CRUD wrappers for main collections. These return plain JS objects.

export async function getCollection(name: string) {
  const db = await getDb();
  return db.collection(name);
}

// Clients
export async function getClients() {
  const col = await getCollection('clients');
  return col.find().toArray();
}

export async function createClient(client: any) {
  const col = await getCollection('clients');
  const res = await col.insertOne({ ...client, createdAt: new Date() });
  return { ...client, _id: res.insertedId };
}

// Services
export async function getServices() {
  const col = await getCollection('services');
  return col.find().toArray();
}

export async function createService(service: any) {
  const col = await getCollection('services');
  const res = await col.insertOne({ ...service, createdAt: new Date() });
  return { ...service, _id: res.insertedId };
}

// Team Members
export async function getTeamMembers() {
  const col = await getCollection('teamMembers');
  return col.find().toArray();
}

export async function createTeamMember(member: any) {
  const col = await getCollection('teamMembers');
  const res = await col.insertOne({ ...member, createdAt: new Date() });
  return { ...member, _id: res.insertedId };
}

// Users
export async function getUsers() {
  const col = await getCollection('users');
  return col.find().toArray();
}

export async function createUser(user: any) {
  const col = await getCollection('users');
  const res = await col.insertOne({ ...user, createdAt: new Date() });
  return { ...user, _id: res.insertedId };
}

// Generic helpers for single item by id
export async function findById(collectionName: string, id: string) {
  const col = await getCollection(collectionName);
  return col.findOne({ _id: new ObjectId(id) });
}

export async function updateById(collectionName: string, id: string, update: any) {
  const col = await getCollection(collectionName);
  await col.updateOne({ _id: new ObjectId(id) }, { $set: update });
  return findById(collectionName, id);
}

export async function deleteById(collectionName: string, id: string) {
  const col = await getCollection(collectionName);
  const res = await col.deleteOne({ _id: new ObjectId(id) });
  return res.deletedCount === 1;
}

// Invoices
export async function getInvoices() {
  const col = await getCollection('invoices');
  return col.find().toArray();
}

export async function createInvoice(invoice: any) {
  const col = await getCollection('invoices');
  const res = await col.insertOne({ ...invoice, createdAt: new Date() });
  return { ...invoice, _id: res.insertedId };
}

// Quotations
export async function getQuotations() {
  const col = await getCollection('quotations');
  return col.find().toArray();
}

export async function createQuotation(q: any) {
  const col = await getCollection('quotations');
  const res = await col.insertOne({ ...q, createdAt: new Date() });
  return { ...q, _id: res.insertedId };
}

export default {
  getClients,
  createClient,
  getServices,
  createService,
  getTeamMembers,
  createTeamMember,
  getUsers,
  createUser,
  findById,
  updateById,
  deleteById,
};
