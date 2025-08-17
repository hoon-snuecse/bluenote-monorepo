export async function GET() {
  return Response.json({ message: 'Test API working', timestamp: new Date().toISOString() });
}