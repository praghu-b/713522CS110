import React, { useState, useEffect } from 'react';
import axios from 'axios';

const randomImages = [
  'https://picsum.photos/200/300?random=1',
  'https://picsum.photos/200/300?random=2',
  'https://picsum.photos/200/300?random=3',
  'https://picsum.photos/200/300?random=4',
  'https://picsum.photos/200/300?random=5',
];

function TopUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users');
        setUsers(response.data.topUsers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching top users:', error);
        setLoading(false);
      }
    };
    fetchTopUsers();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Top Users</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user, index) => (
          <div
            key={user.userId}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300"
          >
            <div className="flex items-center space-x-4">
              <img
                src={randomImages[index % randomImages.length]}
                alt={user.username}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{user.username}</h2>
                <p className="text-gray-600">Posts: {user.postCount}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopUsers;