import { CSSProperties, useEffect, useState } from "react";
import { MultiDirectedGraph } from "graphology";

import { ControlsContainer, FullScreenControl, SigmaContainer, useLoadGraph, useRegisterEvents, useSetSettings, useSigma, ZoomControl } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import { Link, Node } from "../../models/NetworkTrafficGraph";
import { integerToIp } from "../../services/Ip";
import { LayoutForceAtlas2Control, useWorkerLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import { useLayoutCircular } from "@react-sigma/layout-circular";

export type NodeType = { x: number; y: number; label: string; size: number; color: string; highlighted?: boolean };
export type EdgeType = { label: string };

const TEXT_WHITE = '#d9d9d9';
const TEXT_BLACK = '#0e0e0e';

function GraphEvents() {
  const registerEvents = useRegisterEvents();
  const sigma = useSigma();
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [darkMode, _] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const setSettings = useSetSettings<NodeType, EdgeType>();

  useEffect(() => {
    registerEvents({
      enterNode: (e) => {
        sigma.setSettings({labelColor: {color: darkMode ? TEXT_BLACK : TEXT_WHITE}});
        setHoveredNode(e.node);
      },
      leaveNode: () => {
        sigma.setSettings({labelColor: {color: darkMode ? TEXT_WHITE : TEXT_BLACK}});
        setHoveredNode(null);
      },
      downNode: (e) => {
        setDraggedNode(e.node);
        sigma.getGraph().setNodeAttribute(e.node, "highlighted", true);
      },
      mousemovebody: (e) => {
        if (!draggedNode) return;
        const pos = sigma.viewportToGraph(e);
        sigma.getGraph().setNodeAttribute(draggedNode, "x", pos.x);
        sigma.getGraph().setNodeAttribute(draggedNode, "y", pos.y);

        e.preventSigmaDefault();
        e.original.preventDefault();
        e.original.stopPropagation();
      },
      mouseup: () => {
        if (draggedNode) {
          setDraggedNode(null);
          sigma.getGraph().removeNodeAttribute(draggedNode, "highlighted");
        }
      },
      // Disable the autoscale at the first down interaction
      mousedown: () => {
        if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
      },
    });
  }, [registerEvents, sigma, draggedNode, darkMode]);

  useEffect(() => {
    const graph = sigma.getGraph();
    const connected_nodes: Set<string> = new Set();
    const connected_edges: Set<string> = new Set();

    function dfs (current_node: string){
      connected_nodes.add(current_node);
      const edges = graph.filterEdges((_, attr) => attr.target === current_node || attr.source === current_node);
      edges.forEach(e => connected_edges.add(e));
      graph.neighbors(current_node).forEach(n => {
        if(!connected_nodes.has(n)){
          dfs(n);
        }
      });
    }

    if(hoveredNode){
      connected_nodes.clear();
      connected_edges.clear();
      dfs(hoveredNode);
    }

    setSettings({
      nodeReducer: (node, data) => {
        const newData = { ...data, highlighted: data.highlighted || false, hidden: false };

        if (hoveredNode) {
          if (connected_nodes.has(node)) {
            newData.highlighted = true;
          } else {
            newData.hidden = true;
            newData.highlighted = false;
          }
        }
        return newData;
      },
      edgeReducer: (edge, data) => {
        const newData = { ...data, hidden: false };

        if (connected_edges.has(edge)) {
          newData.hidden = true;
        }
        return newData;
      },
    });
  }, [hoveredNode, setSettings, sigma]);

  return null;
}

interface GraphPropTypes {
  nodes: Node[]; 
  links: Link[]; 
}

function getSocketFromId(id: string){
  return `${integerToIp(parseInt(id.split(':')[0]))}${id.split(':')[1] ? ':' + id.split(':')[1] : ''}`
}

const FASettings = { 
  slowDown: 0.02, 
  barnesHutOptimize: true, 
  edgeWeightInfluence: 100, 
  scalingRatio: 100,
  linLogMode: true,
  gravity: 0.001,
  strongGravityMode: true
}

function GraphComponent ({nodes, links}: GraphPropTypes) {
  const loadGraph = useLoadGraph();
  const { start, stop } = useWorkerLayoutForceAtlas2({ settings: FASettings});
  const { assign: assignCircular } = useLayoutCircular({scale: 100});
  useEffect(() => {
    const graph = new MultiDirectedGraph();
    nodes.forEach(n => {
      graph.addNode(n.id, {
        id: n.id,
        x: Math.random() * 1_000,
        y: Math.random() * 1_000,
        label: getSocketFromId(n.id),
        outPacketsCount: n.outPacketsCount,
        attackedBy: n.attackedBy,
        receivedTrafficVolume: n.receivedTrafficVolume,
        sendedTrafficVolume: n.sendedTrafficVolume,
        color: n.attackedBy.size ? "red" : 'white',
        size: 5
      });
    });

    links.forEach(edge => {
      graph.addEdgeWithKey(edge.source + ':' + edge.target, edge.source, edge.target, {
        color: edge.isAttack ? "red" : "white",
        size: 1,
        attackType: edge.attackType,
        outBytes: edge.outBytes,
        inBytes: edge.inBytes,
        outPacketCount: edge.outPacketCount,
        inPacketCount: edge.inPacketCount,
        length: 50,
        
      });
    });
    loadGraph(graph);
    assignCircular();
  }, [loadGraph, nodes, links, assignCircular]);

  useEffect(() => {
    const t1 = setTimeout(() => {start()}, 100);
    const t2 = setTimeout(() => {
      stop();
      console.log('links', links.length, 'nodes', nodes.length);
    }, links.length + nodes.length + 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    }
    // return () => kill();
  }, [nodes, links]);

  return null;
}

interface PropTypes {
  style?: CSSProperties;
  nodes: Node[]; 
  links: Link[]; 
}

const BetterNetworkGraph = ({ style, links, nodes }: PropTypes) => {

  const [darkMode, _] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <SigmaContainer style={style} settings={{ allowInvalidContainer: true, labelColor: {color: darkMode ? TEXT_WHITE : TEXT_BLACK}, autoRescale: true }}>
      <GraphComponent links={links} nodes={nodes} />
      <GraphEvents />
      <ControlsContainer position={"bottom-right"}>
        <ZoomControl />
        <FullScreenControl />
        <LayoutForceAtlas2Control settings={{ settings: FASettings }} />
      </ControlsContainer>
    </SigmaContainer>
  );
};

export default BetterNetworkGraph;