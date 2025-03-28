const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3000;

const TEST_SERVER_URL = 'http://20.244.56.144/test';
const AUTH_URL = `${TEST_SERVER_URL}/auth`;

const authCredentials = {
  companyName: "GoCompany",
  clientID: "43739b33-07aa-48f0-bae3-0ddc84c7e9a1",
  clientSecret: "xjETawqamDoEZBAr",
  ownerName: "Prakash",
  ownerEmail: "prakash.b.cse.2022@snsct.org",
  rollNo: "713522CS110"
};

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzMTU3MTc0LCJpYXQiOjE3NDMxNTY4NzQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjQzNzM5YjMzLTA3YWEtNDhmMC1iYWUzLTBkZGM4NGM3ZTlhMSIsInN1YiI6InByYWthc2guYi5jc2UuMjAyMkBzbnNjdC5vcmcifSwiY29tcGFueU5hbWUiOiJHb0NvbXBhbnkiLCJjbGllbnRJRCI6IjQzNzM5YjMzLTA3YWEtNDhmMC1iYWUzLTBkZGM4NGM3ZTlhMSIsImNsaWVudFNlY3JldCI6InhqRVRhd3FhbURvRVpCQXIiLCJvd25lck5hbWUiOiJQcmFrYXNoIiwib3duZXJFbWFpbCI6InByYWthc2guYi5jc2UuMjAyMkBzbnNjdC5vcmciLCJyb2xsTm8iOiI3MTM1MjJDUzExMCJ9.CbKWLttZb0K8CLk4Ws0QF_40NGD1THYSIpuVVtn6xKc';
const FALLBACK_EXPIRY = 1743157174;

app.use(cors());

let accessToken = FALLBACK_TOKEN;
let tokenExpiry = FALLBACK_EXPIRY;

const getAccessToken = async () => {
  const now = Math.floor(Date.now() / 1000);
  if (!accessToken || now >= tokenExpiry) {
    try {
      console.log('Requesting new access token...');
      const response = await axios.post(AUTH_URL, authCredentials);
      accessToken = response.data.access_token;
      tokenExpiry = response.data.expires_in;
      console.log('New token obtained, expires at:', new Date(tokenExpiry * 1000));
    } catch (error) {
      console.error('Error fetching token:', error.response?.data || error.message);
      if (accessToken === null) {
        console.log('Using fallback token');
        accessToken = FALLBACK_TOKEN;
        tokenExpiry = FALLBACK_EXPIRY;
      }
    }
  }
  return accessToken;
};

const apiClient = axios.create({
  baseURL: TEST_SERVER_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get('/', (req, res) => {
  res.send('Social Media Analytics Microservice');
});

app.get('/users', asyncHandler(async (req, res) => {
  try {
    const usersResponse = await apiClient.get('/users');
    const users = usersResponse.data.users;

    const posts = [];
    for (const userId in users) {
      const userPostsResponse = await apiClient.get(`/users/${userId}/posts`);
      posts.push(...userPostsResponse.data.posts);
    }

    console.log('Number of users loaded:', Object.keys(users).length);
    console.log('Number of posts loaded:', posts.length);

    const userPostCounts = new Map();
    posts.forEach(post => {
      const currentCount = userPostCounts.get(post.userid) || 0;
      userPostCounts.set(post.userid, currentCount + 1);
    });

    const topUsers = Array.from(userPostCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([userId, count]) => ({
        userId,
        postCount: count,
        username: users[userId] || `User ${userId}`
      }));

    console.log('Top users calculated:', topUsers);
    res.json({ topUsers });
  } catch (error) {
    console.error('Error in /users:', error.response?.data || error.message);
    throw error;
  }
}));

app.get('/posts', asyncHandler(async (req, res) => {
  try {
    const usersResponse = await apiClient.get('/users');
    const users = usersResponse.data.users;

    const posts = [];
    for (const userId in users) {
      const userPostsResponse = await apiClient.get(`/users/${userId}/posts`);
      posts.push(...userPostsResponse.data.posts);
    }

    const postsWithComments = await Promise.all(posts.map(async post => {
      const commentsResponse = await apiClient.get(`/posts/${post.id}/comments`);
      const commentCount = commentsResponse.data.comments.length;
      return {
        ...post,
        commentCount,
        username: users[post.userid] || `User ${post.userid}`
      };
    }));

    console.log('Number of posts loaded:', posts.length);
    console.log('Number of comments processed:', postsWithComments.reduce((sum, p) => sum + p.commentCount, 0));

    const type = req.query.type || 'popular';

    if (type === 'popular') {
      const maxComments = Math.max(...postsWithComments.map(post => post.commentCount));
      const popularPosts = postsWithComments.filter(post => post.commentCount === maxComments);

      console.log('Popular posts:', popularPosts);
      res.json({ popularPosts });
    } else if (type === 'latest') {
      const latestPosts = postsWithComments
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

      console.log('Latest posts:', latestPosts);
      res.json({ latestPosts });
    } else {
      res.status(400).json({ 
        error: 'Invalid type parameter',
        message: 'Type must be "popular" or "latest"'
      });
    }
  } catch (error) {
    console.error('Error in /posts:', error.response?.data || error.message);
    throw error;
  }
}));

app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found on this server`
  });
});

app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    details: err.response?.data
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});