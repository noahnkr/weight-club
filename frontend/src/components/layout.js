import { Outlet } from "react-router-dom";
import Navbar from "./navbar";
import "../styles/style.css";

const Layout = () => {
  return (
    <div className="App">
      <Navbar />
      <div className="main">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
