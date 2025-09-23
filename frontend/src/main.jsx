import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Global CSS imports
import "./assets/css/customQuillStyles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./assets/css/responsive.css";

import { ToastProvider } from "./context/ToastContext";
import { SidebarProvider } from "./context/sidebarContext.jsx";

import Home from "./components/HomePage/Home";
import InnoCheckPage from "./components/Innocheck/InnoCheckPage";
import ProvisioDraft from "./components/ProvisioDraft/ProvisioDraftPage";
import HomeTwo from "./components/HomePage2/HomeTwo";
import InnoCheckNext from "./components/InnoCheckNext/InnoCheckNext";
import DraftMaster from "./components/DraftMaster/DraftMasterPage";
import Projects from "./components/Projects/Projects";
import CreateIDFPage from "./components/CreateIDF/CreateIDFPage";

// App component will now serve as the root layout
import App from "./App.jsx";

// Define the router configuration
const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/homeTwo", element: <HomeTwo /> },
      { path: "/innoCheck", element: <InnoCheckPage /> },
      { path: "/innoCheckNext", element: <InnoCheckNext /> },
      { path: "/provisioDraft", element: <ProvisioDraft /> },
      { path: "/draftMaster", element: <DraftMaster /> },
      { path: "/projects", element: <Projects /> },
      { path: "/CreateIDF", element: <CreateIDFPage /> },
    ],
  },
]);

// Render the application
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SidebarProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </SidebarProvider>
  </React.StrictMode>
);
