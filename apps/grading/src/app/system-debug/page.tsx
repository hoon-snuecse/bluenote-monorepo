'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui';

export default function SystemDebugPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch assignments
      const assignmentsRes = await fetch('/api/assignments');
      const assignmentsData = await assignmentsRes.json();
      if (assignmentsData.success) {
        setAssignments(assignmentsData.assignments);
      }

      // Fetch all submissions
      const submissionsRes = await fetch('/api/debug/submissions');
      const submissionsData = await submissionsRes.json();
      setSubmissions(submissionsData.recentSubmissions || []);

      // Fetch token status
      const tokensRes = await fetch('/api/debug/tokens');
      const tokensData = await tokensRes.json();
      setTokens(tokensData);

      // Get session
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      setSession(sessionData);
    } catch (error) {
      console.error('Debug data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAssignmentSubmissions = async (assignmentId: string) => {
    try {
      const res = await fetch(`/api/debug/submissions?assignmentId=${assignmentId}`);
      const data = await res.json();
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      alert('Error: ' + error);
    }
  };

  if (loading) return <div className="p-8">Loading debug info...</div>;

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-6">System Debug Page</h1>

      <Card>
        <CardHeader>
          <CardTitle>Session Info</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google Tokens Status</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(tokens, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignments ({assignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{assignment.title}</p>
                  <p className="text-sm text-gray-600">ID: {assignment.id}</p>
                </div>
                <button
                  onClick={() => checkAssignmentSubmissions(assignment.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Check Submissions
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions ({submissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {submissions.map((submission: any) => (
              <div key={submission.id} className="p-3 bg-gray-50 rounded">
                <p className="font-medium">{submission.studentName}</p>
                <p className="text-sm text-gray-600">
                  Assignment: {submission.assignmentTitle} (ID: {submission.assignmentId})
                </p>
                <p className="text-sm text-gray-600">
                  Created: {new Date(submission.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}