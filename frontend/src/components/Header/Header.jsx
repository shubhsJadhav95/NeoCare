import "../../App.css";
import React, { useEffect, useRef, useContext } from "react";
import neoCareLogo from "../../assets/images/NeoCare.png";
import drneo2 from "../../assets/images/drneo2.jpg";
import medrisk2 from "../../assets/images/medrisk2.jpg";
import pulsesummery2 from "../../assets/images/pulsesummery2.jpg";
import medpredict2 from "../../assets/images/medpredict2.jpg";
import pharmafast2 from "../../assets/images/pharmafast2.jpg";
import defaultAvatar from "../../assets/images/patient-avatar.png";
import { NavLink, Link } from "react-router-dom";
import { BiMenu } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import { authContext } from "../../context/AuthContext.jsx";

const navLinks = [
  {
    path: "/home",
    display: "Home",
  },
];

const Header = () => {
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const { user, role, token } = useContext(authContext);

  const handleStickyHeader = () => {
    window.addEventListener("scroll", () => {
      if (
        document.body.scrollTop > 80 ||
        document.documentElement.scrollTop > 80
      ) {
        headerRef.current.classList.add("sticky__header");
      } else {
        headerRef.current.classList.remove("sticky__header");
      }
    });
  };

  useEffect(() => {
    handleStickyHeader();
    return () => window.removeEventListener("scroll", handleStickyHeader);
  }, []);

  const toggleMenu = () => menuRef.current.classList.toggle("show__menu");

  return (
    <header className="header flex items-center" ref={headerRef}>
      <div className="container">
        <div className="flex items-center justify-between">
          {/* ===========Logo ==========*/}
          <div>
            <img className="h-16 w-auto object-contain" src={neoCareLogo} alt="NeoCare logo" />
          </div>
          {/* =========== Menu ==========*/}
          <div className="navigation" ref={menuRef}>
            <div className="close-menu-icon md:hidden" onClick={toggleMenu}>
              <AiOutlineClose className="w-8 h-8 cursor-pointer text-black text-2xl absolute top-4 right-4" />
            </div>
            <ul className="menu flex items-center gap-[2.7rem]">
              <li>
                <NavLink
                  to="/home"
                  className={(navClass) =>
                    navClass.isActive
                      ? "text-primaryColor text-[16px] leading-7 font-[600]"
                      : "text-textColor text-[16px] leading-7 font-[500] hover:text-primaryColor"
                  }
                  onClick={toggleMenu}
                >
                  Home
                </NavLink>
              </li>
              <li className="relative group">
                <span className="text-textColor text-[16px] leading-7 font-[500] cursor-pointer">Services</span>
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex flex-col items-center gap-2 bg-white shadow-lg rounded-lg p-4 z-50 min-w-[180px]">
                  <Link to="/chatbotdoctorassistant" className="flex flex-row items-center gap-2 w-full">
                    <img src={drneo2} alt="Dr Neo2" className="h-10 w-10 rounded-full shadow-md" />
                    <span className="text-sm text-gray-700 font-semibold">DrNeo</span>
                  </Link>
                  <Link to="/medrisk2" className="flex flex-row items-center gap-2 w-full">
                    <img src={medrisk2} alt="MedRisk2" className="h-10 w-10 rounded-full shadow-md" />
                    <span className="text-sm text-gray-700 font-semibold">MedRisk</span>
                  </Link>
                  <Link to="/medpredict2" className="flex flex-row items-center gap-2 w-full">
                    <img src={medpredict2} alt="MedPredict2" className="h-10 w-10 rounded-full shadow-md" />
                    <span className="text-sm text-gray-700 font-semibold">MedPredict</span>
                  </Link>
                  <Link to="/pulsesummery2" className="flex flex-row items-center gap-2 w-full">
                    <img src={pulsesummery2} alt="PulseSummery2" className="h-10 w-10 rounded-full shadow-md" />
                    <span className="text-sm text-gray-700 font-semibold">PulseSummery</span>
                  </Link>
                  <Link to="/pharmafast2" className="flex flex-row items-center gap-2 w-full">
                    <img src={pharmafast2} alt="PharmaFast2" className="h-10 w-10 rounded-full shadow-md" />
                    <span className="text-sm text-gray-700 font-semibold">PharmaFast</span>
                  </Link>
                  {/* <Link to="/pharmscan2" className="flex flex-row items-center gap-2 w-full">
                    <img src={pharmscan2} alt="PharmScan2" className="h-10 w-10 rounded-full shadow-md" />
                    <span className="text-sm text-gray-700 font-semibold">PharmScan2</span>
                  </Link> */}
                </div>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={(navClass) =>
                    navClass.isActive
                      ? "text-primaryColor text-[16px] leading-7 font-[600]"
                      : "text-textColor text-[16px] leading-7 font-[500] hover:text-primaryColor"
                  }
                  onClick={toggleMenu}
                >
                  Contact
                </NavLink>
              </li>
            </ul>
          </div>

          {/* ========== nav right ========== */}
          <div className="flex items-center gap-4">
            {token && user ? (
              <div>
                <Link
                  to={
                    role === "doctor"
                      ? "/doctors/profile/me"
                      : "/users/profile/me"
                  }
                >
                  <figure className="w-[35px] h-[35px] rounded-full cursor-pointer">
                    <img
                      src={user?.photo || defaultAvatar}
                      alt="User"
                      className="w-full rounded-full"
                      onError={(e) => {
                        if (e.currentTarget.src !== defaultAvatar) {
                          e.currentTarget.src = defaultAvatar;
                        }
                      }}
                    />
                  </figure>
                </Link>
              </div>
            ) : (
              <Link to="/login">
                <button className="bg-primaryColor py-2 px-6 text-white font-[600] h-[44px] flex items-center justify-center rounded-[50px]">
                  Login
                </button>
              </Link>
            )}
            <span className="md:hidden" onClick={toggleMenu}>
              <BiMenu className="w-6 h-6 cursor-pointer" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
