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

  // 헤더
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoStaged: {
    fontSize: 28, // Reduced from 32
    fontWeight: 700,
    color: '#91AF52', // primary-600
    letterSpacing: 0.8,
  },
  logoPlus: {
    fontSize: 28,
    fontWeight: 700,
    color: '#F58742', // secondary-600
    marginLeft: 2,
  },
  headerSubtitle: {
    fontSize: 14, // xl equivalent
    fontWeight: 400, // Regular, not medium
    color: '#475569',
    letterSpacing: -0.02,
  },

  // 구분선
  dividerThick: {
    height: 1, // Thinner
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },

  // 섹션
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12, // lg equivalent
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 10,
    letterSpacing: -0.02,
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

  // 통계 그리드
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9, // xs
    color: '#94a3b8',
    marginBottom: 5,
    fontWeight: 400,
    lineHeight: 1.5,
  },
  statValue: {
    fontSize: 18, // Reduced from 20
    fontWeight: 700,
    color: '#1e293b',
    letterSpacing: -0.02,
  },
  statValueGreen: {
    color: '#91AF52', // primary-600
  },
  statValueBlue: {
    color: '#F58742', // secondary-600
  },

  // 성취 수준 분포
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelLabel: {
    fontSize: 10,
    width: 75,
    color: '#64748b',
    fontWeight: 400, // Regular, not medium
    lineHeight: 1.5,
  },
  barContainer: {
    flex: 1,
    height: 20, // Slightly reduced
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#91AF52', // primary-600
  },
  distributionValue: {
    fontSize: 9.5,
    width: 85,
    textAlign: 'right',
    color: '#1e293b',
    fontWeight: 500, // Medium, not bold
    lineHeight: 1.5,
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
