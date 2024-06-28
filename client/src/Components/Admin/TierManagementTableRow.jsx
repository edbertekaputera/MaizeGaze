import { Button, Checkbox, Table } from "flowbite-react";
import React, { useState } from "react";
import ViewUserModal from "./ViewUserModal";
import { format } from "date-fns";
import ViewTierModal from "./ViewTierModal";

function TierManagementTableRow({ name, detection_quota, storage_limit, price, subscriber_count, selected, setSelected }) {
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

	const formatBytes = (storage, decimals = 2) => {
		if (!+storage) return "0 Bytes";
		const bytes = storage * 1024 * 1024;
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	};

	const SGDollar = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "SGD",
	});

	return (
		<>
			<ViewTierModal state={showView} setState={setShowView} name={name} />
			<Table.Row className="bg-white">
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
					<Checkbox checked={selected} onChange={handleCheckbox} disabled={name === "FREE_USER"} className={name === "FREE_USER" && "bg-gray-300"} />
				</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{name}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{detection_quota}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{formatBytes(storage_limit)}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{SGDollar.format(price)}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{subscriber_count}</Table.Cell>
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

export default TierManagementTableRow;
