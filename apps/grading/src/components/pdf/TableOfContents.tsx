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
 */
function getLevelStyle(level: string) {
  if (level.includes('매우 우수') || level.includes('매우우수')) {
    return { color: '#10b981', fontWeight: 700 };
  }
  if (level.includes('우수')) {
    return { color: '#3b82f6', fontWeight: 700 };
  }
  if (level.includes('보통')) {
    return { color: '#f59e0b', fontWeight: 500 };
  }
  if (level.includes('미흡')) {
    return { color: '#ef4444', fontWeight: 500 };
  }
  return { color: '#64748b', fontWeight: 400 };
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKR',
    padding: 50,
    backgroundColor: '#FFFFFF',
    fontSize: 10,
  },

  // 헤더
  header: {
    marginBottom: 25,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1e293b',
  },
  pageInfo: {
    fontSize: 11,
    color: '#64748b',
  },

  // 테이블
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#cbd5e1',
    padding: 8,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 700,
    color: '#475569',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 8,
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    fontSize: 10,
    color: '#1e293b',
    textAlign: 'center',
  },

  // 컬럼 너비
  colNumber: {
    width: 50,
  },
  colName: {
    width: 150,
    textAlign: 'left',
    paddingLeft: 10,
  },
  colStudentId: {
    width: 100,
  },
  colLevel: {
    width: 120,
  },
  colPage: {
    width: 70,
  },

  // 하단
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 50,
    right: 50,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 10,
    color: '#94a3b8',
  },
});
