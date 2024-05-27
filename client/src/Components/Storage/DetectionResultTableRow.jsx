import { Button, Checkbox, Table } from "flowbite-react";
import React, { useEffect } from "react";
import { FaTimesCircle } from "react-icons/fa";

function DetectionResultTableRow({
	id,
	name,
	farm_name,
	tassel_count,
	date,
	selected,
	setSelected,
}) {
	const splitted_date = date.split(" ");

	const handleCheckbox = () => {
		if (selected) {
			setSelected((prev) => {
				let new_set = new Set(prev);
				new_set.delete(`${farm_name}_${id}`);
				return new_set;
			});
		} else {
			setSelected((prev) => new Set(prev).add(`${farm_name}_${id}`));
		}
	};

	return (
		<Table.Row className="bg-white">
			<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
				<Checkbox checked={selected} onChange={handleCheckbox} />
			</Table.Cell>
			<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
				{name}
			</Table.Cell>
			<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
				{farm_name}
			</Table.Cell>
			<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
				{tassel_count}
			</Table.Cell>
			<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
				{splitted_date[0]}
			</Table.Cell>
			<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
				{splitted_date[1]}
			</Table.Cell>
			<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
				<Button
					type="button"
					className="bg-custom-green-1 px-2 py-0 hover:bg-custom-green-2 shadow-md ring-custom-green-2"
					onClick={() =>console.log(id, farm_name) }
				>
					View
				</Button>
			</Table.Cell>
		</Table.Row>
	);
}

export default DetectionResultTableRow;