// app/api/auth/check/route.js
import jwt from 'jsonwebtoken';
export async function GET(req) {
  const token = req.headers.get('Authorization')?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return Response.json({ loggedIn: false }, { status: 200 });
  }

  try {
    // Implement your token verification logic
    const decoded = verifyToken(token);
    return Response.json({
      loggedIn: true,
      user: decoded // optional
    }, { status: 200 });
  } catch (error) {
    return Response.json({ loggedIn: false }, { status: 200 });
  }
}

// Simple JWT verification example (implement properly)
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
