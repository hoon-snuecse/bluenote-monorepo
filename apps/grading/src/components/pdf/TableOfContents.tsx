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
 * Design system colors from tailwind.config.ts
 */
function getLevelStyle(level: string) {
  if (level.includes('매우 우수') || level.includes('매우우수')) {
    return { color: '#789542', fontWeight: 500 }; // primary-700, medium weight
  }
  if (level.includes('우수')) {
    return { color: '#91AF52', fontWeight: 500 }; // primary-600
  }
  if (level.includes('보통')) {
    return { color: '#F58742', fontWeight: 400 }; // secondary-600, regular weight
  }
  if (level.includes('미흡')) {
    return { color: '#94a3b8', fontWeight: 400 }; // Neutral gray
  }
  return { color: '#64748b', fontWeight: 400 };
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

  // 헤더
  header: {
    marginBottom: 20,
    borderBottomWidth: 1, // Thinner
    borderBottomColor: '#91AF52', // primary-600
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16, // Reduced from 20
    fontWeight: 700,
    color: '#1e293b',
    letterSpacing: -0.02,
  },
  pageInfo: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: 400,
    lineHeight: 1.5,
  },

  // 테이블
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#e2e8f0',
    padding: 6,
  },
  tableHeaderCell: {
    fontSize: 9, // xs
    fontWeight: 500, // Medium, not bold
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    padding: 6,
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    fontSize: 9, // xs
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
