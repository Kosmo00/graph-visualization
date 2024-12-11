import { signal } from "@preact/signals-react";
import { useSignal, useSignals } from "@preact/signals-react/runtime";
import { createPortal } from "react-dom";

interface Coordinates {
	x: number;
	y: number;
}

interface PropTypes {
	children: React.ReactNode;
	onClose: () => void;
	header?: string;
}

// const signalPosition = signal<Coordinates>({x: 0, y: 0});
// const signalReferencePosition = signal<Coordinates>({x: 0, y: 0});
// const isPressed = signal<boolean>(false);

function Modal({children, onClose, header} : PropTypes) {

	return createPortal(<ModalBody onClose={onClose} header={header}>{children}</ModalBody>, document.getElementById('popups')!);
}

function ModalBody({ children, onClose, header }: PropTypes){
	useSignals();
	const signalPosition = useSignal<Coordinates>({x: 0, y: 0});
	const signalReferencePosition = useSignal<Coordinates>({x: 0, y: 0});
	const isPressed = useSignal<boolean>(false);

	const handleMouseMove = (ev: React.MouseEvent<HTMLDivElement>) => {
		if(isPressed.value){
			signalPosition.value.x = signalPosition.value.x + ev.clientX - signalReferencePosition.value.x;
			signalPosition.value.y = signalPosition.value.y + ev.clientY - signalReferencePosition.value.y;
			signalPosition.value = {...signalPosition.value};
			signalReferencePosition.value.x = ev.clientX;
			signalReferencePosition.value.y = ev.clientY;
			signalReferencePosition.value = {...signalReferencePosition.value};
		}
	}

	const handleMouseDown = (ev: React.MouseEvent<HTMLDivElement>) => {
		signalReferencePosition.value.x = ev.clientX;
		signalReferencePosition.value.y = ev.clientY;
		signalReferencePosition.value = {...signalReferencePosition.value};
		isPressed.value = true;
	}



	return (
		<div 
			className="absolute bg-black py-5 px-8 z-10 w-[300px] rounded-xl cursor-grab hover:z-20" 
			style={{transform: `translate(${signalPosition.value.x}px,${signalPosition.value.y}px)`}}
			onMouseDown={handleMouseDown}
			onMouseUp={() => isPressed.value = false}
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