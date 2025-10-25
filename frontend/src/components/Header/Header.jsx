import "../../App.css";
import React, { useEffect, useRef, useContext } from "react";
import neoCareLogo from "../../assets/images/NeoCare.png";
import drneo2 from "../../assets/images/drneo2.jpg";
import medrisk2 from "../../assets/images/medrisk2.jpg";
import pulsesummery2 from "../../assets/images/pulsesummery2.jpg";
import pulsesummery from "../../assets/images/pulsesummery.png";
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
  {
    path: "/contact",
    display: "Contact",
  },
];

const Header = () => {
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const { user, token } = useContext(authContext);

  // Toggle mobile/overlay menu visibility
  const toggleMenu = () => {
    if (menuRef.current) {
      menuRef.current.classList.toggle("open");
    }
  };

  return (
    <header className="header flex items-center" ref={headerRef}>
      <div className="container">
        <div className="flex items-center justify-between">
          {/* NeoCare Logo */}
          <div>
            <img className="h-16 w-auto object-contain" src={neoCareLogo} alt="NeoCare logo" />
          </div>

          {/* Navigation Menu - Only visible when logged in */}
          {token && user && (
            <div className="navigation" ref={menuRef}>
              <div className="close-menu-icon md:hidden" onClick={toggleMenu}>
                <AiOutlineClose className="w-8 h-8 cursor-pointer text-black text-2xl absolute top-4 right-4" />
              </div>
              <ul className="menu flex items-center gap-[2.7rem]">
                {navLinks.map((link, index) => (
                  <li key={index}>
                    <NavLink
                      to={link.path}
                      className={(navClass) =>
                        navClass.isActive
                          ? "text-primaryColor text-[16px] leading-7 font-[600]"
                          : "text-textColor text-[16px] leading-7 font-[500] hover:text-primaryColor"
                      }
                      onClick={toggleMenu}
                    >
                      {link.display}
                    </NavLink>
                  </li>
                ))}

                {/* Services Dropdown */}
                <li className="relative group">
                  <span className="text-textColor text-[16px] leading-7 font-[500] cursor-pointer">Services</span>
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex flex-col items-center gap-2 bg-white shadow-lg rounded-lg p-4 z-50 min-w-[180px]">
                    <Link to="/user/chatbotdoctorassistant" className="flex flex-row items-center gap-2 w-full">
                      <img src={drneo2} alt="Dr Neo" className="h-10 w-10 rounded-full shadow-md" />
                      <span className="text-sm text-gray-700 font-semibold">Dr.NEO</span>
                    </Link>
                    <Link to="/user/pulsesummery" className="flex flex-row items-center gap-2 w-full">
                      <img src={pulsesummery} alt="PulseSummery" className="h-10 w-10 rounded-full shadow-md" />
                      <span className="text-sm text-gray-700 font-semibold">PulseSummery</span>
                    </Link>
                    <Link to="/medrisk2" className="flex flex-row items-center gap-2 w-full">
                      <img src={medrisk2} alt="MedRisk" className="h-10 w-10 rounded-full shadow-md" />
                      <span className="text-sm text-gray-700 font-semibold">MedRisk</span>
                    </Link>
                    <Link to="/user/medpredict" className="flex flex-row items-center gap-2 w-full">
                      <img src={medpredict2} alt="MedPredict" className="h-10 w-10 rounded-full shadow-md" />
                      <span className="text-sm text-gray-700 font-semibold">MedPredict</span>
                    </Link>
                    <Link to="/pharmafast2" className="flex flex-row items-center gap-2 w-full">
                      <img src={pharmafast2} alt="PharmaFast" className="h-10 w-10 rounded-full shadow-md" />
                      <span className="text-sm text-gray-700 font-semibold">PharmaFast</span>
                    </Link>
                  </div>
                </li>
              </ul>
            </div>
          )}

          {/* Right side - Login/Register or Profile */}
          <div className="flex items-center gap-4">
            {token && user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile">
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
            ) : null}
            {token && user && (
              <span className="md:hidden" onClick={toggleMenu}>
                <BiMenu className="w-6 h-6 cursor-pointer" />
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
