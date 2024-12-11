// import { Flow, IsAttack } from './Flow';
import { ChartParams } from '../charts/BarChart';
import { LineChartData } from '../charts/LineChart';
import { Flow } from './Flow';
import { NetworkTrafficGraph } from './NetworkTrafficGraph';
import { Queue } from 'elegant-queue';


export class ConnectedComponentsResume {

    connectedComponents: Map<number, number>;

    bfs(adjacencyList: Array<Array<number>>, visited: Array<boolean>, actual: number){
        const queue = new Queue<number>();
        queue.enqueue(actual)
        visited[actual] = true;
        let numberOfElements = 0;
        while(queue.size() > 0){
            const u = queue.dequeue()!;
            numberOfElements++;
            adjacencyList[u].forEach(v => {
                if(!visited[v]){
                    queue.enqueue(v);
                    visited[v] = true;
                }
            });
        }
        return numberOfElements;
    }
    
    constructor(graph: NetworkTrafficGraph) {
        this.connectedComponents = new Map<number, number>;
        const nodes = graph.getNodes();
        const edges = graph.getLinks();
        const nodesNumber = Array.from({length: nodes.length} , (_, i) => i);
        const nodeToNumber = new Map<string, number> ();
        nodes.forEach((node, index) => {
            nodeToNumber.set(node.id, index);
        });
        const adjacencyList : Array<Array<number>> = Array.from({length: nodes.length}, (_) => new Array<number>);

        edges.forEach(edge => {
            adjacencyList[nodeToNumber.get(edge.source)!].push(nodeToNumber.get(edge.target)!);
            adjacencyList[nodeToNumber.get(edge.target)!].push(nodeToNumber.get(edge.source)!);
        })

        const visited = Array.from({length: nodes.length}, (_) => false);
        
        nodesNumber.forEach(nodeNumber => {
            if(!visited[nodeNumber]){
                const actualConnectedComponentLength = this.bfs(adjacencyList, visited, nodeNumber);
                if(!this.connectedComponents.has(actualConnectedComponentLength)){
                    this.connectedComponents.set(actualConnectedComponentLength, 0);
                }
                this.connectedComponents.set(actualConnectedComponentLength, this.connectedComponents.get(actualConnectedComponentLength)! + 1);
            }
        });
    }
    getConnectedComponentsData(): ChartParams[]{
        const params: ChartParams[] = Array.from(this.connectedComponents.entries()).map(([key, value]) => ({
            name: key.toString(),
            value
        })).sort((a, b) => Number(a.name) - Number(b.name));

        return params;
    }
}

export class EccentricityResume {
    eccentricity: Map<number, number>;

    bfs(adjacencyList: Array<Array<number>>, actual: number){
        const queue = new Queue<{value: number, element: number}>();
        const visited = new Set<number>;
        queue.enqueue({value: 0, element: actual})
        visited.add(actual);
        let numberOfElements = 0;
        while(queue.size() > 0){
            const queueElement = queue.dequeue()!;
            numberOfElements = Math.max(numberOfElements, queueElement.value);
            adjacencyList[queueElement.element].forEach(v => {
                if(!visited.has(v)){
                    queue.enqueue({value: queueElement.value + 1, element: v});
                    visited.add(v);
                }
            });
        }
        return numberOfElements;
    }

    constructor(graph: NetworkTrafficGraph){
        this.eccentricity = new Map<number, number>;
        const nodes = graph.getNodes();
        const edges = graph.getLinks();
        const nodesNumber = Array.from({length: nodes.length} , (_, i) => i);
        const nodeToNumber = new Map<string, number> ();
        nodes.forEach((node, index) => {
            nodeToNumber.set(node.id, index);
        });
        const adjacencyList : Array<Array<number>> = Array.from({length: nodes.length}, (_) => new Array<number>);

        edges.forEach(edge => {
            adjacencyList[nodeToNumber.get(edge.source)!].push(nodeToNumber.get(edge.target)!);
            adjacencyList[nodeToNumber.get(edge.target)!].push(nodeToNumber.get(edge.source)!);
        });

        nodesNumber.forEach(nodeNumber => {
            const nodeEccentricity = this.bfs(adjacencyList, nodeNumber);
            if(!this.eccentricity.has(nodeEccentricity)){
                this.eccentricity.set(nodeEccentricity, 0);
            }
            this.eccentricity.set(nodeEccentricity, this.eccentricity.get(nodeEccentricity)! + 1);
        });
    }

    getEccentricityData(): ChartParams[]{
        const params: ChartParams[] = Array.from(this.eccentricity.entries()).map(([key, value]) => ({
            name: key.toString(),
            value
        })).sort((a, b) => Number(a.name) - Number(b.name));

        return params;
    }
}

export class FlowsResume {
    flowsPerTimestampGroup: Map<number, number>

    constructor(flows: Flow[]){
        this.flowsPerTimestampGroup = new Map<number, number> ();
        const maxInitialTimestamp = Math.max(...flows.map(flow => flow.initialTimestampMilliseconds));
        const minInitialTimestamp = Math.min(...flows.map(flow => flow.initialTimestampMilliseconds));
        const duration = maxInitialTimestamp - minInitialTimestamp;
        const chunksNumber = 1000;
        const chunkLen = Math.ceil(duration / chunksNumber);
        let actual = minInitialTimestamp;
        for(let i = 0; i < chunksNumber; i++){
            this.flowsPerTimestampGroup.set(actual, 0);
            actual += chunkLen;
        }

        flows.forEach(flow => {
            const actualTime = flow.initialTimestampMilliseconds - minInitialTimestamp;
            const chunkTime = minInitialTimestamp + (Math.floor(actualTime / chunkLen) * chunkLen);
            if(!this.flowsPerTimestampGroup.has(chunkTime)){
                this.flowsPerTimestampGroup.set(chunkTime, 0);
            }
            this.flowsPerTimestampGroup.set(chunkTime, this.flowsPerTimestampGroup.get(chunkTime)! + 1);
        })
    }

    getFlowsData(): LineChartData[]{
        const params: LineChartData[] = Array.from(this.flowsPerTimestampGroup.entries()).map(([key, value]) => ({
            timestamp: key,
            value
        })).sort((a, b) => a.timestamp - b.timestamp);

        return params;
    }
}
