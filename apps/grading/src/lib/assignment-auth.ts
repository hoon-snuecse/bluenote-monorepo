import { getServerSession } from "next-auth";
import { authOptions } from "@bluenote/auth";
import prisma from '@/lib/prisma';

export type PermissionLevel = 'none' | 'read' | 'evaluate' | 'write' | 'owner';

export interface AssignmentPermission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canEvaluate: boolean;
  permissionLevel: PermissionLevel;
  isOwner: boolean;
}

/**
 * 사용자의 과제에 대한 권한을 확인합니다.
 */
export async function checkAssignmentPermission(
  assignmentId: string,
  userEmail?: string | null
): Promise<AssignmentPermission> {
  // 기본 권한 (권한 없음)
  const noPermission: AssignmentPermission = {
    canView: false,
    canEdit: false,
    canDelete: false,
    canShare: false,
    canEvaluate: false,
    permissionLevel: 'none',
    isOwner: false
  };

  if (!userEmail) {
    return noPermission;
  }

  try {
    // 과제 정보 조회
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        userEmail: true,
        isShared: true,
        userId: true
      }
    });

    if (!assignment) {
      return noPermission;
    }

    // 소유자 확인
    const isOwner = assignment.userEmail === userEmail;
    
    if (isOwner) {
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        canShare: true,
        canEvaluate: true,
        permissionLevel: 'owner',
        isOwner: true
      };
    }

    // 공유된 과제인지 확인
    if (assignment.isShared) {
      // SharedAssignment 테이블에서 권한 확인
      const sharedPermission = await prisma.sharedAssignment.findUnique({
        where: {
          assignmentId_sharedToEmail: {
            assignmentId: assignmentId,
            sharedToEmail: userEmail
          }
        },
        select: {
          permission: true
        }
      });

      if (sharedPermission) {
        const permission = sharedPermission.permission as 'read' | 'evaluate' | 'write';
        
        return {
          canView: true,
          canEdit: permission === 'write',
          canDelete: false,
          canShare: false,
          canEvaluate: permission === 'evaluate' || permission === 'write',
          permissionLevel: permission,
          isOwner: false
        };
      }
    }

    return noPermission;
  } catch (error) {
    console.error('Error checking assignment permission:', error);
    return noPermission;
  }
}

/**
 * 여러 과제에 대한 권한을 일괄 확인합니다.
 */
export async function checkAssignmentPermissions(
  assignmentIds: string[],
  userEmail?: string | null
): Promise<Map<string, AssignmentPermission>> {
  const permissions = new Map<string, AssignmentPermission>();
  
  if (!userEmail || assignmentIds.length === 0) {
    return permissions;
  }

  try {
    // 과제 정보 일괄 조회
    const assignments = await prisma.assignment.findMany({
      where: { id: { in: assignmentIds } },
      select: {
        id: true,
        userEmail: true,
        isShared: true,
        userId: true
      }
    });

    // 공유 권한 일괄 조회
    const sharedPermissions = await prisma.sharedAssignment.findMany({
      where: {
        assignmentId: { in: assignmentIds },
        sharedToEmail: userEmail
      },
      select: {
        assignmentId: true,
        permission: true
      }
    });

    // 공유 권한을 Map으로 변환
    const sharedPermissionMap = new Map(
      sharedPermissions.map(sp => [sp.assignmentId, sp.permission])
    );

    // 각 과제에 대한 권한 계산
    for (const assignment of assignments) {
      const isOwner = assignment.userEmail === userEmail;
      
      if (isOwner) {
        permissions.set(assignment.id, {
          canView: true,
          canEdit: true,
          canDelete: true,
          canShare: true,
          canEvaluate: true,
          permissionLevel: 'owner',
          isOwner: true
        });
      } else if (assignment.isShared && sharedPermissionMap.has(assignment.id)) {
        const permission = sharedPermissionMap.get(assignment.id) as 'read' | 'evaluate' | 'write';
        
        permissions.set(assignment.id, {
          canView: true,
          canEdit: permission === 'write',
          canDelete: false,
          canShare: false,
          canEvaluate: permission === 'evaluate' || permission === 'write',
          permissionLevel: permission,
          isOwner: false
        });
      }
    }
  } catch (error) {
    console.error('Error checking assignment permissions:', error);
  }

  return permissions;
}

/**
 * 현재 세션의 사용자 정보를 가져옵니다.
 */
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * 사용자가 볼 수 있는 과제 목록을 가져옵니다.
 */
export async function getViewableAssignments(userEmail: string) {
  try {
    const assignments = await prisma.assignment.findMany({
      where: {
        OR: [
          // 본인이 만든 과제
          { userEmail: userEmail },
          // 공유받은 과제
          {
            isShared: true,
            sharedAssignments: {
              some: {
                sharedToEmail: userEmail
              }
            }
          }
        ]
      },
      include: {
        _count: {
          select: {
            submissions: true
          }
        },
        sharedAssignments: {
          where: {
            sharedToEmail: userEmail
          },
          select: {
            permission: true,
            sharedByEmail: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return assignments;
  } catch (error) {
    console.error('Error getting viewable assignments:', error);
    return [];
  }
}

/**
 * 평가 권한을 확인합니다.
 */
export async function checkEvaluationPermission(
  assignmentId: string,
  userEmail?: string | null
): Promise<boolean> {
  if (!userEmail) return false;

  const permission = await checkAssignmentPermission(assignmentId, userEmail);
  return permission.canEvaluate;
}

/**
 * 제출물 접근 권한을 확인합니다.
 */
export async function checkSubmissionAccess(
  submissionId: string,
  userEmail?: string | null
): Promise<boolean> {
  if (!userEmail) return false;

  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        assignmentId: true
      }
    });

    if (!submission) return false;

    const permission = await checkAssignmentPermission(submission.assignmentId, userEmail);
    return permission.canView;
  } catch (error) {
    console.error('Error checking submission access:', error);
    return false;
  }
}