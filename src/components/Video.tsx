import React from "react";

interface Props {
  reff: React.RefObject<HTMLVideoElement>;
  muted?: boolean;
  clickedIcon: string;
  className?: string;
  style?: React.CSSProperties;
}

const Video = ({ reff, muted, clickedIcon, className, style }: Props) => {
  const defaultClassName = "m-20 object-cover rounded-3xl"; // Add default classes here

  const defaultStyle = {
    height: "60vh",
    width: "80vh",
  };

  return (
    <video
      className={`${className} ? ${className}: ${defaultClassName} `}
      ref={reff}
      muted={muted}
      autoPlay
      style={{
        ...defaultStyle,
        ...style,
        display:
          clickedIcon === "Draw" || clickedIcon === "CodeBox"
            ? "none"
            : "block",
      }}
    ></video>
  );
};

export default Video;
