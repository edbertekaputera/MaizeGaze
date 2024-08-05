import { Button, Checkbox, Table, Tooltip } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FaTimesCircle } from "react-icons/fa";

function DetectionResultTableRowAL({ id, name, farm_name, farm_patch_id, farm_patch_name, tassel_count, date, selected, setSelected, isTrained }) {
	const splitted_date = date.split(" ");
	const handleCheckbox = () => {
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
			<Table.Row className={isTrained ? "bg-gray-50" : "bg-white"}>
				<Table.Cell className={"whitespace-nowrap font-medium p-4 " + (isTrained ? "text-gray-400" : "text-gray-900")}>
					{isTrained ? (
						<Tooltip content="You have previously used this record to train." placement="right">
							<Checkbox checked={selected} onChange={handleCheckbox} />
						</Tooltip>
					) : (
						<Checkbox checked={selected} onChange={handleCheckbox} />
					)}
				</Table.Cell>
				<Table.Cell className={"whitespace-nowrap font-medium p-4 " + (isTrained ? "text-gray-400" : "text-gray-900")}>{name}</Table.Cell>
				<Table.Cell className={"whitespace-nowrap font-medium p-4 " + (isTrained ? "text-gray-400" : "text-gray-900")}>{farm_name}</Table.Cell>
				<Table.Cell className={"whitespace-nowrap font-medium p-4 " + (isTrained ? "text-gray-400" : "text-gray-900")}>{farm_patch_name}</Table.Cell>
				<Table.Cell className={"whitespace-nowrap font-medium p-4 " + (isTrained ? "text-gray-400" : "text-gray-900")}>{tassel_count}</Table.Cell>
				<Table.Cell className={"whitespace-nowrap font-medium p-4 " + (isTrained ? "text-gray-400" : "text-gray-900")}>{splitted_date[0]}</Table.Cell>
				<Table.Cell className={"whitespace-nowrap font-medium p-4 " + (isTrained ? "text-gray-400" : "text-gray-900")}>{splitted_date[1]}</Table.Cell>
			</Table.Row>
		</>
	);
}

export default DetectionResultTableRowAL;
