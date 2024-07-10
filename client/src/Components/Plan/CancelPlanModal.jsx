import React, { useContext } from "react";
import { Button, Modal} from "flowbite-react";
import { FaCheckCircle } from "react-icons/fa";
import { AuthContext } from "../Authentication/PrivateRoute";
import axios from "axios";

function CancelPlanModal({ state, setState }) {
    const { userInfo } = useContext(AuthContext);

    const handleCancellation = () => {
        axios
        .post("/api/user/subscription/cancel_plan")
        .then((res) => {
            if (res.status === 200) {
                window.location.reload();
            } else {
                alert("Error occured when processing cancellation. Please Try again.");
                window.location.reload();
            }
        })
    }

    const convertStorageLimit = (storage) => {
        if (storage >= 1024) {
          return { value: (storage / 1024), unit: 'GB' };
        }
        return { value: storage, unit: 'MB' };
      };
    
    const { value: storageValue, unit: storageUnit } = convertStorageLimit(userInfo.storage_limit);

        return (
        <>
            <Modal className="" show={state} onClose={() => setState(false)} popup>
                <Modal.Header>
					<div className="pl-10 pt-4 text-2xl font-bold text-gray-900 dark:text-white">Are you sure? 😢 You'll miss out on...</div>
				</Modal.Header>
                <Modal.Body>
                    <div className="px-7 pt-7 flex flex-col justify-center items-center">
                        <ul className=" w-full text-black justify-between">
                        {userInfo.can_reannotate && (
                            <li className="w-full flex text-left justify-between items-center py-2">
                                <span>Interactive Model Self-training</span>
                                <div className="text-custom-green-2 text-xl">
                                    <FaCheckCircle />
                                </div>
                            </li>
                        )}
                        {userInfo.can_chatbot && (
                            <li className="w-full flex text-left justify-between items-center py-2">
                            <span>AI-powered Chatbot</span>
                            <div className="text-custom-green-2 text-xl">
                                <FaCheckCircle />
                            </div>
                            </li>
                        )}
                        {userInfo.can_active_learn && (
                            <li className="w-full flex text-left justify-between items-center py-2">
                            <span>Personalized Active Learning</span>
                            <div className="text-custom-green-2 text-xl">
                                <FaCheckCircle />
                            </div>
                            </li>
                        )}
                        {userInfo.can_diagnose && (
                            <li className="w-full flex text-left justify-between items-center py-2">
                            <span>Diagnose Maize Plant</span>
                            <div className="text-custom-green-2 text-xl">
                                <FaCheckCircle />
                            </div>
                            </li>
                        )}
                            <li className="w-full flex text-left justify-between items-center py-2">
                            <span>Detection Quota</span>
                            <div className="text-xl font-bold">{userInfo.detection_quota_limit}</div>
                            </li>
                            <li className="w-full flex text-left justify-between items-center py-2">
                            <span>Storage</span>
                            <div className="text-xl font-bold">{storageValue} <span className="text-xs"> {storageUnit} </span></div>
                            </li>
                        </ul>
                        <Button
                            className="bg-custom-brown-1 text-white w-1/2 mt-5 mx-auto" 
                            onClick={() => setState(false)}>
                                Keep Plan
                        </Button>
                        <Button
                            className="bg-red-500 text-white w-1/2 mt-5 mx-auto" 
                            onClick={handleCancellation}>
                                Confirm Cancel Plan
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default CancelPlanModal;