import { Button, Checkbox, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FaTimesCircle } from "react-icons/fa";
import ViewTrainingResultsModal from "./ViewTrainingResultsModal";

function ModelsTableRow({ model_id, name, map, mae, num_data, training_date, status, train_loss, val_loss, val_map, selected, setSelected }) {
	const [showView, setShowView] = useState(false);

	const splitted_date = training_date.split(" ");

	const handleCheckbox = () => {
		if (selected) {
			setSelected((prev) => {
				let new_set = new Set(prev);
				new_set.delete(model_id);
				return new_set;
			});
		} else {
			setSelected((prev) => new Set(prev).add(model_id));
		}
	};

	const displayPercentage = (val) => {
		return Number(val / 100).toLocaleString(undefined, { style: "percent", minimumFractionDigits: 2 });
	};

	return (
		<>
			{status === "ACTIVE" && (
				<ViewTrainingResultsModal
					state={showView}
					setState={setShowView}
					model_name={name}
					training_date={training_date}
					train_loss={train_loss}
					val_loss={val_loss}
					val_map={val_map}
				/>
			)}
			<Table.Row className="bg-white">
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
					<Checkbox checked={selected} onChange={handleCheckbox} />
				</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{name}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{map ? displayPercentage(map) : "-"}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{mae ? (Math.fround(mae * 100) / 100).toFixed(2) : "-"}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{num_data}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{splitted_date[0]}</Table.Cell>
				{status === "ACTIVE" ? (
					<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
						<Button
							type="button"
							className="bg-custom-green-1 px-2 py-0 hover:bg-custom-green-2 shadow-md ring-custom-green-2"
							onClick={() => setShowView(true)}
						>
							View Results
						</Button>
					</Table.Cell>
				) : status === "TRAINING" ? (
					<Table.Cell className="whitespace-nowrap font-semibold p-4 text-gray-600">IN PROGRESS</Table.Cell>
				) : (
					<Table.Cell className="whitespace-nowrap font-semibold p-4 text-red-600">FAILED</Table.Cell>
				)}
			</Table.Row>
		</>
	);
}

export default ModelsTableRow;
