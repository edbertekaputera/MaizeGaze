import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
import PlanCard from "../Components/Plan/PlanCard";
import CancelPlanModal from "../Components/Plan/CancelPlanModal";

function UserPlanManagementPage() {
    const [freeDetails, setFreeDetails] = useState({});
    const [standardDetails, setStandardDetails] = useState({});
    const [premiumDetails, setPremiumDetails] = useState({});
    const [showCancelPlanModal, setShowCancelPlanModal] = useState(false);

    useEffect(() => {
        Promise.all([
            axios
                .get("/api/user/plan_management", {
                    params: {
                        name: "FREE_USER"
                    }
                }),
            axios
                .get("/api/user/plan_management", {
                    params: {
                        name: "STANDARD_USER"
                    }
                }),
            axios
                .get("/api/user/plan_management", {
                    params: {
                        name: "PREMIUM_USER"
                    }
                })
        ]).then((res) => {
            setFreeDetails(res[0].data);
            setStandardDetails(res[1].data);
            setPremiumDetails(res[2].data);
            // console.log(res);
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
            <div className="w-full flex flex-wrap lg:py-15 py-10 items-center">
                <PlanCard
                    plan_name = "FREE"
                    plan = {freeDetails}
                    setShowCancelPlanModal={setShowCancelPlanModal}
                />
                <PlanCard
                    plan_name = "STANDARD"
                    plan = {standardDetails}
                    setShowCancelPlanModal={setShowCancelPlanModal}
                />
                <PlanCard
                    plan_name = "PREMIUM"
                    plan = {premiumDetails}
                    setShowCancelPlanModal={setShowCancelPlanModal}
                />
            </div>
        </div>
    );
}

export default UserPlanManagementPage;