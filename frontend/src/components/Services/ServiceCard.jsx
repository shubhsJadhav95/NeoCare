import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";
import drNeo from "../../assets/images/DRNEO.png";
import virtualDoc from "../../assets/images/virtualDOC.png";
import pulseSummery from "../../assets/images/pulsesummery.png";
import pharmaScan from "../../assets/images/pharmascan.png";
import medRisk from "../../assets/images/medrisk.png";
import pharmaFast from "../../assets/images/pharmafast.png";
import medPredict from "../../assets/images/medpredict.png";

const ServiceCard = ({ item }) => {
  const navigate = useNavigate();

  const handleClick = (id) => {
    if (id === "1") {
      window.location.href = "http://localhost:5173/user/chatbotdoctorassistant";
      return;
    }
    if (id === "2") {
      window.location.href = "http://localhost:5173/user/virtualdoc";
      return;
    }
    if (id === "3") {
      window.location.href = "http://localhost:5173/user/pulsesummery";
      return;
    }
    if (id === "4") {
      window.location.href = "http://localhost:5173/user/pharmascan";
      return;
    }
    if (id === "5") {
      window.location.href = "http://localhost:5173/user/medrisk";
      return;
    }
    if (id === "6") {
      window.location.href = "http://localhost:5173/user/pharmafast";
      return;
    }
    if (id === "7") {
      window.location.href = "http://localhost:5173/user/medpredict";
      return;
    }
    navigate(`/disease/${id}`);
  };

  const { id, name, desc, bgColor, textColor } = item;

  const isChatbot = id === "1";
  const isVirtualDoc = id === "2";
  const isPulseSummery = id === "3";
  const isPharmaScan = id === "4";
  const isMedRisk = id === "5";
  const isPharmaFast = id === "6";
  const isMedPredict = id === "7";

  return (
    <div className={`py-[30px] px-3 lg:px-5 ${
      isChatbot || isVirtualDoc || isPulseSummery || isPharmaScan || isMedRisk || isPharmaFast || isMedPredict
        ? "text-center flex flex-col items-center"
        : ""
    }`}>
      <h2 className={`text-[26px] leading-9 text-headingColor font-[700] ${
        isChatbot || isVirtualDoc || isPulseSummery || isPharmaScan || isMedRisk || isPharmaFast || isMedPredict
          ? "text-center"
          : ""
      }`}>
        {name}
      </h2>
      {!isChatbot && !isVirtualDoc && !isPulseSummery && !isPharmaScan && !isMedRisk && !isPharmaFast && !isMedPredict && (
        <p className="text-[16px] leading-7 font-[400] text-textColor mt-4">{desc}</p>
      )}

      {/* Preview images removed for DR.NEO and VirtualDoc per request */}

      <div className={`${
        isChatbot || isVirtualDoc || isPulseSummery || isPharmaScan || isMedRisk || isPharmaFast || isMedPredict
          ? "flex items-center justify-center gap-4 mt-[30px]"
          : "flex items-center justify-between mt-[30px]"
      }`}>
        <div
          onClick={() => handleClick(id)}
          className={
            isChatbot || isVirtualDoc || isPulseSummery || isPharmaScan || isMedRisk || isPharmaFast || isMedPredict
              ? "flex items-center justify-center cursor-pointer"
              : "w-[44px] h-[44px] rounded-full border border-solid border-[#181A1E] flex items-center justify-center group hover:bg-primaryColor hover:border-none cursor-pointer"
          }
        >
          {isChatbot || isVirtualDoc || isPulseSummery || isPharmaScan || isMedRisk || isPharmaFast || isMedPredict ? (
            <img
              src={
                isChatbot
                  ? drNeo
                  : isVirtualDoc
                  ? virtualDoc
                  : isPulseSummery
                  ? pulseSummery
                  : isPharmaScan
                  ? pharmaScan
                  : isMedRisk
                  ? medRisk
                  : isPharmaFast
                  ? pharmaFast
                  : medPredict
              }
              alt={
                isChatbot
                  ? "DrNeo"
                  : isVirtualDoc
                  ? "VirtualDoc"
                  : isPulseSummery
                  ? "PulseSummery"
                  : isPharmaScan
                  ? "PharmaScan"
                  : isMedRisk
                  ? "MedRisk"
                  : isPharmaFast
                  ? "PharmaFast"
                  : "MedPredict"
              }
              className="object-contain w-24 h-24 sm:w-36 sm:h-36"
            />
          ) : (
            <BsArrowRight className="group-hover:text-white w-6 h-5" />
          )}
        </div>

        {!isChatbot && !isVirtualDoc && !isPulseSummery && !isPharmaScan && !isMedRisk && !isPharmaFast && !isMedPredict && (
          <span
            className="w-[44px] h-[44px] flex items-center justify-center text-[18px] leading-[30px] font-[600] "
            style={{
              background: `${bgColor}`,
              color: `${textColor}`,
              borderRadius: "6px 0 0 6px",
            }}
          >
            {id}
          </span>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;
