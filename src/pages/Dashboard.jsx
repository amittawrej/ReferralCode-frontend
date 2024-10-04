import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = useSelector((state) => state.user.userInfo);
  useEffect(() => {
    if (!token && !user) {
      navigate("/login");
    }
  }, []);
  const submitHandler = () => {
    navigate("/");
  };
  return (
    <div>
      Dashboard
      <button onClick={submitHandler}>Home</button>
    </div>
  );
};

export default Dashboard;
