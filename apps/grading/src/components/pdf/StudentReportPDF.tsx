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
  studentPageStart?: number; // 개인별 페이지 번호 계산을 위한 시작 페이지
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
  studentPageStart,
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
            <Text style={styles.icon}>●</Text>
            <Text style={styles.assignmentText}>
              과제: {assignment.title}
            </Text>
          </View>
          <View style={styles.assignmentRow}>
            <Text style={styles.icon}>●</Text>
            <Text style={styles.assignmentText}>
              학교: {assignment.schoolName} {assignment.gradeLevel.replace('초등학교 ', '')}
            </Text>
          </View>
        </View>

        {/* 학생 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>▎학생 정보</Text>
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
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>▎제출한 글</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.submissionBox}>
          <Text style={styles.submissionText}>
            {submission.content}
          </Text>
        </View>

        {/* 종합 평가 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>▎종합 평가</Text>
          <View style={styles.divider} />

          <View style={styles.overallBox}>
            <Text style={styles.overallLabel}>성취 수준:</Text>
            <View style={getLevelBadgeStyle(evaluation.overallLevel)}>
              <Text style={[styles.overallLevel, { color: getLevelColor(evaluation.overallLevel) }]}>
                {evaluation.overallLevel}
              </Text>
            </View>
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
          <Text style={styles.sectionTitle}>▎영역별 상세 평가</Text>
          <View style={styles.divider} />

          {assignment.evaluationDomains.map((domain, index) => {
            const domainEval = evaluation.domainEvaluations[domain];
            if (!domainEval) return null;

            return (
              <View key={domain} style={styles.domainSection}>
                <View style={styles.domainHeader}>
                  <Text style={styles.domainNumber}>{index + 1}.</Text>
                  <Text style={styles.domainTitle}>{domain}</Text>
                  <View style={getLevelBadgeStyle(domainEval.level)}>
                    <Text style={[styles.domainLevel, { color: getLevelColor(domainEval.level) }]}>
                      {domainEval.level}
                      {domainEval.score && ` (${domainEval.score}점)`}
                    </Text>
                  </View>
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
            <Text style={styles.sectionTitle}>▎강점</Text>
            <View style={styles.divider} />

            {evaluation.strengths.map((strength, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listBullet}>●</Text>
                <Text style={styles.listText}>{strength}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 개선 방안 */}
        {evaluation.improvementSuggestions && evaluation.improvementSuggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>▎개선 방안</Text>
            <View style={styles.divider} />

            {evaluation.improvementSuggestions.map((suggestion, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listBullet}>●</Text>
                <Text style={styles.listText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ● 글쓰기 평가 보고서는 학생의 글을 선생님이 정한 규칙에 따라 AI가 채점한 것입니다.{'\n'}
            ● 보고서에서 제시하는 강점과 개선 방안을 읽고 성장을 위해 노력해야 할 점을 생각해 봅시다.
          </Text>
        </View>

        {/* 푸터 */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            평가일: {formatDateKorean(evaluation.evaluatedAt)}
          </Text>
        </View>
    </Page>
  );
}

/**
 * 성취 수준에 따른 배지 배경 스타일 (View용)
 */
function getLevelBadgeStyle(level: string) {
  if (level.includes('매우 우수') || level.includes('매우우수')) {
    return {
      backgroundColor: '#f0f4e8',
      paddingHorizontal: 6,
      paddingVertical: 3,
    };
  }
  if (level.includes('우수')) {
    return {
      backgroundColor: '#f4f7ee',
      paddingHorizontal: 6,
      paddingVertical: 3,
    };
  }
  if (level.includes('보통')) {
    return {
      backgroundColor: '#f8fafc',
      paddingHorizontal: 6,
      paddingVertical: 3,
    };
  }
  if (level.includes('미흡')) {
    return {
      backgroundColor: '#f8fafc',
      paddingHorizontal: 6,
      paddingVertical: 3,
    };
  }
  return {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 6,
    paddingVertical: 3,
  };
}

/**
 * 성취 수준에 따른 텍스트 색상 (Text용)
 */
function getLevelColor(level: string) {
  if (level.includes('매우 우수') || level.includes('매우우수')) {
    return '#789542'; // primary-700
  }
  if (level.includes('우수')) {
    return '#91AF52'; // primary-600
  }
  if (level.includes('보통')) {
    return '#64748b'; // 보통은 중립 회색
  }
  if (level.includes('미흡')) {
    return '#94a3b8'; // 연한 회색
  }
  return '#64748b';
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKR',
    padding: 40,
    paddingBottom: 60, // 푸터 공간 확보 (footer bottom 40 + 여유 20)
    backgroundColor: '#FFFFFF',
    fontSize: 10, // base: 1rem equivalent in pt
    fontWeight: 400, // Regular weight for body
    color: '#1e293b',
    lineHeight: 1.6, // Design system line-height
  },

  // 헤더 - 편집 디자인: 작고 절제되게
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  logoStaged: {
    fontSize: 18, // 더 크게
    fontWeight: 700,
    color: '#91AF52',
    letterSpacing: 0.5,
  },
  logoPlus: {
    fontSize: 18,
    fontWeight: 700,
    color: '#F58742',
    marginLeft: 1,
  },
  mainTitle: {
    fontSize: 13, // 제목 크게
    fontWeight: 400, // Regular
    color: '#4A4B3D', // neutral-700
    letterSpacing: 0.3,
  },

  // 과제 정보
  assignmentInfo: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 8,
    marginRight: 6,
    fontWeight: 400,
    color: '#91AF52', // primary-600
  },
  assignmentText: {
    fontSize: 9.5, // Between xs and sm
    fontWeight: 400,
    color: '#64748b',
    lineHeight: 1.5,
  },

  // 섹션 - 편집 디자인: 타이포그래피 계층 명확하게
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 600, // Bold → Semibold (컬러 인쇄용)
    color: '#4A4B3D', // neutral-700
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  subsectionTitle: {
    fontSize: 9,
    fontWeight: 400, // Regular
    color: '#94a3b8',
    marginBottom: 6,
    marginTop: 10,
    letterSpacing: 0.5,
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
  },
  submissionText: {
    fontSize: 9,
    lineHeight: 1.6,
    fontWeight: 400,
    color: '#64748b',
    letterSpacing: -0.01,
  },

  // 종합 평가 - 배지 스타일로 세련되게
  overallBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'transparent', // 배경 제거
    marginBottom: 12,
  },
  overallLabel: {
    fontSize: 9,
    fontWeight: 400,
    color: '#94a3b8', // 더 연하게
    marginRight: 10,
    letterSpacing: 0.5,
  },
  overallLevel: {
    fontSize: 10, // 크기 줄임
    fontWeight: 400, // Bold 제거
    letterSpacing: 0,
  },
  feedbackBox: {
    backgroundColor: '#ffffff',
    padding: 10,
  },
  feedbackText: {
    fontSize: 9,
    lineHeight: 1.6,
    fontWeight: 400,
    color: '#64748b',
    letterSpacing: -0.01,
  },

  // 영역별 평가 - 편집 디자인: 미니멀하고 가독성 높게
  domainSection: {
    marginBottom: 12,
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  domainNumber: {
    fontSize: 8,
    fontWeight: 400,
    marginRight: 6,
    color: '#cbd5e1', // 매우 연하게
  },
  domainTitle: {
    fontSize: 9,
    fontWeight: 400, // Regular
    color: '#475569',
    flex: 1,
    letterSpacing: 0,
  },
  domainLevel: {
    fontSize: 8, // 작게
    fontWeight: 400, // Regular
    letterSpacing: 0,
  },
  domainFeedbackBox: {
    backgroundColor: '#f8fafc',
    padding: 8,
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
    fontWeight: 400, // Regular
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

  // Disclaimer
  disclaimer: {
    marginTop: 20,
    marginBottom: 40,
    padding: 12,
    backgroundColor: '#F7FAF3', // primary-50
  },
  disclaimerText: {
    fontSize: 8.5,
    fontWeight: 400,
    color: '#607835', // primary-800
    lineHeight: 1.6,
    letterSpacing: -0.01,
  },

  // 푸터
  footer: {
    position: 'absolute',
    bottom: 40, // 하단 여백 충분히 확보
    left: 40,
    right: 40,
    alignItems: 'center',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    fontWeight: 400,
    color: '#94a3b8',
    lineHeight: 1.5,
  },
});
