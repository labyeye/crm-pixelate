import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function seed() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not set in environment');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const dbName = process.env.MONGODB_DB || undefined;
  const db = client.db(dbName);
  console.log('Connected to DB:', db.databaseName || '(unknown)');

  const collections = ['clients', 'users', 'services', 'teamMembers', 'projects', 'leads', 'quotations', 'invoices', 'supportTickets'];
  for (const name of collections) {
    try {
      await db.collection(name).drop();
      console.log('Dropped', name);
    } catch (e) {
      // ignore
    }
  }

  const clients = [
    { name: 'Acme Corp', email: 'hello@acme.test', phone: '9990012345', address: '1 Acme Way', hasGst: false },
    { name: 'Beta Studios', email: 'contact@beta.test', phone: '9990023456', address: '42 Beta Street', hasGst: true, gstCompanyName: 'Beta Studios Pvt Ltd', gstNumber: '27ABCDE1234F1Z5', gstAddress: '42 Beta Street' }
  ];
  await db.collection('clients').insertMany(clients.map(c => ({ ...c, createdAt: new Date() })));

  const users = [
    { name: 'Admin User', email: 'admin@pixelate.test', role: 'admin', password: 'admin' },
    { name: 'Staff User', email: 'staff@pixelate.test', role: 'staff', password: 'staff' }
  ];
  await db.collection('users').insertMany(users.map(u => ({ ...u, createdAt: new Date() })));

  const services = [
    { name: 'Web Development' },
    { name: 'Video Editing' },
    { name: 'SEO' }
  ];
  await db.collection('services').insertMany(services.map(s => ({ ...s, createdAt: new Date() })));

  const teamMembers = [
    { name: 'Alice', email: 'alice@pixelate.test', role: 'Web Developer' },
    { name: 'Bob', email: 'bob@pixelate.test', role: 'Designer' }
  ];
  await db.collection('teamMembers').insertMany(teamMembers.map(t => ({ ...t, createdAt: new Date() })));

  const projects = [
    { title: 'Acme Website', client: 'Acme Corp', progress: 20, description: 'New marketing site', status: 'IN PROGRESS', dueDate: new Date().toISOString(), assignees: [] },
    { title: 'Beta Promo', client: 'Beta Studios', progress: 0, description: 'Promo video', status: 'BACKLOG' }
  ];
  await db.collection('projects').insertMany(projects.map(p => ({ ...p, createdAt: new Date() })));

  const leads = [
    { name: 'Lead One', project: 'Acme Website', value: 50000, status: 'NEW' },
    { name: 'Lead Two', project: 'Beta Promo', value: 25000, status: 'QUALIFIED' }
  ];
  await db.collection('leads').insertMany(leads.map(l => ({ ...l, createdAt: new Date() })));

  const quotations = [
    { id: 'Q-2025-001', status: 'PENDING', clientId: null, clientName: 'Acme Corp', services: [{ id: 1, name: 'Web Development' }], amount: 50000, discount: 0, deliveryDate: new Date(), authorId: null }
  ];
  await db.collection('quotations').insertMany(quotations.map(q => ({ ...q, createdAt: new Date() })));

  const invoices = [
    { id: 'INV-001', client: 'Acme Corp', amount: 50000, dueDate: new Date().toISOString(), status: 'DUE' }
  ];
  await db.collection('invoices').insertMany(invoices.map(i => ({ ...i, createdAt: new Date() })));

  const tickets = [
    { title: 'Bug: Contact form', client: 'Acme Corp', priority: 'High', sla: 'DEADLINE PASSED', status: 'OPEN' }
  ];
  await db.collection('supportTickets').insertMany(tickets.map(t => ({ ...t, createdAt: new Date() })));

  await client.close();
  console.log('Seeding complete');
}

seed().catch(err => {
  console.error('Seeding failed', err);
  process.exit(1);
});
