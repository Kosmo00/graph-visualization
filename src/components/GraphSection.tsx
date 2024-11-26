// @ts-nocheck
import { NetworkTrafficGraph, Link, Node } from "../models/NetworkTrafficGraph";
import { Flow } from "../models/Flow";
import { useCallback, useEffect, useState } from "react";
import PredictionEvaluation from './PredictionEvaluation';
import { v4 as uuidv4 } from "uuid";
import Modal from './Modal';
import useActiveLinksStore from "../store/activeLinksStore";
import useActiveNodesState from "../store/activeNodesStore";

function integerToIp(ipInteger: number): string {
  const bytes: number[] = new Array(4);
  bytes[0] = ipInteger & 0xFF;
  bytes[1] = (ipInteger >> 8) & 0xFF;
  bytes[2] = (ipInteger >> 16) & 0xFF;
  bytes[3] = (ipInteger >> 24) & 0xFF;

  return bytes.join('.');
}

function GraphSection() {

  const { activeLinks, removeActiveLink } = useActiveLinksStore(state => state);
  const { activeNodes, removeActiveNode } = useActiveNodesState(state => state);

  const [flows, setFlows] = useState<Flow[]>([]);
  const [filteredFlows, setFilteredFlows] = useState<Flow[]>([]);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  const [minTimestamp, setMinTimestamp] = useState<number>(0);
  const [maxTimestamp, setMaxTimestamp] = useState<number>(0);

  // Filters
  const [actualTimestamp, setActualTimestamp] = useState<number>(0);
  const [timeInterval, setTimeInterval] = useState(1200)
  const [ipFilter, setIpFilter] = useState('');
  const [portFilter, setPortFilter] = useState('');

  const width = 1200;
  const height = 500;

  useEffect(() => {
    const currentGraph = new NetworkTrafficGraph(filteredFlows, width, height);
    setNodes(currentGraph.getNodes());
    setLinks(currentGraph.getLinks());
  }, [filteredFlows])
  

  
  const applyFilters = useCallback(() => {
    const initialInterval = actualTimestamp - timeInterval;
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
      setTimeInterval(parseInt(ev.target.value));
    }
  }, []);

  const onUpdateIntervalChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    if(parseInt(ev.target.value)){
      setActualTimestamp(parseInt(ev.target.value));
    }
  }, [])

  const onFilterIpChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    if(ev.target.value === '' || ev.target.value === 0 || parseInt(ev.target.value)){
      setIpFilter(ev.target.value)
    }
  }, [])

  const onFilterPortChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    if(ev.target.value === '' || ev.target.value === 0 || parseInt(ev.target.value)){
      setPortFilter(ev.target.value)
    }
  }, [])

  return (
    <>
      {activeNodes.map(node => (
        <Modal 
          onClose={() => removeActiveNode(node.id)}
          key={node.id}
          header="Node"
        >
          <div>
            id: {node.id}
          </div>
          <div>
            ip endpoint: {`${integerToIp(parseInt(node.id.split(':')[0]))}:${node.id.split(':')[1]}`}
          </div>
          <div>
            {
              node.attackedBy.length !== 0 &&
              ('attackedBy: ')
            }
            {node.attackedBy.map(nodeId => (
              <div>{`${integerToIp(parseInt(nodeId.split(':')[0]))}:${nodeId.split(':')[1]},`}</div>
            ))}
          </div>
          <div>
            sended: {node.receivedTrafficVolume} bytes
          </div>
          <div>
            received: {node.sendedTrafficVolume} bytes
          </div>
        </Modal>
      ))}
      {
        activeLinks.map(link => (
          <Modal key={`${link.source.id}-${link.target.id}`} onClose={() => removeActiveLink(link.source.id, link.target.id)} header="Link">
            <div>
              <div>
                id: {link.source.id}-{link.target.id}
              </div>
              {
                link.attackType !== 'normal_traffic' &&
                <div>attack type: {link.attackType}</div>
              }
              <div>
                from: {`${integerToIp(parseInt(link.source.id.split(':')[0]))}:${link.source.id.split(':')[1]}`}
              </div>
              <div>
                to: {`${integerToIp(parseInt(link.target.id.split(':')[0]))}:${link.target.id.split(':')[1]}`}
              </div>
              <div>
                bytes sended: {link.outBytes} bytes
              </div>
              <div>
                bytes received: {link.inBytes} bytes
              </div>
              <div>
                packets sended: {link.outPacketCount} packets
              </div>
              <div>
                packets received: {link.inPacketCount} packets
              </div>
            </div>
          </Modal>
        ))
      }
      <div className="h-full bg-main-third w-full rounded-3xl p-6 relative">
        <div className="flex flex-row">
          <div className="flex flex-col">
          <button 
            className="bg-hover transition-all [&>img]:hover:brightness-200 py-2 px-4 rounded-xl relative"
          >
            Add csv file
            <input type="file" onChange={onFileSelected} className="absolute top-0 right-0 left-0 bottom-0 opacity-0 cursor-pointer" />
          </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="mt-1 ml-7">
              Actual timestamp: <input className="rounded-lg pl-1" type="text" value={actualTimestamp} onChange={onUpdateIntervalChange} />
              <div className="my-1 flex" >
                {minTimestamp}
                <input className="mx-2 grow" type="range" min={minTimestamp} max={maxTimestamp} value={actualTimestamp} onChange={onSliderChange} />
                {maxTimestamp}
              </div>
              <div>
                <label className="mr-2">Interval (ms)</label>
                <input className="rounded-lg pl-1" type="text" value={timeInterval} onChange={onIntervalChange} />
              </div>
            </div>
            <div>
              <div>
                <label className="mr-2">number ip</label>
                <input className="rounded-lg pl-1" type="text" value={ipFilter} onChange={onFilterIpChange} />
              </div>
              <div className="mt-4">
                <label className="mr-2">number port</label>
                <input className="rounded-lg pl-1" type="text" value={portFilter} onChange={onFilterPortChange} />
              </div>
            </div>
          </div>
        </div>
        <PredictionEvaluation nodes={nodes} links={links} name="Network Graph" width={width} height={height} />     
      </div>
    </>
  )
}

export default GraphSection