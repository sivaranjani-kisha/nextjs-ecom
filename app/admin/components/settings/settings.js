"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function HomeSectionOrder() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 📌 Fetch sections from API
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch("/api/sections");
        const data = await res.json();
        setSections(data.sections);
      } catch (error) {
        console.error("Error fetching sections:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSections();
  }, []);

  // 🔄 Handle drag-and-drop reordering
  const handleDragEnd = async (result) => {
    if (!result.destination) return; // Dropped outside the list

    const newSections = [...sections];
    const [movedItem] = newSections.splice(result.source.index, 1);
    newSections.splice(result.destination.index, 0, movedItem);

    // Update positions (0, 1, 2, ...)
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      position: index,
    }));

    setSections(updatedSections);

    // Save new order to DB
    try {
      await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: updatedSections }),
      });
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  if (isLoading) return <p>Loading sections...</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Manage Section Order</h1>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {sections.map((section, index) => (
                <Draggable
                  key={section._id}
                  draggableId={section._id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="p-3 mb-2 bg-white border rounded shadow flex justify-between"
                    >
                      <span>{section.name}</span>
                      <span className="text-gray-500">Pos: {index + 1}</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}