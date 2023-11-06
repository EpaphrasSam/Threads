import {create} from "zustand";

export interface ThreadCardState {
  displayReplies: number;
  replying: boolean;
}

const useThreadCardStore = create<ThreadCardState>((set:any) => ({
  displayReplies: 0,
  replying: false,
}));

export default useThreadCardStore;