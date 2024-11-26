import { useCallback, useState } from "react"

interface Coordinates {
	x: number;
	y: number;
}

interface PropTypes {
	children: React.ReactNode;
	onClose: () => void;
	header?: string;
}

function Modal({children, onClose, header} : PropTypes) {
	const [position, setPosition] = useState<Coordinates>({x: 0, y: 0});
	const [referencePosition, setReferencePosition] = useState<Coordinates>({x: 0, y: 0});
	const [isPressed, setIsPressed] = useState<boolean>(false);

	const handleMouseMove = useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
		if(isPressed){
			setPosition((position) => ({
				x: position.x + ev.clientX - referencePosition.x,
				y: position.y + ev.clientY - referencePosition.y
			}));
			setReferencePosition(position => ({
				x: position.x + ev.clientX - position.x,
				y: position.y + ev.clientY - position.y
			}))
		}
	}, [referencePosition, isPressed])

	const handleMouseDown = useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
		setReferencePosition({
			x: ev.clientX,
			y: ev.clientY
		});
		setIsPressed(true);
	}, [])

	return (
		<div 
			className="absolute bg-black py-5 px-8 z-10 w-[300px] rounded-xl cursor-grab hover:z-20" 
			style={{marginLeft: `${position.x}px`, marginTop: `${position.y}px`}}
			onMouseDown={handleMouseDown}
			onMouseUp={() => setIsPressed(false)}
			onMouseMove={handleMouseMove}
		>
			<div className="flex justify-between mb-3">
				<p>{header}</p>
				<span className="cursor-pointer" onClick={onClose}>X</span>
			</div>
			{children}
		</div>
	)
}

export default Modal