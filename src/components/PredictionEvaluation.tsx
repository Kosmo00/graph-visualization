import { Node, Link } from "../models/NetworkTrafficGraph";
import NetworkGraph from "./NetworkGraph";

interface PropTypes {
  name: string; 
  nodes: Node[]; 
  links: Link[];
  width?: number;
  height?: number;
}

export default function PredictionEvaluation({ name, nodes, links, width=500, height=600}: PropTypes) {
  return (
    <div className="flex flex-col items-start gap-3 w-full overflow-hidden">
      <p className="text-lg text-text-primary">{name}</p>
      <div className="flex flex-col gap-6 w-full justify-center items-center bg-main-primary rounded-3xl relative">
        <NetworkGraph nodes={nodes} links={links} width={width} height={height} />
      </div>
    </div>
  );
}
