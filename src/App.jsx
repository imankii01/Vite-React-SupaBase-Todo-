import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TodoDashboard from "./pages/Dashboard";
import { Layout } from "antd";
const { Header, Content } = Layout;

function App() {
  return (
    <Layout className="h-screen">
      <Content className="flex items-center justify-center bg-gray-100">
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<TodoDashboard />} />
          </Routes>
        </Router>
      </Content>
    </Layout>
  );
}


export default App;
