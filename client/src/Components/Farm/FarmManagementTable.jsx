import { Checkbox, Table } from "flowbite-react";
import React, { useEffect } from "react";
import FarmManagementTableRow from "./FarmManagementTableRow";

function FarmManagementTable({ farms, selected, setSelected }) {
	useEffect(() => {
		selected.forEach((val) => {
			let flag = false;
			farms.forEach((t) => {
				if (t.name == val) {
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
	}, [farms]);

	const handleAllCheckbox = () => {
		if (selected.size != 0 && selected.size === farms.length) {
			setSelected(new Set());
		} else {
			farms.forEach((t) => {
				setSelected((prev) => new Set(prev).add(t.name));
			});
		}
	};

	return (
		<div className="max-h-screen overflow-x-auto overflow-y-auto rounded-lg shadow-lg outline-gray-700">
			<Table hoverable>
				<Table.Head>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">
						<Checkbox checked={selected.size != 0 && selected.size === farms.length} onChange={handleAllCheckbox} />
					</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Name</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Country</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">City</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Address</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Total Land Size (mu)</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">
						<span className="sr-only">View</span>
					</Table.HeadCell>
				</Table.Head>
				<Table.Body className="divide-y">
					{farms.map((t, index) => (
						<FarmManagementTableRow
							key={index}
							name={t.name}
							country={t.country}
							city={t.city}
							address={t.address}
							total_land_size={t.total_land_size}
							selected={selected.has(t.name)}
							setSelected={setSelected}
						/>
					))}
					{farms.length == 0 && (
						<Table.Row>
							<Table.Cell colSpan={6}>
								<span className="flex justify-center w-full">No matching farms found</span>
							</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</div>
	);
}

export default FarmManagementTable;
