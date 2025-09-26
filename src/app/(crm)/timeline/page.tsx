
'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projects as initialProjects, projectStatuses, Project, ProjectStatus } from '@/lib/data';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    // Group initial projects by status
    const groupedProjects = projectStatuses.reduce((acc, status) => {
      acc[status] = initialProjects.filter(p => p.status === status);
      return acc;
    }, {} as Record<ProjectStatus, Project[]>);
    setProjectData(groupedProjects);
    setIsBrowser(true); // Component has mounted, we are in the browser
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
      const result = move(sourceItems, destItems, source, destination);
      
      const updatedSourceItems = result[sourceStatus];
      const updatedDestItems = result[destStatus].map(item => ({...item, status: destStatus}));

      setProjectData(prev => ({
        ...prev,
        [sourceStatus]: updatedSourceItems,
        [destStatus]: updatedDestItems
      }));
    }
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
                      {projectData[status].map((project, index) => (
                        <Draggable key={project.id.toString()} draggableId={project.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Card className={cn("border-4 border-black", snapshot.isDragging && "border-primary")}>
                                <CardHeader>
                                  <CardTitle className="text-xl font-bold tracking-tight">{project.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm font-bold text-muted-foreground">{project.client}</p>
                                  <p className="mt-2 text-sm">{project.description}</p>
                                </CardContent>
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
