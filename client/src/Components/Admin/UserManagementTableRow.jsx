import { Button, Checkbox, Table } from "flowbite-react";
import React, { useState } from "react";

function UserManagementTableRow({ email, name, tier, status, selected, setSelected }) {
	const [showView, setShowView] = useState(false);

	const handleCheckbox = () => {
		if (selected) {
			setSelected((prev) => {
				let new_set = new Set(prev);
				new_set.delete(email);
				return new_set;
			});
		} else {
			setSelected((prev) => new Set(prev).add(email));
		}
	};

	return (
		<>
			<Table.Row className="bg-white">
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
					<Checkbox checked={selected} onChange={handleCheckbox} />
				</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{name}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{email}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{tier}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{status}</Table.Cell>
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

export default UserManagementTableRow;
