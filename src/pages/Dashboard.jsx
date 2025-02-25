import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { List, Button, Input, Avatar, Layout } from "antd";
import { DeleteOutlined, CheckCircleOutlined, LogoutOutlined } from "@ant-design/icons";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ProfileUpload from "../components/ProfileUpload";

const { Header, Content } = Layout;

// Custom sortable item component
function SortableTodoItem({ todo, index, toggleComplete, deleteTodo }) {
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
      className="cursor-grab bg-white dark:bg-gray-800"
      actions={[
        <Button onClick={() => toggleComplete(todo.id, todo.completed)} icon={<CheckCircleOutlined />} />,
        <Button onClick={() => deleteTodo(todo.id)} icon={<DeleteOutlined />} danger />,
      ]}
    >
      <List.Item.Meta
        title={todo.task}
        avatar={<Avatar style={{ backgroundColor: todo.completed ? "green" : "gray" }}>{todo.completed ? "✔" : "⏳"}</Avatar>}
      />
    </List.Item>
  );
}

function TodoDashboard() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const navigate = useNavigate();
  const user = supabase.auth.getUser();

  useEffect(() => {
    if (user) fetchTodos();
  }, []);

  async function fetchTodos() {
    const { data, error } = await supabase.from("todos").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (!error) setTodos(data);
  }

  async function addTodo() {
    await supabase.from("todos").insert([{ task, completed: false, user_id: user.id }]);
    setTask("");
    fetchTodos();
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

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((todo) => todo.id === active.id);
    const newIndex = todos.findIndex((todo) => todo.id === over.id);

    setTodos(arrayMove(todos, oldIndex, newIndex));
  }

  return (
    <Layout className="h-screen">
      <Header className="flex justify-between items-center bg-blue-500 p-4">
        <h2 className="text-white text-lg">Todo List</h2>
        <div className="flex items-center gap-4">
          <ProfileUpload user={user} />
          <Button onClick={logout} icon={<LogoutOutlined />} type="primary" danger>
            Logout
          </Button>
        </div>
      </Header>
      <Content className="p-6 max-w-md mx-auto bg-white dark:bg-gray-900 shadow rounded">
        <Input
          placeholder="New task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onPressEnter={addTodo}
        />
        <Button className="mt-2 w-full bg-blue-500 text-white" onClick={addTodo}>Add</Button>
        
        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <SortableContext items={todos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
            <List
              className="mt-4"
              bordered
              dataSource={todos}
              renderItem={(todo, index) => (
                <SortableTodoItem key={todo.id} todo={todo} index={index} toggleComplete={toggleComplete} deleteTodo={deleteTodo} />
              )}
            />
          </SortableContext>
        </DndContext>
      </Content>
    </Layout>
  );
}

export default TodoDashboard;
