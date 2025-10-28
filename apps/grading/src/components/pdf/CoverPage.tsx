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
      {/* 헤더 - 개인보고서 스타일 적용 */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoStaged}>STAGED</Text>
          <Text style={styles.logoPlus}>+</Text>
        </View>
        <Text style={styles.mainTitle}>글쓰기 평가 보고서</Text>
      </View>

      {/* 구분선 */}
      <View style={styles.dividerThick} />

      {/* 과제 정보 */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.icon}>●</Text>
          <View>
            <Text style={styles.label}>과제</Text>
            <Text style={styles.value}>{assignment.title}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.icon}>●</Text>
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
        </View>
      </View>

      {/* 구분선 */}
      <View style={styles.dividerThick} />

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ● 글쓰기 평가 보고서는 학생의 글을 선생님이 정한 규칙에 따라 AI가 채점한 것입니다.{'\n'}
          ● 보고서에서 제시하는 강점과 개선 방안을 읽고 성장을 위해 노력해야 할 점을 생각해 봅시다.
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

  // 헤더 - 개인보고서 스타일 적용
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  logoStaged: {
    fontSize: 18, // 개인보고서와 동일
    fontWeight: 700,
    color: '#91AF52', // primary-600
    letterSpacing: 0.5,
  },
  logoPlus: {
    fontSize: 18, // 개인보고서와 동일
    fontWeight: 700,
    color: '#F58742', // secondary-600
    marginLeft: 3, // 간격 조정
  },
  mainTitle: {
    fontSize: 13, // 개인보고서와 동일
    fontWeight: 400, // Regular
    color: '#4A4B3D', // neutral-700
    letterSpacing: 0.3,
  },

  // 구분선 - 미니멀하게
  dividerThick: {
    height: 0.5,
    backgroundColor: '#cbd5e1', // 더 연하게
    marginVertical: 24,
  },

  // 섹션 - 개인보고서 스타일 적용
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11, // 개인보고서와 동일
    fontWeight: 600, // Semibold
    color: '#4A4B3D', // neutral-700
    marginBottom: 10,
    letterSpacing: 0.3,
  },

  // 과제 정보
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  icon: {
    fontSize: 10,
    marginRight: 8,
    width: 15,
    fontWeight: 400,
    color: '#91AF52', // primary-600
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
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: '#F7FAF3', // primary-50으로 통일감
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8,
    color: '#78716C', // neutral-500
    marginBottom: 6,
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22, // 약간 줄임
    fontWeight: 400, // Regular로 깔끔하게
    color: '#1e293b',
    letterSpacing: -0.5,
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
    marginHorizontal: 10,
    overflow: 'hidden',
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

  // Disclaimer - 개인보고서 스타일 적용
  disclaimer: {
    marginTop: 16,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#F7FAF3', // primary-50
  },
  disclaimerText: {
    fontSize: 9,
    lineHeight: 1.6,
    fontWeight: 400,
    color: '#607835', // primary-800
    letterSpacing: -0.01,
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
