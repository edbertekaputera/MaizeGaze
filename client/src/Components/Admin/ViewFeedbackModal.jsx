import { Modal, Card, Label, TextInput, Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import axios from "axios";
import MessageModal from "../MessageModal";
import LoadingCard from "../LoadingCard";

function ViewFeedbackModal({ state, setState, feedbackId }) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [messageModal, setMessageModal] = useState(false);

    useEffect(() => {
        if (state && data == null) {
            setIsLoading(true);
            axios
                .get("/api/admin/feedback/query_feedback", {
                    params: {
                        feedback_id: feedbackId,
                    },
                })
                .then((res) => {
                    if (res.data.status_code === 200) {
                        setData(res.data.feedback);
                    } else {
                        alert(`Failed to load feedback information, please try again...`);
                        setState(false);
                    }
                })
                .catch((error) => {
                    console.log(error);
                    alert(`Failed to load feedback information, please try again...`);
                    setState(false);
                })
                .finally(() => setIsLoading(false));
        }
    }, [state, feedbackId]);

    if (isLoading || data == null) {
        return <LoadingCard show={isLoading}>{`Loading feedback...`}</LoadingCard>;
    }

    return (
        <>
            <MessageModal
                state={messageModal}
                setState={() => {
                    setMessageModal(false);
                    setState(false);
                }}
            >
                Failed to load feedback information.
            </MessageModal>

            <Modal
                show={state}
                onClose={() => {
                    setData(null);
                    setState(false);
                }}
                popup
            >
                <Modal.Header>
                    <div className="pl-4 pt-4 text-2xl font-bold text-gray-900">
                        Feedback Details
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div className="flex flex-col justify-center">
                        <div className="mt-4 flex flex-col gap-y-5">
                            <div className="flex flex-col sm:flex-row gap-y-4 gap-x-6">
                                <section className="flex flex-col gap-4 w-full">
                                    <div className="flex flex-col gap-1">
                                        <Label value="Feedback ID" />
                                        <TextInput
                                            disabled
                                            value={data.feedback_id}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label value="User Email" />
                                        <TextInput
                                            disabled
                                            value={data.user_email}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label value="Rating" />
                                        <TextInput
                                            disabled
                                            value={data.rating}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label value="Content" />
                                        <textarea
                                            disabled
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            rows={5}
                                            value={data.content}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label value="Created At" />
                                        <TextInput
                                            disabled
                                            value={data.created_at}
                                        />
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ViewFeedbackModal;