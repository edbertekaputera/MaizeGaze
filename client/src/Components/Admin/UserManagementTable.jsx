import { Checkbox, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import UserManagementTableRow from "./UserManagementTableRow";
import { format } from "date-fns";

function UserManagementTable({ users, selected, setSelected }) {
	useEffect(() => {
		selected.forEach((val) => {
			let flag = false;
			users.forEach((result) => {
				if (result.email == val) {
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
	}, [users]);

	const handleAllCheckbox = () => {
		if (selected.size != 0 && selected.size === users.length) {
			setSelected(new Set());
		} else {
			users.forEach((r) => {
				setSelected((prev) => new Set(prev).add(r.email));
			});
		}
	};

	return (
		<div className="max-h-screen overflow-x-auto overflow-y-auto rounded-lg shadow-lg outline-gray-700">
			<Table hoverable>
				<Table.Head>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">
						<Checkbox checked={selected.size != 0 && selected.size === users.length} onChange={handleAllCheckbox} />
					</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Name</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Email</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Tier</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">Status</Table.HeadCell>
					<Table.HeadCell className="bg-custom-brown-1 text-white p-4">
						<span className="sr-only">View</span>
					</Table.HeadCell>
				</Table.Head>
				<Table.Body className="divide-y">
					{users.map((r, index) => (
						<UserManagementTableRow
							key={index}
							email={r.email}
							name={r.name}
							tier={r.user_type}
							suspension_details={r.suspended}
							email_verified={r.email_is_verified}
							selected={selected.has(r.email)}
							setSelected={setSelected}
						/>
					))}
					{users.length == 0 && (
						<Table.Row>
							<Table.Cell colSpan={6}>
								<span className="flex justify-center w-full">No matching user accounts found</span>
							</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</div>
	);
}

export default UserManagementTable;
