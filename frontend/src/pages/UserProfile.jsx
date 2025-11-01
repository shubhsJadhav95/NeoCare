import React, { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authContext } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";
import defaultAvatar from "../assets/images/patient-avatar.png";

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, role, dispatch } = useContext(authContext);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Redirect to login if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <section className="py-[50px]">
      <div className="container">
        <div className="max-w-[1000px] mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Header with Logout */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h2 className="text-[32px] font-bold text-headingColor">
                My Profile
              </h2>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Logout
              </button>
            </div>

            {/* Profile Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-primaryColor flex items-center justify-center text-white text-6xl font-bold mb-4 shadow-lg">
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = defaultAvatar;
                      }}
                    />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-headingColor mb-1">
                    {user.name}
                  </h3>
                  <p className="text-base text-textColor capitalize bg-blue-50 px-4 py-1 rounded-full inline-block">
                    {role?.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Right Column - User Details */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-headingColor mb-4">
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-textColor font-medium">Full Name:</span>
                      <span className="text-headingColor font-semibold">{user.name}</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-textColor font-medium">Email:</span>
                      <span className="text-headingColor font-semibold">{user.email}</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-textColor font-medium">User ID:</span>
                      <span className="text-headingColor font-semibold">#{user.id}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-textColor font-medium">Account Type:</span>
                      <span className="text-headingColor font-semibold capitalize">
                        {role?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-headingColor mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      to="/doctors"
                      className="bg-white p-4 rounded-lg hover:shadow-md transition border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-xl">👨‍⚕️</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-headingColor">Find Doctors</h4>
                          <p className="text-xs text-textColor">Browse specialists</p>
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/services"
                      className="bg-white p-4 rounded-lg hover:shadow-md transition border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-xl">🏥</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-headingColor">Services</h4>
                          <p className="text-xs text-textColor">View all services</p>
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/contact"
                      className="bg-white p-4 rounded-lg hover:shadow-md transition border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 text-xl">📞</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-headingColor">Contact</h4>
                          <p className="text-xs text-textColor">Get in touch</p>
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/home"
                      className="bg-white p-4 rounded-lg hover:shadow-md transition border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-yellow-600 text-xl">🏠</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-headingColor">Home</h4>
                          <p className="text-xs text-textColor">Back to homepage</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
