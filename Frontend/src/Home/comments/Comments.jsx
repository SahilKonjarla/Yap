import { useContext, useState } from "react";
import { AuthContext } from "../context/authContext"
import "./comments.scss";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import moment from "moment"

const Comments = ({postId}) => {
    const [content, setContent] = useState("");
    const { currentUser } = useContext(AuthContext)

    const {isPending, error, data } = useQuery({
        queryKey: ['comments'],
        queryFn: () =>
            fetch(`http://localhost:5001/getcomments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({postId}),
            })
                .then(res => res.json())
                .then((data) => {
                    return data
                })
    })

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (newComment) =>
            fetch("http://localhost:5001/addcomment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(newComment)
            })
                .then(res => res.json())
                .then(data => {
                    return data
                }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments'] })
        }
    });

    const handleClick = async (e) => {
        e.preventDefault();
        mutation.mutate({ content: content, postid: postId });
        setContent("");
    };

    return (
        <div className="comments">
            <div className="write">
                <img src={`${process.env.PUBLIC_URL}/${currentUser.profilepic}`} alt="" />
                <input
                    type="text"
                    placeholder="write a comment"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <button onClick={handleClick}>Send</button>
            </div>
            {error
                ? "Something went wrong"
                : isPending
                    ? "No Comments"
                    : data.map((comment) => (
                        <div className="comment">
                            <img src={`${process.env.PUBLIC_URL}/${comment.profilepic}`} alt="" />
                            <div className="info">
                                <span>{comment.name}</span>
                                <p>{comment.content}</p>
                            </div>
                            <span className="date">
                                {moment(comment.created).fromNow()}
                            </span>
                        </div>
                    ))}
        </div>
    );
};

export default Comments;
