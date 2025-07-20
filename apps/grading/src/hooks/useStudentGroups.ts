import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface Student {
  id: string;
  studentId: string;
  name: string;
  grade?: string;
  class?: string;
  number?: number;
  email?: string;
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentGroup {
  id: string;
  name: string;
  description?: string;
  schoolName: string;
  gradeLevel?: string;
  className?: string;
  schoolYear: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    students: number;
  };
  studentCount?: number;
}

export function useStudentGroups() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchGroups();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student-groups');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch groups');
      }
      
      setGroups(data.groups || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch groups');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData: {
    name: string;
    description?: string;
    schoolName: string;
    gradeLevel?: string;
    className?: string;
    schoolYear: string;
  }) => {
    try {
      const response = await fetch('/api/student-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create group');
      }
      
      await fetchGroups(); // Refresh the list
      return data.group;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create group');
    }
  };

  const updateGroup = async (id: string, updates: Partial<StudentGroup>) => {
    try {
      const response = await fetch(`/api/student-groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update group');
      }
      
      setGroups(groups.map(g => g.id === id ? data.group : g));
      return data.group;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update group');
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      const response = await fetch(`/api/student-groups/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete group');
      }
      
      setGroups(groups.filter(g => g.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete group');
    }
  };

  const fetchStudents = async (groupId: string): Promise<Student[]> => {
    try {
      const response = await fetch(`/api/student-groups/${groupId}/students`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch students');
      }
      
      return data.students || [];
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch students');
    }
  };

  const addStudents = async (groupId: string, students: Array<{
    studentId: string;
    name: string;
    grade?: string;
    class?: string;
    number?: number;
    email?: string;
  }>) => {
    try {
      const response = await fetch(`/api/student-groups/${groupId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add students');
      }
      
      return data.students;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add students');
    }
  };

  const deleteStudents = async (groupId: string, studentIds: string[]) => {
    try {
      const response = await fetch(`/api/student-groups/${groupId}/students?studentIds=${studentIds.join(',')}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete students');
      }
      
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete students');
    }
  };

  const updateStudent = async (groupId: string, studentId: string, updates: {
    studentId?: string;
    name?: string;
    grade?: string;
    class?: string;
    number?: number;
    email?: string;
  }) => {
    try {
      const response = await fetch(`/api/student-groups/${groupId}/students`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, updates }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update student');
      }
      
      return data.student;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update student');
    }
  };

  const fetchStudent = async (groupId: string, studentId: string): Promise<Student & { 
    submissions: any[];
    evaluations: any[];
  }> => {
    try {
      const response = await fetch(`/api/student-groups/${groupId}/students/${studentId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch student');
      }
      
      return data.student;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch student');
    }
  };

  return {
    groups,
    loading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    fetchStudents,
    fetchStudent,
    addStudents,
    updateStudent,
    deleteStudents,
    refetch: fetchGroups
  };
}