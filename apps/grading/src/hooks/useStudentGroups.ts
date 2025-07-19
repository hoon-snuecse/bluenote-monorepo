import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Student {
  id: number;
  name: string;
  group_id: number;
  created_at: string;
  updated_at: string;
}

export interface StudentGroup {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export function useStudentGroups() {
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_groups')
        .select('*')
        .order('name');

      if (error) throw error;
      setGroups(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('student_groups')
        .insert({ name, description })
        .select()
        .single();

      if (error) throw error;
      setGroups([...groups, data]);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create group');
    }
  };

  const updateGroup = async (id: number, updates: Partial<StudentGroup>) => {
    try {
      const { data, error } = await supabase
        .from('student_groups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setGroups(groups.map(g => g.id === id ? data : g));
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update group');
    }
  };

  const deleteGroup = async (id: number) => {
    try {
      const { error } = await supabase
        .from('student_groups')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setGroups(groups.filter(g => g.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete group');
    }
  };

  const fetchStudents = async (groupId: number): Promise<Student[]> => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('group_id', groupId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch students');
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
    refetch: fetchGroups
  };
}