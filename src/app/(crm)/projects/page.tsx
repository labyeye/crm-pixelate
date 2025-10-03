
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import AddProjectForm from "@/components/projects/add-project-form";
import { Progress } from "@/components/ui/progress";
import type { Project } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';
import { CardContent as _CardContent } from "@/components/ui/card";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cRes, sRes, tRes] = await Promise.all([fetch('/api/clients'), fetch('/api/services'), fetch('/api/team-members')]);
        const [cJson, sJson, tJson] = await Promise.all([cRes.json(), sRes.json(), tRes.json()]);
        if (!mounted) return;
        const normClients = (cJson as any[] || []).map(c => ({ ...c, id: c.id ?? (c._id ? String(c._id) : String(c.id)) }));
        const normServices = (sJson as any[] || []).map(s => ({ ...s, id: s.id ?? (s._id ? String(s._id) : String(s.id)) }));
        setClients(normClients);
        setServices(normServices);
        setTeamMembers(tJson as any[] || []);
      } catch (err) {
        console.error('Failed to load project related data', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`);
        const items = await res.json();
        if (mounted) setProjects(items as Project[]);
      } catch (err) {
        console.error('Failed to load projects', err);
      }
    })();
    return () => { mounted = false; };
  }, []);


  return (
    <div className="space-y-8 font-headline">
      <header>
        <h1 className="text-5xl font-black tracking-tighter">PROJECTS</h1>
        <p className="text-muted-foreground text-lg">An overview of all active and completed projects.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Add Project card */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-2xl font-black tracking-tighter">Add Project</CardTitle>
          </CardHeader>
          <CardContent>
            <AddProjectForm
              clients={clients}
              services={services}
              teamMembers={teamMembers}
              initialValues={editing}
              editingId={editing ? (editing._id ?? editing.id) : null}
              onCreate={(p) => {
                // if editing, replace
                if (editing) {
                  setProjects(prev => prev.map(pr => (pr._id ?? pr.id) === (editing._id ?? editing.id) ? p : pr));
                  setEditing(null);
                } else {
                  setProjects(prev => [p, ...prev]);
                }
              }}
            />
          </CardContent>
        </Card>
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col border-4 border-black relative">
            {project.status === 'COMPLETED' && (
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="bg-white/80 rounded-full p-4">
                  <CheckCircle className="text-green-600 h-20 w-20" />
                </div>
              </div>
            )}
            <CardHeader>
              <div>
                  <CardTitle className="text-4xl font-black tracking-tighter">{project.title}</CardTitle>
                  <CardDescription className="text-base font-bold text-muted-foreground">{project.client}</CardDescription>
                  {project.brandLogo && (
                    <div className="mt-6 flex justify-center">
                      <img src={project.brandLogo} alt="logo" className="h-full w-full object-contain" />
                    </div>
                  )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-base">{project.description}</p>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
                <div>
                    <span className="text-sm font-bold text-muted-foreground">PROGRESS</span>
                    <p className="text-2xl font-bold">{project.progress}%</p>
                </div>
              <Progress value={project.progress} />
              <div className="w-full">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Project Amount</div>
                  <div className="text-xl font-bold">₹{(project.amount ?? 0).toLocaleString()}</div>
                </div>
                <div className="mt-2 text-sm">
                  {project.assignees && project.assignees.length > 0 ? (
                    <div>Each assignee receives: <span className="font-bold">₹{Math.floor((project.amount ?? 0) / project.assignees.length).toLocaleString()}</span></div>
                  ) : (
                    <div>No assignees</div>
                  )}
                </div>
              </div>
              <Button variant="outline" className="w-full text-base font-bold">VIEW PROJECT</Button>
              <div className="flex gap-2 w-full">
                <Button variant="ghost" className="w-full" onClick={async () => {
                  // fetch fresh project and populate edit form
                  try {
                    const res = await fetch(`/api/projects/${project._id ?? project.id}`);
                    if (!res.ok) throw new Error('Failed to fetch project');
                    const data = await res.json();
                    setEditing({ ...data, id: data._id ? String(data._id) : data.id });
                    // scroll to top where form is
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } catch (err) { console.error(err); }
                }}>Edit</Button>
                {project.status !== 'COMPLETED' && (
                  <Button variant="secondary" className="w-full" onClick={async () => {
                    try {
                      const id = project._id ?? project.id;
                      const res = await fetch(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'COMPLETED' }), headers: { 'Content-Type': 'application/json' } });
                      if (!res.ok) throw new Error('Failed to mark complete');
                      const updated = await res.json();
                      setProjects(prev => prev.map(p => (p._id ?? p.id) === id ? updated : p));
                      // fetch latest invoices and notify other pages (dashboard) to refresh data (invoices/revenue)
                      try {
                        const invoicesRes = await fetch('/api/invoices');
                        const invoicesData = invoicesRes.ok ? await invoicesRes.json() : [];
                        window.dispatchEvent(new CustomEvent('data:changed', { detail: { type: 'invoices', invoices: invoicesData } }));
                      } catch(e) { /* ignore */ }
                    } catch (err) { console.error(err); }
                  }}>Mark as Complete</Button>
                )}
                <Button variant="destructive" className="w-full" onClick={async () => {
                  if (!confirm('Delete this project?')) return;
                  try {
                    const id = project._id ?? project.id;
                    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Delete failed');
                    setProjects(prev => prev.filter(p => (p._id ?? p.id) !== id));
                  } catch (err) { console.error(err); }
                }}>Delete</Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
