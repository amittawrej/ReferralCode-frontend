

import React, { useState } from "react";
import { signInWithPopup, TwitterAuthProvider } from "firebase/auth";
import { useDispatch } from "react-redux";
import { auth } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { login } from "../redux/slices/userSlice";
import toast from "react-hot-toast";

const Login = () => {
  const [wallet, setWallet] = useState("");
  const [referral, setReferral] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signInWithTwitter = async (e) => {
    e.preventDefault();
    try {
      const provider = new TwitterAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      const userData = {
        userId: user.uid,
        referralCode: referral,
      };

      const response = await fetch(
        `http://localhost:4000/api/v1/auth/twitter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to authenticate with backend due to wrong referral code"
        );
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      dispatch(login({ user: data.user, accessToken: data.accessToken }));
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      toast.error("Login failed! " + error.message);
      console.log(error.message);
    }
  };

  const signInWithMetamask = async () => {
    try {
      if (window.ethereum) {
        console.log("MetaMask detected");
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const userAddress = accounts[0];
        setWallet(userAddress);

        const nonceResponse = await fetch(
          `http://localhost:4000/api/v1/auth/metamask/nonce?userAddress=${userAddress}`
        );
        const { nonce } = await nonceResponse.json();
        const message = `Sign this message to authenticate: ${nonce}`;
        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [userAddress, message],
        });
        const userData={
          userAddress,
          signature,
          nonce,
          referralCode:referral
        }
        const verifyResponse = await fetch(
          "http://localhost:4000/api/v1/auth/metamask",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(userData),
          }
        );

        const verifyData = await verifyResponse.json();
        if (verifyData) {
          console.log("Authenticated with MetaMask:", userAddress);

          toast.success("MetaMask authentication successful!");
          localStorage.setItem("token", verifyData.token);
          // dispatch(login({ user: { address: userAddress }, accessToken: verifyData.token }));
          navigate("/");
        } else {
          toast.error("MetaMask authentication failed: " + verifyData.error);
        }
      } else {
        toast.error("MetaMask is not installed.");
        console.log("MetaMask not detected");
      }
    } catch (error) {
      console.log("MetaMask connection error:", error);
      toast.error("MetaMask connection failed: " + error.message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <div>
        <input
          type="text"
          placeholder="Referral Code"
          onChange={(e) => setReferral(e.target.value)}
        />
        <button onClick={signInWithTwitter}>Twitter Signup</button>
        <button onClick={signInWithMetamask}>
          MetaMask Wallet Connect Signup
        </button>
      </div>
    </div>
  );
};

export default Login;
