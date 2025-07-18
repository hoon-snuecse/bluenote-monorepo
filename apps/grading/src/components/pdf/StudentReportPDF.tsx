import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'

// 한글 폰트 등록
Font.register({
  family: 'NotoSansKR',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/noto-sans-kr@0.1.1/fonts/NotoSansKR-Regular.otf',
      fontWeight: 400,
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/noto-sans-kr@0.1.1/fonts/NotoSansKR-Bold.otf',
      fontWeight: 700,
    },
  ],
})

// 스타일 정의
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    fontFamily: 'NotoSansKR',
    padding: 40,
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 10,
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 15,
    color: '#1e293b',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#475569',
    width: 100,
  },
  infoValue: {
    fontSize: 12,
    color: '#1e293b',
    flex: 1,
  },
  scoreCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scoreItem: {
    flex: 1,
    marginRight: 10,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#3b82f6',
  },
  domainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  domainCard: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  domainTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
    color: '#1e293b',
  },
  domainScore: {
    fontSize: 16,
    fontWeight: 700,
    color: '#3b82f6',
    marginBottom: 5,
  },
  achievementLevel: {
    fontSize: 11,
    color: '#10b981',
    marginBottom: 10,
  },
  feedback: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 1.6,
  },
  rubricTable: {
    marginTop: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    padding: 8,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 700,
    color: '#475569',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
  },
  tableCell: {
    fontSize: 10,
    color: '#1e293b',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 10,
    color: '#94a3b8',
  },
})

interface StudentReportPDFProps {
  evaluation: any
  assignment: any
  student: any
}

export function StudentReportPDF({ evaluation, assignment, student }: StudentReportPDFProps) {
  const domains = [
    { key: 'clarity', label: '주장의 명확성' },
    { key: 'validity', label: '근거의 타당성' },
    { key: 'structure', label: '논리적 구조' },
    { key: 'expression', label: '설득력 있는 표현' },
  ]

  const getAchievementLevel = (score: number) => {
    if (score >= 90) return '매우 우수'
    if (score >= 80) return '우수'
    if (score >= 70) return '보통'
    if (score >= 60) return '미흡'
    return '매우 미흡'
  }

  const getAchievementColor = (score: number) => {
    if (score >= 90) return '#22c55e'
    if (score >= 80) return '#3b82f6'
    if (score >= 70) return '#eab308'
    if (score >= 60) return '#f97316'
    return '#ef4444'
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>학생 평가 보고서</Text>
          <Text style={styles.subtitle}>
            {assignment.title} - {student.name} 학생
          </Text>
        </View>

        {/* 기본 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기본 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>학생 이름</Text>
            <Text style={styles.infoValue}>{student.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>학생 번호</Text>
            <Text style={styles.infoValue}>{student.studentId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>과제명</Text>
            <Text style={styles.infoValue}>{assignment.title}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>평가일</Text>
            <Text style={styles.infoValue}>
              {new Date(evaluation.evaluatedAt).toLocaleDateString('ko-KR')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>평가 차수</Text>
            <Text style={styles.infoValue}>{evaluation.round}차</Text>
          </View>
        </View>

        {/* 총점 및 평균 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>평가 결과 요약</Text>
          <View style={styles.scoreCard}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>평균 점수</Text>
              <Text style={styles.scoreValue}>{evaluation.averageScore}점</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>종합 성취도</Text>
              <Text style={[styles.scoreValue, { color: getAchievementColor(evaluation.averageScore) }]}>
                {getAchievementLevel(evaluation.averageScore)}
              </Text>
            </View>
          </View>
        </View>

        {/* 영역별 상세 평가 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>영역별 상세 평가</Text>
          <View style={styles.domainGrid}>
            {domains.map((domain) => {
              const score = evaluation.scores?.[domain.key] || 0
              const domainEval = evaluation.domainEvaluations?.[domain.key] || {}
              
              return (
                <View key={domain.key} style={styles.domainCard}>
                  <Text style={styles.domainTitle}>{domain.label}</Text>
                  <Text style={styles.domainScore}>{score}점</Text>
                  <Text style={[styles.achievementLevel, { color: getAchievementColor(score) }]}>
                    {getAchievementLevel(score)}
                  </Text>
                  <Text style={styles.feedback}>
                    {domainEval.feedback || '평가 피드백이 없습니다.'}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* 루브릭 기준 */}
        {assignment.rubric && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>평가 기준 (루브릭)</Text>
            <View style={styles.rubricTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>평가 영역</Text>
                <Text style={styles.tableHeaderText}>배점</Text>
                <Text style={styles.tableHeaderText}>획득 점수</Text>
              </View>
              {domains.map((domain) => (
                <View key={domain.key} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{domain.label}</Text>
                  <Text style={styles.tableCell}>25점</Text>
                  <Text style={styles.tableCell}>{evaluation.scores?.[domain.key] || 0}점</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 종합 피드백 */}
        {evaluation.overallFeedback && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>종합 피드백</Text>
            <Text style={styles.feedback}>{evaluation.overallFeedback}</Text>
          </View>
        )}

        {/* 푸터 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            생성일: {new Date().toLocaleDateString('ko-KR')}
          </Text>
          <Text style={styles.footerText}>
            BlueNote AI 평가 시스템
          </Text>
        </View>
      </Page>
    </Document>
  )
}