import { Checkbox, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import DetectionResultTableRow from "./DetectionResultTableRow";

function DetectionResultTable({ results, selected, setSelected }) {
	useEffect(() => {
		selected.forEach((val) => {
			const splitted = val.split("_");
			let flag = false;
			results.forEach((result) => {
				if (result.id == splitted[1] && result.farm_name == splitted[0]) {
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
	}, [results]);

	const handleAllCheckbox = () => {
		if (selected.size != 0 && selected.size === results.length) {
			setSelected(new Set());
		} else {
			results.forEach((r) => {
				setSelected((prev) => new Set(prev).add(`${r.farm_name}_${r.id}`));
			});
		}
	};

	return (
		<div className="max-h-screen overflow-x-auto overflow-y-auto rounded-lg shadow-lg outline-gray-700">
			<Table hoverable>
				<Table.Head>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">
						<Checkbox
							checked={
								selected.size != 0 && selected.size === results.length
							}
							onChange={handleAllCheckbox}
						/>
					</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">
						Name
					</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">
						Farm
					</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">
						Tassel Count
					</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">
						Date
					</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">
						Time
					</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">
						<span className="sr-only">View</span>
					</Table.HeadCell>
				</Table.Head>
				<Table.Body className="divide-y">
					{results.map((r, index) => (
						<DetectionResultTableRow
							key={index}
							id={r.id}
							name={r.name}
							farm_name={r.farm_name}
							tassel_count={r.tassel_count}
							date={r.record_date}
							selected={selected.has(`${r.farm_name}_${r.id}`)}
							setSelected={setSelected}
						/>
					))}
					{results.length == 0 && (
						<Table.Row>
							<Table.Cell colSpan={7}>
								<span className="flex justify-center w-full">
									No matching detection results found
								</span>
							</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</div>
	);
}

export default DetectionResultTable;
