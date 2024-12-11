import { create } from "zustand";
import { CurrentLink } from "../charts/graphRepresentation/NetworkGraph";

interface ActiveLinksState {
    activeLinks: CurrentLink[];
    addActiveLink: (newLink: CurrentLink) => void;
    removeActiveLink: (srcNodeId: string, dstNodeId: string) => void;
}

const useActiveLinksStore = create<ActiveLinksState>()((set) => ({
    activeLinks: [],
    addActiveLink: (newLink) => set((state) => ({
        activeLinks: [...state.activeLinks, newLink]
    })),
    removeActiveLink: (srcNodeId, dstNodeId) => set((state) => ({
        activeLinks: [...state.activeLinks.filter((link) => link.source.id !== srcNodeId || link.target.id !== dstNodeId)]
    })),
}))


export default useActiveLinksStore
