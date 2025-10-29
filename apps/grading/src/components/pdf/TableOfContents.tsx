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
    marginBottom: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
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
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 400, // Regular로 절제
    color: '#94a3b8', // 더 연한 색상
    textAlign: 'center',
    lineHeight: 1.3,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3, // 줄간격 더 축소
    paddingHorizontal: 3,
  },
  tableRowEven: {
    backgroundColor: 'transparent',
  },
  tableCell: {
    fontSize: 8,
    color: '#64748b', // 더 부드러운 색상
    textAlign: 'center',
    fontWeight: 400,
    lineHeight: 1.3,
  },

  // 컬럼 너비 - 최적화하여 공간 절약
  colNumber: {
    width: 35,
  },
  colName: {
    width: 120,
    textAlign: 'left',
    paddingLeft: 6,
  },
  colStudentId: {
    width: 85,
  },
  colLevel: {
    width: 90,
  },
  colPage: {
    width: 50,
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
 * - React.createElement 패턴으로 서버사이드 렌더링 보장
 */
export function createTableOfContentsPages(students: TableOfContentsProps['students']) {
  // 한 페이지당 최대 학생 수
  const studentsPerPage = 30;
  const totalPages = Math.ceil(students.length / studentsPerPage);

  return Array.from({ length: totalPages }, (_, pageIndex) => {
    const startIndex = pageIndex * studentsPerPage;
    const endIndex = Math.min(startIndex + studentsPerPage, students.length);
    const pageStudents = students.slice(startIndex, endIndex);

    return React.createElement(
      Page,
      { key: `toc-${pageIndex}`, size: 'A4', style: styles.page },
      // 헤더
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.title }, '목차'),
        totalPages > 1 && React.createElement(
          Text,
          { style: styles.pageInfo },
          `${pageIndex + 1} / ${totalPages}`
        )
      ),
      // 테이블 헤더
      React.createElement(
        View,
        { style: styles.tableHeader },
        React.createElement(Text, { style: [styles.tableHeaderCell, styles.colNumber] }, '번호'),
        React.createElement(Text, { style: [styles.tableHeaderCell, styles.colName] }, '학생 이름'),
        React.createElement(Text, { style: [styles.tableHeaderCell, styles.colStudentId] }, '학번'),
        React.createElement(Text, { style: [styles.tableHeaderCell, styles.colLevel] }, '종합 평가'),
        React.createElement(Text, { style: [styles.tableHeaderCell, styles.colPage] }, '페이지')
      ),
      // 테이블 내용
      ...pageStudents.map((student, index) => {
        const globalIndex = startIndex + index + 1;
        const isEven = globalIndex % 2 === 0;

        return React.createElement(
          View,
          {
            key: student.studentId,
            style: [styles.tableRow, isEven && styles.tableRowEven]
          },
          React.createElement(
            Text,
            { style: [styles.tableCell, styles.colNumber] },
            globalIndex.toString()
          ),
          React.createElement(
            Text,
            { style: [styles.tableCell, styles.colName] },
            student.name
          ),
          React.createElement(
            Text,
            { style: [styles.tableCell, styles.colStudentId] },
            student.studentId
          ),
          React.createElement(
            Text,
            { style: [styles.tableCell, styles.colLevel] },
            React.createElement(
              Text,
              { style: getLevelStyle(student.overallLevel) },
              student.overallLevel
            )
          ),
          React.createElement(
            Text,
            { style: [styles.tableCell, styles.colPage] },
            student.pageNumber.toString()
          )
        );
      }),
      // 하단
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(
          Text,
          { style: styles.footerText },
          `총 ${students.length}명의 학생 평가 보고서`
        )
      )
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
