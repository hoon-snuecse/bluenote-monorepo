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
        <View style={styles.section} break>
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
          <View style={styles.section} break>
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
 */
function getLevelColor(level: string) {
  if (level.includes('매우 우수') || level.includes('매우우수')) {
    return { color: '#8B9D3C' }; // STAGED green
  }
  if (level.includes('우수')) {
    return { color: '#8B9D3C' }; // STAGED green
  }
  if (level.includes('보통')) {
    return { color: '#FF6B35' }; // STAGED orange
  }
  if (level.includes('미흡')) {
    return { color: '#94a3b8' }; // Gray
  }
  return { color: '#64748b' };
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKR',
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontSize: 11,
    color: '#1e293b',
  },

  // 헤더
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoStaged: {
    fontSize: 24,
    fontWeight: 700,
    color: '#8B9D3C', // Primary green from design system
    letterSpacing: 1,
  },
  logoPlus: {
    fontSize: 24,
    fontWeight: 700,
    color: '#FF6B35', // Secondary orange from design system
    marginLeft: 2,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 500,
    color: '#1e293b',
  },

  // 과제 정보
  assignmentInfo: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    fontSize: 14,
    marginRight: 8,
  },
  assignmentText: {
    fontSize: 12,
    color: '#475569',
  },

  // 섹션
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 10,
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#475569',
    marginBottom: 8,
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 12,
  },

  // 학생 정보
  infoGrid: {
    paddingLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#64748b',
    width: 80,
  },
  infoValue: {
    fontSize: 11,
    color: '#1e293b',
    flex: 1,
  },

  // 제출한 글
  submissionBox: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  submissionText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#475569',
  },

  // 종합 평가
  overallBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    marginBottom: 15,
  },
  overallLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: '#475569',
    marginRight: 10,
  },
  overallLevel: {
    fontSize: 18,
    fontWeight: 700,
  },
  feedbackBox: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  feedbackText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#475569',
  },

  // 영역별 평가
  domainSection: {
    marginBottom: 15,
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  domainNumber: {
    fontSize: 14,
    marginRight: 8,
  },
  domainTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1e293b',
    flex: 1,
  },
  domainLevel: {
    fontSize: 12,
    fontWeight: 700,
  },
  domainFeedbackBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  domainFeedback: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#475569',
  },

  // 리스트 (강점, 개선방안)
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 10,
  },
  listBullet: {
    fontSize: 11,
    color: '#10b981',
    marginRight: 8,
    fontWeight: 700,
  },
  listNumber: {
    fontSize: 11,
    color: '#3b82f6',
    marginRight: 8,
    fontWeight: 700,
    width: 20,
  },
  listText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#475569',
    flex: 1,
  },

  // 푸터
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 9,
    color: '#94a3b8',
  },
});
