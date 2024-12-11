// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import * as d3 from 'd3';

interface PropTypes {
  height: number;
  data: LineChartData[];
}

export interface LineChartData {
  timestamp: number;
  value: number;
}

function RealtimeLineChart({height, data}: PropTypes) {

  const svgRef = useRef<SVGSVGElement>(null);
  const gx = useRef<SVGGElement>(null);
  const [lineData, setLineData] = useState('')
  const [areaData, setAreaData] = useState('')
  const [width, setWidth] = useState<number>(0);

  const margin = 20;

  useEffect(() => {
    if(svgRef !== null){
        setWidth(svgRef.current!.clientWidth);
    }
}, [svgRef])

  useEffect(() => {
    const maxXValue = d3.max<LineChartData, number>(data, resume => resume.timestamp) || 0;
    const minXValue = d3.min<LineChartData, number>(data, resume => resume.timestamp) || 0;

    // Creating x-axis label
    const x = d3.scaleLinear([minXValue, maxXValue], [0, width]);
    d3.select(gx.current).call(d3.axisBottom(x));
    
    //Creating y-axis label
    const maxYValue = d3.max<LineChartData, number>(data, resume => resume.value) || 0;
    const y = d3.scaleLinear([0, maxYValue], [height - margin, margin]);

    const xValues = data.map(d => x(d.timestamp));

    const line = d3.line((_, i) => xValues[i], y);
    setLineData((line(data.map(d => d.value))) || '');

    const area = d3.area<LineChartData>()
    .x(d => x(d.timestamp))
    .y1(d => y(d.value))
    .y0(_ => y(0));

    setAreaData(area(data) || '');

  }, [width, data, height])
  

  return (
    <svg ref={svgRef} width={"100%"} height={height} className="bg-main-third rounded-2xl">
      <g ref={gx} transform={`translate(0,${height - margin})`} />
      <g width={'100%'} height={`${height-margin}px`}>
        <path fill="none" strokeWidth="1.5" d={lineData} className="stroke-green" opacity={0.8} />
        <path d={areaData} className="fill-green" opacity={0.2} />
      </g>
    </svg>
  )
}

export default RealtimeLineChart