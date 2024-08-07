import { Button, Checkbox, Table } from "flowbite-react";
import React, { useState } from "react";
import ViewFarmModal from "./ViewFarmModal";

function FarmManagementTableRow({ name, city, country, address, total_land_size, selected, setSelected }) {
	const [showView, setShowView] = useState(false);

	const handleCheckbox = () => {
		if (selected) {
			setSelected((prev) => {
				let new_set = new Set(prev);
				new_set.delete(name);
				return new_set;
			});
		} else {
			setSelected((prev) => new Set(prev).add(name));
		}
	};

	return (
		<>
			<ViewFarmModal state={showView} setState={setShowView} name={name} />
			<Table.Row className="bg-white">
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
					<Checkbox checked={selected} onChange={handleCheckbox} />
				</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{name}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{country}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{city}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{address}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{Math.round(total_land_size * 100) / 100}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
					<Button
						type="button"
						className="bg-custom-green-1 px-2 py-0 hover:bg-custom-green-2 shadow-md ring-custom-green-2"
						onClick={() => setShowView(true)}
					>
						View
					</Button>
				</Table.Cell>
			</Table.Row>
		</>
	);
}

export default FarmManagementTableRow;
