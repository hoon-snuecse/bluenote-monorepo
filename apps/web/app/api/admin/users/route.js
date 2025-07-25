import { createApiHandler, crud, supabaseQuery } from '@/lib/api-helpers';

const handleAdminRequest = createApiHandler({ requiredRole: 'admin' });

// GET - Fetch all users
export async function GET(request) {
  return handleAdminRequest(request, async ({ supabase }) => {
    const users = await crud.list(supabase, 'user_permissions');
    return { users };
  });
}

// POST - Create new user
export async function POST(request) {
  return handleAdminRequest(request, async ({ supabase }) => {
    const data = await request.json();
    const { email, role = 'user', claude_daily_limit = 3, can_write = false } = data;

    if (!email || !email.includes('@')) {
      throw { message: 'Valid email required', status: 400 };
    }

    const newUser = await crud.create(supabase, 'user_permissions', {
      email,
      role,
      claude_daily_limit,
      can_write
    });

    return { user: newUser };
  });
}

// PUT - Update existing user
export async function PUT(request) {
  return handleAdminRequest(request, async ({ supabase }) => {
    const data = await request.json();
    const { email, role, claude_daily_limit, can_write } = data;

    if (!email) {
      throw { message: 'Email required', status: 400 };
    }

    // user_permissions 테이블은 email이 primary key이므로 특별 처리
    const updatedUser = await supabaseQuery(
      () => supabase
        .from('user_permissions')
        .update({
          role,
          claude_daily_limit,
          can_write,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select()
        .single(),
      'Failed to update user'
    );

    return { user: updatedUser };
  });
}

// DELETE - Delete user
export async function DELETE(request) {
  return handleAdminRequest(request, async ({ session, supabase }) => {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      throw { message: 'Email required', status: 400 };
    }

    // Prevent self-deletion
    if (email === session.user.email) {
      throw { message: 'Cannot delete your own account', status: 400 };
    }

    // user_permissions 테이블은 email이 primary key이므로 특별 처리
    await supabaseQuery(
      () => supabase
        .from('user_permissions')
        .delete()
        .eq('email', email),
      'Failed to delete user'
    );

    return { success: true };
  });
}