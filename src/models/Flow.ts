
export enum L4Protocol{
    TCP = 6,
    UDP = 17
}

export enum IsAttack{
    NormalTraffic = 0,
    Attack = 1
}

export interface Flow {
    attackType: string;
    destinationIpAddress: number;
    destinationPort: number;
    finalInTimestampMilliseconds: number;
    finalOutTimestampMilliseconds: number;
    finalTimestampMilliseconds: number;
    id: string;
    inPacketArrivalIntervalAverage: number;
    inPacketArrivalIntervalSum: number;
    inPacketSizeAverage: number;
    initialInTimestampMilliseconds: number;
    initialOutTimestampMilliseconds: number;
    initialTimestampMilliseconds: number;
    ipVersion: number;
    isAttack: IsAttack;
    maximumInPacketSize: number;
    maximumOutPacketSize: number;
    maximumPacketSize: number;
    minimumInPacketSize: number;
    minimumOutPacketSize: number;
    minimumPacketSize: number;
    outPacketArrivalIntervalAverage: number;
    outPacketArrivalIntervalSum: number;
    outPacketSizeAverage: number;
    packetArrivalIntervalAverage: number;
    protocol: L4Protocol;
    sourceIpAddress: number;
    sourcePort: number;
    tcpFlags: number;
    tcpInFlags: number;
    tcpOutFlags: number;
    totalBytes: number;
    totalFlowDurationMilliseconds: number;
    totalInBytes: number;
    totalInDuration: number;
    totalInPackets: number;
    totalOutBytes: number;
    totalOutDuration: number;
    totalOutPackets: number;
    totalPacketArrivalIntervalSum: number;
    totalPacketSizeAverage: number;
    totalPackets: number;
}
