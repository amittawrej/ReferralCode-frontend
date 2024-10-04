import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { login, logout } from "../redux/slices/userSlice";
import Cookies from "js-cookie";

const Home = () => {
  const user = useSelector((state) => state.user.userInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const refreshToken = Cookies.get("refreshToken");

  useEffect(() => {
    const fetchNewTokens = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/v1/refresh-token",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to refresh tokens");
        }

        const data = await response.json();
        localStorage.setItem("token", data.token);
      } catch (error) {
        console.error("Error refreshing tokens:", error);
        navigate("/login"); // Redirect on error
      }
    };

    if (!token && refreshToken) {
      fetchNewTokens();
    } else if (token) {
      const fetchUserData = async () => {
        try {
          const response = await fetch("http://localhost:4000/api/v1/home", {
            method: "GET",
            headers: {
              Authorization: `${token}`,
            },
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }

          const data = await response.json();
          if (data && data.user) {
            dispatch(
              login({
                user: {
                  userId: data.user.id,
                  referralCode: data.user.referralCode,
                  points: data.user.points,
                },
              })
            );
          } else {
            navigate("/login");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          navigate("/login");
        }
      };

      fetchUserData();
    } else {
      navigate("/login");
    }
  }, [dispatch, navigate, token, refreshToken]);
  const submitHandler = () => {
    navigate("/dashboard");
  };

  const logoutHandler = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    Cookies.remove("refreshToken");
    navigate("/login");
  };

  return (
    <div>
      Home
      <h2>Welcome</h2>
      <button onClick={submitHandler}>Dashboard</button>
      <button onClick={logoutHandler}>Logout</button>
    </div>
  );
};

export default Home;
