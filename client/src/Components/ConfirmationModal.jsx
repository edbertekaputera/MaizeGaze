import { Button, Modal } from "flowbite-react";
import React from "react";

function ConfirmationModal({ state, setState, action, icon, children }) {
	return (
		<Modal
			show={state}
			size="md"
			onClose={() => setState(false)}
			popup
		>
			<div className="rounded shadow-md">
				<Modal.Header />
				<Modal.Body>
					<div className="text-center">
						<div className="flex flex-row justify-center mb-5 text-gray-600">{icon}</div>
						<h3 className="mb-5 text-lg font-normal text-gray-600">
							{children}
						</h3>
						<div className="flex justify-center gap-4">
							<Button
								color="gray"
								outline
								onClick={() => setState(false)}
							>
								No, cancel
							</Button>
							<Button
								color="failure"
								onClick={() => {
									setState(false);
									action();
								}}
							>
								Yes, I'm sure
							</Button>
						</div>
					</div>
				</Modal.Body>
			</div>
		</Modal>
	);
}

export default ConfirmationModal;
