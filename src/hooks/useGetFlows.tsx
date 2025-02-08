import { useCallback, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Flow } from "../models/Flow";


function useGetFlows() {
	const [flows, setFlows] = useState<Flow[]>([]);
	// Filters
	const [minTimestamp, setMinTimestamp] = useState<number>(0);
	const [maxTimestamp, setMaxTimestamp] = useState<number>(0);
  const onFileSelected = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
		const file = ev.target.files![0];
		const readText = async () => {
			const jsonObject = []
			const csvLines = (await file.text()).replace('\r', '').split('\n');
			const headers = csvLines[0].split(',');
			for(let i=0;i<headers.length;i++){
				const aux = headers[i][0].toLowerCase() + headers[i].slice(1);
				headers[i] = aux as keyof Flow;
			}
			for(let i = 1; i < csvLines.length - 1; i++){
				const fields = csvLines[i].split(',');
				const jsonItem: Partial<{[key in keyof Flow]: string | number}> = {};
				jsonItem['id'] = uuidv4()
				for(let j = 0; j < fields.length; j++){
					jsonItem[headers[j] as keyof Flow] = fields[j]
					if(headers[j] !== 'attackType'){
						jsonItem[headers[j] as keyof Flow] = parseInt(fields[j])
					}
				}
				jsonObject.push(jsonItem);
			}
			
			setFlows(jsonObject as Flow[]);
			let minTs = jsonObject[0].initialTimestampMilliseconds! as number;
			let maxTs = jsonObject[0].finalTimestampMilliseconds! as number;
			jsonObject.forEach(flow => {
				minTs = Math.min(minTs, flow.initialTimestampMilliseconds! as number);
				maxTs = Math.max(maxTs, flow.finalTimestampMilliseconds! as number);
			})
			setMinTimestamp(minTs);
			setMaxTimestamp(maxTs);
		}
		readText();
	}, []);

	return { flows, minTimestamp, maxTimestamp, onFileSelected};

}

export default useGetFlows