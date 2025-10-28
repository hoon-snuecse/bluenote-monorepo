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
        <View style={styles.headerBox}>
          <Text style={styles.systemName}>BlueNote AI 평가 시스템</Text>
          <Text style={styles.headerSubtitle}>평가 보고서</Text>
        </View>
      </View>

      {/* 구분선 */}
      <View style={styles.dividerThick} />

      {/* 과제 정보 */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.icon}>📋</Text>
          <View>
            <Text style={styles.label}>과제</Text>
            <Text style={styles.value}>{assignment.title}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.icon}>🏫</Text>
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
        <Text style={styles.sectionTitle}>📊 평가 통계</Text>

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
        <Text style={styles.sectionTitle}>📈 성취 수준 분포</Text>

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
        <Text style={styles.sectionTitle}>📅 시행 정보</Text>

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
        <Text style={styles.contentInfoItem}>✓ 과제 및 평가 정보</Text>
        <Text style={styles.contentInfoItem}>✓ 학생 목차</Text>
        <Text style={styles.contentInfoItem}>
          ✓ 개별 학생 평가 보고서 ({statistics.evaluatedStudents}명)
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
    fontSize: 11,
  },

  // 헤더
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  headerBox: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  systemName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#3b82f6',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1e293b',
  },

  // 구분선
  dividerThick: {
    height: 2,
    backgroundColor: '#e2e8f0',
    marginVertical: 20,
  },

  // 섹션
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 12,
  },

  // 과제 정보
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
    width: 25,
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 3,
  },
  value: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: 500,
  },

  // 통계 그리드
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  statBox: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1e293b',
  },
  statValueGreen: {
    color: '#10b981',
  },
  statValueBlue: {
    color: '#3b82f6',
  },

  // 성취 수준 분포
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelLabel: {
    fontSize: 11,
    width: 80,
    color: '#475569',
    fontWeight: 500,
  },
  barContainer: {
    flex: 1,
    height: 22,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  distributionValue: {
    fontSize: 10,
    width: 90,
    textAlign: 'right',
    color: '#1e293b',
    fontWeight: 700,
  },

  // 시행 정보
  dateInfo: {
    paddingLeft: 10,
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 10,
    width: 90,
    color: '#64748b',
  },
  dateValue: {
    fontSize: 10,
    color: '#1e293b',
    flex: 1,
  },

  // 보고서 포함 내용
  contentInfo: {
    paddingLeft: 10,
  },
  contentInfoTitle: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 10,
  },
  contentInfoItem: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 5,
    paddingLeft: 10,
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
    fontSize: 10,
    color: '#94a3b8',
  },
});
