import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import HomePage from "./Components/HomePage";
import SocketProvider from "./Contexts";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Routes,
  Redirect,
} from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

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

// {<Router>
// <Routes>
//   <Route
//     path="/"
//     element={<Navigate to={`/documents/${uuidV4()}`} />}
//   />
//   <Route path="/documents/:id">
//     <Route
//       index
//       element={
//         <>
//           {/* <SocketProvider> */}
//           <HomePage />
//           {/* </SocketProvider> */}
//         </>
//       }
//     />
//   </Route>
// </Routes>
// </Router>}
