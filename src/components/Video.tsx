import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

// const Container = styled.div`
//   position: relative;
//   display: inline-block;
//   width: 240px;
//   height: 270px;
//   margin: 5px;
// `;

// interface VideoContainerProps {
//   clickedIcon: string;
// }

// const VideoContainer = styled.div<VideoContainerProps>`
//   display: ${(props) => (props.clickedIcon === "Video" ? "block" : "none")};
// `;

// const UserLabel = styled.p`
//   display: inline-block;
//   position: absolute;
//   top: 230px;
//   left: 0px;
// `;

interface Props {
  //   name: string;
  reff: React.RefObject<HTMLVideoElement>;
  muted?: boolean;
  //   clickedIcon: string;
  className?: string;
  style?: React.CSSProperties;
}

const Video = ({ reff, muted, className, style }: Props) => {
  //   const ref = useRef<HTMLVideoElement>(null);
  //   const [isMuted, setIsMuted] = useState<boolean>(false);

  //   useEffect(() => {
  //     // if (ref.current) ref.current.srcObject = stream;
  //     if (muted) setIsMuted(muted);
  //   }, [muted]);
  const defaultClassName = "m-20"; // Add default classes here

  const defaultStyle = {
    height: "60vh",
    width: "80vh",
    border: "1px solid green",
    // display: clickedIcon === "Video" ? "block" : "none",
    // Add other default styles here
  };

  return (
    // <Container>
    <video
      className={`${className} ? ${className} : ${defaultClassName} `}
      ref={reff}
      muted={muted}
      autoPlay
      style={{
        ...defaultStyle,
        ...style,
        // display: clickedIcon === "Video" ? "block" : "none",
      }}
    >
      {/* Your video content */}
    </video>
    //   <UserLabel>{name}</UserLabel>
    // </Container>
  );
};

export default Video;
