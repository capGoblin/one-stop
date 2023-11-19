import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { create } from "zustand";

interface VideoStore {
  rtcPeerConnection: RTCPeerConnection | undefined;
}
interface ExcalidrawStore {
  excalidrawAPI: ExcalidrawImperativeAPI | undefined;
}
interface TextEditorStore {
  editorValue: string;
}
interface MeetStore extends ExcalidrawStore, VideoStore, TextEditorStore {
  setExcalidrawAPI: (api: ExcalidrawImperativeAPI | undefined) => void;
  setRtcPeerConnection: (peerConnection: RTCPeerConnection) => void;
  setEditorValue: (editorValue: string) => void;
}

const useMeetStore = create<MeetStore>((set) => ({
  excalidrawAPI: undefined,
  rtcPeerConnection: undefined,
  editorValue: "",
  setExcalidrawAPI: (api) => set({ excalidrawAPI: api }),
  setRtcPeerConnection: (peerConnection) =>
    set({ rtcPeerConnection: peerConnection }),
  setEditorValue: (value) => set({ editorValue: value }),
}));

export default useMeetStore;
