import { Flow } from '../../models/Flow';
import ActiveModals from "../../components/ActiveModals";
import ChartSection from "../ChartSection";
import BarChart from "../BarChart";
import { ConnectedComponentsResume } from '../../models/StatisticalResume';
import { NetworkTrafficGraph } from '../../models/NetworkTrafficGraph';

interface PropTypes {
  flows: Flow[];
  isIpAndPortNodes: boolean;
}

const width = 1200;
const height = 500;

function ConnectedComponents({flows, isIpAndPortNodes} : PropTypes) {
  
  const networkTraffic = new NetworkTrafficGraph(flows, 0, 0, isIpAndPortNodes);
  const connectedComponents = new ConnectedComponentsResume(networkTraffic);

  return (
    <>
      <ActiveModals />
      <ChartSection name="Connected components">
        <BarChart width={width} height={height} data={connectedComponents.getConnectedComponentsData()} />
      </ChartSection>
    </>
  )
}

export default ConnectedComponents