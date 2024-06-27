import { Checkbox, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import TierManagementTableRow from "./TierManagementTableRow";

function TierManagementTable({ tiers, selected, setSelected }) {
	useEffect(() => {
		selected.forEach((val) => {
			let flag = false;
			tiers.forEach((t) => {
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
	}, [tiers]);

	const handleAllCheckbox = () => {
		if (selected.size != 0 && selected.size === tiers.length - 1) {
			setSelected(new Set());
		} else {
			tiers.forEach((t) => {
				if (t.name !== "FREE_USER") {
					setSelected((prev) => new Set(prev).add(t.name));
				}
			});
		}
	};

	return (
		<div className="max-h-screen overflow-x-auto overflow-y-auto rounded-lg shadow-lg outline-gray-700">
			<Table hoverable>
				<Table.Head>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">
						<Checkbox checked={selected.size != 0 && selected.size === tiers.length - 1} onChange={handleAllCheckbox} />
					</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Name</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Detection Quota</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Storage Limit</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Price</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Subscriber Count</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">
						<span className="sr-only">View</span>
					</Table.HeadCell>
				</Table.Head>
				<Table.Body className="divide-y">
					{tiers.map((t, index) => (
						<TierManagementTableRow
							key={index}
							name={t.name}
							detection_quota={t.detection_quota_limit}
							storage_limit={t.storage_limit}
							price={t.price}
							subscriber_count={t.num_users}
							selected={selected.has(t.name)}
							setSelected={setSelected}
						/>
					))}
					{tiers.length == 0 && (
						<Table.Row>
							<Table.Cell colSpan={6}>
								<span className="flex justify-center w-full">No matching tier plans found</span>
							</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</div>
	);
}

export default TierManagementTable;
