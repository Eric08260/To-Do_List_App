"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Trash2, CheckCircle, Edit2, Moon, Sun, FileText } from "lucide-react"; // Import FileText icon
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker styles
import { Dropdown } from "@/components/ui/dropdown"; // Import Dropdown component
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Task {
  text: string;
  completed: boolean;
  deadline: Date; // Change deadline type to Date
  isEditing?: boolean; // Add isEditing property
  priority: "Low" | "Medium" | "High"; // Add priority property
  recurrence?: "None" | "Daily" | "Weekly" | "Monthly"; // Add recurrence property
  notified?: boolean; // Add notified property
}

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [task, setTask] = useState<string>("");
  const [deadline, setDeadline] = useState<Date | null>(null); // Change state type to Date
  const [filter, setFilter] = useState<string>("All"); // Add filter state
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium"); // Add priority state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false); // Add dark mode state
  const [recurrence, setRecurrence] = useState<"None" | "Daily" | "Weekly" | "Monthly">("None"); // Add recurrence state

  const completedTasksCount = tasks.filter(task => task.completed).length;
  const totalTasksCount = tasks.length;
  const completionPercentage = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks).map((task: Task) => ({
        ...task,
        deadline: new Date(task.deadline)
      })));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newTasks = tasks.map((task) => {
        if (!task.completed && !task.notified) {
          const timeDiff = task.deadline.getTime() - now.getTime();
          const hoursDiff = timeDiff / (1000 * 3600);
          if (hoursDiff <= 1 && hoursDiff > 0) {
            alert(`Task "${task.text}" is due within an hour!`);
            return { ...task, notified: true };
          } else if (hoursDiff <= 0) {
            alert(`Task "${task.text}" is overdue!`);
            return { ...task, notified: true };
          }
        }
        return task;
      });
      setTasks(newTasks);
    }, 1800000);

    return () => clearInterval(interval);
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (task.trim() !== "" && deadline) {
      setTasks([...tasks, { text: task, completed: false, deadline, priority, recurrence }]);
      setTask("");
      setDeadline(null); // Reset deadline
      setPriority("Medium"); // Reset priority
      setRecurrence("None"); // Reset recurrence
    }
  };

  const toggleComplete = (index: number) => {
    const newTasks = tasks.map((t, i) =>
      i === index ? { ...t, completed: !t.completed } : t
    );
    setTasks(newTasks);
  };

  const deleteTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const startEditing = (index: number) => {
    const newTasks = tasks.map((t, i) =>
      i === index ? { ...t, isEditing: true } : t
    );
    setTasks(newTasks);
  };

  const saveTask = (index: number, newText: string, newDeadline: Date | null, newPriority: "Low" | "Medium" | "High") => {
    const newTasks = tasks.map((t, i) =>
      i === index ? { ...t, text: newText, deadline: newDeadline || t.deadline, priority: newPriority, isEditing: false } : t
    );
    setTasks(newTasks);
  };

  const handleEditChange = (index: number, newText: string) => {
    const newTasks = tasks.map((t, i) =>
      i === index ? { ...t, text: newText } : t
    );
    setTasks(newTasks);
  };

  const handleDeadlineChange = (index: number, newDeadline: Date | null) => {
    const newTasks = tasks.map((t, i) =>
      i === index ? { ...t, deadline: newDeadline || t.deadline } : t
    );
    setTasks(newTasks);
  };

  const handlePriorityChange = (index: number, newPriority: "Low" | "Medium" | "High") => {
    const newTasks = tasks.map((t, i) =>
      i === index ? { ...t, priority: newPriority } : t
    );
    setTasks(newTasks);
  };

  const handleRecurrenceChange = (index: number, newRecurrence: "None" | "Daily" | "Weekly" | "Monthly") => {
    const newTasks = tasks.map((t, i) =>
      i === index ? { ...t, recurrence: newRecurrence } : t
    );
    setTasks(newTasks);
  };

  const handleRecurringTasks = () => {
    const now = new Date();
    const newTasks = tasks.map((task) => {
      if (task.completed || !task.recurrence || task.recurrence === "None") return task;

      let newDeadline = new Date(task.deadline);
      if (task.recurrence === "Daily") {
        newDeadline.setDate(newDeadline.getDate() + 1);
      } else if (task.recurrence === "Weekly") {
        newDeadline.setDate(newDeadline.getDate() + 7);
      } else if (task.recurrence === "Monthly") {
        newDeadline.setMonth(newDeadline.getMonth() + 1);
      }

      if (newDeadline <= now) {
        return { ...task, deadline: newDeadline, completed: false };
      }
      return task;
    });
    setTasks(newTasks);
  };

  useEffect(() => {
    const interval = setInterval(handleRecurringTasks, 60000); // Check for recurring tasks every minute
    return () => clearInterval(interval);
  }, [tasks]);

  const exportTasksToPDF = () => {
    try {
      const doc = new jsPDF();
      
      console.log("doc initialized", doc); // Debugging
  
      const tableColumn = ["Task", "Completed", "Deadline", "Priority", "Recurrence"];
      const tableRows: any[] = [];
  
      tasks.forEach(task => {
        tableRows.push([
          task.text,
          task.completed ? "Yes" : "No",
          task.deadline ? task.deadline.toLocaleString() : "No Deadline",
          task.priority,
          task.recurrence || "None"
        ]);
      });
  
      console.log("tableRows", tableRows); // Debugging
  
      // Ensure autoTable is being called correctly
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 10 }
      });
  
      doc.text("To-Do List", 14, 15);
      doc.save("todo-list.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };
  
  
  const filteredTasks = tasks.filter((task) => {
    if (filter === "Completed") return task.completed;
    if (filter === "Pending") return !task.completed;
    return true;
  });

  return (
    <div className={`max-w-md mx-auto p-6 shadow-lg rounded-lg h-[100vh] flex flex-col ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">To-Do List</h1>
        <Button variant="ghost" onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6 text-gray-800" />}
        </Button>
      </div>
      <div className="flex justify-between mb-4 space-x-2">
        <Button onClick={() => setFilter("All")} className={`w-full ${filter === "All" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>All</Button>
        <Button onClick={() => setFilter("Completed")} className={`w-full ${filter === "Completed" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>Completed</Button>
        <Button onClick={() => setFilter("Pending")} className={`w-full ${filter === "Pending" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>Pending</Button>
      </div>
      <div className="flex flex-col space-y-4 mb-4">
        <Input
          value={task}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTask(e.target.value)}
          placeholder="Add a new task"
          className={`w-full ${isDarkMode ? "placeholder-gray-400" : "placeholder-gray-600"}`}
        />
        <div className="flex space-x-2">
          <DatePicker
            selected={deadline}
            onChange={(date: Date | null) => setDeadline(date)}
            showTimeSelect
            dateFormat="Pp"
            className={`w-[100%] p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-800"}`}
            placeholderText="Select deadline"
            popperClassName="custom-datepicker" // Add custom class
          />
          <Dropdown
            value={priority}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as "Low" | "Medium" | "High")}
            options={["Low", "Medium", "High"]}
            className={`w-[50%] p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-800"}`}
          />
          <Dropdown
            value={recurrence}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setRecurrence(e.target.value as "None" | "Daily" | "Weekly" | "Monthly")}
            options={["None", "Daily", "Weekly", "Monthly"]}
            className={`w-[50%] p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-800"}`}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={addTask} className="bg-blue-500 text-white hover:bg-blue-600 w-full">Add</Button>
          <Button variant="ghost" onClick={exportTasksToPDF}>
            <FileText className={`h-6 w-6 ${isDarkMode ? "text-white" : "text-gray-800"}`} />
          </Button>
        </div>
        <div className="flex justify-between">
          <span className={`${isDarkMode ? "text-white" : "text-gray-800"}`}>{filteredTasks.length} tasks</span>
          <span className={`${isDarkMode ? "text-white" : "text-gray-800"}`}>{completionPercentage.toFixed(2)}% completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
        </div>
      </div>
      <div className="space-y-2 overflow-y-auto flex-1">
        {filteredTasks.map((t, index) => (
          <Card key={index} className={`flex justify-between items-center p-4 shadow-md rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
            {t.isEditing ? (
              <div className="flex-1">
                <Input
                  value={t.text}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleEditChange(index, e.target.value)}
                  className={`w-full ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800"}`}
                />
                <div className="flex space-x-2 mt-2">
                  <DatePicker
                    selected={t.deadline}
                    onChange={(date: Date | null) => handleDeadlineChange(index, date)}
                    showTimeSelect
                    dateFormat="Pp"
                    className={`w-[100%] p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-800"}`}
                    popperClassName="custom-datepicker" // Add custom class
                  />
                  <Dropdown
                    value={t.priority}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => handlePriorityChange(index, e.target.value as "Low" | "Medium" | "High")}
                    options={["Low", "Medium", "High"]}
                    className={`w-[50%] p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-800"}`}
                  />
                  <Dropdown
                    value={t.recurrence || "None"}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => handleRecurrenceChange(index, e.target.value as "None" | "Daily" | "Weekly" | "Monthly")}
                    options={["None", "Daily", "Weekly", "Monthly"]}
                    className={`w-[50%] p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-800"}`}
                  />
                </div>
                <Button onClick={() => saveTask(index, t.text, t.deadline, t.priority)} className="bg-green-500 text-white hover:bg-green-600 w-full mt-2">Save</Button>
              </div>
            ) : (
              <CardContent
                className={`flex-1 ${t.completed ? "line-through text-gray-500" : "text-gray-800"}`}
              >
                <div className="whitespace-normal break-words">{t.text}</div>
                <div className="text-sm text-gray-500">{t.deadline.toLocaleString()}</div> {/* Display deadline */}
                <div className={`text-sm ${t.priority === "Low" ? "text-green-500" : t.priority === "Medium" ? "text-yellow-500" : "text-red-500"}`}>{t.priority} Priority</div> {/* Display priority */}
                {t.recurrence && t.recurrence !== "None" && (
                  <div className="text-sm text-gray-500">{t.recurrence} Recurrence</div> // Display recurrence
                )}
              </CardContent>
            )}
            <div className="flex space-x">
              <Button variant="ghost" onClick={() => toggleComplete(index)}>
                <CheckCircle className={`h-5 w-5 ${t.completed ? "text-green-500" : "text-gray-400"}`} />
              </Button>
              <Button variant="ghost" onClick={() => startEditing(index)}>
                <Edit2 className="h-5 w-5 text-blue-500" />
              </Button>
              <Button variant="ghost" onClick={() => deleteTask(index)}>
                <Trash2 className="h-5 w-5 text-red-500" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
