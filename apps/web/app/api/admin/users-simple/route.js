export async function GET() {
  // Simple test response
  return Response.json({ 
    users: [
      { email: 'test@example.com', role: 'user' }
    ],
    count: 1,
    message: 'Users Simple API working'
  });
}