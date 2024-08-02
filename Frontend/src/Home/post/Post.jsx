import "./post.scss";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { MdOutlineTextsms } from "react-icons/md";
import { IoShareSocialOutline } from "react-icons/io5";
import { MdMoreHoriz } from "react-icons/md";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState } from "react";

const Post = ({ post }) => {
    const [commentOpen, setCommentOpen] = useState(false);

    //TEMPORARY
    const liked = false;

    return (
        <div className="post">
            <div className="container">
                <div className="user">
                    <div className="userInfo">
                        <img src={"https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1600"} alt="" />
                        <div className="details">
                            <Link
                                to={`/profile/${post.userId}`}
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