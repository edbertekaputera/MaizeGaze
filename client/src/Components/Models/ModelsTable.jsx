import { Checkbox, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import ModelsTableRow from "./ModelsTableRow";
// import DetectionResultTableRow from "./DetectionResultTableRow";

function ModelsTable({ models, selected, setSelected }) {
	useEffect(() => {
		selected.forEach((val) => {
			let flag = false;
			models.forEach((result) => {
				if (result.model_id === val) {
					flag = true;
					return;
				}
			});
			if (!flag) {
				setSelected((prev) => {
					let new_set = new Set(prev);
					new_set.delete(val);
					return new_set;
				});
			}
		});
	}, [models]);

	const handleAllCheckbox = () => {
		if (selected.size != 0 && selected.size === models.length) {
			setSelected(new Set());
		} else {
			models.forEach((r) => {
				setSelected((prev) => new Set(prev).add(r.model_id));
			});
		}
	};

	return (
		<div className="max-h-screen overflow-x-auto overflow-y-auto rounded-lg shadow-lg outline-gray-700">
			<Table hoverable>
				<Table.Head>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">
						<Checkbox checked={selected.size != 0 && selected.size === models.length} onChange={handleAllCheckbox} />
					</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Model Name</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">mAP50(%)</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Mean Absolute Error(MAE)</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">No. of Training Data</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Training Date</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Training Status</Table.HeadCell>
				</Table.Head>
				<Table.Body className="divide-y">
					{models.map((m, index) => (
						<ModelsTableRow
							key={index}
							model_id={m.model_id}
							name={m.name}
							map={m.training_metrics ? m.training_metrics.test_map : null}
							mae={m.training_metrics ? m.training_metrics.test_mae: null}
							num_data={m.num_data}
							training_date={m.training_date}
							status={m.status}
							train_loss={m.training_metrics ? m.training_metrics.train_loss: null}
							val_loss={m.training_metrics ? m.training_metrics.val_loss: null}
							val_map={m.training_metrics ? m.training_metrics.val_map: null}
							selected={selected.has(m.model_id)}
							setSelected={setSelected}
						/>
					))}
					{models.length == 0 && (
						<Table.Row>
							<Table.Cell colSpan={8}>
								<span className="flex justify-center w-full">No matching detection models found</span>
							</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</div>
	);
}

export default ModelsTable;
