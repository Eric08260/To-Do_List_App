"use client";

import { useState, ChangeEvent } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Trash2, CheckCircle } from "lucide-react";
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker styles

interface Task {
  text: string;
  completed: boolean;
  deadline: Date; // Change deadline type to Date
}

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [task, setTask] = useState<string>("");
  const [deadline, setDeadline] = useState<Date | null>(null); // Change state type to Date

  const addTask = () => {
    if (task.trim() !== "" && deadline) {
      setTasks([...tasks, { text: task, completed: false, deadline }]);
      setTask("");
      setDeadline(null); // Reset deadline
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

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg h-[100vh] overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">To-Do List</h1>
      <div className="flex flex-col space-y-4 mb-4">
        <Input
          value={task}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTask(e.target.value)}
          placeholder="Add a new task"
          className="w-full"
        />
        <DatePicker
          selected={deadline}
          onChange={(date: Date | null) => setDeadline(date)}
          showTimeSelect
          dateFormat="Pp"
          className="w-full"
          placeholderText="Select deadline"
        />
        <Button onClick={addTask} className="bg-blue-500 text-white hover:bg-blue-600 w-full">Add</Button>
      </div>
      <div className="space-y-2">
        {tasks.map((t, index) => (
          <Card key={index} className="flex justify-between items-center p-4 bg-gray-100 shadow-md rounded-lg">
            <CardContent
              className={`flex-1 ${t.completed ? "line-through text-gray-500" : "text-gray-800"}`}
            >
              {t.text}
              <div className="text-sm text-gray-500">{t.deadline.toLocaleString()}</div> {/* Display deadline */}
            </CardContent>
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={() => toggleComplete(index)}>
                <CheckCircle className={`h-5 w-5 ${t.completed ? "text-green-500" : "text-gray-400"}`} />
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
