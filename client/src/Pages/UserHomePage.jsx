import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner } from "flowbite-react";
import { AuthContext } from "../Components/Authentication/PrivateRoute";
import { useNavigate } from "react-router-dom";
import DropImageInput from "../Components/DropImageInput";

function UserHomePage() {
	const { userInfo } = useContext(AuthContext);
	return (
		<div>
			Welcome {userInfo.name}... <br />
			Your email is {userInfo.email}, and you are a {userInfo.type}.
		</div>
	);
}

export default UserHomePage;
