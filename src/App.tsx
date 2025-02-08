import { useCallback, useEffect, useRef, useState } from "react";
import GraphSection from "./charts/graphRepresentation/GraphSection";
import { Flow } from "./models/Flow";
import SelectDropdownLabel, { Option } from "./components/SelectDropdownLabel";
import ConnectedComponents from "./charts/connectedComponents/ConnectedComponents";
import Eccentricity from "./charts/excentricity/Eccentricity";
import { FlowsResume } from "./models/StatisticalResume";
import RealtimeLineChart from "./charts/LineChart";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import useGetFlows from "./hooks/useGetFlows";

enum ChartID {
  GRAPH_REPRESENTATION,
  CONNECTED_COMPONENTS,
  ECCENTRICITY
}

const chartOptions : Option[] = [
  {
    label: 'Graph Representation',
    value: ChartID.GRAPH_REPRESENTATION
  },
  {
    label: 'Connected Components',
    value:  ChartID.CONNECTED_COMPONENTS
  },
  {
    label: 'Eccentricity',
    value: ChartID.ECCENTRICITY
  }
]

function App() {

  const [actualTimestamp, setActualTimestamp] = useState<number>(0);
  const [timeInterval, setTimeInterval] = useState(30_000);
  const [ipFilter, setIpFilter] = useState('');
  const [portFilter, setPortFilter] = useState('');
	const [filteredFlows, setFilteredFlows] = useState<Flow[]>([]);

  const [windowPosition, setWindowPosition] = useState(0);
  const [deltaRightResize, setDeltaRightResize] = useState(0);

  const { flows, minTimestamp, maxTimestamp, onFileSelected} = useGetFlows();

  const [selectedChart, setSelectedChart] = useState<number | string>(ChartID.GRAPH_REPRESENTATION);

  const flowsResume = new FlowsResume(flows);
  const windowSize = timeInterval / (maxTimestamp - minTimestamp) * 100;

  const [isIpAndPortNodes, setIsIpAndPortNodes] = useState(false);

  const applyFilters = useCallback(() => {
    const initialInterval = actualTimestamp;
    const finalInterval = actualTimestamp + timeInterval;
    let filteredFlows = flows.filter((flow) => {
      return flow.finalTimestampMilliseconds >= initialInterval && flow.finalTimestampMilliseconds <= finalInterval ||
      flow.initialTimestampMilliseconds >= initialInterval && flow.initialTimestampMilliseconds <= finalInterval;
    })
    if(ipFilter){
      filteredFlows = filteredFlows.filter((flow) => {
        return flow.sourceIpAddress == parseInt(ipFilter) || flow.destinationIpAddress == parseInt(ipFilter);
      })
    }

    if(portFilter){
      filteredFlows = filteredFlows.filter((flow) => {
        return flow.sourcePort == parseInt(portFilter) || flow.destinationPort == parseInt(portFilter);
      })
    }
    setFilteredFlows(filteredFlows)
  }, [flows, actualTimestamp, timeInterval, portFilter, ipFilter])
  
  useEffect(() => {
    applyFilters();
  }, [flows, applyFilters]);

  useEffect(() => {
    setActualTimestamp(minTimestamp);
  }, [minTimestamp])

  const onIntervalChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    if(parseInt(ev.target.value)){
      setTimeInterval(parseInt(ev.target.value) - actualTimestamp);
    }
  }, []);

  const onUpdateIntervalChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    if(parseInt(ev.target.value)){
      setActualTimestamp(parseInt(ev.target.value));
    }
  }, [])

  const onWindowSizeChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    if(parseInt(ev.target.value)){
      setTimeInterval(parseInt(ev.target.value));
    }
  }, [])

  const onFilterIpChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    if(ev.target.value === '' || ev.target.value === '0' || parseInt(ev.target.value)){
      setIpFilter(ev.target.value)
    }
  }, [])

  const onFilterPortChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    if(ev.target.value === '' || ev.target.value === '0' || parseInt(ev.target.value)){
      setPortFilter(ev.target.value)
    }
  }, [])

  const displayedChart = [
    {
      id: ChartID.GRAPH_REPRESENTATION,
      value: <GraphSection flows={filteredFlows} isIpAndPortNodes={isIpAndPortNodes} />
    },
    {
      id: ChartID.CONNECTED_COMPONENTS,
      value: <ConnectedComponents flows={filteredFlows} isIpAndPortNodes={isIpAndPortNodes} />
    },
    {
      id: ChartID.ECCENTRICITY,
      value: <Eccentricity flows={filteredFlows} isIpAndPortNodes={isIpAndPortNodes} />
    },
  ].filter((chart) => chart.id === selectedChart)[0].value;


  // Slidding window functions
  const intervalRef = useRef<HTMLDivElement>(null);

  const onWindowDrag = (_: DraggableEvent, ui: DraggableData) => {
    if(intervalRef){
      const intervalWidth = intervalRef.current!.offsetWidth;
      const newPosition = Math.min(windowPosition + ui.deltaX, intervalWidth - windowSize);
      const actualPercent = newPosition / intervalWidth;
      const newTimestamp = minTimestamp + Math.floor((maxTimestamp - minTimestamp) * actualPercent);
      setActualTimestamp(newTimestamp);
      setWindowPosition(newPosition);
      setDeltaRightResize(newPosition);
    }
  }

  const onLeftResizeDrag = (_: DraggableEvent, ui: DraggableData) => {
    if(intervalRef){
      const intervalWidth = intervalRef.current!.offsetWidth;
      const newPosition = Math.min(windowPosition + ui.deltaX, windowPosition + windowSize);
      const actualPercent = newPosition / intervalWidth;
      const newTimestamp = minTimestamp + Math.floor((maxTimestamp - minTimestamp) * actualPercent);
      setTimeInterval(interval => interval - (newTimestamp - actualTimestamp));
      setActualTimestamp(newTimestamp);
      setWindowPosition(newPosition);
      setDeltaRightResize(newPosition);
    }
  }

  const onRightResizeDrag = (_: DraggableEvent, ui: DraggableData) => {
    if(intervalRef){
      const intervalWidth = intervalRef.current!.offsetWidth;
      const actualPercent = ui.deltaX / intervalWidth;
      const newTimeInterval = Math.max(1, timeInterval + Math.floor((maxTimestamp - minTimestamp) * actualPercent)); 
      setTimeInterval(newTimeInterval);
      setDeltaRightResize(windowPosition -ui.deltaX);
    }
  }

  const onRightResizeDragEnd = () => {
    setDeltaRightResize(0);
    setDeltaRightResize(windowPosition);
  }

  return (
    <section className="h-screen w-screen gap-5 mr-5 bg-main-secondary">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <h4 className="text-2xl">Time Line</h4> 
          </div>
          <div className="h-full bg-main-third w-full p-6 relative">
            <div className="flex flex-row">
              <div className="flex flex-col">
              <button 
                className="bg-hover transition-all py-2 px-4 rounded-xl relative"
              >
                Add csv file
                <input type="file" onChange={onFileSelected} className="absolute top-0 right-0 left-0 bottom-0 opacity-0 cursor-pointer" />
              </button>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="ml-4 mt-2">
                  <label className="mr-2">ip number</label>
                  <input className="rounded-lg pl-1" type="text" value={ipFilter} onChange={onFilterIpChange} />
                </div>
                <div className="mt-2">
                  <label className="mr-2">port number</label>
                  <input className="rounded-lg pl-1" type="text" value={portFilter} onChange={onFilterPortChange} />
                </div>
                <div>
                  <SelectDropdownLabel options={chartOptions} value={selectedChart} onChange={setSelectedChart} />
                </div>
              </div>
            </div>  
            {
              displayedChart
            }
            <div className="mt-5 ml-7 flex flex-row">
              <div>
                Initial interval timestamp <input className="rounded-lg pl-1" type="text" value={actualTimestamp} onChange={onUpdateIntervalChange} />
              </div>
              <div className="ml-5">
                <label className="mr-2">Final interval timestamp</label>
                <input className="rounded-lg pl-1" type="text" value={timeInterval + actualTimestamp} onChange={onIntervalChange} />
              </div>
              <div className="ml-5">
                <label className="mr-2">Window size (ms)</label>
                <input className="rounded-lg pl-1" type="text" value={timeInterval} onChange={onWindowSizeChange} />
              </div>
              <div className="ml-5">
                <input type="checkbox" id="check-id-port" onChange={() => setIsIpAndPortNodes(v => !v)} />
                <label htmlFor="check-id-port" className="ml-1">IP + port nodes</label>
              </div>
            </div>
            <div className="relative h-[80px] w-full my-5">
              <div className="absolute w-full h-full">
                <RealtimeLineChart data={flowsResume.getFlowsData()} height={80} />
              </div>
              <div ref={intervalRef} className="absolute h-full flex w-full">
                <Draggable 
                  position={{x: windowPosition, y: 0}} 
                  axis="x" 
                  bounds="parent" 
                  onDrag={onLeftResizeDrag} 
                  onStart={(ev) => ev.stopPropagation()}
                >
                  <div className="h-full w-[10px] hover:cursor-ew-resize bg-slate-500 mr-[-1px]"></div>
                </Draggable>
                <Draggable 
                  position={{x: windowPosition, y: 0}} 
                  bounds="parent" 
                  axis="x" 
                  onDrag={onWindowDrag}
                >
                  <div 
                    className="h-full opacity-90 bg-main-primary border border-slate-700 hover:cursor-grab"
                    style={{
                      width: `${windowSize || 0}%`,
                    }}
                  >
                  </div>
                </Draggable>
                <Draggable 
                  axis="x" 
                  bounds="parent" 
                  position={{x: deltaRightResize, y: 0}}
                  onDrag={onRightResizeDrag}
                  onStop={onRightResizeDragEnd}
                >
                  <div className="h-full w-[10px] hover:cursor-ew-resize bg-slate-500 ml-[-1px]"></div>
                </Draggable>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default App;
