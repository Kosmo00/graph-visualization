import { NetworkTrafficGraph } from "../../models/NetworkTrafficGraph";
import { Flow } from '../../models/Flow';
import { useMemo } from 'react';
import ActiveModals from "../../components/ActiveModals";
import ChartSection from "../ChartSection";
import BetterNetworkGraph from "./BetterNetworkGraph";

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
        <BetterNetworkGraph style={{width, height}} links={currentGraph.getLinks()} nodes={currentGraph.getNodes()} />
      </ChartSection>
    </>
  )
}

export default GraphSection