import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

function App() {
  const navigate = useNavigate();

  function handleSignInClickEvent() {
    navigate("/sign-in/");
  }

  function handleSignUpClickEvent() {
    navigate("/sign-up/");
  }
  return (
    <>
      {/* <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-between"> */}
      <div
        style={{
          background: "#1C1919",
        }}
        className="h-screen"
      >
        <div className="flex flex-col items-center justify-center">
          <img
            // className="px-8 py-4"
            className="px-8 py-4 transition duration-300 ease-in-out transform hover:scale-105"
            // className="px-8 py-4 transition duration-300 ease-in-out transform hover:scale-110"
            style={{ height: "10rem", width: "16rem" }}
            src={logo}
            alt="Description"
          />
          <p
            className="font-extrabold text-center text-transparent text-2xl bg-clip-text bg-gradient-to-r from-yellow-600 to-red-600 transition duration-300 ease-in-out transform hover:scale-105"
            style={{ height: "10rem", width: "40rem" }}
          >
            A Place to Meet, Draw, Write, Code, and Collaborate in One Stop.
          </p>
        </div>
        <div className="flex h-28 items-end justify-center space-x-44 border-secondary">
          <button
            className="text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold py-4 px-4 rounded-lg w-28 border border-secondary transition duration-300 ease-in-out transform hover:scale-105"
            onClick={handleSignInClickEvent}
          >
            Sign In
          </button>
          <button
            className="text-secondary bg-gray-900 hover:text-gray-900 hover:bg-secondary hover:font-bold font-semibold py-4 px-4 rounded-lg w-28 border border-secondary transition duration-300 ease-in-out transform hover:scale-105"
            onClick={handleSignUpClickEvent}
          >
            Sign Up
          </button>
        </div>
      </div>
      {/* </div> */}
      {/* <div
        style={{
          background: "#1C1919",
        }}
      >
        <div className="flex flex-col justify-between">
          <div
            style={{
              background: "#1C1919",
              borderColor: "blue",
              // width: "10v",
            }}
            className="top-0 left-0 w-1 h-1"
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />
          <p className="text-6xl h-80 w-3/5 text-amber-200 align-bottom text-right mt-80 mr-64">
            A Place to meet, draw, write, code and collaborate in one stop.
          </p>
        </div>
        <div className="flex h-screen items-center justify-center space-x-44">
          <button
            className="text-secondary bg-gray-900 hover:text-gray-900 hover:font-bold font-semibold py-4 px-4 rounded-lg w-28"
            onClick={handleSignInClickEvent}
          >
            Sign In
          </button>
          <button
            className="bg-gradient-to-r from-blue-800 to-indigo-900  bg-gray-900 hover:text-gray-900 hover:bg-blue-800 hover:font-bold font-semibold py-4 px-4 rounded-lg w-28"
            onClick={handleSignUpClickEvent}
          >
            Sign Up
          </button>
        </div>
      </div> */}
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
