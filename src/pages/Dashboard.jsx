import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { List, Button, Input, Avatar, Layout, Spin } from "antd";
import { DeleteOutlined, CheckCircleOutlined, LogoutOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ProfileUpload from "../components/ProfileUpload";

const { Header, Content } = Layout;

// Sortable todo item
function SortableTodoItem({ todo, toggleComplete, deleteTodo }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <List.Item
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="cursor-grab p-3 bg-white dark:bg-gray-800 border rounded flex justify-between items-center"
    >
      <div className="flex items-center gap-2">
        <Avatar style={{ backgroundColor: todo.completed ? "green" : "gray" }}>{todo.completed ? "✔" : "⏳"}</Avatar>
        <span className={todo.completed ? "line-through text-gray-400" : ""}>{todo.task}</span>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => toggleComplete(todo.id, todo.completed)} icon={<CheckCircleOutlined />} />
        <Button onClick={() => deleteTodo(todo.id)} icon={<DeleteOutlined />} danger />
      </div>
    </List.Item>
  );
}

function TodoDashboard() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error) {
        setUser(data.user);
        fetchTodos(data.user.id);
      }
    };
    fetchUser();
  }, []);

  async function fetchTodos(userId) {
    setLoading(true);
    const { data, error } = await supabase.from("todos").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (!error) setTodos(data);
    setLoading(false);
  }

  async function addTodo() {
    if (!task.trim()) return;
    setLoading(true);
    await supabase.from("todos").insert([{ task, completed: false, user_id: user.id }]);
    setTask("");
    fetchTodos(user.id);
  }

  async function toggleComplete(id, completed) {
    await supabase.from("todos").update({ completed: !completed }).eq("id", id);
    fetchTodos(user.id);
  }

  async function deleteTodo(id) {
    await supabase.from("todos").delete().eq("id", id);
    fetchTodos(user.id);
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((todo) => todo.id === active.id);
    const newIndex = todos.findIndex((todo) => todo.id === over.id);

    setTodos(arrayMove(todos, oldIndex, newIndex));
  }

  return (
    <Layout className="h-screen">
      <Header className="flex justify-between items-center bg-blue-600 p-4 shadow-lg">
        <h2 className="text-white text-lg">Todo List</h2>
        <div className="flex items-center gap-4">
          {user && <ProfileUpload user={user} />}
          <Button onClick={logout} icon={<LogoutOutlined />} type="primary" danger>
            Logout
          </Button>
        </div>
      </Header>
      <Content className="p-6 max-w-lg mx-auto bg-white dark:bg-gray-900 shadow-lg rounded">
        <div className="flex gap-2">
          <Input
            placeholder="New task..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onPressEnter={addTodo}
          />
          <Button
            onClick={addTodo}
            className="bg-blue-600 text-white"
            icon={<PlusCircleOutlined />}
            loading={loading}
          >
            Add
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center mt-6">
            <Spin size="large" />
          </div>
        ) : (
          <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <SortableContext items={todos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
              <List
                className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow"
                bordered
                dataSource={todos}
                renderItem={(todo) => (
                  <SortableTodoItem key={todo.id} todo={todo} toggleComplete={toggleComplete} deleteTodo={deleteTodo} />
                )}
              />
            </SortableContext>
          </DndContext>
        )}
      </Content>
    </Layout>
  );
}

export default TodoDashboard;
