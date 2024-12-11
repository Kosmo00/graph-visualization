import { Flow } from './Flow';

type NodeId = string;
type FlowId = string;

export interface Node extends d3.SimulationNodeDatum {
    id: NodeId;
    value: number;
    name?: string;
    attackedBy: NodeId[];
    inPacketsCount: number;
    outPacketsCount: number;
    receivedTrafficVolume: number;
    sendedTrafficVolume: number;
}

export interface Link extends d3.SimulationLinkDatum<Node> {
    source: NodeId;
    target: NodeId;
    isAttack: boolean;
    inPacketCount: number;
    outPacketCount: number;
    inBytes: number;
    outBytes: number;
    attackType: string;
}

export class NetworkTrafficGraph {
    nodes: Record<NodeId, Node>;
    links: Record<FlowId, Link>;
    width: number;
    height: number;
    constructor(flows: Flow[], width: number = 0, height: number = 0){
        this.nodes = {};
        this.links = {};
        this.height = height;
        this.width = width;
        flows.forEach(flow => {
            this.updateLinks(flow);
            this.updateNode(flow);
        });
        let maxPackets = 1;
        this.getNodes().forEach(node => {
            maxPackets = Math.max(maxPackets, node.inPacketsCount + node.outPacketsCount);
        })
        this.getNodes().forEach(node => {
            const newValue = 0.5 + ((node.inPacketsCount + node.outPacketsCount) / maxPackets) * 0.3;
            this.nodes[node.id] = { ...node, value: newValue };
        })
    }

    getNodes() : Node[]{
        return Object.values(this.nodes);
    }

    getLinks() : Link[]{
        return Object.values(this.links);
    }

    updateNode(flow: Flow){
        this.updateSrcNode(flow)
        this.updateDstNode(flow)
    }

    createDefaultNode(nodeId: NodeId) : Node{
        return {
            id: nodeId,
            value: 0.4,
            attackedBy: [],
            inPacketsCount: 0,
            outPacketsCount: 0,
            receivedTrafficVolume: 0,
            sendedTrafficVolume: 0,
            x: this.width / 2,
            y: this.height / 2
        } 
    }

    createDefaultLink(srcNodeId: NodeId, dstNodeId: NodeId) : Link{
        return {
            source: srcNodeId,
            target: dstNodeId,
            isAttack: false,
            inBytes: 0,
            outBytes: 0,
            inPacketCount: 0,
            outPacketCount: 0,
            attackType: 'normal_traffic'
        }
    }

    getSrcNodeId(flow: Flow) : NodeId {
        return flow.sourceIpAddress + ":" + flow.sourcePort.toString();
    }

    getDstNodeId(flow: Flow) : NodeId {
        return flow.destinationIpAddress + ":" + flow.destinationPort.toString();
    }

    updateSrcNode(flow: Flow){
        const nodeId: NodeId = this.getSrcNodeId(flow);
        if(!this.nodes[nodeId]){
            this.nodes[nodeId] = this.createDefaultNode(nodeId);
        }
        this.nodes[nodeId].inPacketsCount += flow.totalInPackets;
        this.nodes[nodeId].outPacketsCount += flow.totalOutPackets;
        this.nodes[nodeId].receivedTrafficVolume += flow.totalInBytes;
        this.nodes[nodeId].sendedTrafficVolume += flow.totalOutBytes;
    }

    updateDstNode(flow: Flow){
        const nodeId: NodeId = this.getDstNodeId(flow);
        if(!this.nodes[nodeId]){
            this.nodes[nodeId] = this.createDefaultNode(nodeId);
        }
        this.nodes[nodeId].inPacketsCount += flow.totalOutPackets;
        this.nodes[nodeId].outPacketsCount += flow.totalInPackets;
        this.nodes[nodeId].receivedTrafficVolume += flow.totalOutBytes;
        this.nodes[nodeId].sendedTrafficVolume += flow.totalInBytes;
        if(flow.isAttack){
            const attackerId: NodeId = this.getSrcNodeId(flow);
            this.nodes[nodeId].attackedBy.push(attackerId);
        }
    }

    updateLinks(flow: Flow){
        let sourceNodeId: NodeId = this.getSrcNodeId(flow);
        let destNodeId: NodeId = this.getDstNodeId(flow);
        if (destNodeId < sourceNodeId) {
            [sourceNodeId, destNodeId] = [destNodeId, sourceNodeId]
        }
        const flowId = sourceNodeId+'-'+destNodeId;
        
        if(!this.links[flowId]){
            this.links[flowId] = this.createDefaultLink(sourceNodeId, destNodeId);
        }
        if(flow.isAttack){
            this.links[flowId].isAttack = true;
            this.links[flowId].attackType = flow.attackType;
        }
        if(sourceNodeId == this.links[flowId].source){
            this.links[flowId].inBytes += flow.totalInBytes;
            this.links[flowId].outBytes += flow.totalOutBytes;
            this.links[flowId].inPacketCount += flow.totalInPackets;
            this.links[flowId].outPacketCount += flow.totalOutPackets;
        }
        else {
            this.links[flowId].outBytes += flow.totalInBytes;
            this.links[flowId].inBytes += flow.totalOutBytes;
            this.links[flowId].outPacketCount += flow.totalInPackets;
            this.links[flowId].inPacketCount += flow.totalOutPackets;
        }
    }
}
