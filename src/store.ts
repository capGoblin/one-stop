import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { create } from "zustand";

interface VideoStore {
  rtcPeerConnection: RTCPeerConnection | undefined;
}
interface ExcalidrawStore {
  excalidrawAPI: ExcalidrawImperativeAPI | undefined;
}
interface MeetStore extends ExcalidrawStore, VideoStore {
  setExcalidrawAPI: (api: ExcalidrawImperativeAPI) => void;
  setRtcPeerConnection: (peerConnection: RTCPeerConnection) => void;
}

const useMeetStore = create<MeetStore>((set) => ({
  excalidrawAPI: undefined,
  rtcPeerConnection: undefined,
  setExcalidrawAPI: (api) => set({ excalidrawAPI: api }),
  setRtcPeerConnection: (peerConnection) =>
    set({ rtcPeerConnection: peerConnection }),
}));

export default useMeetStore;
