
'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Project, ProjectStatus, TeamMember } from '@/lib/data';

// Local copy of project statuses to avoid importing value exports from server-side modules
const projectStatuses: ProjectStatus[] = ['BACKLOG', 'IN PROGRESS', 'IN REVIEW', 'COMPLETED'];
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Helper to reorder lists
const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Helper to move items between lists
const move = (source: any[], destination: any[], droppableSource: any, droppableDestination: any) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  return { [droppableSource.droppableId]: sourceClone, [droppableDestination.droppableId]: destClone };
};

export default function TimelinePage() {
  const [projectData, setProjectData] = useState<Record<ProjectStatus, Project[]>>({
    'BACKLOG': [],
    'IN PROGRESS': [],
    'IN REVIEW': [],
    'COMPLETED': []
  });

  const [isBrowser, setIsBrowser] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [projectsRes, membersRes] = await Promise.all([fetch('/api/projects'), fetch('/api/team-members')]);
        const projects = (await projectsRes.json()) as Project[];
        const members = (await membersRes.json()) as TeamMember[];
        if (!mounted) return;
        const groupedProjects = projectStatuses.reduce((acc, status) => {
          acc[status] = (projects as Project[]).filter(p => p.status === status);
          return acc;
        }, {} as Record<ProjectStatus, Project[]>);
        setProjectData(groupedProjects);
        setTeamMembers(members as TeamMember[]);
      } catch (err) {
        console.error('Failed to load timeline data', err);
      }
    })();
    setIsBrowser(true);
    return () => { mounted = false; };
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const sourceStatus = source.droppableId as ProjectStatus;
    const destStatus = destination.droppableId as ProjectStatus;

    if (sourceStatus === destStatus) {
      const items = reorder(projectData[sourceStatus], source.index, destination.index);
      setProjectData(prev => ({ ...prev, [sourceStatus]: items }));
    } else {
      const sourceItems = projectData[sourceStatus];
      const destItems = projectData[destStatus];
  const resultMap = move(sourceItems, destItems, source, destination) as Record<string, Project[]>;

  const updatedSourceItems = resultMap[sourceStatus] ?? [];
  const updatedDestItems = (resultMap[destStatus] ?? []).map(item => ({...item, status: destStatus}));

      setProjectData(prev => ({
        ...prev,
        [sourceStatus]: updatedSourceItems,
        [destStatus]: updatedDestItems
      }));
    }
  };

  const handleAssigneeChange = (projectId: number | string | undefined, memberId: number | string | undefined) => {
  if (projectId == null || memberId == null) return;
    const newProjectData = { ...projectData };
    for (const status in newProjectData) {
    const projectIndex = newProjectData[status as ProjectStatus].findIndex(p => String(p.id) === String(projectId));
        if (projectIndex !== -1) {
            const project = newProjectData[status as ProjectStatus][projectIndex];
      const currentAssignees = project.assignees || [];
      // assignees are objects { id, payout }
    if (currentAssignees.some((a:any) => String(a.id ?? a) === String(memberId))) {
    project.assignees = currentAssignees.filter((a:any) => String(a.id ?? a) !== String(memberId));
      } else {
        project.assignees = [...currentAssignees, { id: memberId, payout: 0 }];
      }
            break;
        }
    }
    setProjectData(newProjectData);
  };

  return (
    <div className="space-y-8 font-headline">
      <header>
        <h1 className="text-5xl font-black tracking-tighter">PROJECT TIMELINE</h1>
        <p className="text-muted-foreground text-lg">Manage your projects from backlog to completion.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
        {isBrowser && (
          <DragDropContext onDragEnd={onDragEnd}>
            {projectStatuses.map(status => (
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "space-y-4 rounded-lg",
                      snapshot.isDraggingOver ? 'bg-muted' : 'bg-transparent'
                    )}
                  >
                    <h2 className="text-2xl font-black tracking-tighter p-2 border-2 border-black bg-secondary text-center">
                      {status}
                    </h2>
                    <div className="space-y-4 h-full min-h-[200px]">
                      {projectData[status].filter(p => p.id != null).map((project, index) => (
                        <Draggable key={project.id!.toString()} draggableId={project.id!.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Card className={cn("border-4 border-black", snapshot.isDragging && "border-primary")}>
                                <CardHeader>
                                  <Badge variant="outline" className="w-fit">{project.client}</Badge>
                                  <CardTitle className="text-xl font-bold tracking-tight pt-2">{project.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm text-muted-foreground">{project.description}</p>
                                </CardContent>
                                <CardFooter className="flex-col items-start gap-4">
                                  {project.dueDate && (
                                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                      <CalendarIcon className="h-4 w-4" />
                                      <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex -space-x-2">
                                        <TooltipProvider>
          {project.assignees?.map((assignee:any) => {
            const aid = assignee?.id ?? assignee;
            const member = teamMembers.find(m => String(m.id) === String(aid));
                      return member ? (
                                                <Tooltip key={member.id}>
                                                    <TooltipTrigger asChild>
                                                        <Avatar className="border-2 border-background">
                                                            <AvatarImage src={member.avatarUrl} />
                                                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{member.name}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : null;
                                        })}
                                        </TooltipProvider>
                                    </div>
                                    
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                          <PlusCircle className="h-5 w-5" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        {teamMembers.map(member => (
                                          <DropdownMenuCheckboxItem
                                            key={member.id}
                                            checked={project.assignees?.some((a:any) => String(a.id ?? a) === String(member.id))}
                                            onSelect={(e) => e.preventDefault()} // prevent closing
                                            onCheckedChange={() => project.id != null && handleAssigneeChange(project.id, member.id)}
                                          >
                                            {member.name}
                                          </DropdownMenuCheckboxItem>
                                        ))}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </CardFooter>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
