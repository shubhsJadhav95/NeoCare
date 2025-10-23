import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";
import { authContext } from "../context/AuthContext.jsx";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useContext(authContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8080/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.message || 'Login failed');
      }

      // Manually set localStorage immediately
      localStorage.setItem('token', result.token);
      localStorage.setItem('role', result.role);
      localStorage.setItem('user', JSON.stringify(result.user));

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: result.user,
          token: result.token || null,
          role: result.role,
        },
      });

      setLoading(false);
      toast.success(result.message || 'Login successful!');
      
      // Navigate to home
      window.location.href = '/home';
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.message || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <section className="px-5 lg:px-0">
      <div className="w-full max-w-[570px] mx-auto rounded-lg shadow-md md:p-10">
        <h3 className="text-headingColor text-[22px] leading-9 font-bold mb-10">
          Hello
          <span className="text-primaryColor"> Welcome </span> Back 👋
        </h3>
        <form action="" className="py-4 md:py-0" onSubmit={submitHandler}>
          <div className="mb-5">
            <input
              type="email"
              placeholder="Enter Your Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
              required
            />
          </div>
          <div className="mb-5">
            <input
              type="password"
              placeholder="Enter Your Password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
              required
            />
          </div>
          <div className="mb-5">
            <Link to="/forgot-password" className="text-primaryColor">
              Forgot Password?
            </Link>
          </div>
          <div className="mt-7">
            <button
              type="submit"
              className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-4"
            >
              {loading ? <HashLoader size={25} color="#ffffff" /> : "Login"}
            </button>
          </div>
          <p className="mt-5 text-textColor text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-primaryColor font-medium ml-1">
              Register
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;
