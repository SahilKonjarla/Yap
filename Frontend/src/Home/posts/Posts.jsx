import "./posts.scss"
import Post from "../post/Post"
import { useQuery } from '@tanstack/react-query'

const Posts = () => {

    const { isPending, error, data } = useQuery({
        queryKey: ['posts'],
        queryFn: () =>
            fetch('http://localhost:5001/getposts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(),
            })
                .then((res) => res.json())
                .then(data => {
                    return data
                })
    })

    if (isPending) return 'Loading...'

    if (error) return 'An error has occurred: ' + error.message

    return (
        <div className="posts">
            {data.map((post) => (
                <Post post={post} key={post.id} />
            ))}
        </div>
    )
};

export default Posts