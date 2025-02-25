import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

function TodoDashboard() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const { data, error } = await supabase.from("todos").select("*").order("created_at", { ascending: false });
    if (error) console.log(error);
    else setTodos(data);
  }

  async function addTodo() {
    const { data, error } = await supabase.from("todos").insert([{ task, completed: false }]);
    if (error) console.log(error);
    else fetchTodos();
    setTask("");
  }

  async function toggleComplete(id, completed) {
    await supabase.from("todos").update({ completed: !completed }).eq("id", id);
    fetchTodos();
  }

  async function deleteTodo(id) {
    await supabase.from("todos").delete().eq("id", id);
    fetchTodos();
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <div>
      <h2>Todo List</h2>
      <button onClick={logout}>Logout</button>
      <input type="text" placeholder="New task" value={task} onChange={(e) => setTask(e.target.value)} />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
              {todo.task}
            </span>
            <button onClick={() => toggleComplete(todo.id, todo.completed)}>
              {todo.completed ? "Undo" : "Complete"}
            </button>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoDashboard;
