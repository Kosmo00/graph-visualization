// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from "react";
import GraphSection from "./charts/graphRepresentation/GraphSection";
import { Flow } from "./models/Flow";
import { v4 as uuidv4 } from "uuid";
import SelectDropdownLabel, { Option } from "./components/SelectDropdownLabel";
import ConnectedComponents from "./charts/connectedComponents/ConnectedComponents";
import Eccentricity from "./charts/excentricity/Eccentricity";
import { FlowsResume } from "./models/StatisticalResume";
import RealtimeLineChart from "./charts/LineChart";

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

  const [flows, setFlows] = useState<Flow[]>([]);
  const [filteredFlows, setFilteredFlows] = useState<Flow[]>([]);

  // Filters
  const [minTimestamp, setMinTimestamp] = useState<number>(0);
  const [maxTimestamp, setMaxTimestamp] = useState<number>(0);

  const [actualTimestamp, setActualTimestamp] = useState<number>(0);
  const [timeInterval, setTimeInterval] = useState(30_000);
  const [ipFilter, setIpFilter] = useState('');
  const [portFilter, setPortFilter] = useState('');

  const [selectedChart, setSelectedChart] = useState<number | string>(ChartID.GRAPH_REPRESENTATION);

  const flowsResume = new FlowsResume(flows);
  const windowSize = timeInterval / (maxTimestamp - minTimestamp) * 100;
  const windowPadding = (actualTimestamp - minTimestamp) / (maxTimestamp - minTimestamp) * 100;

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
  
  const onFileSelected = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files![0];
    const readText = async () => {
      const jsonObject = []
      const csvLines = (await file.text()).replace('\r', '').split('\n');
      const headers = csvLines[0].split(',');
      for(let i=0;i<headers.length;i++){
        const aux = headers[i][0].toLowerCase() + headers[i].slice(1);
        headers[i] = aux;
      }
      for(let i = 1; i < csvLines.length - 1; i++){
        const fields = csvLines[i].split(',');
        const jsonItem = {};
        jsonItem['id'] = uuidv4()
        for(let j = 0; j < fields.length; j++){
          jsonItem[headers[j]] = fields[j]
          if(headers[j] !== 'attackType'){
            jsonItem[headers[j]] = parseInt(fields[j])
          }
        }
        jsonObject.push(jsonItem);
      }
      
      setFlows(jsonObject);
      let minTs = jsonObject[0].initialTimestampMilliseconds;
      let maxTs = jsonObject[0].finalTimestampMilliseconds;
      jsonObject.forEach(flow => {
        minTs = Math.min(minTs, flow.initialTimestampMilliseconds);
        maxTs = Math.max(maxTs, flow.finalTimestampMilliseconds);
      })
      setActualTimestamp(minTs);
      setMinTimestamp(minTs);
      setMaxTimestamp(maxTs);
    }
    readText();
  }, [])

  const onSliderChange = useCallback((ev : React.ChangeEvent<HTMLInputElement>) => {
    setActualTimestamp(parseInt(ev.target.value));
  }, [])

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
      value: <GraphSection flows={filteredFlows} />
    },
    {
      id: ChartID.CONNECTED_COMPONENTS,
      value: <ConnectedComponents flows={filteredFlows} />
    },
    {
      id: ChartID.ECCENTRICITY,
      value: <Eccentricity flows={filteredFlows} />
    },
  ].filter((chart) => chart.id === selectedChart)[0].value;


  // Slidding window functions
  const intervalRef = useRef<HTMLDivElement>(null);
  const [isWindowPressed, setIsWindowPressed] = useState<boolean>(false);
  const [isLeftResizePressed, setIsLeftResizePressed] = useState<boolean>(false);
  const [isRightResizePressed, setIsRightResizePressed] = useState<boolean>(false);

  const [mouseReference, setMouseReference] = useState(0);

  const onWindowMouseMove = (ev : React.MouseEvent<HTMLDivElement>) => {
    if(isWindowPressed && intervalRef){
      const windowWidth = intervalRef.current.offsetWidth;
      const moved = ev.clientX - mouseReference;
      setMouseReference(ev.clientX);
      const percentMoved = moved / windowWidth;
      const newTimestamp = Math.min(Math.max(actualTimestamp + Math.floor((maxTimestamp - minTimestamp) * percentMoved), minTimestamp), maxTimestamp);
      setActualTimestamp(newTimestamp);
    }
  }

  const onWindowMouseDown = (ev : React.MouseEvent<HTMLDivElement>) => {
    console.log('window')
    setIsWindowPressed(true);
    setMouseReference(ev.clientX);
  }

  const onWindowMouseUp = (ev : React.MouseEvent<HTMLDivElement>) => {
    setIsWindowPressed(false);
  }

  const onLeftResizeMouseMove = (ev : React.MouseEvent<HTMLDivElement>) => {
    if(isLeftResizePressed && intervalRef){
      const windowWidth = intervalRef.current.offsetWidth;
      const moved = ev.clientX - mouseReference;
      setMouseReference(ev.clientX);
      const percentMoved = moved / windowWidth;
      const newTimestamp = Math.min(Math.max(actualTimestamp + Math.floor((maxTimestamp - minTimestamp) * percentMoved), minTimestamp), maxTimestamp);
      setTimeInterval(interval => interval - (newTimestamp - actualTimestamp));
      setActualTimestamp(newTimestamp);
    }
  }

  const onLeftResizeMouseDown = (ev : React.MouseEvent<HTMLDivElement>) => {
    ev.stopPropagation()
    setIsLeftResizePressed(true);
    setMouseReference(ev.clientX);
  }

  const onLeftResizeMouseUp = (ev : React.MouseEvent<HTMLDivElement>) => {
    setIsLeftResizePressed(false);
  }

  const onRightResizeMouseMove = (ev : React.MouseEvent<HTMLDivElement>) => {
    if(isRightResizePressed && intervalRef){
      const windowWidth = intervalRef.current.offsetWidth;
      const moved = ev.clientX - mouseReference;
      setMouseReference(ev.clientX);
      const percentMoved = moved / windowWidth;
      setTimeInterval(interval => interval + Math.floor((maxTimestamp - minTimestamp) * percentMoved));
    }
  }

  const onRightResizeMouseDown = (ev : React.MouseEvent<HTMLDivElement>) => {
    ev.stopPropagation()
    setIsRightResizePressed(true);
    setMouseReference(ev.clientX);
  }

  const onRightResizeMouseUp = (ev : React.MouseEvent<HTMLDivElement>) => {
    setIsRightResizePressed(false);
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
            </div>
            <div ref={intervalRef} className="relative h-[80px] w-full my-5">
              <div className="absolute w-full h-full">
                <RealtimeLineChart data={flowsResume.getFlowsData()} height={80} />
              </div>
              <div 
                className="absolute h-full opacity-90 bg-main-primary border border-slate-700 hover:cursor-grab flex flex-row justify-between"
                onMouseDown={onWindowMouseDown}
                onMouseMove={onWindowMouseMove}
                onMouseUp={onWindowMouseUp}
                style={{
                  width: `${windowSize || 0}%`,
                  marginLeft: `${windowPadding || 0}%`
                }}
              >
                <div 
                  onMouseDown={onLeftResizeMouseDown}
                  onMouseUp={onLeftResizeMouseUp}
                  onMouseMove={onLeftResizeMouseMove}
                  className="h-full w-[6px] hover:cursor-ew-resize bg-slate-500"
                ></div>
                <div 
                  className="h-full w-[6px] hover:cursor-ew-resize bg-slate-500"
                  onMouseDown={onRightResizeMouseDown}
                  onMouseUp={onRightResizeMouseUp}
                  onMouseMove={onRightResizeMouseMove}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default App;
