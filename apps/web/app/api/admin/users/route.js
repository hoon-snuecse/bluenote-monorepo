import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all users
export async function GET(request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = await createClient();
    
    // Fetch all users
    const { data: users, error } = await supabase
      .from('user_permissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const data = await request.json();
    const { email, role = 'user', claude_daily_limit = 3, can_write = false } = data;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Create new user
    const { data: newUser, error } = await supabase
      .from('user_permissions')
      .insert([{
        email,
        role,
        claude_daily_limit,
        can_write
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'User already exists' }, { status: 409 });
      }
      console.error('Error creating user:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json({ user: newUser });
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    return NextResponse.json({ 
      error: 'Failed to create user',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT - Update existing user
export async function PUT(request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const data = await request.json();
    const { email, role, claude_daily_limit, can_write } = data;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Update user
    const { data: updatedUser, error } = await supabase
      .from('user_permissions')
      .update({
        role,
        claude_daily_limit,
        can_write,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      console.error('Error updating user:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error in PUT /api/admin/users:', error);
    return NextResponse.json({ 
      error: 'Failed to update user',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Prevent self-deletion
    if (email === session.user.email) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Delete user (cascade will delete related usage logs)
    const { error } = await supabase
      .from('user_permissions')
      .delete()
      .eq('email', email);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/users:', error);
    return NextResponse.json({ 
      error: 'Failed to delete user',
      details: error.message 
    }, { status: 500 });
  }
}