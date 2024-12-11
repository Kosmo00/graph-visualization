import useActiveLinksStore from "../store/activeLinksStore";
import useActiveNodesState from "../store/activeNodesStore";
import Modal from "./Modal";


function integerToIp(ipInteger: number): string {
  const bytes: number[] = new Array(4);
  bytes[0] = ipInteger & 0xFF;
  bytes[1] = (ipInteger >> 8) & 0xFF;
  bytes[2] = (ipInteger >> 16) & 0xFF;
  bytes[3] = (ipInteger >> 24) & 0xFF;

  return bytes.join('.');
}

function ActiveModals() {
  const { activeLinks, removeActiveLink } = useActiveLinksStore(state => state);
  const { activeNodes, removeActiveNode } = useActiveNodesState(state => state);
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
    </>
  )
}

export default ActiveModals