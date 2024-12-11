import { Flow } from '../../models/Flow';
import ActiveModals from "../../components/ActiveModals";
import ChartSection from "../ChartSection";
import BarChart from "../BarChart";
import { EccentricityResume } from '../../models/StatisticalResume';
import { NetworkTrafficGraph } from '../../models/NetworkTrafficGraph';

interface PropTypes {
  flows: Flow[];
}

const width = 1200;
const height = 500;

function Eccentricity({flows} : PropTypes) {
  
  const networkTraffic = new NetworkTrafficGraph(flows);
  const eccentricity = new EccentricityResume(networkTraffic);

  return (
    <>
      <ActiveModals />
      <ChartSection name="Max eccentricity per graph">
        <BarChart width={width} height={height} data={eccentricity.getEccentricityData()} />
      </ChartSection>
    </>
  )
}

export default Eccentricity