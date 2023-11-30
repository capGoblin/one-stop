// import React from "react";
// import ReactDOM from "react-dom";
// import createRoot from "react-dom";
// import "./index.css";
// import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
// import {
//   ClerkProvider,
//   RedirectToSignIn,
//   SignedIn,
//   SignedOut,
//   SignIn,
//   SignUp,
// } from "@clerk/clerk-react";
// import App from "./App.tsx";
// import HomePage from "./Components/HomePage.tsx";

// import "react-grid-layout/css/styles.css";
// import "react-resizable/css/styles.css";

// if (!import.meta.env.VITE_REACT_APP_CLERK_PUBLISHABLE_KEY) {
//   throw new Error("Missing Publishable Key");
// }
// const clerkPubKey = import.meta.env.VITE_REACT_APP_CLERK_PUBLISHABLE_KEY;

// function ClerkProviderWithRoutes() {
//   const navigate = useNavigate();

//   return (
//     <ClerkProvider publishableKey={clerkPubKey} navigate={(to) => navigate(to)}>
//       <Routes>
//         <Route path="/" element={<App />} />
//         <Route
//           path="/sign-in/*"
//           element={<SignIn redirectUrl="/homepage" path="/sign-in" />}
//         />
//         <Route
//           path="/sign-up/*"
//           element={
//             <SignUp redirectUrl="/homepage" routing="path" path="/sign-up" />
//           }
//         />
//         <Route
//           path="/homepage"
//           element={
//             <>
//               <SignedIn>
//                 <HomePage />
//               </SignedIn>
//               <SignedOut>
//                 <RedirectToSignIn />
//               </SignedOut>
//             </>
//           }
//         />
//         <Route path="/homepage" element={<HomePage />} />
//       </Routes>
//     </ClerkProvider>
//   );
// }

// createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     {/* <App /> */}
//     <BrowserRouter>
//       <ClerkProviderWithRoutes />
//     </BrowserRouter>
//   </React.StrictMode>
// );

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import {
  ClerkProvider,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
} from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import App from "./App.tsx";
import HomePage from "../src/Components/VideoCall.tsx";

if (!import.meta.env.VITE_REACT_APP_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}
const clerkPubKey = import.meta.env.VITE_REACT_APP_CLERK_PUBLISHABLE_KEY;

function ClerkProviderWithRoutes() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={{
        baseTheme: dark,
      }}
      navigate={(to) => navigate(to)}
    >
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/sign-in/*"
          element={
            <SignIn
              redirectUrl="/homepage"
              path="/sign-in"
              appearance={{
                elements: {
                  rootBox: "flex h-screen w-screen justify-center items-center",
                },
              }}
            />
          }
        />
        <Route
          path="/sign-up/*"
          element={
            <SignUp redirectUrl="/homepage" routing="path" path="/sign-up" />
          }
        />
        <Route
          path="/homepage"
          element={
            <>
              <SignedIn>
                <HomePage />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route path="/homepage" element={<HomePage />} />
      </Routes>
    </ClerkProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* <App /> */}
    <BrowserRouter>
      <ClerkProviderWithRoutes />
    </BrowserRouter>
  </React.StrictMode>
);
