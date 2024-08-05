import { Button, Checkbox, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FaTimesCircle } from "react-icons/fa";

function DetectionResultTableRowAL({ id, name, farm_name, farm_patch_id, farm_patch_name, tassel_count, date, selected, setSelected, isTrained}) {
	const splitted_date = date.split(" ");

	const handleCheckbox = () => {
        if (isTrained) return;
        
		if (selected) {
			setSelected((prev) => {
				let new_set = new Set(prev);
				new_set.delete(`${farm_name}_${farm_patch_id}_${id}`);
				return new_set;
			});
		} else {
			setSelected((prev) => new Set(prev).add(`${farm_name}_${farm_patch_id}_${id}`));
		}
	};

	return (
		<>
			<Table.Row className="bg-white">
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
					<Checkbox 
                        checked={selected} 
                        onChange={handleCheckbox} 
                        disabled={isTrained}
                        className={isTrained ? "cursor-not-allowed" : ""}
                    />
				</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{name}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{farm_name}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{farm_patch_name}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{tassel_count}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{splitted_date[0]}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{splitted_date[1]}</Table.Cell>
			</Table.Row>
		</>
	);
}

export default DetectionResultTableRowAL;