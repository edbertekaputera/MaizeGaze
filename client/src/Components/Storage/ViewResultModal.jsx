import axios from "axios";
import { Modal } from "flowbite-react";
import React, { useEffect, useState, Component } from "react";
import { PiFarmFill } from "react-icons/pi";
import { GiCorn } from "react-icons/gi";
import { FiTrash2 } from "react-icons/fi";
import { IoMdDownload } from "react-icons/io";

function ViewResultModal({state, setState, result_id, farm_name}){
    const [image, setImage] = useState("");
    const [name, setName] = useState("");
    const [farm, setFarm] = useState("");
    const [maize, setMaize] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    useEffect(() => {
        axios
        .get(`/api/detect/get_detection_result`,{
            params: {
                result_id: result_id, 
                farm_name: farm_name
            }
        })
        .then((res) => {
            console.log("Successful ", res);
            setImage(res.data.image);
            setName(res.data.name);
            setFarm(res.data.farm);
            setMaize(res.data.maize);
            setDate(res.data.date);
            setTime(res.data.time);
        })
        .catch((error) => {
            console.log(error);
            alert("Error while fetching...");
        });
    }, [result_id, farm_name]);

    const handleDelete = () => {
        // Delete the result
    }

    const handleDownload = () => {
        // Download the result
    }

    return(
        <>
            <Modal show={state} size="3xl" onClose={() => setState(false)} popup>
                <div className="rounded shadow-md">
                    <Modal.Header>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="p-5">
                            <div>
                                <img
                                    className="w-full h-auto object-contain"
                                    src={image}
                                    alt="Annotated Image"
                                />
                            </div>
                            <div className="mt-5">
                                <div className="flex flex-wrap items-center">
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-bold">{name}</h1>
                                    </div>
                                    <div className="flex items-center gap-10 ml-auto">
                                        <button
                                            className="border-none bg-transparent"
                                            onClick={handleDelete}
                                        >
                                            <FiTrash2 size={25}/>
                                        </button>
                                        <button
                                            className="border-none bg-transparent"
                                            onClick={handleDownload}
                                        >
                                            < IoMdDownload size={25}/>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap mt-5 items-center">
                                    <div className="flex items-center">
                                        <span> <PiFarmFill /> </span>
                                        <span className="ml-2">{farm}</span>
                                    </div>
                                    <div className="flex items-center ml-auto">
                                        <span>{time}</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap mt-5 items-center">
                                    <div className="flex items-center">
                                        <span> <GiCorn /> </span>
                                        <span className="ml-2">{maize}</span>
                                    </div>
                                    <div className="flex items-center ml-auto">
                                        <span><i>{date}</i></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                </div>
            </Modal>
        </>
    )
}

export default ViewResultModal;