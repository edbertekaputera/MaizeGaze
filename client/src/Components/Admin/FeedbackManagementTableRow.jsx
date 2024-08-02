import { Button, Table } from "flowbite-react";
import React, { useState } from "react";
import ViewFeedbackModal from "./ViewFeedbackModal";

function FeedbackManagementTableRow({ feedback }) {
    const [showView, setShowView] = useState(false);

    if (!feedback) {
        return null;
    }

    const { feedback_id, user_email, rating, content, created_at } = feedback;

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <>
            <ViewFeedbackModal 
                state={showView} 
                setState={setShowView} 
                feedbackId={feedback_id} 
            />
            <Table.Row className="bg-white">
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
                    {user_email || 'N/A'}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
                    {rating || 'N/A'}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
                    {content && content.length > 30 ? `${content.substring(0, 30)}...` : (content || 'N/A')}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
                    {created_at ? formatDate(created_at) : 'N/A'}
                </Table.Cell>
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

export default FeedbackManagementTableRow;