import { Modal, Button, TextInput } from "flowbite-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import test from "../../assets/alex.jpg";

function ViewUserModal({ state, setState, id, email }) {  // Make sure id and email are passed as props
    const [data, setData] = useState({
        image: "",
        name: "",
        email: "",
        tier_plan: "",
        status: "",
        suspend_until: "",
    });

    useEffect(() => {
        if (state && data.name === "") {
            axios
                .get(`/api/storage/query_result`, {
                    params: {
                        id: id,
                        email: email,
                    },
                })
                .then((res) => {
                    if (res.data.status_code === 200) {
                        setData((prev) => ({
                            ...prev,
                            image: res.data.result.image,
                            name: res.data.result.name,
                            email: res.data.result.email,
                            tier_plan: res.data.result.tier_plan,
                            status: res.data.result.status.toUpperCase(),
                            suspend_until: res.data.result.suspend_until,
                        }));
                    } else {
                        console.log(res.data.status_code, res.data.message);
                        alert(res.data.message);
                        setState(false);
                    }
                })
                .catch((error) => {
                    console.log(error);
                    alert("Error while fetching...");
                });
        }
    }, [state]);

    const handleSuspend = () => {
        // Handle suspend user
    }

    return (
        <>
            <Modal show={state} size="6xl" onClose={() => setState(false)} popup>
                <div className="rounded shadow-md overflow-y-scroll">
                    <Modal.Header></Modal.Header>
                    <Modal.Body>
                        <div className="flex flex-wrap p-5">
                            <div className="flex flex-col w-full md:w-1/3 lg:w-1/3 justify-center items-center">
                                <img src={data.image} className="rounded-full w-40 h-40 md:w-48 md:h-48" />
                                {data.status === "ACTIVE" ? (
                                    <h1 className="text-2xl font-bold mt-5 text-green-500">{data.status}</h1>
                                ) : (
                                    <div className="text-center">
                                        <h1 className="text-2xl font-bold mt-5 text-red-500">{data.status}</h1>
                                        {data.suspend_until && (
                                            <span className="block">Until: {data.suspend_until}</span>
                                        )}
                                    </div>
                                )}
                                {data.status === "ACTIVE" && (
                                    <Button 
                                        className="my-5 bg-red-500"
                                        onClick={handleSuspend}
                                    >
                                        Suspend
                                    </Button>
                                )}
                            </div>
                            <div className="flex flex-col w-full md:w-2/3 lg:w-2/3 justify-center">
                                <div className="flex flex-col py-3">
                                    <label className="font-semibold mb-2">Name</label>
                                    <TextInput
                                        type="text"
                                        value={data.name}
                                        readOnly
                                    />
                                </div>
                                <div className="flex flex-col py-3">
                                    <label className="font-semibold">Email</label>
                                    <TextInput
                                        type="text"
                                        value={data.email}
                                        readOnly
                                    />
                                </div>
                                <div className="flex flex-col py-3">
                                    <label className="font-semibold">Tier Plan</label>
                                    <TextInput
                                        type="text"
                                        value={data.tier_plan}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                </div>
            </Modal>
        </>
    );
}

export default ViewUserModal;
