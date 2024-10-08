import { Button, Modal } from "flowbite-react";
import { FaTimes } from "react-icons/fa";

function MessageModal({ state, setState, children }) {
	// !!! NEED CHILDREN FOR MESSAGE !!!
	function onCloseModal() {
		setState(false);
	}

	return (
		<>
			<Modal className="" show={state} onClose={onCloseModal} size="xl" popup>
				{/* <img className="rounded-full h-20 w-2" src="https://i.pinimg.com/564x/0b/0c/3a/0b0c3a9fa3c7998613b0eaacf4a51e06.jpg"/> */}
				<Modal.Header />
				<Modal.Body>
					<h1 className="text-center text-2xl font-bold my-20">{children}</h1>
				</Modal.Body>
			</Modal>
		</>
	);
}
export default MessageModal;
