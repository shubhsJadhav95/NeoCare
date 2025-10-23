import React from "react";
import heroImage01 from "../assets/images/hero-img01.png";
import heroImage02 from "../assets/images/hero-img02.png";
import heroImage03 from "../assets/images/hero-img03.png";
import icon01 from "../assets/images/icon01.png";
import icon02 from "../assets/images/icon02.png";
import icon03 from "../assets/images/icon03.png";
// removed feature section assets
import faqImg from "../assets/images/faq-img.png";
// removed feature section assets
import { Link } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";
// About section removed per request
import ServiceList from "../components/Services/ServiceList";
import DoctorList from "../components/Doctors/DoctorList";
import FaqList from "../components/Faq/FaqList";
// Testimonial section removed per request
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Home = () => {
  const navigate = useNavigate();
  
  const bookAppointment = async () => {
    toast.success("Find your Doctor");
    navigate("/doctors");
  };
  return (
    <>
      {/* ========== Hero Section ========== */}
      <section className="hero__section pt-[60px] 2xl:h-[800px]">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-[90px] items-center justify-between">
            {/* ========== Hero Content ========== */}
            <div>
              <div className="lg:w-[570px]">
                <h1 className="text-[36px] leading-[46px] text-headingColor font-[800] md:text-[45px] md:leading-[70px]">
                  A Smart Solution for Better Healthcare: Helping patients live
                  healthier, longer lives.
                </h1>
                <p className="text__para">
                  We have developed a healthcare platform that supports the
                  diagnosis, treatment, and management of seven major diseases,
                  aiming to improve patient quality of life with accurate
                  information, customized treatment plans, and ongoing support.
                </p>
                <button onClick={bookAppointment} className="btn">
                  Request an Appointment
                </button>
              </div>
              {/* ========== Hero Counter */}
              <div className="mt-[30px] lg:mt-[70px] flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-[30px]">
                <div>
                  <h2 className="text-[36px] leading-[56px] lg:text-[44px] lg:leading-[54px] font-[700] text-headingColor">
                    30+
                  </h2>
                  <span className="w-[100px] h-2 bg-yellowColor rounded-full block mt-[-14px]"></span>
                  <p className="text__para">Years of Experience</p>
                </div>

                <div>
                  <h2 className="text-[36px] leading-[56px] lg:text-[44px] lg:leading-[54px] font-[700] text-headingColor">
                    15+
                  </h2>
                  <span className="w-[100px] h-2 bg-purpleColor rounded-full block mt-[-14px]"></span>
                  <p className="text__para">Clinic Location</p>
                </div>

                <div>
                  <h2 className="text-[36px] leading-[56px] lg:text-[44px] lg:leading-[54px] font-[700] text-headingColor">
                    100%
                  </h2>
                  <span className="w-[100px] h-2 bg-irisBlueColor rounded-full block mt-[-14px]"></span>
                  <p className="text__para">Patient Satisfaction</p>
                </div>
              </div>
            </div>
            {/* ========== Hero Content ========== */}

            <div className="flex gap-[30px] justify-end">
              <div>
                <img src={heroImage01} className="w-full" alt="" />
              </div>
              <div className="mt-[30px]">
                <img src={heroImage02} className="w-full mb-[30px]" alt="" />
                <img src={heroImage03} className="w-full" alt="" />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ========== Hero Section End ========== */}

      {/* Intro services section removed per request */}

      {/* About section removed per request */}

      {/* ========== Services Section ========== */}
      <section>
        <div className="container">
          <div className="xl:w-[470px] mx-auto">
            <h2 className="heading text-center">Our medical services</h2>
            <p className="text__para text-center">
              World-class care for everyone. Our health system offers
              unmatched, expert health care.
            </p>
          </div>
          <ServiceList />
        </div>
      </section>
      {/* ========== Services Section end ========== */}


      {/* Feature section removed per request */}

      {/* ========== Our Great Doctors Section ========== */}
      <section>
        <div className="container">
          <div className="xl:w-[470px] mx-auto">
            <h2 className="heading text-center">Our greate doctors</h2>
            <p className="text__para text-center">
              World-class care for everyone. Our health system offers
              unmathched, expert health care.
            </p>
          </div>
          <DoctorList />
        </div>
      </section>
      {/* ========== Our Great Doctors Section end ========== */}

      {/* ========== Faqs Section ========== */}
      <section>
        <div className="container">
          <div className="flex justify-between gap-[50px] lg:gap-0">
            <div className="w-1/2 hidden md:block">
              <img src={faqImg} alt="" />
            </div>

            <div className="w-full md:w-1/2">
              <h2 className="heading">
                Most questions asked by our beloved customers
              </h2>
              <FaqList />
            </div>
          </div>
        </div>
      </section>
      {/* ========== Faqs Section end ========== */}

      {/* Testimonial section removed per request */}
    </>
  );
};

export default Home;
