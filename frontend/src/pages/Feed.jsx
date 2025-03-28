import React, { useState, useEffect } from 'react';
import axios from 'axios';

const randomImages = [
  'https://picsum.photos/200/300?random=1',
  'https://picsum.photos/200/300?random=2',
  'https://picsum.photos/200/300?random=3',
  'https://picsum.photos/200/300?random=4',
  'https://picsum.photos/200/300?random=5',
];

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await axios.get('http://localhost:3000/posts?type=latest');
        setPosts(response.data.latestPosts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching feed:', error);
        setLoading(false);
      }
    };

    fetchFeed();
    const interval = setInterval(fetchFeed, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Live Feed</h1>
      <div className="space-y-6">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300"
          >
            <div className="flex space-x-4">
              <img
                src={randomImages[index % randomImages.length]}
                alt={post.content}
                className="w-24 h-24 rounded-md object-cover"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800">{post.username}</h2>
                <p className="text-gray-600 mt-1">{post.content}</p>
                <p className="text-sm text-gray-500 mt-2">Comments: {post.commentCount}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feed;