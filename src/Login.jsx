import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import Input from "./Input";
import "./Login.css";

import {
  signinWithgoogle,
  creataUserdocfromauth,
  signinuser,
} from "./utils/firebase";

import { UserContext } from "./context/UserContext";

function Login() {
  const navigate = useNavigate();

  const { setcurrentuser } = useContext(UserContext);

  const [contact, setcontact] = useState({
    email: "",
    password: "",
  });

  const [error, seterror] = useState("");
  const [loading, setloading] = useState(false);

  const { email, password } = contact;

  function handleContact(event) {
    const { name, value } = event.target;

    setcontact((prevValue) => ({
      ...prevValue,
      [name]: value,
    }));
  }

  async function handlelogin(event) {
    event.preventDefault();
    seterror("");

    if (!email.trim() || !password) {
      seterror("Please enter your email and password.");
      return;
    }

    try {
      setloading(true);

      const result = await signinuser(email, password);
      const user = result.user;

      // Update the logged-in user
      setcurrentuser(user);

      // Navigate after successful authentication
      navigate("/profile");

      // Create the Firestore document if it doesn't exist
      try {
        await creataUserdocfromauth(user);
      } catch (firestoreError) {
        console.error(
          "Could not create user document:",
          firestoreError.code,
          firestoreError.message
        );
      }
    } catch (error) {
      console.error("Login failed:", error.code, error.message);

      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          seterror("Incorrect email or password.");
          break;

        case "auth/invalid-email":
          seterror("Please enter a valid email address.");
          break;

        case "auth/too-many-requests":
          seterror("Too many attempts. Please try again later.");
          break;

        case "auth/network-request-failed":
          seterror("Network error. Check your internet connection.");
          break;

        default:
          seterror(error.message || "Login failed. Please try again.");
      }
    } finally {
      setloading(false);
    }
  }

  async function handleuser() {
    seterror("");

    try {
      setloading(true);

      const result = await signinWithgoogle();
      const user = result.user;

      setcurrentuser(user);
      navigate("/profile");
    } catch (error) {
      console.error("Google sign-in failed:", error.code, error.message);

      if (error.code === "auth/popup-closed-by-user") {
        seterror("Google sign-in was cancelled.");
      } else {
        seterror(error.message || "Google sign-in failed.");
      }
    } finally {
      setloading(false);
    }
  }

  return (
    <div className="head">
      <div className="login-style">
        <h2>Login</h2>

        <form onSubmit={handlelogin}>
          <Input
            name="email"
            type="email"
            placeholder="Enter email"
            onChange={handleContact}
          />

          <br />

          <Input
            name="password"
            type="password"
            placeholder="Enter password"
            onChange={handleContact}
          />

          <br />

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>

        <br />

        <button
          type="button"
          onClick={handleuser}
          disabled={loading}
        >
          Continue with Google
        </button>

        {error && <p className="error-message">{error}</p>}

        <br />

        <Link to="/signup">Instead, sign up</Link>
      </div>
    </div>
  );
}

export default Login;
