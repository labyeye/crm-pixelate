// NOTE: this file used to contain in-memory demo data. It now provides types
// and async helpers that read from the database via `src/lib/services.ts`.
// For backward compatibility some components import synchronous arrays from
// here; those are exported as empty arrays and should be migrated to the
// async getters below.

export interface Client {
    id?: number | string;
    _id?: string | any;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    hasGst?: boolean;
    gstCompanyName?: string;
    gstNumber?: string;
    gstAddress?: string;
}

export const clients: Client[] = [];

export async function getClients() {
    const svc = await import('./services');
    return svc.getClients();
}

export async function addClient(client: Omit<Client, 'id' | '_id'>) {
    const svc = await import('./services');
    return svc.createClient(client);
}

export interface User {
    id?: number | string;
    _id?: string | any;
    name: string;
    email: string;
    role: 'admin' | 'staff';
    password?: string;
    avatarUrl?: string;
}

export const users: User[] = [];

export async function getUsers() {
    const svc = await import('./services');
    return svc.getUsers();
}

export async function addUser(user: Omit<User, 'id' | '_id'>) {
    const svc = await import('./services');
    return svc.createUser(user);
}

export interface Lead {
    id?: number;
    _id?: string | any;
    name: string;
    project?: string;
    value?: number;
    status?: 'NEW' | 'QUALIFIED' | 'PROPOSAL SENT';
}

export const leads: Lead[] = [];

export const leadStatuses: ('NEW' | 'QUALIFIED' | 'PROPOSAL SENT')[] = ['NEW', 'QUALIFIED', 'PROPOSAL SENT'];

export async function getLeads() {
    const svc = await import('./services');
    const col = await svc.getCollection('leads');
    return col.find().toArray();
}

export type ProjectStatus = 'BACKLOG' | 'IN PROGRESS' | 'IN REVIEW' | 'COMPLETED';

export interface Project {
    id?: number | string;
    _id?: string | any;
    title: string;
    client?: string;
    progress?: number;
    description?: string;
    status?: ProjectStatus;
    dueDate?: string;
    services?: { id?: string | number; name?: string; amount?: number }[];
    assignees?: { id?: string | number; payout?: number }[]; // Array of assignee objects with payout
    amount?: number;
    workUrl?: string;
    brandLogo?: string;
}

export let projects: Project[] = [];

export const projectStatuses: ProjectStatus[] = ['BACKLOG', 'IN PROGRESS', 'IN REVIEW', 'COMPLETED'];

export async function getProjects() {
    const svc = await import('./services');
    const col = await svc.getCollection('projects');
    return col.find().toArray();
}

export interface Quotation {
    id?: string;
    _id?: string | any;
    status?: 'APPROVED' | 'PENDING' | 'REJECTED';
    clientId?: number | string | any;
    clientName?: string;
    services?: { id: number | string; name: string }[];
    amount?: number;
    discount?: number;
    deliveryDate?: Date;
    authorId?: number | any;
}

export const quotations: Quotation[] = [];

export async function getQuotations() {
    const svc = await import('./services');
    const col = await svc.getCollection('quotations');
    return col.find().toArray();
}

export const invoices: any[] = [];

export async function getInvoices() {
    const svc = await import('./services');
    const col = await svc.getCollection('invoices');
    return col.find().toArray();
}

export const supportTickets: any[] = [];

export async function getSupportTickets() {
    const svc = await import('./services');
    const col = await svc.getCollection('supportTickets');
    return col.find().toArray();
}

export const stats: any[] = [];

export async function getStats() {
    // implement derived stats from DB later
    return [];
}

export interface Service {
    id?: number | string;
    _id?: string | any;
    name: string;
}

export const services: Service[] = [];

export async function getServices() {
    const svc = await import('./services');
    return svc.getServices();
}

export async function addService(service: Omit<Service, 'id' | '_id'>) {
    const svc = await import('./services');
    return svc.createService(service);
}

export interface TeamMember {
    id?: number;
    _id?: string | any;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    role?: 'Founder' | 'Co-Founder' | 'Web Developer' | 'Editor' | 'Designer' | 'Project Manager' | 'Lead Generator';
    pan?: string;
    aadhar?: string;
    secondaryPhone?: string;
    secondaryEmail?: string;
    salary?: number;
    avatarUrl?: string;
}

export const teamMembers: TeamMember[] = [];

export async function getTeamMembers() {
    const svc = await import('./services');
    return svc.getTeamMembers();
}

export async function addTeamMember(member: Omit<TeamMember, 'id' | '_id'>) {
    const svc = await import('./services');
    return svc.createTeamMember(member);
}
