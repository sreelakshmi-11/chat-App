import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [currentState, setCurrentState] = useState("Signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [dataSubmitted, setdataSubmitted] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (currentState === "Signup" && !dataSubmitted) {
      setdataSubmitted(true);

      return;
    }
    login(currentState === "Signup" ? "signup" : "login", {
      fullName,
      email,
      password,
      bio,
    });
    navigate("/");
  };
  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center  gap-8 md:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      {/* ------------left--------------- */}
      <img src={assets.logo_big} alt="logo" className="w-[min(30vw,250px)]" />
      {/* ------------right--------------- */}
      <form
        onSubmit={onSubmitHandler}
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
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}
        {!dataSubmitted && (
          <div className="flex flex-col gap-6">
            <input
              type="email"
              placeholder="Email"
              className="p-2 border border-gray-500 rounded-md focus:outline-none"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="p-2 border border-gray-500 rounded-md focus:outline-none"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}
        {currentState === "Signup" && dataSubmitted && (
          <textarea
            rows={4}
            className="p-2 border border-gray-500 rounded-md focus:outline-none"
            placeholder="Provide a short Bio..."
            required
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          ></textarea>
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
