import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

const LoginPage = () => {
  const [currentState, setCurrentState] = useState("Signup");
  const [dataSubmitted, setdataSubmitted] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const onSubmitHandler = (data) => {
    if (currentState === "Signup" && !dataSubmitted) {
      setdataSubmitted(true);
      return;
    }
    login(currentState === "Signup" ? "signup" : "login", data);
    navigate("/");
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center  gap-8 md:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      {/* ------------left--------------- */}
      <img src={assets.logo_big} alt="logo" className="w-[min(30vw,250px)]" />
      {/* ------------right--------------- */}
      <form
        onSubmit={handleSubmit(onSubmitHandler)}
        className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg "
      >
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currentState}
          {dataSubmitted && (
            <img
              onClick={() => setdataSubmitted(false)}
              src={assets.arrow_icon}
              alt=""
              className="w-5 cursor-pointer"
            />
          )}
        </h2>
        {currentState === "Signup" && !dataSubmitted && (
          <input
            type="text"
            className="p-2 border border-gray-500 rounded-md focus:outline-none"
            placeholder="Full Name"
            {...register("fullName", {
              required: "Full Name is required",
            })}
          />
        )}
        {errors.fullName && (
          <span className="text-red-500 text-sm">
            {errors.fullName.message}
          </span>
        )}
        {!dataSubmitted && (
          <div className="flex flex-col gap-6">
            <input
              type="email"
              placeholder="Email"
              className="p-2 border border-gray-500 rounded-md focus:outline-none"
              {...register("email", {
                required: "Email is required",
              })}
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message}
              </span>
            )}
            <input
              type="password"
              placeholder="Password"
              className="p-2 border border-gray-500 rounded-md focus:outline-none"
              {...register("password", {
                required: "Password is required",
              })}
            />
            {errors.password && (
              <span className="text-red-500 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>
        )}
        {currentState === "Signup" && dataSubmitted && (
          <textarea
            rows={4}
            className="p-2 border border-gray-500 rounded-md focus:outline-none"
            placeholder="Provide a short Bio..."
            {...register("bio", {
              required: "Bio is required",
            })}
          ></textarea>
        )}
        {errors.bio && (
          <span className="text-red-500 text-sm">{errors.bio.message}</span>
        )}
        <button type="submit" className="px-3 py-2 rounded-xl bg-[blue]">
          {currentState === "Signup" ? "Create Account" : "Login Now"}
        </button>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            {" "}
            <input type="checkbox" />
            <label className="text-[gray] text-sm">
              Agree to the terms of use and privacy policy.
            </label>
          </div>
          <div className="flex gap-2">
            <p className="text-[gray] text-sm">
              {currentState === "Signup"
                ? "Already have an account?"
                : "Create an account?"}
            </p>
            <button
              className="text-[blue]"
              onClick={() => {
                setCurrentState(currentState === "Signup" ? "Login" : "Signup");
                setdataSubmitted(false);
              }}
            >
              {currentState === "Signup" ? "Login here" : "Click here"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
