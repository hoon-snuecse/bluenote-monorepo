'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Link, 
  QrCode, 
  FileText,
  Upload,
  Copy,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import QRCode from 'react-qr-code';

export default function CollectPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.assignmentId;
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('link'); // link, google
  const [googleDocsUrl, setGoogleDocsUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  
  const submissionUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/grading/submit/${assignmentId}`;

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const response = await fetch('/api/grading/assignments');
      const data = await response.json();
      if (data.success) {
        const found = data.assignments.find(a => a.id === assignmentId);
        setAssignment(found);
      }
    } catch (error) {
      console.error('과제 정보 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(submissionUrl);
    alert('링크가 복사되었습니다!');
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${assignmentId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleImportFromGoogle = async () => {
    if (!googleDocsUrl) {
      alert('구글 문서 URL을 입력해주세요.');
      return;
    }

    setImporting(true);
    setImportResults(null);

    try {
      // 구글 문서 ID 추출
      const docIdMatch = googleDocsUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      if (!docIdMatch) {
        throw new Error('올바른 구글 문서 URL이 아닙니다.');
      }

      const docId = docIdMatch[1];
      
      // API 호출하여 문서 내용 가져오기
      const response = await fetch('/api/grading/import/google-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId,
          googleDocsUrl,
          docId
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setImportResults({
          success: true,
          count: result.count,
          students: result.students
        });
      } else {
        throw new Error(result.error || '가져오기 실패');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert(`가져오기 실패: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-slate-50 to-purple-50/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            뒤로 가기
          </button>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-2">학생 글 수집</h1>
          {assignment && (
            <p className="text-slate-600">{assignment.title}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'link'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Link className="w-5 h-5" />
                링크/QR 코드
              </div>
            </button>
            <button
              onClick={() => setActiveTab('google')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'google'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                구글 문서에서 가져오기
              </div>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'link' ? (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  제출 링크 공유
                </h3>
                
                {/* Link Section */}
                <div className="mb-8">
                  <p className="text-sm text-slate-600 mb-3">
                    아래 링크를 학생들에게 공유하면 직접 글을 제출할 수 있습니다.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={submissionUrl}
                      readOnly
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      복사
                    </button>
                  </div>
                </div>

                {/* QR Code Section */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">QR 코드</h4>
                  <p className="text-sm text-slate-600 mb-4">
                    학생들이 스마트폰으로 스캔하여 바로 접속할 수 있습니다.
                  </p>
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-4 border-2 border-slate-200 rounded-lg">
                      <QRCode
                        id="qr-code"
                        value={submissionUrl}
                        size={200}
                        level="H"
                      />
                    </div>
                    <button
                      onClick={handleDownloadQR}
                      className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      QR 코드 다운로드
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  구글 문서에서 가져오기
                </h3>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">사용 방법</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>구글 문서에 학생들의 글을 모아둡니다</li>
                        <li>각 학생의 글은 "이름: 홍길동" 형식으로 시작해야 합니다</li>
                        <li>문서를 "링크가 있는 모든 사용자" 공유로 설정합니다</li>
                        <li>문서 URL을 아래에 입력합니다</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      구글 문서 URL
                    </label>
                    <input
                      type="url"
                      value={googleDocsUrl}
                      onChange={(e) => setGoogleDocsUrl(e.target.value)}
                      placeholder="https://docs.google.com/document/d/..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleImportFromGoogle}
                    disabled={importing || !googleDocsUrl}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        가져오는 중...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        구글 문서에서 가져오기
                      </>
                    )}
                  </button>
                </div>

                {/* Import Results */}
                {importResults && (
                  <div className="mt-6">
                    {importResults.success ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-800">
                              {importResults.count}명의 학생 글을 성공적으로 가져왔습니다!
                            </p>
                            <ul className="mt-2 text-sm text-green-700">
                              {importResults.students?.map((student, idx) => (
                                <li key={idx}>• {student}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">가져오기에 실패했습니다.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* View Submissions Button */}
        <div className="text-center">
          <button
            onClick={() => router.push(`/grading/assignments/${assignmentId}/submissions`)}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            제출 현황 보기
          </button>
        </div>
      </div>
    </div>
  );
}