import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
import PlanCard from "../Components/Plan/PlanCard";
import CancelPlanModal from "../Components/Plan/CancelPlanModal";

function UserPlanManagementPage() {
    const [plans, setPlans] = useState([]);
    const [showCancelPlanModal, setShowCancelPlanModal] = useState(false);

    useEffect(() => {
        axios
        .get("/api/user/plan_management")
        .then((res) => {
            setPlans(res.data);
        })
        .catch((error) => {
            console.log(error);
            alert("Failed to fetch plans, please try again...");
        });
    }, []);

    return (
        <div className="min-h-screen px-10">
            {/* Cancel Plan Modal */}
            <CancelPlanModal state={showCancelPlanModal} setState={setShowCancelPlanModal} />
            {/* Plan Management Page */}
            <header className="flex flex-wrap justify-between border-b-2 border-black py-5">
                <h1 className="text-4xl font-extrabold">Plan Management</h1>
            </header>
            <div className="flex flex-col lg:flex-row w-full justify-center py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 w-full">
                    {plans.map((plan, index) => {
                        return (
                                <PlanCard
                                    key={index}
                                    plan={plan}
                                    setShowCancelPlanModal={setShowCancelPlanModal}
                                />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default UserPlanManagementPage;