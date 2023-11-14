import React from "react";
import { useNavigate } from "react-router-dom";
import HomePage from "./components/HomePage";

function App(props) {
  // const navigate = useNavigate();

  // function handleSignInClickEvent() {
  //   navigate("/sign-in/");
  // }

  // function handleSignUpClickEvent() {
  //   navigate("/sign-up/");
  // }
  return (
    <>
      <HomePage />
      {/* <button onClick={handleSignInClickEvent}>Sign In</button>
      <button onClick={handleSignUpClickEvent}>Sign Up</button> */}
    </>
  );
}

export default App;
