import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
import ScrollToTopButton from "./ScrollToTopButton";

const MainLayout = ({
  isDrawerOpen,
  toggleDrawer,
  selected,
  handleSelect,
}) => {
  return (
    <div id="scroll-container" className="flex h-screen overflow-y-auto">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        selected={selected}
        handleSelect={handleSelect}
      />
      <div
        style={{ width: "85%" }}
        className={`flex flex-col flex-grow transition-all duration-300 ${
          isDrawerOpen ? "ml-60" : "ml-14"
        }`}
      >
        <NavBar handleSelect={handleSelect} />
        <main className="w-full flex-grow ease-soft-in-out relative h-full max-h-screen rounded-xl transition-all duration-200 mt-4">
          <Outlet />
        </main>
        <ScrollToTopButton />
      </div>
    </div>
  );
};

export default MainLayout;
