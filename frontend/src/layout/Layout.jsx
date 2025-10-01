import React from "react";
import Header from "../components/Header/Header";
import Routers from "../routes/Routers";
// Footer removed per request
const Layout = () => {
  return (
    <div>
      <Header />
      <main>
        <Routers />
      </main>
    </div>
  );
};

export default Layout;
