import "./posts.scss"
import Post from "../post/Post"
import { useQuery } from '@tanstack/react-query'

const Posts = () => {

    const { isPending, error, data } = useQuery(["posts"], () =>
        fetch("http://localhost:5001/getposts").then((res) => {
            return res.data
        })
    )


    return (
        <div className="posts">
            {data.map(post=>(
                <Post post={post} key={post.id}/>
            ))}
        </div>
    )
};

export default Posts;