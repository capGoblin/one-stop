import React, { useState } from "react";
import { FaVideo } from "react-icons/fa";
import { GoHome } from "react-icons/go";
import { BsPencilFill } from "react-icons/bs";
import { PiFileTextBold } from "react-icons/pi";
import { RiCodeBoxFill } from "react-icons/ri";
import { IconType } from "react-icons";
// import { IoSettingsSharp } from "react-icons/io";
// import IconType from "react-icons";

interface Props {
  clickedIcon: (arg0: string) => void;
}
// interface ClickedIcons {
//   GoHome: boolean;
//   Draw: boolean;
//   Video: boolean;
//   FileText: boolean;
//   CodeBox: boolean;
// }
interface ClickedIcons {
  [key: string]: boolean;
}
const SideBar = (props: Props) => {
  const initial = "Video";
  // const [initial, setInitial] = useState<string>("Video");
  const [clickedIcons, setClickedIcons] = useState<ClickedIcons>({
    GoHome: false,
    Draw: false,
    Video: false,
    FileText: false,
    CodeBox: false,
  });
  function handleIconClick(arg0: string) {
    // console.log(arg0);
    // setInitial(arg0);
    // console.log(initial);
    props.clickedIcon(arg0 === undefined ? initial : arg0);

    const clickedIconKey = arg0 as keyof ClickedIcons;

    setClickedIcons((prevState) => {
      const newState: ClickedIcons = {};

      for (const key in prevState) {
        if (key === clickedIconKey) {
          newState[key] = !prevState[key];
        } else {
          newState[key] = false;
        }
      }

      return newState;
    });
  }

  return (
    <div className="fixed w-20 z-50 top-1/2 left-2 rounded-2xl transform -translate-y-1/2 flex flex-col items-center bg-gray-950 text-white shadow hover:shadow-2xl">
      <SideBarIcon
        icon={<GoHome />}
        onClick={() => {
          handleIconClick("GoHome");
        }}
        isClicked={clickedIcons["GoHome"]}
      />
      <SideBarIcon
        icon={<BsPencilFill />}
        onClick={() => {
          handleIconClick("Draw");
        }}
        isClicked={clickedIcons["Draw"]}
      />
      <SideBarIcon
        icon={<FaVideo />}
        onClick={() => {
          handleIconClick("Video");
        }}
        isClicked={clickedIcons["Video"]}
      />
      <SideBarIcon
        icon={<PiFileTextBold />}
        onClick={() => {
          handleIconClick("FileText");
        }}
        isClicked={clickedIcons["FileText"]}
      />
      <SideBarIcon
        icon={<RiCodeBoxFill />}
        onClick={() => {
          handleIconClick("CodeBox");
        }}
        isClicked={clickedIcons["CodeBox"]}
      />
    </div>
  );
};

interface Icon {
  icon: React.ReactElement;
  onClick: () => void;
  isClicked: boolean;
}
const SideBarIcon = (i: Icon) => {
  return (
    <div
      className={`sidebar-icons ${
        i.isClicked ? "text-gray-900 bg-secondary" : ""
      }`}
      onClick={i.onClick}
    >
      {i.icon}
    </div>
  );
};

export default SideBar;
