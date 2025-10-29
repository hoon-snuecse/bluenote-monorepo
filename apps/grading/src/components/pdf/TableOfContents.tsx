import React from 'react';
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface TableOfContentsProps {
  students: Array<{
    name: string;
    studentId: string;
    overallLevel: string;
    pageNumber: number;
  }>;
}

/**
 * 성취 수준에 따른 스타일 반환
 * 디자인 시스템: 부드럽고 절제된 색상 사용
 */
function getLevelStyle(level: string) {
  if (level.includes('매우 우수') || level.includes('매우우수')) {
    return {
      color: '#78716C', // neutral-500 - 더 절제된 색상
      fontWeight: 400, // Regular
      fontSize: 8,
    };
  }
  if (level.includes('우수')) {
    return {
      color: '#78716C', // neutral-500 - 통일감
      fontWeight: 400,
      fontSize: 8,
    };
  }
  if (level.includes('보통')) {
    return {
      color: '#94a3b8', // 보통은 회색
      fontWeight: 400,
      fontSize: 8,
    };
  }
  if (level.includes('미흡')) {
    return {
      color: '#cbd5e1', // 연한 회색
      fontWeight: 400,
      fontSize: 8,
    };
  }
  return {
    color: '#94a3b8',
    fontWeight: 400,
    fontSize: 8,
  };
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKR',
    padding: 40,
    paddingTop: 35,
    backgroundColor: '#FFFFFF',
    fontSize: 10,
    fontWeight: 400,
    lineHeight: 1.6,
  },

  // 헤더 - 개인보고서 스타일 통일
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 11, // 개인보고서 sectionTitle과 동일
    fontWeight: 600, // Semibold
    color: '#4A4B3D', // neutral-700
    letterSpacing: 0.3,
  },
  pageInfo: {
    fontSize: 8,
    color: '#94a3b8',
    fontWeight: 400,
    lineHeight: 1.3,
    letterSpacing: 0.3,
  },

  // 테이블 - 편집 디자인: 가독성과 우아함
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e8ede5',
    paddingVertical: 7,
    paddingHorizontal: 3,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 8.5,
    fontWeight: 700, // Bold로 헤더 강조
    color: '#2d3e1f',
    textAlign: 'center',
    lineHeight: 1.3,
    letterSpacing: 0.2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 3,
    minHeight: 20,
  },
  tableRowEven: {
    backgroundColor: '#f5f7f3',
  },
  tableCell: {
    fontSize: 9.5,
    color: '#2c3e50',
    fontWeight: 400,
    lineHeight: 1.4,
  },
  tableCellName: {
    textAlign: 'left',
  },

  // 컬럼 너비 - View에 적용 (flexDirection: row에서 셀 역할)
  colNumber: {
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colName: {
    width: 140,
    justifyContent: 'center',
    paddingLeft: 6,
  },
  colStudentId: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colLevel: {
    width: 95,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 하단
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 50,
    right: 50,
    alignItems: 'center',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 9, // xs
    color: '#94a3b8',
    fontWeight: 400,
    lineHeight: 1.5,
  },
});

/**
 * 목차 페이지 생성 헬퍼 함수
 * - React-PDF Document에서 직접 사용할 수 있도록 페이지 배열 반환
 */
export function createTableOfContentsPages(students: TableOfContentsProps['students']) {
  // 한 페이지당 최대 학생 수
  const studentsPerPage = 30;
  const totalPages = Math.ceil(students.length / studentsPerPage);

  return Array.from({ length: totalPages }, (_, pageIndex) => {
    const startIndex = pageIndex * studentsPerPage;
    const endIndex = Math.min(startIndex + studentsPerPage, students.length);
    const pageStudents = students.slice(startIndex, endIndex);

    return (
      <Page key={`toc-${pageIndex}`} size="A4" style={styles.page}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>목차</Text>
          {totalPages > 1 && (
            <Text style={styles.pageInfo}>
              {pageIndex + 1} / {totalPages}
            </Text>
          )}
        </View>

        {/* 테이블 헤더 */}
        <View style={styles.tableHeader}>
          <View style={styles.colNumber}>
            <Text style={styles.tableHeaderCell}>번호</Text>
          </View>
          <View style={styles.colName}>
            <Text style={[styles.tableHeaderCell, styles.tableCellName]}>학생 이름</Text>
          </View>
          <View style={styles.colStudentId}>
            <Text style={styles.tableHeaderCell}>학번</Text>
          </View>
          <View style={styles.colLevel}>
            <Text style={styles.tableHeaderCell}>종합 평가</Text>
          </View>
        </View>

        {/* 학생 행들 */}
        {pageStudents.map((student, index) => {
          const globalIndex = startIndex + index + 1;
          const isEven = globalIndex % 2 === 0;

          return (
            <View
              key={student.studentId}
              style={[styles.tableRow, isEven && styles.tableRowEven]}
            >
              <View style={styles.colNumber}>
                <Text style={styles.tableCell}>{globalIndex}</Text>
              </View>
              <View style={styles.colName}>
                <Text style={[styles.tableCell, styles.tableCellName]}>{student.name}</Text>
              </View>
              <View style={styles.colStudentId}>
                <Text style={styles.tableCell}>{student.studentId}</Text>
              </View>
              <View style={styles.colLevel}>
                <Text style={[styles.tableCell, getLevelStyle(student.overallLevel)]}>
                  {student.overallLevel}
                </Text>
              </View>
            </View>
          );
        })}

        {/* 하단 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            총 {students.length}명의 학생 평가 보고서
          </Text>
        </View>
      </Page>
    );
  });
}

/**
 * 목차 페이지 컴포넌트 (하위 호환성 유지)
 * @deprecated createTableOfContentsPages를 사용하세요
 */
export function TableOfContents({ students }: TableOfContentsProps) {
  return <>{createTableOfContentsPages(students)}</>;
}
