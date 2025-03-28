const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

// Middleware for error handling
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get('/', (req, res) => {
  res.send('Social Media Analytics Microservice');
});

// Top Users endpoint
app.get('/users', asyncHandler(async (req, res) => {
  try {
    const usersData = await fs.readFile(path.join(__dirname, 'users.json'), 'utf8');
    const postsData = await fs.readFile(path.join(__dirname, 'posts.json'), 'utf8');

    const users = JSON.parse(usersData).users;
    const posts = JSON.parse(postsData).posts;

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
    console.error('Error in /users:', error);
    throw error;
  }
}));

// Top/Latest Posts endpoint
app.get('/posts', asyncHandler(async (req, res) => {
  try {
    const postsData = await fs.readFile(path.join(__dirname, 'posts.json'), 'utf8');
    const commentsData = await fs.readFile(path.join(__dirname, 'comments.json'), 'utf8');
    const usersData = await fs.readFile(path.join(__dirname, 'users.json'), 'utf8');

    const posts = JSON.parse(postsData).posts;
    const comments = JSON.parse(commentsData).comments;
    const users = JSON.parse(usersData).users;

    console.log('Number of posts loaded:', posts.length);
    console.log('Number of comments loaded:', comments.length);

    // Add comment count to each post
    const postsWithComments = posts.map(post => {
      const commentCount = comments.filter(comment => comment.postid === post.id).length;
      return {
        ...post,
        commentCount,
        username: users[post.userid] || `User ${post.userid}`
      };
    });

    const type = req.query.type || 'popular';

    if (type === 'popular') {
      // Find maximum comment count
      const maxComments = Math.max(...postsWithComments.map(post => post.commentCount));
      // Get all posts with maximum comments
      const popularPosts = postsWithComments.filter(post => post.commentCount === maxComments);

      console.log('Popular posts:', popularPosts);
      res.json({ popularPosts });
    } else if (type === 'latest') {
      // Sort posts by ID descending (assuming higher ID = more recent)
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
    console.error('Error in /posts:', error);
    throw error;
  }
}));

// Custom 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found on this server`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 