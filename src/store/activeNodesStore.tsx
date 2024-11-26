import { create } from "zustand";
import { Node } from "../models/NetworkTrafficGraph";

interface ActiveNodesState {
    activeNodes: Node[],
    addActiveNode: (newNode: Node) => void,
    removeActiveNode: (nodeId: string) => void
}

const useActiveNodesState = create<ActiveNodesState>()((set) => ({
    activeNodes: [],
    addActiveNode: (newNode) => set((state) => ({activeNodes: [...state.activeNodes, newNode]})),
    removeActiveNode: (nodeId) => set((state) => ({activeNodes: [...state.activeNodes.filter(node => node.id !== nodeId)]}))
}))

export default useActiveNodesState;

