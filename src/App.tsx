import React from "react";
import { useNavigate } from "react-router-dom";

function App(props) {
  const navigate = useNavigate();

  function handleSignInClickEvent() {
    navigate("/sign-in/");
  }

  function handleSignUpClickEvent() {
    navigate("/sign-up/");
  }
  return (
    <>
      <button onClick={handleSignInClickEvent}>Sign In</button>
      <button onClick={handleSignUpClickEvent}>Sign Up</button>
    </>
  );
}

export default App;
