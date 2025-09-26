
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


export interface Project {
    id: number;
    title: string;
    client: string;
    progress: number;
    description: string;
}

export const projects: Project[] = [
  { id: 1, title: 'Project Phoenix', client: 'Stellar Solutions', progress: 75, description: 'Complete redesign of their flagship mobile application.' },
  { id: 2, title: 'Project Titan', client: 'Apex Digital', progress: 40, description: 'Full-stack e-commerce platform development.' },
  { id: 3, title: 'Project Nova', client: 'Visionary Ventures', progress: 90, description: 'New brand identity and style guide creation.' },
  { id: 4, title: 'Project Orion', client: 'QuantumLeap Corp', progress: 20, description: 'Initial phase of AI-driven analytics platform.' },
];

export interface Quotation {
    id: string;
    client: string;
    amount: number;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    services: string[];
}

export const quotations: Quotation[] = [
  { id: 'Q-2024-001', client: 'Apex Digital', amount: 250000, status: 'APPROVED', services: ['Web Development', 'UX/UI Design', 'Project Management'], },
  { id: 'Q-2024-002', client: 'Nexus Innovations', amount: 95000, status: 'PENDING', services: ['Cloud Consulting', 'DevOps Strategy'], },
  { id: 'Q-2024-003', client: 'CyberNetics Inc.', amount: 45000, status: 'REJECTED', services: ['Security Audit'], },
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
