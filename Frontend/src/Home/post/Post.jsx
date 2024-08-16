import "./post.scss";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { MdOutlineTextsms } from "react-icons/md";
import { IoShareSocialOutline } from "react-icons/io5";
import { MdMoreHoriz } from "react-icons/md";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState, useContext } from "react";
import { AuthContext } from "../context/authContext"

const Post = ({ post }) => {
    const [commentOpen, setCommentOpen] = useState(false);
    const currentUser = useContext(AuthContext);


    //TEMPORARY
    const liked = false;

    return (
        <div className="post">
            <div className="container">
                <div className="user">
                    <div className="userInfo">
                        <div className="details">
                            <Link
                                to={`/profile/${post.userid}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <span className="name">{post.name}</span>
                            </Link>
                            <span className="date">1 min ago</span>
                        </div>
                    </div>
                    <MdMoreHoriz />
                </div>
                <div className="content">
                    <p>{post.desc}</p>
                    <img src={post.img} alt="" />
                </div>
                <div className="info">
                    <div className="item">
                        {liked ? <FaRegHeart /> : <FaHeart />}
                        12 Likes
                    </div>
                    <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
                        <MdOutlineTextsms />
                        12 Comments
                    </div>
                    <div className="item">
                        <IoShareSocialOutline />
                        Share
                    </div>
                </div>
                {commentOpen && <Comments />}
            </div>
        </div>
    );
};

export default Post;