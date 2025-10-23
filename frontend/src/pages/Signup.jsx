import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import signupImg from "../assets/images/signup.gif";
import uploadImageToCloudinary from "../utils/uploadCloudinary";
import { BASE_URL } from "../config.js";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";

const Signup = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    photo: selectedFile,
    gender: "",
    role: "patient",
    // Role-specific fields
    bloodGroup: "",
    phoneNumber: "",
    specialization: "",
    licenseNumber: "",
    labName: "",
    labRegNumber: "",
    pharmacyName: "",
    pharmacyRegNo: ""
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    try {
      const data = await uploadImageToCloudinary(file);
      setPreviewUrl(data.url);
      setSelectedFile(data.url);
      setFormData({ ...formData, photo: data.url });
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Image upload failed. You can continue without a photo.');
    }
  };
  const prepareFormData = () => {
    const commonFields = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      photo: formData.photo || '',
      gender: formData.gender,
      role: formData.role.toLowerCase()
    };

    switch (formData.role.toLowerCase()) {
      case 'patient':
        return {
          ...commonFields,
          bloodGroup: formData.bloodGroup,
          phoneNumber: formData.phoneNumber
        };
      case 'doctor':
        return {
          ...commonFields,
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber
        };
      case 'labassistant':
        return {
          ...commonFields,
          labName: formData.labName,
          labRegNumber: formData.labRegNumber
        };
      case 'pharmacy':
        return {
          ...commonFields,
          pharmacyName: formData.pharmacyName,
          pharmacyRegNo: formData.pharmacyRegNo
        };
      default:
        return commonFields;
    }
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!formData.name || !formData.email || !formData.password || !formData.gender) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const requestData = prepareFormData();
      console.log('Sending registration data:', requestData);
      
      const res = await fetch(`http://localhost:8080/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      let responseData;
      const contentType = res.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await res.json();
      } else {
        responseData = { message: await res.text() };
      }
      
      console.log('Server response:', responseData);
      
      if (!res.ok) {
        const errorMsg = responseData.message || responseData.error || JSON.stringify(responseData) || 'Registration failed';
        throw new Error(errorMsg);
      }

      setLoading(false);
      toast.success(responseData.message || 'Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.message || 'Failed to register. Please try again.');
      setLoading(false);
    }
  };
  return (
    <section className="px-5 xl:px-0">
      <div className="max-w-[1170px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* ========== img box ========== */}
          <div className="hidden lg:block bg-primaryColor rounded-l-lg">
            <figure className="rounded-l-lg">
              <img src={signupImg} alt="" className="w-full rounded-l-lg" />
            </figure>
          </div>

          {/* ========== img box ========== */}
          <div className="rounded-l-lg lg:pl-16 py-10">
            <h3 className="text-headingColor text-[22px] leading-9 font-bold mb-10">
              Create an <span className="text-primaryColor">account</span>
            </h3>
            <form onSubmit={submitHandler}>
              <div className="mb-5">
                <input
                  type="text"
                  placeholder="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
                  required
                />
              </div>
              <div className="mb-5">
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
                  required
                />
              </div>
              <div className="mb-5">
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
                  required
                />
              </div>

              <div className="mb-5 flex items-center justify-between">
                <label className="text-headingColor font-bold text-[16px] leading-7">
                  Are you a:
                  <select
                    name="role"
                    className="text-textColor font-semibold text-[15px] leading-7 px-4 py-3 focus:outline-none"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="labAssistant">Lab Assistant</option>
                    <option value="pharmacy">Pharmacy</option>
                  </select>
                </label>

                <label className="text-headingColor font-bold text-[16px] leading-7">
                  Gender:
                  <select
                    name="gender"
                    className="text-textColor font-semibold text-[15px] leading-7 px-4 py-3 focus:outline-none"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="select">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              <div className="mb-5 flex items-center gap-3">
                {selectedFile && (
                  <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center">
                    <img
                      src={previewUrl}
                      className="w-full rounded-full"
                      alt=""
                    />
                  </figure>
                )}

                <div className="relative w-[130px] h-[50px]">
                  <input
                    type="file"
                    name="photo"
                    id="customFile"
                    accept=".jpg,.png"
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    // value={formData.photo}
                    onChange={handleFileInputChange}
                  />
                  <label
                    htmlFor="customFile"
                    className="absolute top-0 left-0 w-full h-full flex items-center px-[0.75rem] py-[0.375rem] text-[15px] leading-6 overflow-hidden bg-[#0066ff46] text-headingColor font-semibold rounded-lg truncate cursor-pointer"
                  >
                    Upload Photo
                  </label>
                </div>
              </div>

              {/* Patient Specific Fields */}
              {formData.role === 'patient' && (
                <>
                  <div className="mb-5">
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor"
                      required
                    />
                  </div>
                  <div className="mb-5">
                    <label className="text-headingColor font-bold text-[16px] leading-7">
                      Blood Group:
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor cursor-pointer"
                      required
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </label>
                </div>
                </>
              )}

              {/* Doctor Specific Fields */}
              {formData.role === 'doctor' && (
                <>
                  <div className="mb-5">
                    <input
                      type="text"
                      placeholder="Specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor"
                      required
                    />
                  </div>
                  <div className="mb-5">
                    <input
                      type="text"
                      placeholder="License Number"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor"
                      required
                    />
                  </div>
                </>
              )}

              {/* Lab Assistant Specific Fields */}
              {formData.role === 'labAssistant' && (
                <>
                  <div className="mb-5">
                    <input
                      type="text"
                      placeholder="Lab Name"
                      name="labName"
                      value={formData.labName}
                      onChange={handleInputChange}
                      className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor"
                      required
                    />
                  </div>
                  <div className="mb-5">
                    <input
                      type="text"
                      placeholder="Lab Registration Number"
                      name="labRegNumber"
                      value={formData.labRegNumber}
                      onChange={handleInputChange}
                      className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor"
                      required
                    />
                  </div>
                </>
              )}

              {/* Pharmacy Specific Fields */}
              {formData.role === 'pharmacy' && (
                <>
                  <div className="mb-5">
                    <input
                      type="text"
                      placeholder="Pharmacy Name"
                      name="pharmacyName"
                      value={formData.pharmacyName}
                      onChange={handleInputChange}
                      className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor"
                      required
                    />
                  </div>
                  <div className="mb-5">
                    <input
                      type="text"
                      placeholder="Pharmacy Registration Number"
                      name="pharmacyRegNo"
                      value={formData.pharmacyRegNo}
                      onChange={handleInputChange}
                      className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor"
                      required
                    />
                  </div>
                </>
              )}

              <div className="mt-7">
                <button
                  disabled={loading && true}
                  type="submit"
                  className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-4"
                >
                  {loading ? (
                    <HashLoader size={35} color="#ffffff" />
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </div>
              <p className="mt-5 text-textColor text-center">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primaryColor font-medium ml-1"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signup;
