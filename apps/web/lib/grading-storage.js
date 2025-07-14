import fs from 'fs/promises';
import path from 'path';

// 데이터 저장 경로
const DATA_DIR = path.join(process.cwd(), 'data', 'grading');
const ASSIGNMENTS_FILE = path.join(DATA_DIR, 'assignments.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// 초기화
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// 과제 관련 함수들
export async function getAssignments() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(ASSIGNMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // 파일이 없으면 기본 데이터 반환
    return [
      {
        id: '1',
        title: '2024 1학기 논설문 쓰기',
        schoolName: '서울초등학교',
        gradeLevel: '6학년',
        writingType: '논설문',
        evaluationDomains: ['주장의 명확성', '근거의 타당성', '논리적 구조', '설득력'],
        evaluationLevels: ['매우 우수', '우수', '보통', '미흡'],
        levelCount: '4',
        gradingCriteria: '논설문 평가 기준',
        createdAt: new Date().toISOString(),
      }
    ];
  }
}

export async function saveAssignment(assignment) {
  try {
    await ensureDataDir();
    const assignments = await getAssignments();
    assignments.unshift(assignment);
    await fs.writeFile(ASSIGNMENTS_FILE, JSON.stringify(assignments, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving assignment:', error);
    return false;
  }
}

export async function deleteAssignment(id) {
  try {
    const assignments = await getAssignments();
    const filtered = assignments.filter(a => a.id !== id);
    await fs.writeFile(ASSIGNMENTS_FILE, JSON.stringify(filtered, null, 2));
    return true;
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return false;
  }
}

// 제출물 관련 함수들
export async function getSubmissions(assignmentId) {
  try {
    await ensureDataDir();
    const data = await fs.readFile(SUBMISSIONS_FILE, 'utf-8');
    const allSubmissions = JSON.parse(data);
    return assignmentId 
      ? allSubmissions.filter(s => s.assignmentId === assignmentId)
      : allSubmissions;
  } catch (error) {
    return [];
  }
}

export async function saveSubmission(submission) {
  try {
    await ensureDataDir();
    const submissions = await getSubmissions();
    submissions.push(submission);
    await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving submission:', error);
    return false;
  }
}