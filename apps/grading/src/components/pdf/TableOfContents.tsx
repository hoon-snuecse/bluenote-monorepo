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
 * 목차 페이지 컴포넌트
 * - 학생 목록 및 페이지 번호
 * - 25명 이상일 경우 자동으로 다중 페이지 생성
 */
export function TableOfContents({ students }: TableOfContentsProps) {
  // 한 페이지당 최대 학생 수
  const studentsPerPage = 30;
  const totalPages = Math.ceil(students.length / studentsPerPage);

  const pages = Array.from({ length: totalPages }, (_, pageIndex) => {
    const startIndex = pageIndex * studentsPerPage;
    const endIndex = Math.min(startIndex + studentsPerPage, students.length);
    const pageStudents = students.slice(startIndex, endIndex);

    return (
      <Page key={pageIndex} size="A4" style={styles.page}>
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
          <Text style={[styles.tableHeaderCell, styles.colNumber]}>번호</Text>
          <Text style={[styles.tableHeaderCell, styles.colName]}>학생 이름</Text>
          <Text style={[styles.tableHeaderCell, styles.colStudentId]}>학번</Text>
          <Text style={[styles.tableHeaderCell, styles.colLevel]}>종합 평가</Text>
          <Text style={[styles.tableHeaderCell, styles.colPage]}>페이지</Text>
        </View>

        {/* 테이블 내용 */}
        {pageStudents.map((student, index) => {
          const globalIndex = startIndex + index + 1;
          const isEven = globalIndex % 2 === 0;

          return (
            <View
              key={student.studentId}
              style={[styles.tableRow, isEven && styles.tableRowEven]}
            >
              <Text style={[styles.tableCell, styles.colNumber]}>
                {globalIndex}
              </Text>
              <Text style={[styles.tableCell, styles.colName]}>
                {student.name}
              </Text>
              <Text style={[styles.tableCell, styles.colStudentId]}>
                {student.studentId}
              </Text>
              <Text style={[styles.tableCell, styles.colLevel]}>
                <Text style={getLevelStyle(student.overallLevel)}>
                  {student.overallLevel}
                </Text>
              </Text>
              <Text style={[styles.tableCell, styles.colPage]}>
                {student.pageNumber}
              </Text>
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

  return <>{pages}</>;
}


/**
 * 성취 수준에 따른 스타일 반환
 * 편집 디자인: 배지처럼 작고 절제된 표현
 */
function getLevelStyle(level: string) {
  if (level.includes('매우 우수') || level.includes('매우우수')) {
    return {
      color: '#789542',
      fontWeight: 400, // Regular로 절제
      fontSize: 8, // 더 작게
    };
  }
  if (level.includes('우수')) {
    return {
      color: '#91AF52',
      fontWeight: 400,
      fontSize: 8,
    };
  }
  if (level.includes('보통')) {
    return {
      color: '#94a3b8', // 보통은 회색으로 절제
      fontWeight: 400,
      fontSize: 8,
    };
  }
  if (level.includes('미흡')) {
    return {
      color: '#cbd5e1', // 더 연한 회색
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
    padding: 50,
    backgroundColor: '#FFFFFF',
    fontSize: 10,
    fontWeight: 400,
    lineHeight: 1.6,
  },

  // 헤더 - 편집 디자인: 미니멀하고 세련되게
  header: {
    marginBottom: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1', // 더 연하게
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline', // 베이스라인 정렬
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  pageInfo: {
    fontSize: 8,
    color: '#94a3b8',
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: 0.5,
  },

  // 테이블 - 편집 디자인: 가독성과 우아함
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'transparent', // 배경 제거로 깔끔하게
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 500,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 1.4,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.25, // 매우 얇게
    borderBottomColor: '#f1f5f9',
    paddingVertical: 7,
    paddingHorizontal: 4,
  },
  tableRowEven: {
    backgroundColor: 'transparent', // 줄무늬 제거, 더 깔끔
  },
  tableCell: {
    fontSize: 9,
    color: '#475569',
    textAlign: 'center',
    fontWeight: 400,
    lineHeight: 1.5,
  },

  // 컬럼 너비
  colNumber: {
    width: 45,
  },
  colName: {
    width: 145,
    textAlign: 'left',
    paddingLeft: 8,
  },
  colStudentId: {
    width: 95,
  },
  colLevel: {
    width: 115,
  },
  colPage: {
    width: 65,
  },

  // 하단
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 50,
    right: 50,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 9, // xs
    color: '#94a3b8',
    fontWeight: 400,
    lineHeight: 1.5,
  },
});
