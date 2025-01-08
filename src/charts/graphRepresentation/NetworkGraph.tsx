import { useMemo, useState, useEffect } from "react";
import { Node, Link } from "../../models/NetworkTrafficGraph";
import * as d3 from "d3";
import useActiveNodesState from "../../store/activeNodesStore";
import useActiveLinksStore from "../../store/activeLinksStore";

export interface CurrentLink extends d3.SimulationLinkDatum<Node> {
  source: Node;
  target: Node;
  isAttack: boolean;
  inPacketCount: number;
  outPacketCount: number;
  inBytes: number;
  outBytes: number;
  attackType: string;
}

const getId = (node: Node) => node.id;

const RADIUS = 12;
const LINK_WIDTH = 3;
const LINK_DISTANCE = 5;
const NODE_STRENGTH = -0.001;
const FORCE_RADIUS_FACTOR = 1.2;

function d3Map<T, U>(
  data: T[],
  keyAccessor: (datum: T) => string,
  valueAccessor: (datum: T) => U
): Map<string, U> {
  return new Map(
    Array.from(data, (datum) => [keyAccessor(datum), valueAccessor(datum)])
  );
}

interface PropTypes{
  nodes: Node[]; 
  links: Link[]; 
  width: number;
  height: number;
}

function NetworkGraph({nodes, links, width, height}: PropTypes) {

  const addActiveNode = useActiveNodesState(state => state.addActiveNode);
  const addActiveLink = useActiveLinksStore(state => state.addActiveLink);

  const newLinks = useMemo(() => {
    const nodesMap = d3Map(nodes, getId, (d) => d);
  
    const newLinks = links.map((link) : CurrentLink => ({
      source: nodesMap.get(link.source)!,
      target: nodesMap.get(link.target)!,
      isAttack: link.isAttack,
      inBytes: link.inBytes,
      inPacketCount: link.inPacketCount,
      outBytes: link.outBytes,
      outPacketCount: link.outBytes,
      attackType: link.attackType
    }));
    return newLinks;
  }, [nodes, links]);

  const [currentNodes, setCurrentNodes] = useState<Node[]>(nodes);
  const [currentLinks, setCurrentLinks] = useState<CurrentLink[]>(newLinks);

  useEffect(() => {
    const simulation = d3.forceSimulation<Node, Link>(nodes)
      .force(
        "link",
        d3.forceLink<Node, CurrentLink>(newLinks)
          .id((d) => d.id)
          .distance(LINK_DISTANCE)
      )
      .force("center", d3.forceCenter(width / 2, height / 2).strength(1))
      .force("charge", d3.forceManyBody().strength(NODE_STRENGTH))
      .force("collision", d3.forceCollide(RADIUS * FORCE_RADIUS_FACTOR));

    // update state on every frame
    simulation.on("tick", () => {
      setCurrentNodes([...simulation.nodes()]);
      setCurrentLinks([...newLinks]);
    });

    return () => {
      simulation.stop();
    };
  }, [newLinks, nodes, width, height]);


  return <svg width={width} height={height}>
    {currentLinks.map((link, index) => {
          const { source, target } = link;
          const modSource = source as Node;
          const modTarget = target as Node;

          return (
            <line
              key={`${index}-${modSource.id}-${modTarget.id}`}
              stroke={link.isAttack ? "red" : "white"}
              className="cursor-pointer"
              strokeWidth={LINK_WIDTH}
              strokeOpacity={0.5}
              onClick={() => addActiveLink(link)}
              x1={modSource.x}
              y1={modSource.y}
              x2={modTarget.x}
              y2={modTarget.y}
            />
          );
        })}
      {currentNodes.map((node) => (
        <>
          <circle
            key={'b'+node.id}
            r={10 * node.value}
            stroke={ "black" }
            strokeWidth={1}
            fill={ "black" }
            cx={node.x}
            cy={node.y}
            />
          <circle
            key={node.id}
            className="cursor-pointer"
            r={10 * node.value}
            stroke={ node.attackedBy.size !== 0 ? "red" : "white" }
            strokeWidth={1}
            fill={ node.attackedBy.size !== 0 ? "red" : "white" }
            cx={node.x}
            cy={node.y}
            opacity={node.value}
            onClick={() => {addActiveNode(node)}}
          />
        </>
      ))}
  </svg>
}

export default NetworkGraph;
