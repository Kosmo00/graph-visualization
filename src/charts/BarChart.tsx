// @ts-nocheck
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const margin = { top: 0, right: 100, bottom: 30, left: 100 };

interface PropTypes{
  width: number;
  height: number;
  data: ChartParams[];
}

export interface ChartParams {
  name: string;
  value: number;
}

export default function BarChart({width, height, data}: PropTypes){

  const [bandWidth, setBandWidth] = useState<number>(0);
  const [heights, setHeights] = useState<number[]>([]);
  const [xPositions, setXPositions] = useState<number[]>([])
  
  const svgRef = useRef<SVGSVGElement> (null);
  const gx = useRef<SVGGElement>(null);
  const gy = useRef<SVGGElement>(null);

  useEffect (() => {
    const x = d3.scaleBand(data.map(d => d.name), [margin.left, width - margin.right]);
    
    d3.select(gx.current).call(d3.axisBottom(x));
  
    const maxValue = d3.max<ChartParams, number>(data, resume => resume.value) || 0;
    const y = d3.scaleLinear([0, maxValue], [height - margin.bottom, margin.bottom]);
    d3.select(gy.current).call(d3.axisLeft(y)), [gy, y];
    
    setBandWidth(x.bandwidth());
    const barXPos = data.map(d => x(d.name)!);
    setXPositions(barXPos);
    const barYPos = data.map(d => y(d.value)!);
    setHeights(barYPos);
  }, [data])
  
  return(
    <svg ref={svgRef} width={"100%"} height={height}>
      <g ref={gx} transform={`translate(0,${height - margin.bottom})`} />
      <g ref={gy} transform={`translate(${margin.left},0)`} />
      {xPositions.map((xPos, i) => (
        <>
        <line 
          key={i}
          x1={xPos + bandWidth / 2} 
          x2={xPos + bandWidth / 2} 
          y1={height-margin.bottom} 
          y2={heights[i]}
          strokeWidth={bandWidth - bandWidth / 5}
          opacity={0.3}
          className="stroke-text-primary"
        />
        <text key={'text-' + i} x={xPos + bandWidth / 2 - 10} y={heights[i] - 10} className="fill-text-primary">{data[i]?.value}</text>
        </>
      ))}
    </svg>
  )
}