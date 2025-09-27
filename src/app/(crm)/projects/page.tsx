
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Project } from "@/lib/data";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

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
