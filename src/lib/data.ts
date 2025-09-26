
// This is a global state hack for demo purposes.
// In a real app, you'd use a proper state management solution or a database.
let usersStore: User[] = [
    { id: 1, name: 'Admin User', email: 'admin@pixelate.com', role: 'admin', password: 'password'},
    { id: 2, name: 'Staff User', email: 'staff@pixelate.com', role: 'staff', password: 'password'},
];

if (typeof window !== 'undefined' && !(window as any).__usersStore) {
    (window as any).__usersStore = usersStore;
} else if (typeof window !== 'undefined') {
    usersStore = (window as any).__usersStore;
}

export interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    hasGst: boolean;
    gstCompanyName?: string;
    gstNumber?: string;
    gstAddress?: string;
}

// This is a global state hack for demo purposes.
let clientsStore: Client[] = [
    { 
        id: 1, 
        name: 'Apex Digital', 
        email: 'contact@apex.co', 
        address: '123 Tech Park, Silicon Valley', 
        phone: '123-456-7890', 
        hasGst: false 
    },
    { 
        id: 2, 
        name: 'Nexus Innovations', 
        email: 'info@nexus.io', 
        address: '456 Future Drive, Innovation City', 
        phone: '098-765-4321', 
        hasGst: true, 
        gstCompanyName: 'Nexus Innovations LLC', 
        gstNumber: 'GSTIN123456', 
        gstAddress: '456 Future Drive, Innovation City' 
    },
];

if (typeof window !== 'undefined' && !(window as any).__clientsStore) {
    (window as any).__clientsStore = clientsStore;
} else if (typeof window !== 'undefined') {
    clientsStore = (window as any).__clientsStore;
}

export const clients: Client[] = clientsStore;

export const addClient = (client: Omit<Client, 'id'>): Client => {
    const newId = (typeof window !== 'undefined' && (window as any).__clientsStore)
        ? (window as any).__clientsStore.reduce((maxId: number, c: Client) => Math.max(c.id, maxId), 0) + 1
        : new Date().getTime();
    const newClient = { ...client, id: newId };
    if (typeof window !== 'undefined') {
        (window as any).__clientsStore.push(newClient);
    }
    return newClient;
};


export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'staff';
    password?: string;
    avatarUrl?: string;
}

export const users: User[] = usersStore;

export const addUser = (user: Omit<User, 'id'>): User => {
    const newId = (typeof window !== 'undefined' && (window as any).__usersStore) 
        ? (window as any).__usersStore.reduce((maxId: number, u: User) => Math.max(u.id, maxId), 0) + 1 
        : new Date().getTime();
    const newUser = { ...user, id: newId };
    if (typeof window !== 'undefined') {
        (window as any).__usersStore.push(newUser);
    }
    return newUser;
}


export interface Lead {
  id: number;
  name: string;
  project: string;
  value: number;
  status: 'NEW' | 'QUALIFIED' | 'PROPOSAL SENT';
}

export const leads: Lead[] = [
  { id: 1, name: 'QuantumLeap Corp', project: 'AI Platform Development', value: 120000, status: 'NEW' },
  { id: 2, name: 'Stellar Solutions', project: 'Mobile App Redesign', value: 75000, status: 'NEW' },
  { id: 3, name: 'Nexus Innovations', project: 'Cloud Migration Strategy', value: 95000, status: 'QUALIFIED' },
  { id: 4, name: 'Apex Digital', project: 'E-commerce Overhaul', value: 250000, status: 'PROPOSAL SENT' },
  { id: 5, name: 'Visionary Ventures', project: 'Branding & Identity', value: 60000, status: 'QUALIFIED' },
];

export const leadStatuses: ('NEW' | 'QUALIFIED' | 'PROPOSAL SENT')[] = ['NEW', 'QUALIFIED', 'PROPOSAL SENT'];


export type ProjectStatus = 'BACKLOG' | 'IN PROGRESS' | 'IN REVIEW' | 'COMPLETED';

export interface Project {
    id: number;
    title: string;
    client: string;
    progress: number;
    description: string;
    status?: ProjectStatus;
    dueDate?: string;
    assignees?: number[]; // Array of TeamMember IDs
}

export let projects: Project[] = [
  { id: 1, title: 'Project Phoenix', client: 'Stellar Solutions', progress: 75, description: 'Complete redesign of their flagship mobile application.', status: 'IN PROGRESS', dueDate: '2024-08-15', assignees: [1] },
  { id: 2, title: 'Project Titan', client: 'Apex Digital', progress: 40, description: 'Full-stack e-commerce platform development.', status: 'IN PROGRESS', dueDate: '2024-09-30', assignees: [1, 2] },
  { id: 3, title: 'Project Nova', client: 'Visionary Ventures', progress: 90, description: 'New brand identity and style guide creation.', status: 'IN REVIEW', dueDate: '2024-07-20', assignees: [2] },
  { id: 4, title: 'Project Orion', client: 'QuantumLeap Corp', progress: 20, description: 'Initial phase of AI-driven analytics platform.', status: 'BACKLOG', dueDate: '2024-10-01' },
  { id: 5, title: 'Website Refresh', client: 'Old Client LLC', progress: 100, description: 'A small website refresh.', status: 'COMPLETED', dueDate: '2024-06-30' },
];

if (typeof window !== 'undefined' && !(window as any).__projectsStore) {
    (window as any).__projectsStore = projects;
} else if (typeof window !== 'undefined') {
    projects = (window as any).__projectsStore;
}


export const projectStatuses: ProjectStatus[] = ['BACKLOG', 'IN PROGRESS', 'IN REVIEW', 'COMPLETED'];


export interface Quotation {
    id: string;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    clientId: number;
    clientName: string;
    services: { id: number; name: string }[];
    amount: number;
    discount: number;
    deliveryDate: Date;
    authorId: number;
}

export const quotations: Quotation[] = [
  { 
    id: 'Q-2024-001', 
    clientId: 1,
    clientName: 'Apex Digital',
    amount: 250000, 
    status: 'APPROVED', 
    services: [{id: 1, name: 'Web Development'}, {id: 2, name: 'UX/UI Design'}],
    discount: 0,
    deliveryDate: new Date('2024-09-30'),
    authorId: 1,
  },
  { 
    id: 'Q-2024-002', 
    clientId: 2,
    clientName: 'Nexus Innovations',
    amount: 95000, 
    status: 'PENDING', 
    services: [{id: 3, name: 'Cloud Consulting'}],
    discount: 5000,
    deliveryDate: new Date('2024-08-15'),
    authorId: 2,
  },
];

export const invoices = [
    { id: 'INV-001', client: 'Stellar Solutions', amount: 37500, dueDate: '2024-08-01', status: 'PAID' },
    { id: 'INV-002', client: 'Apex Digital', amount: 100000, dueDate: '2024-07-25', status: 'DUE' },
    { id: 'INV-003', client: 'Visionary Ventures', amount: 54000, dueDate: '2024-06-15', status: 'OVERDUE' },
    { id: 'INV-004', client: 'Old Client LLC', amount: 15000, dueDate: '2024-07-30', status: 'DUE' },
];

export const supportTickets = [
    { id: 'TICK-001', title: 'Login issue on mobile', client: 'Apex Digital', priority: 'High', sla: '2h remaining', status: 'Open' },
    { id: 'TICK-002', title: 'API rate limit question', client: 'Stellar Solutions', priority: 'Medium', sla: '22h remaining', status: 'Open' },
    { id: 'TICK-003', title: 'Asset delivery failed', client: 'Visionary Ventures', priority: 'High', sla: 'DEADLINE PASSED', status: 'Open' },
    { id: 'TICK-004', title: 'Feature request: Dark Mode', client: 'QuantumLeap Corp', priority: 'Low', sla: '3d remaining', status: 'In Progress' },
    { id: 'TICK-005', title: 'Invoice correction needed', client: 'Stellar Solutions', priority: 'Medium', sla: 'N/A', status: 'Closed' },
];

export const stats = [
    { name: 'Revenue', value: '₹12,45,000', change: '+12.5%', changeType: 'positive' },
    { name: 'New Leads', value: '42', change: '+2.1%', changeType: 'positive' },
    { name: 'Conversion Rate', value: '24.5%', change: '-1.8%', changeType: 'negative' },
    { name: 'Active Projects', value: '4', change: '0%', changeType: 'neutral' },
];


export interface Service {
    id: number;
    name: string;
}

let servicesStore: Service[] = [
    { id: 1, name: 'Web Development' },
    { id: 2, name: 'UX/UI Design' },
    { id: 3, name: 'Cloud Consulting' },
    { id: 4, name: 'Video Editing' },
    { id: 5, name: 'SEO Strategy' },
];

// This is a global state hack for demo purposes.
if (typeof window !== 'undefined' && !(window as any).__servicesStore) {
    (window as any).__servicesStore = servicesStore;
} else if (typeof window !== 'undefined') {
    servicesStore = (window as any).__servicesStore.length ? (window as any).__servicesStore : servicesStore;
}
export const services: Service[] = servicesStore;


export const addService = (service: Omit<Service, 'id'>): Service => {
    const newId = (typeof window !== 'undefined' && (window as any).__servicesStore)
        ? (window as any).__servicesStore.reduce((maxId: number, s: Service) => Math.max(s.id, maxId), 0) + 1
        : new Date().getTime();
    const newService = { ...service, id: newId };
    if (typeof window !== 'undefined') {
        (window as any).__servicesStore.push(newService);
    }
    return newService;
}

// New data structure for Developers and Editors
export interface TeamMember {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: 'Web Developer' | 'Editor' | 'Designer' | 'Project Manager';
    // Optional fields
    pan?: string;
    aadhar?: string;
    secondaryPhone?: string;
    secondaryEmail?: string;
    salary?: number;
    avatarUrl?: string;
}

let teamMembersStore: TeamMember[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@pixelate.com', phone: '111-222-3333', address: '1 Creative Way', role: 'Web Developer', avatarUrl: 'https://i.pravatar.cc/150?u=alice' },
    { id: 2, name: 'Bob Williams', email: 'bob@pixelate.com', phone: '444-555-6666', address: '2 Design Drive', role: 'Editor', avatarUrl: 'https://i.pravatar.cc/150?u=bob' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@pixelate.com', phone: '777-888-9999', address: '3 Code Court', role: 'Designer', avatarUrl: 'https://i.pravatar.cc/150?u=charlie' },
];

if (typeof window !== 'undefined' && !(window as any).__teamMembersStore) {
    (window as any).__teamMembersStore = teamMembersStore;
} else if (typeof window !== 'undefined') {
    teamMembersStore = (window as any).__teamMembersStore;
}
export const teamMembers: TeamMember[] = teamMembersStore;


export const addTeamMember = (member: Omit<TeamMember, 'id'>): TeamMember => {
    const newId = (typeof window !== 'undefined' && (window as any).__teamMembersStore)
        ? (window as any).__teamMembersStore.reduce((maxId: number, m: TeamMember) => Math.max(m.id, maxId), 0) + 1
        : new Date().getTime();
    const newMember = { ...member, id: newId };
    if (typeof window !== 'undefined') {
        (window as any).__teamMembersStore.push(newMember);
    }
    return newMember;
};
