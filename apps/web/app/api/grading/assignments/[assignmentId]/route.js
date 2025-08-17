import { NextResponse } from 'next/server';
// Removed next-auth import
import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request, { params }) {
  try {
    const authSupabase = createRouteHandlerClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    const session = user ? { user } : null;
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const { assignmentId } = params;

    // Delete assignment (cascades to submissions and evaluations)
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      console.error('Error deleting assignment:', error);
      return NextResponse.json(
        { success: false, error: '과제 삭제 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '과제가 삭제되었습니다'
    });
    
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { success: false, error: '과제 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}