import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import HomePage from "./Components/VideoCall";
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
      <div className="flex h-screen items-center justify-center space-x-44">
        <button
          className="text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold py-4 px-4 rounded-lg w-28"
          onClick={handleSignInClickEvent}
        >
          Sign In
        </button>
        <button
          className="text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold py-4 px-4 rounded-lg w-28"
          onClick={handleSignUpClickEvent}
        >
          Sign Up
        </button>
      </div>
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
