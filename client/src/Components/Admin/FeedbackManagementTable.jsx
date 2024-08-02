import { Table } from "flowbite-react";
import React from "react";
import FeedbackManagementTableRow from "./FeedbackManagementTableRow";

function FeedbackManagementTable({ feedbacks }) {
    return (
        <div className="max-h-screen overflow-x-auto overflow-y-auto rounded-lg shadow-lg outline-gray-700">
            <Table hoverable>
                <Table.Head>
                    {/* <Table.HeadCell className="bg-custom-brown-1 text-white p-4">Name</Table.HeadCell> */}
                    <Table.HeadCell className="bg-custom-brown-1 text-white p-4">Email</Table.HeadCell>
                    <Table.HeadCell className="bg-custom-brown-1 text-white p-4">Rating</Table.HeadCell>
                    <Table.HeadCell className="bg-custom-brown-1 text-white p-4">Suggestion</Table.HeadCell>
                    <Table.HeadCell className="bg-custom-brown-1 text-white p-4">Date</Table.HeadCell>
                    <Table.HeadCell className="bg-custom-brown-1 text-white p-4">
                        <span className="sr-only">View</span>
                    </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                    {feedbacks.map((feedback, index) => (
                        <FeedbackManagementTableRow
                            key={index}
                            feedback={feedback}
                        />
                    ))}
                    {feedbacks.length === 0 && (
                        <Table.Row>
                            <Table.Cell colSpan={5}>
                                <span className="flex justify-center w-full">No feedback found</span>
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </div>
    );
}

export default FeedbackManagementTable;