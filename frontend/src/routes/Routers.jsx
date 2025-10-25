import React from "react";
import Home from "../pages/Home";
import Services from "../pages/Services";
import Signup from "../pages/Signup";
import Symptomchk from "../pages/Symptomchk";
import Login from "../pages/Login";
import Contact from "../pages/Contact";
import Doctors from "../pages/Doctors/Doctors";
import DoctorDetails from "../pages/Doctors/DoctorDetails";
import { Routes, Route } from "react-router-dom";
import MyAccount from "../Dashboard/user-account/MyAccount";
import Dashboard from "../Dashboard/doctor-account/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import CheckoutSuccess from "../pages/CheckoutSuccess";
import { services } from "../assets/data/services.js";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import ResetPassword from "../pages/ResetPassword.jsx";
import UserProfile from "../pages/UserProfile";
import DrNeoChatbot from "../components/DrNeoChatbot";
import PulseSummery from "../pages/PulseSummery";
import MedPredict from "../pages/MedPredict";
import MedRisk from "../pages/MedRisk";
import PulseReport from "../pages/PulseReport";
import PharmaScan from "../pages/PharmaScan";
import PharmaMedicine from "../pages/PharmaMedicine";
import PharmaFast from "../pages/PharmaFast";
import PharmaStore from "../pages/PharmaStore";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/symptomchk" element={<Symptomchk />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/doctors/:id" element={<DoctorDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["patient", "doctor", "labassistant", "pharmacy"]}>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route path="/user/chatbotdoctorassistant" element={<DrNeoChatbot />} />

      {/* User service routes */}
      <Route path="/user/pulsesummery" element={<PulseSummery />} />
      <Route path="/user/pulsesummery/report" element={<PulseReport />} />
      <Route path="/user/medpredict" element={<MedPredict />} />
      <Route path="/user/medrisk" element={<MedRisk />} />
      <Route path="/user/pharmascan" element={<PharmaScan />} />
      <Route path="/user/pharmascan/medicine" element={<PharmaMedicine />} />
      <Route path="/user/pharmafast" element={<PharmaFast />} />
      <Route path="/user/pharmafast/pharmastore" element={<PharmaStore />} />

      <Route path="/medrisk2" element={<div>MedRisk2 Service Page</div>} />
      <Route path="/medpredict2" element={<div>MedPredict2 Service Page</div>} />
      <Route path="/pulsesummery2" element={<div>PulseSummery2 Service Page</div>} />
      <Route path="/pharmafast2" element={<div>PharmaFast2 Service Page</div>} />
      <Route path="/pharmscan2" element={<div>PharmScan2 Service Page</div>} />

      <Route
        path="/services"
        element={
          <ProtectedRoute allowedRoles={["patient", "doctor", "admin", "labassistant", "pharmacy"]}>
            <Services />
          </ProtectedRoute>
        }
      />
      <Route path="/checkout-success" element={<CheckoutSuccess />} />
      <Route
        path="/users/profile/me"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <MyAccount />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctors/profile/me"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* DiseasePage routes removed due to missing component */}
    </Routes>
  );
};

export default Routers;
