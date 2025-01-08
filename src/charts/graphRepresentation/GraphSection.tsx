import { NetworkTrafficGraph } from "../../models/NetworkTrafficGraph";
import { Flow } from '../../models/Flow';
import { useMemo } from 'react';
import ActiveModals from "../../components/ActiveModals";
import ChartSection from "../ChartSection";
import NetworkGraph from "./NetworkGraph";

interface PropTypes {
  flows: Flow[];
  isIpAndPortNodes: boolean;
}

const width = 1200;
const height = 500;

function GraphSection({flows, isIpAndPortNodes} : PropTypes) {
  const currentGraph = useMemo(() => new NetworkTrafficGraph(flows, width, height, isIpAndPortNodes), [flows, isIpAndPortNodes]);
  return (
    <>
      <ActiveModals />
      <ChartSection name="Graph representation">
        <NetworkGraph nodes={currentGraph.getNodes()} links={currentGraph.getLinks()}  width={width} height={height} />   
      </ChartSection>
    </>
  )
}

export default GraphSection