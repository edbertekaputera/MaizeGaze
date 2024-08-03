import { Button, Card } from 'flowbite-react';
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Authentication/PrivateRoute';

function PurchasePlan() {
    const { userInfo } = useContext(AuthContext);
    const [user, setUser] = useState({});
    const { plan_name } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
            axios
            .get("/api/user/subscription/get_plan",
                {
                    params: {
                        name: plan_name
                    }
                }
            )
            .then((res) => {
                setUser(res.data);
            })
            .catch((error) => {
                console.log(error);
            })
    }, []);

    const handleChangePlan = () => {
        navigate("/user/plan_management");
    }

    const handlePayment = () => {
        axios
        .get("/api/user/subscription/purchase_plan", { 
            params: { 
            name: plan_name, 
            }, 
        }) 
        .then((res) => { 
            if (res.status === 200) { 
            window.location.replace(res.data.url);
            } else { 
            alert("Error occured when processing purchase. Please Try again."); 
            window.location.reload(); 
            } 
        }) 
        .catch((err) => { 
            alert("Error occured when processing purchase. Please Try again."); 
            window.location.reload();

        });
    }

    return (
        <div className="h-screen overflow-hidden">
            {/* Page Card */}
            <Card className="my-5 mx-4 lg:my-10 lg:mx-16 shadow-lg border xl:mb-20 pb-5">
                <header className="flex flex-wrap flex-row gap-2 justify-between shadow-b border-b-2 pb-5 border-black">
                    <h1 className="text-4xl font-extrabold">Order Confirmation</h1>
                </header>
                <div className="w-full flex flex-col lg:flex-row gap-10 py-16">
                    <div className="w-full lg:w-1/2 border-gray-300 shadow-lg rounded-lg border px-5 pt-5">
                        <header className="flex flex-wrap flex-row justify-between shadow-b border-b-2 pb-5 border-black">
                            <h1 className="text-xl font-bold">Your Details</h1>
                        </header>
                        <div className="flex flex-col p-5 gap-y-5">
                            <p>{userInfo.name}</p>
                            <p className=" text-gray-500">{userInfo.email}</p>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 border-gray-300 shadow-lg rounded-lg border p-5">
                        <header className="flex flex-wrap flex-row justify-between shadow-b border-b-2 pb-5 border-black">
                            <h1 className="text-xl font-bold">Payment Summary</h1>
                        </header>
                        <div className="flex flex-row justify-between p-5 gap-y-5">
                            <p>{user.plan_name}</p>
                            <p>S$ {user.plan_price}</p>
                        </div>
                        <div className="flex justify-end">
                            <Button 
                                className="bg-custom-brown-1 hover:bg-custom-brown-2"
                                onClick={handleChangePlan}
                            >
                                Change Plan
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="w-full flex justify-center ">
                    <Button 
                        className="w-full lg:w-1/3 bg-custom-green-2 hover:bg-custom-green-1 focus:ring-4 focus:ring-custom-green-3"
                        onClick={handlePayment}
                    >
                        Continue to payment
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default PurchasePlan;