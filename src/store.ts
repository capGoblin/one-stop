import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { create } from "zustand";

interface VideoStore {
  rtcPeerConnection: RTCPeerConnection | undefined;
}
interface ExcalidrawStore {
  excalidrawAPI: ExcalidrawImperativeAPI | undefined;
}

// interface GameQuery {
//   genreId?: number;
//   platformId?: number;
//   sortOrder?: string;
//   searchText?: string;
// }
interface MeetStore extends ExcalidrawStore, VideoStore {
  //   gameQuery: GameQuery;
  setExcalidrawAPI: (api: ExcalidrawImperativeAPI) => void;
  setRtcPeerConnection: (peerConnection: RTCPeerConnection) => void;
  //   setSearchText: (searchText: string) => void;
  //   setGenreId: (genreId: number) => void;
  //   setPlatformId: (platformId: number) => void;
  //   setSortOrder: (sortOrder: string) => void;
}

const useMeetStore = create<MeetStore>((set) => ({
  //   gameQuery: {},
  excalidrawAPI: undefined,
  rtcPeerConnection: undefined,
  setExcalidrawAPI: (api) => set({ excalidrawAPI: api }),
  setRtcPeerConnection: (peerConnection) =>
    set({ rtcPeerConnection: peerConnection }),
  //   setSearchText: (searchText) => set(() => ({ gameQuery: { searchText } })),
  //   setGenreId: (genreId) =>
  //     set((store) => ({ gameQuery: { ...store.gameQuery, genreId } })),
  //   setPlatformId: (platformId) =>
  //     set((store) => ({ gameQuery: { ...store.gameQuery, platformId } })),
  //   setSortOrder: (sortOrder) =>
  //     set((store) => ({ gameQuery: { ...store.gameQuery, sortOrder } })),
}));

export default useMeetStore;
