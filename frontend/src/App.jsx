import { Outlet } from "react-router-dom";
import Navbar from "./components/HomePage/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <main className="main-content-area">
        <Outlet />
      </main>
    </>
  );
}

export default App;
