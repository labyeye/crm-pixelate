
'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { projects as initialProjects, Project } from "@/lib/data";
import { Button } from "@/components/ui/button";

// This is a global state hack for demo purposes.
// In a real app, you'd use a proper state management solution.
let projectsStore: Project[] = initialProjects;
if (typeof window !== 'undefined' && !(window as any).__projectsStore) {
    (window as any).__projectsStore = projectsStore;
} else if (typeof window !== 'undefined') {
    projectsStore = (window as any).__projectsStore;
}


export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(projectsStore);

  // This effect will sync the state with the global store.
  // This is needed because Next.js can re-render the page without a full reload.
  useState(() => {
    const interval = setInterval(() => {
      if ((window as any).__projectsStore !== projects) {
        setProjects((window as any).__projectsStore);
      }
    }, 500);
    return () => clearInterval(interval);
  });


  return (
    <div className="space-y-8 font-headline">
      <header>
        <h1 className="text-5xl font-black tracking-tighter">PROJECTS</h1>
        <p className="text-muted-foreground text-lg">An overview of all active and completed projects.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col border-4 border-black">
            <CardHeader>
              <CardTitle className="text-4xl font-black tracking-tighter">{project.title}</CardTitle>
              <CardDescription className="text-base font-bold text-muted-foreground">{project.client}</CardDescription>
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
              <Button variant="outline" className="w-full text-base font-bold">VIEW PROJECT</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
