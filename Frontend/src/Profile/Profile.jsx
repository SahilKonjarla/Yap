import "./profile.scss";
import { IoMdMore } from "react-icons/io";
import Posts from "../Home/posts/Posts"
import { AuthContext } from "../Home/context/authContext"
import { useContext, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";


const Profile = () => {
    const {currentUser} = useContext(AuthContext);
    const userId = useLocation().pathname.split("/")[2];

    const { isPending, error, data } = useQuery({
        queryKey: ['users'],
        queryFn: () =>
            fetch('http://localhost:5001/userinfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({uuid: userId}),
            })
                .then((res) => res.json())
                .then(data => {
                    return data
                })
    })

    const {isLoading: rIsLoading, data: relationshipData } = useQuery({
        queryKey: ['relationships'],
        queryFn: () =>
            fetch('http://localhost:5001/getrelationship', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({userId}),
            })
                .then((res) => res.json())
                .then(data => {
                    return data
                })
    })

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (following) => {
            if (following) {
                fetch("http://localhost:5001/deleterelationship", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({userId}),
                })
                    .then(res => res.json())
                    .then(data => {
                        return data
                    })
            } else {
                fetch("http://localhost:5001/addrelationship", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({userId}),
                })
                    .then(res => res.json())
                    .then(data => {
                        return data
                    })
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['relationships'])
        }
    });

    const handleFollow = () => {
        console.log("here")
        mutation.mutate(relationshipData.includes(currentUser.uuid))
    }

    return (
        <div className="profile">
            {isPending ? (
                "loading"
            ) : (
                <>
                    <div className="images">
                        <img src={"https://images.pexels.com/photos/13440765/pexels-photo-13440765.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"} alt="" className="cover"/>
                        <img src={`${process.env.PUBLIC_URL}/${currentUser.profilepic}`} alt="" className="profilePic"/>
                    </div>
                    <div className="profileContainer">
                        <div className="uInfo">
                            <div className="center">
                                <span>{currentUser.name}</span>
                                <div className="item">
                                    <span>User Bio</span>
                                </div>
                                {rIsLoading ? (
                                    "loading"
                                ) : userId === currentUser.uuid ? (
                                    <button>update</button>
                                ) : (
                                    <button onClick={handleFollow}>
                                        {relationshipData.includes(currentUser.uuid)
                                            ? "Following"
                                            : "Follow"}
                                    </button>
                                )}
                            </div>
                            <div className="right">
                                <IoMdMore />
                            </div>
                        </div>
                        <Posts userId={userId}/>
                    </div>
                </>
            )}
        </div>
    );
};

export default Profile;