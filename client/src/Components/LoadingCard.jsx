import { Card, Spinner } from "flowbite-react";
import React from "react";

function LoadingCard({ show, children }) {
	return (show &&
		<div className="fixed top-0 left-0 flex bg-gray-800 w-full h-full z-50 bg-opacity-50 justify-center items-center">
			<Card size="md">
				<div className="flex flex-col justify-center mb-2 items-center">
					<h3 className="mb-5 text-xl font-normal text-gray-600">
						{children}
					</h3>
					<Spinner size={"xl"} color={"success"} />
				</div>
			</Card>
		</div>
	);
}

export default LoadingCard;
