import "./post.scss";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { MdOutlineTextsms } from "react-icons/md";
import { IoShareSocialOutline } from "react-icons/io5";
import { MdMoreHoriz } from "react-icons/md";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from "../context/authContext"
import moment from "moment"

const Post = ({ post }) => {
    const [commentOpen, setCommentOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { currentUser } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const postid = post.postid

    const {isPending, error, data } = useQuery({
        queryKey: ['likes', postid],
        queryFn: () =>
            fetch(`http://localhost:5001/getlikes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({postid}),
            })
                .then(res => res.json())
                .then((data) => {
                    return data.map(like=>like.likesuserid)
                })
    })

    const mutation = useMutation({
        mutationFn: (liked) => {
            if (liked) {
                fetch("http://localhost:5001/deletelike", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({postid})
                })
                    .then(res => res.json())
                    .then(data => {
                        return data
                    })
            } else {
                fetch("http://localhost:5001/addlike", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({postid}),
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data === undefined) {
                            return 1
                        } else {
                            return data
                        }
                    })
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['likes'] })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (postid) => {
            fetch("http://localhost:5001/deletepost", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({postid})
            })
                .then (res => res.json())
                .then (data => {
                    return data
                })
        },
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries(["posts"]);
        }
    })

    const handleLike = () => {
        if (data === undefined) {
            mutation.mutate(false)
        } else {
            mutation.mutate(data.includes(currentUser.uuid))
        }
    }

    const handleDelete = () => {
        deleteMutation.mutate(post.postid)
    }

    return (
        <div className="post">
            <div className="container">
                <div className="user">
                    <div className="userInfo">
                        <img src={`${process.env.PUBLIC_URL}/${currentUser.profilepic}`} alt={""}/>
                        <div className="details">
                            <Link
                                to={`/profile/${post.userid}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <span className="name">{post.name}</span>
                            </Link>
                            <span className="date">{moment(post.created).fromNow()}</span>
                        </div>
                    </div>
                    <MdMoreHoriz onClick={() => setMenuOpen(!menuOpen)} />
                    {menuOpen && post.userid === currentUser.uuid && (
                        <button onClick={handleDelete}>Delete</button>
                    )}
                </div>
                <div className="content">
                    <p>{post.content}</p>
                </div>
                <div className="info">
                    <div className="item">
                        {data && data.includes(currentUser.id) ? (
                            <FaHeart
                                style={{ color: "red" }}
                                onClick={handleLike}
                            />
                        ) : (
                            <FaRegHeart onClick={handleLike} />
                        )}
                        {isPending && "0"}
                        {data?.length} Likes
                    </div>
                    <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
                        <MdOutlineTextsms />
                        See Comments
                    </div>
                    <div className="item">
                        <IoShareSocialOutline />
                        Share
                    </div>
                </div>
                {commentOpen && <Comments postId={post.postid} />}
            </div>
        </div>
    );
};

export default Post;