import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatDateKorean } from '@/lib/pdf-font-setup';

interface StudentReportPDFProps {
  evaluation: {
    id: string;
    domainEvaluations: Record<string, {
      level: string;
      score?: number;
      feedback: string;
    }>;
    overallLevel: string;
    overallFeedback: string;
    improvementSuggestions: string[];
    strengths: string[];
    evaluatedAt: Date;
    evaluatedBy?: string;
  };
  assignment: {
    title: string;
    schoolName: string;
    gradeLevel: string;
    writingType: string;
    evaluationDomains: string[];
    evaluationLevels: string[];
  };
  student: {
    name: string;
    studentId: string;
  };
  submission: {
    content: string;
    submittedAt: Date;
  };
}

/**
 * 개인 학생 평가 보고서 PDF 컴포넌트 (클래식 디자인)
 *
 * 구조:
 * 1. 헤더
 * 2. 학생 정보
 * 3. 학생이 제출한 글 ← 위치 변경됨
 * 4. 종합 평가
 * 5. 영역별 평가
 * 6. 강점
 * 7. 개선 방안
 * 8. 푸터
 */
export function StudentReportPDF({
  evaluation,
  assignment,
  student,
  submission,
}: StudentReportPDFProps) {
  return (
    <Page size="A4" style={styles.page} wrap>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoStaged}>STAGED</Text>
            <Text style={styles.logoPlus}>+</Text>
          </View>
          <Text style={styles.mainTitle}>글쓰기 평가 보고서</Text>
        </View>

        {/* 과제 정보 (간략) */}
        <View style={styles.assignmentInfo}>
          <View style={styles.assignmentRow}>
            <Text style={styles.icon}>■</Text>
            <Text style={styles.assignmentText}>
              과제: {assignment.title}
            </Text>
          </View>
          <View style={styles.assignmentRow}>
            <Text style={styles.icon}>■</Text>
            <Text style={styles.assignmentText}>
              학교: {assignment.schoolName} {assignment.gradeLevel}
            </Text>
          </View>
        </View>

        {/* 학생 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>학생 정보</Text>
          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>• 이름:</Text>
              <Text style={styles.infoValue}>{student.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>• 학번:</Text>
              <Text style={styles.infoValue}>{student.studentId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>• 제출일:</Text>
              <Text style={styles.infoValue}>
                {formatDateKorean(submission.submittedAt)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>• 평가일:</Text>
              <Text style={styles.infoValue}>
                {formatDateKorean(evaluation.evaluatedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* 학생이 제출한 글 (위치 이동됨 - 학생정보 다음) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제출한 글</Text>
          <View style={styles.divider} />

          <View style={styles.submissionBox}>
            <Text style={styles.submissionText}>
              {submission.content}
            </Text>
          </View>
        </View>

        {/* 종합 평가 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>종합 평가</Text>
          <View style={styles.divider} />

          <View style={styles.overallBox}>
            <Text style={styles.overallLabel}>성취 수준:</Text>
            <Text style={[styles.overallLevel, getLevelColor(evaluation.overallLevel)]}>
              {evaluation.overallLevel}
            </Text>
          </View>

          <Text style={styles.subsectionTitle}>종합 피드백:</Text>
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>
              {evaluation.overallFeedback}
            </Text>
          </View>
        </View>

        {/* 영역별 평가 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>영역별 상세 평가</Text>
          <View style={styles.divider} />

          {assignment.evaluationDomains.map((domain, index) => {
            const domainEval = evaluation.domainEvaluations[domain];
            if (!domainEval) return null;

            return (
              <View key={domain} style={styles.domainSection}>
                <View style={styles.domainHeader}>
                  <Text style={styles.domainNumber}>{index + 1}.</Text>
                  <Text style={styles.domainTitle}>{domain}</Text>
                  <Text style={[styles.domainLevel, getLevelColor(domainEval.level)]}>
                    {domainEval.level}
                    {domainEval.score && ` (${domainEval.score}점)`}
                  </Text>
                </View>
                <View style={styles.domainFeedbackBox}>
                  <Text style={styles.domainFeedback}>
                    {domainEval.feedback}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* 강점 */}
        {evaluation.strengths && evaluation.strengths.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>강점</Text>
            <View style={styles.divider} />

            {evaluation.strengths.map((strength, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listBullet}>•</Text>
                <Text style={styles.listText}>{strength}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 개선 방안 */}
        {evaluation.improvementSuggestions && evaluation.improvementSuggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>개선 방안</Text>
            <View style={styles.divider} />

            {evaluation.improvementSuggestions.map((suggestion, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listNumber}>{index + 1}.</Text>
                <Text style={styles.listText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 푸터 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            평가일: {formatDateKorean(evaluation.evaluatedAt)}
          </Text>
          <Text style={styles.footerText}>
            {evaluation.evaluatedBy || 'AI 평가'}
          </Text>
        </View>
    </Page>
  );
}

/**
 * 성취 수준에 따른 색상 스타일 반환
 * Design system colors from tailwind.config.ts
 */
function getLevelColor(level: string) {
  if (level.includes('매우 우수') || level.includes('매우우수')) {
    return { color: '#789542' }; // primary-700 (darker green for emphasis)
  }
  if (level.includes('우수')) {
    return { color: '#91AF52' }; // primary-600 (main brand green)
  }
  if (level.includes('보통')) {
    return { color: '#F58742' }; // secondary-600 (main brand orange)
  }
  if (level.includes('미흡')) {
    return { color: '#94a3b8' }; // Neutral gray
  }
  return { color: '#64748b' };
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKR',
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontSize: 10, // base: 1rem equivalent in pt
    fontWeight: 400, // Regular weight for body
    color: '#1e293b',
    lineHeight: 1.6, // Design system line-height
  },

  // 헤더
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  logoStaged: {
    fontSize: 14, // Reduced from 16
    fontWeight: 700,
    color: '#91AF52', // primary-600 from design system
    letterSpacing: 0.3,
  },
  logoPlus: {
    fontSize: 14,
    fontWeight: 700,
    color: '#F58742', // secondary-600 from design system
    marginLeft: 1,
  },
  mainTitle: {
    fontSize: 11, // sm: 0.875rem
    fontWeight: 400, // Regular, not medium
    color: '#475569',
    letterSpacing: -0.01,
  },

  // 과제 정보
  assignmentInfo: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 10,
    marginRight: 6,
    fontWeight: 400,
  },
  assignmentText: {
    fontSize: 9.5, // Between xs and sm
    fontWeight: 400,
    color: '#64748b',
    lineHeight: 1.5,
  },

  // 섹션
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11, // lg: 1.125rem equivalent
    fontWeight: 700, // Bold only for section titles
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: -0.02,
  },
  subsectionTitle: {
    fontSize: 10,
    fontWeight: 500, // Medium for subsections
    color: '#64748b',
    marginBottom: 6,
    marginTop: 8,
    letterSpacing: -0.01,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#e2e8f0',
    marginBottom: 10,
  },

  // 학생 정보
  infoGrid: {
    paddingLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 9, // xs: 0.75rem
    fontWeight: 400, // Regular, not medium
    color: '#94a3b8',
    width: 65,
    lineHeight: 1.5,
  },
  infoValue: {
    fontSize: 9,
    fontWeight: 400,
    color: '#475569',
    flex: 1,
    lineHeight: 1.5,
  },

  // 제출한 글
  submissionBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  submissionText: {
    fontSize: 9,
    lineHeight: 1.6,
    fontWeight: 400,
    color: '#64748b',
    letterSpacing: -0.01,
  },

  // 종합 평가
  overallBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    marginBottom: 10,
  },
  overallLabel: {
    fontSize: 10,
    fontWeight: 400, // Regular, not medium
    color: '#64748b',
    marginRight: 8,
    letterSpacing: -0.01,
  },
  overallLevel: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: -0.01,
  },
  feedbackBox: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  feedbackText: {
    fontSize: 9,
    lineHeight: 1.6,
    fontWeight: 400,
    color: '#64748b',
    letterSpacing: -0.01,
  },

  // 영역별 평가
  domainSection: {
    marginBottom: 10,
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  domainNumber: {
    fontSize: 9.5,
    fontWeight: 400,
    marginRight: 5,
    color: '#94a3b8',
  },
  domainTitle: {
    fontSize: 10,
    fontWeight: 500, // Medium, not bold
    color: '#1e293b',
    flex: 1,
    letterSpacing: -0.01,
  },
  domainLevel: {
    fontSize: 9,
    fontWeight: 500, // Medium, not bold
    letterSpacing: -0.01,
  },
  domainFeedbackBox: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 3,
    borderLeftWidth: 1.5,
    borderLeftColor: '#91AF52', // primary-600
  },
  domainFeedback: {
    fontSize: 8.5,
    lineHeight: 1.5,
    fontWeight: 400,
    color: '#64748b',
    letterSpacing: -0.01,
  },

  // 리스트 (강점, 개선방안)
  listItem: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingLeft: 6,
  },
  listBullet: {
    fontSize: 8,
    color: '#91AF52', // primary-600
    marginRight: 5,
    fontWeight: 400,
  },
  listNumber: {
    fontSize: 9,
    color: '#91AF52', // primary-600
    marginRight: 5,
    fontWeight: 400, // Regular, not medium
    width: 16,
  },
  listText: {
    fontSize: 9,
    lineHeight: 1.5,
    fontWeight: 400,
    color: '#64748b',
    flex: 1,
    letterSpacing: -0.01,
  },

  // 푸터
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    fontWeight: 400,
    color: '#94a3b8',
    lineHeight: 1.5,
  },
});
