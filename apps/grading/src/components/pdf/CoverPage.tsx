import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatDateKorean } from '@/lib/pdf-font-setup';

interface CoverPageProps {
  assignment: {
    title: string;
    schoolName: string;
    gradeLevel: string;
    className?: string;
  };
  statistics: {
    totalStudents: number;
    evaluatedStudents: number;
    levelDistribution: Record<string, number>;
  };
  dateInfo: {
    submissionStart: Date;
    submissionEnd: Date;
    evaluationDate: Date;
    reportGeneratedDate: Date;
  };
  evaluationModel: string;
}

/**
 * 표지 페이지 컴포넌트 (시안 B: 통계 중심, 심플)
 * - 과제 정보
 * - 평가 통계
 * - 성취 수준 분포 (막대 그래프)
 * - 시행 정보
 */
export function CoverPage({
  assignment,
  statistics,
  dateInfo,
  evaluationModel,
}: CoverPageProps) {
  const completionRate = Math.round(
    (statistics.evaluatedStudents / statistics.totalStudents) * 100
  );

  return (
    <Page size="A4" style={styles.page}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoStaged}>STAGED</Text>
          <Text style={styles.logoPlus}>+</Text>
        </View>
        <Text style={styles.headerSubtitle}>글쓰기 평가 보고서</Text>
      </View>

      {/* 구분선 */}
      <View style={styles.dividerThick} />

      {/* 과제 정보 */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.icon}>■</Text>
          <View>
            <Text style={styles.label}>과제</Text>
            <Text style={styles.value}>{assignment.title}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.icon}>■</Text>
          <View>
            <Text style={styles.label}>학교</Text>
            <Text style={styles.value}>
              {assignment.schoolName} {assignment.gradeLevel}
              {assignment.className && ` ${assignment.className}`}
            </Text>
          </View>
        </View>
      </View>

      {/* 구분선 */}
      <View style={styles.dividerThick} />

      {/* 평가 통계 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>평가 통계</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>전체 학생</Text>
            <Text style={styles.statValue}>{statistics.totalStudents}명</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>평가 완료</Text>
            <Text style={[styles.statValue, styles.statValueGreen]}>
              {statistics.evaluatedStudents}명
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>완료율</Text>
            <Text style={[styles.statValue, styles.statValueBlue]}>
              {completionRate}%
            </Text>
          </View>
        </View>
      </View>

      {/* 성취 수준 분포 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>성취 수준 분포</Text>

        {Object.entries(statistics.levelDistribution).map(([level, count]) => {
          const percentage = statistics.evaluatedStudents > 0
            ? Math.round((count / statistics.evaluatedStudents) * 100)
            : 0;
          const barWidth = `${percentage}%`;

          return (
            <View key={level} style={styles.distributionRow}>
              <Text style={styles.levelLabel}>{level}</Text>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: barWidth }]} />
              </View>
              <Text style={styles.distributionValue}>
                {count}명 ({percentage}%)
              </Text>
            </View>
          );
        })}
      </View>

      {/* 시행 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>시행 정보</Text>

        <View style={styles.dateInfo}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>• 제출 기간:</Text>
            <Text style={styles.dateValue}>
              {formatDateKorean(dateInfo.submissionStart)} ~ {formatDateKorean(dateInfo.submissionEnd)}
            </Text>
          </View>

          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>• 평가 완료:</Text>
            <Text style={styles.dateValue}>
              {formatDateKorean(dateInfo.evaluationDate)}
            </Text>
          </View>

          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>• 평가 모델:</Text>
            <Text style={styles.dateValue}>{evaluationModel}</Text>
          </View>
        </View>
      </View>

      {/* 구분선 */}
      <View style={styles.dividerThick} />

      {/* 보고서 포함 내용 안내 */}
      <View style={styles.contentInfo}>
        <Text style={styles.contentInfoTitle}>이 보고서에는 다음 내용이 포함되어 있습니다:</Text>
        <Text style={styles.contentInfoItem}>• 과제 및 평가 정보</Text>
        <Text style={styles.contentInfoItem}>• 학생 목차</Text>
        <Text style={styles.contentInfoItem}>
          • 개별 학생 평가 보고서 ({statistics.evaluatedStudents}명)
        </Text>
      </View>

      {/* 하단 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          보고서 생성일: {formatDateKorean(dateInfo.reportGeneratedDate)}
        </Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKR',
    padding: 50,
    backgroundColor: '#FFFFFF',
    fontSize: 10, // base
    fontWeight: 400,
    color: '#1e293b',
    lineHeight: 1.6,
  },

  // 헤더 - 편집 디자인 원칙: 여백과 계층 구조
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline', // 베이스라인 정렬로 더 세련됨
    marginBottom: 12,
  },
  logoStaged: {
    fontSize: 36, // 표지는 임팩트 있게
    fontWeight: 700,
    color: '#91AF52', // primary-600
    letterSpacing: -0.5, // 타이트한 자간으로 모던함
  },
  logoPlus: {
    fontSize: 36,
    fontWeight: 700,
    color: '#F58742', // secondary-600
    marginLeft: 1,
  },
  headerSubtitle: {
    fontSize: 11, // 부제는 절제되게
    fontWeight: 400,
    color: '#94a3b8', // 더 연한 색으로 후퇴
    letterSpacing: 1.5, // 자간 넓혀서 우아함 표현
  },

  // 구분선 - 미니멀하게
  dividerThick: {
    height: 0.5,
    backgroundColor: '#cbd5e1', // 더 연하게
    marginVertical: 24,
  },

  // 섹션 - 편집 디자인: 타이포그래피 계층
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 10, // 작지만 명확하게
    fontWeight: 700,
    color: '#64748b', // 강조 줄이고
    marginBottom: 12,
    letterSpacing: 1.2, // 자간 넓혀서 고급스럽게
  },

  // 과제 정보
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  icon: {
    fontSize: 14, // Reduced from 18
    marginRight: 8,
    width: 20,
    fontWeight: 400,
  },
  label: {
    fontSize: 9, // xs
    color: '#94a3b8',
    marginBottom: 3,
    fontWeight: 400,
    lineHeight: 1.5,
  },
  value: {
    fontSize: 11, // sm
    color: '#1e293b',
    fontWeight: 400, // Regular, not medium
    lineHeight: 1.5,
    letterSpacing: -0.01,
  },

  // 통계 그리드 - 카드 디자인 세련되게
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statBox: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fafbfc',
    borderRadius: 2, // 미니멀한 모서리
    borderWidth: 0,
    borderBottomWidth: 2, // 하단 강조선으로 모던함
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8, // 더 작게
    color: '#94a3b8',
    marginBottom: 6,
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 24, // 숫자는 크고 임팩트 있게
    fontWeight: 300, // Light weight로 현대적으로
    color: '#1e293b',
    letterSpacing: -1,
  },
  statValueGreen: {
    color: '#91AF52', // primary-600
    fontWeight: 400, // 조금 더 굵게
  },
  statValueBlue: {
    color: '#F58742', // secondary-600
    fontWeight: 400,
  },

  // 성취 수준 분포 - 데이터 시각화 개선
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelLabel: {
    fontSize: 9,
    width: 70,
    color: '#64748b',
    fontWeight: 400,
    lineHeight: 1.4,
  },
  barContainer: {
    flex: 1,
    height: 16, // 더 가늘게 미니멀하게
    backgroundColor: '#f8fafc',
    borderRadius: 1,
    marginHorizontal: 10,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  bar: {
    height: '100%',
    backgroundColor: '#91AF52', // primary-600
  },
  distributionValue: {
    fontSize: 9,
    width: 80,
    textAlign: 'right',
    color: '#475569',
    fontWeight: 400, // Regular로 절제
    lineHeight: 1.4,
  },

  // 시행 정보
  dateInfo: {
    paddingLeft: 8,
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 9, // xs
    width: 85,
    color: '#94a3b8',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  dateValue: {
    fontSize: 9,
    color: '#475569',
    flex: 1,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: -0.01,
  },

  // 보고서 포함 내용
  contentInfo: {
    paddingLeft: 8,
  },
  contentInfoTitle: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: 400,
    lineHeight: 1.5,
  },
  contentInfoItem: {
    fontSize: 9, // xs
    color: '#94a3b8',
    marginBottom: 4,
    paddingLeft: 8,
    fontWeight: 400,
    lineHeight: 1.5,
  },

  // 하단
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 50,
    right: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9, // xs
    color: '#94a3b8',
    fontWeight: 400,
    lineHeight: 1.5,
  },
});
