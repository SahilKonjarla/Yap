import "./share.scss";
import Friend from "../assets/friend.png";
import { useContext, useState } from "react";
import { AuthContext } from "../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Share = () => {
    const [content, setContent] = useState("");
    const { currentUser } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (newPost) =>
            fetch("http://localhost:5001/addpost", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({content: newPost})
            })
                .then(res => res.json())
                .then(data => {
                    return data
                }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] })
        }

    });

    const handleClick = async (e) => {
        e.preventDefault();
        mutation.mutate({ content });
        setContent("");
    };

    return (
        <div className="share">
            <div className="container">
                <div className="top">
                    <img src={currentUser.profilepic} alt="" />
                    <input
                        type="text"
                        placeholder={`What's on your mind ${currentUser.name}?`}
                        onChange={(e) => setContent(e.target.value)}
                        value={content}
                    />
                </div>
                <hr />
                <div className="bottom">
                    <div className="left">
                        <div className="item">
                            <img src={Friend} alt="" />
                            <span>Tag Friends</span>
                        </div>
                    </div>
                    <div className="right">
                        <button onClick={handleClick}>Share</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Share;
