import { Modal } from "flowbite-react";
import React from "react";
import EpochMetricsChart from "./EpochMetricsChart";
import { format } from "date-fns";

function ViewTrainingResultsModal({ state, setState, model_name, training_date, train_loss, val_loss, val_map }) {
	const loss_series = [
		{
			name: "Validation/Loss",
			data: val_loss.map((val, index) => ({ x: index + 1, y: val })),
			color: "#019A6C",
		},
		{
			name: "Train/Loss",
			data: train_loss.map((val, index) => ({ x: index + 1, y: val })),
			color: "#0096FF",
		},
	];

	const map_series = [
		{
			name: "Validation/mAP50",
			data: val_map.map((val, index) => ({ x: index + 1, y: val })),
			color: "#019A6C",
		},
	];

	return (
		<div>
			<Modal show={state} size="6xl" onClose={() => setState(false)} popup>
				<Modal.Header>
					<h1 className="flex flex-wrap gap-1 text-2xl font-bold px-4 pt-2 text-center justify-center">
						<span className="text-black">{model_name}</span>
						<span className="text-gray-600">({format(training_date, "dd MMM yyyy, h:mma")} SGT)</span>
					</h1>
				</Modal.Header>
				<Modal.Body>
					<div className="flex flex-col gap-4">
						<EpochMetricsChart metric={"Loss"} series={loss_series} height={400} />
						<EpochMetricsChart metric={"mAP50"} series={map_series} height={400} />
					</div>
				</Modal.Body>
			</Modal>
		</div>
	);
}

export default ViewTrainingResultsModal;
