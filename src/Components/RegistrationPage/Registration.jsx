import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import {
  completeRegistration,
  Login,
  signUp,
} from "../../Services/UserService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "../../Styles/Register.css";
import { doLogin } from "../../Auth/auth";

export const Registration = ({ handleClose }) => {
  const navigate = useNavigate();
  const [hidePass, setHidePass] = useState(false);

  // To check if the Continue button is enabled or disabled for OTP purposes
  const [showContinueBtn, setShowContinueBtn] = useState(false);

  const [logIn, setLogIn] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [data, setData] = useState({
    uniqueUsername: "",
    email: "",
    password: "",
  });
  const [loginDetail, setLoginDetail] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState({
    errs: [],
    isError: false,
  });
  const [loginError, setLoginError] = useState({
    errs: "",
    isError: false,
  });
  const [showPlaceholder, setShowPlaceholder] = useState({
    email: false,
    username: false,
    password: false,
  });

  // otp resend countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Handle function for set function of showContinueBtn
  const handleSetShowContinueBtn = () => setShowContinueBtn((prev) => !prev);

  const handleOtpChange = (e) => setOtp(e.target.value);

  const handleFocus = (field) => {
    setShowPlaceholder({ ...showPlaceholder, [field]: true });
  };

  const handleBlur = (e, field) => {
    if (!e.target.value) {
      setShowPlaceholder({ ...showPlaceholder, [field]: false });
    }
  };

  const handleChange = (e, field) => {
    setData({ ...data, [field]: e.target.value });
  };

  const handleLoginChange = (e, field) => {
    let actualVal = e.target.value;
    setLoginDetail({
      ...loginDetail,
      [field]: actualVal,
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Toggling continue button status
    handleSetShowContinueBtn();

    Login(loginDetail)
      .then((jwtTokenData) => {
        setLoginError({
          errs: "",
          isError: false,
        });

        doLogin(jwtTokenData, () => {
          handleClose();
          navigate("/");
          window.location.reload(true);
          toast.success("Login successful!");
        });
      })
      .catch((err) => {
        const error = err?.response?.data?.error;

        // Toggling continue button status
        handleSetShowContinueBtn();

        setLoginError({
          errs:
            error != null
              ? error
              : "PLease try again later with different credentials",
          isError: true,
        });
      });
  };

  const submitForm = (e) => {
    e.preventDefault();

    // Toggling continue button status
    handleSetShowContinueBtn();
    if (!otpSent) {
      // Register and Send OTP
      signUp(data)
        .then((response) => {
          setOtpSent(true);
          setError({ errs: [], isError: false });
          setTimer(300); // Start 5-minute countdown
          toast.success("OTP sent to your email!");

          setLoginDetail({
            email: data.email,
            password: data.password,
          });

          // Toggling continue button status
          handleSetShowContinueBtn();
        })
        .catch((err) => {
          console.error("Registration error:", err);

          const errors = err?.response?.data?.errors;
          const errorMessages = Array.isArray(errors)
            ? errors
            : [
                errors?.message ||
                  "Registration error: Invalid Credentials. Please try again with different credentials",
              ];

          setError({
            errs: errorMessages,
            isError: true,
          });

          // Toggling continue button status
          handleSetShowContinueBtn();
        });
    } else {
      // Complete Registration with OTP
      completeRegistration(data.email, otp, data)
        .then((resp) => {
          setError({ errs: [], isError: false });
          handleClose();
          toast.success("Registration successful!");

          setTimeout(() => {
            handleLoginSubmit(e);
          }, 1000);
        })
        .catch((err) => {
          setError("Invalid OTP. Please try again.");
          console.error(err);

          // Toggling continue button status
          handleSetShowContinueBtn();

          const errors = err?.response?.data?.errors;
          const errorMessages = Array.isArray(errors)
            ? errors
            : [
                errors?.message ||
                  "Registration error: Invalid Credentials. Please try again with different credentials",
              ];

          setError({
            errs: errorMessages,
            isError: true,
          });
        });
    }
  };

  const handleResendOtp = () => {
    setTimer(300);
    signUp(data)
      .then(() => {
        toast.success("OTP resent to your email!");
        setLoginError({
          errs: "",
          isError: false,
        });
      })
      .catch((err) => {
        setError("Failed to resend OTP. Please try again.");
        console.error(err);

        const errors = err?.response?.data?.errors;
        const errorMessages = Array.isArray(errors)
          ? errors
          : [
              errors?.message ||
                "Registration error: Invalid Credentials. Please try again with different credentials",
            ];

        setError({
          errs: errorMessages,
          isError: true,
        });
      });
  };

  console.log("showContinueBtn");

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="h-10">
            <h1 className="font-medium text-xl text-white">
              {logIn ? "Create an account" : "Welcome Back"}
            </h1>
          </div>
          <div className="absolute top-0 right-0 px-3.5 py-1 text-[1.5rem]">
            <FontAwesomeIcon
              onClick={handleClose}
              icon={faXmark}
              style={{ cursor: "pointer", color: "#ffffff" }}
            />
          </div>

          {/* form inputs */}
          <form
            onSubmit={!logIn ? handleLoginSubmit : submitForm}
            className="form"
          >
            <div className="inputBox">
              <input
                type={"email" && "text"}
                id="user--email"
                name="useremail"
                required
                className="w-full border px-4 py-2"
                placeholder={showPlaceholder.email ? "Billy08@email.com" : ""}
                onFocus={() => handleFocus("email")}
                onBlur={(e) => handleBlur(e, "email")}
                onChange={(e) => {
                  !logIn
                    ? handleLoginChange(e, "email")
                    : handleChange(e, "email");
                  setOtpSent(false);
                }}
                value={!logIn ? loginDetail.email : data.email}
              />
              <span className="input--span">Email</span>
            </div>

            {logIn && (
              <div className="inputBox">
                <input
                  type="text"
                  id="user--name"
                  name="username"
                  required
                  className="w-full border px-4 py-2"
                  placeholder={showPlaceholder.username ? "Billy08" : ""}
                  onFocus={() => handleFocus("username")}
                  onBlur={(e) => handleBlur(e, "username")}
                  onChange={(e) => {
                    handleChange(e, "uniqueUsername");
                    setOtpSent(false);
                  }}
                  value={data.uniqueUsername}
                />
                <span className="input--span">Username</span>
              </div>
            )}
            <div className="inputBox">
              <input
                type={hidePass ? "text" : "password"}
                id="pass"
                name="password"
                required
                className="w-full border px-4 py-2"
                placeholder={showPlaceholder.password ? "••••••••" : ""}
                onFocus={() => handleFocus("password")}
                onBlur={(e) => handleBlur(e, "password")}
                onChange={(e) => {
                  !logIn
                    ? handleLoginChange(e, "password")
                    : handleChange(e, "password");
                  setOtpSent(false);
                }}
                value={!logIn ? loginDetail.password : data.password}
              />
              <span className="input--span">Password</span>

              <FontAwesomeIcon
                onClick={() => setHidePass(!hidePass)}
                icon={hidePass ? faEye : faEyeSlash}
                className="absolute top-[40%] right-[2%] text-sm cursor-pointer"
              />
            </div>

            {/* OTP Input */}
            {otpSent && logIn && (
              <div className="border border-gray-700 rounded-xl overflow-hidden h-10 flex flex-row justify-start">
                <input
                  className="h-full w-[75%] text-sm px-3 bg-transparent outline-none"
                  type="number"
                  name="OTP"
                  id="OTP"
                  placeholder="Enter OTP"
                  autoComplete="off"
                  onChange={handleOtpChange}
                  value={otp}
                  required
                />
                <button
                  onClick={() => {
                    handleResendOtp();
                  }}
                  disabled={timer > 0}
                  autoFocus
                  className={
                    timer > 0
                      ? `bg-[#27272e] w-[25%] text-sm font-medium`
                      : `bg-[#27272e] w-[25%] text-sm font-medium cursor-pointer`
                  }
                >
                  {timer > 0 ? `${timer}s` : "Resend"}
                </button>
              </div>
            )}

            {/* warning box */}
            {error.isError && logIn && (
              <div className="warning--box--animate flex-col items-start text-[0.7rem] px-2 py-1 font-medium rounded-md bg-[#2e3031] text-[#e6e1e1]">
                <ul className="list-disc pl-4">
                  {error.errs.map((item, key) => (
                    <li key={key}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {loginError.isError && !logIn && (
              <div className="warning--box--animate flex-col items-start text-[0.7rem] px-2 py-1 font-medium rounded-md bg-[#2e3031] text-[#e6e1e1]">
                <ul className="list-disc pl-4">
                  <li>{loginError.errs}</li>
                </ul>
              </div>
            )}

            {/* submit button */}
            <button
              // Changing botton CSS according to disabled status
              className={
                showContinueBtn
                  ? "py-3 rounded-3xl font-medium bg-gray-400 text-[#333] cursor-not-allowed transition-all duration-300 ease-in-out"
                  : "py-3 rounded-3xl font-medium text-[#333] bg-white hover:text-white hover:bg-[#333] transition-all duration-300 ease-in-out"
              }
              type="submit"
              disabled={showContinueBtn}
            >
              Continue
            </button>
          </form>

          <h1 className="flex flex-row justify-center items-center mt-5 text-[0.75rem]">
            {logIn ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setLogIn(false);
                  }}
                  className="mx-1 text-blue-500 cursor-pointer"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setLogIn(true);
                  }}
                  className="mx-1 text-blue-500 cursor-pointer"
                >
                  Create
                </button>
              </>
            )}
          </h1>

          <span className="divider">or</span>

          {/* google oauth button */}
          <div className="flex flex-col">
            <button className="oauth--buttons">
              Continue with Google (unavailable)
              <FontAwesomeIcon icon={faGoogle} style={{ fontSize: "1rem" }} />
            </button>
            {/* <button className="oauth--buttons">
                Continue with Apple
                <FontAwesomeIcon icon={faApple} style={{ fontSize: "1rem" }} />
              </button> */}
          </div>
        </div>
      </div>
    </>
  );
};
