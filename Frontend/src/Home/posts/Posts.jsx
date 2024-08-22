import "./posts.scss"
import Post from "../post/Post"
import { useQuery } from '@tanstack/react-query'

const Posts = ({userId}) => {

    const { isPending, error, data } = useQuery({
        queryKey: ['posts'],
        queryFn: () =>
            fetch('http://localhost:5001/getposts', {
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

    return (
        <div className="posts">
            {error
                ? "Something went wrong!"
                : isPending
                    ? "loading"
                    : data.map((post) => <Post post={post} key={post.postid} />)}
        </div>
    )
};

export default Posts