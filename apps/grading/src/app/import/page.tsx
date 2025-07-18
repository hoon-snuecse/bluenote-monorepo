'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bluenote/ui';
import { useSearchParams } from 'next/navigation';
import { FolderOpen, FileText, CheckCircle, ChevronRight, HardDrive, Users, Share2, Square, CheckSquare } from 'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  shared?: boolean;
  owners?: Array<{ displayName: string; emailAddress: string }>;
  isRoot?: boolean;
  driveType?: string;
  isFolder?: boolean;
}

function ImportPageContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<DriveFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<DriveFile[]>([]);
  const [navigationPath, setNavigationPath] = useState<DriveFile[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    console.log('Import page - assignmentId:', assignmentId);

    if (success === 'true') {
      setIsAuthenticated(true);
      loadDriveFolders();
    } else if (error) {
      console.error('Authentication error:', error);
    } else {
      // Check if already authenticated
      checkAuthStatus();
    }
  }, [searchParams, assignmentId]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/drive/folders');
      if (response.ok) {
        setIsAuthenticated(true);
        const data = await response.json();
        setFiles(data.files);
      } else {
        console.log('Not authenticated or error:', response.status);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleGoogleAuth = () => {
    const authUrl = assignmentId 
      ? `/api/auth/google?assignmentId=${assignmentId}`
      : '/api/auth/google';
    window.location.href = authUrl;
  };

  const loadDriveFolders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/drive/folders');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      } else {
        try {
          const errorData = await response.json();
          console.error('Failed to load folders:', response.status, errorData);
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        if (response.status === 401) {
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
    setLoading(false);
  };

  const loadFolderDocuments = async (folderId: string, driveType?: string) => {
    setLoading(true);
    try {
      const url = new URL('/api/drive/documents', window.location.origin);
      url.searchParams.append('folderId', folderId);
      if (driveType) {
        url.searchParams.append('driveType', driveType);
      }
      
      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.files);
      } else {
        try {
          const errorData = await response.json();
          console.error('Failed to load documents:', response.status, errorData);
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
    setLoading(false);
  };

  const handleFolderSelect = (folder: DriveFile) => {
    if (folder.isRoot) {
      setNavigationPath([folder]);
    } else {
      setNavigationPath([...navigationPath, folder]);
    }
    setSelectedFolder(folder);
    setSelectedDocuments(new Set()); // Clear selections when navigating
    loadFolderDocuments(folder.id, folder.driveType);
  };

  const handleNavigate = (index: number) => {
    const newPath = navigationPath.slice(0, index + 1);
    const folder = newPath[newPath.length - 1];
    setNavigationPath(newPath);
    setSelectedFolder(folder);
    setSelectedDocuments(new Set()); // Clear selections when navigating
    loadFolderDocuments(folder.id, folder.driveType);
  };

  const toggleDocumentSelection = (docId: string) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(docId)) {
      newSelection.delete(docId);
    } else {
      newSelection.add(docId);
    }
    setSelectedDocuments(newSelection);
  };

  const toggleSelectAll = () => {
    const allDocs = documents.filter(d => !d.isFolder);
    if (selectedDocuments.size === allDocs.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(allDocs.map(d => d.id)));
    }
  };

  const handleImportDocuments = async () => {
    if (!selectedFolder || selectedDocuments.size === 0) return;

    console.log('Importing with assignmentId:', assignmentId);
    
    setLoading(true);
    try {
      const response = await fetch('/api/import/google-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderId: selectedFolder.id,
          documentIds: Array.from(selectedDocuments),
          assignmentId: assignmentId, // 과제 ID 추가
        }),
      });

      const data = await response.json();
      console.log('Import response:', data);

      if (response.ok) {
        // assignmentId가 있으면 해당 과제의 제출 현황으로, 없으면 대시보드로
        if (assignmentId) {
          console.log('Redirecting to submissions:', `/assignments/${assignmentId}/submissions`);
          window.location.href = `/assignments/${assignmentId}/submissions`;
        } else {
          console.log('No assignmentId, redirecting to dashboard');
          window.location.href = '/dashboard';
        }
      }
    } catch (error) {
      console.error('Failed to import documents:', error);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Google 드라이브에서 문서 가져오기</h1>

      {!isAuthenticated ? (
        <Card>
          <CardHeader>
            <CardTitle>Google 계정 연결</CardTitle>
            <CardDescription>
              Google 드라이브의 문서를 가져오려면 먼저 Google 계정을 연결해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={handleGoogleAuth}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Google 계정으로 로그인
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>폴더 선택</CardTitle>
              <CardDescription>
                문서를 가져올 Google 드라이브 폴더를 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              {navigationPath.length > 0 && (
                <div className="mb-4 flex items-center text-sm text-gray-600">
                  <button
                    onClick={() => {
                      setNavigationPath([]);
                      setSelectedFolder(null);
                      setDocuments([]);
                    }}
                    className="hover:text-blue-600"
                  >
                    홈
                  </button>
                  {navigationPath.map((folder, index) => (
                    <div key={folder.id} className="flex items-center">
                      <ChevronRight className="w-4 h-4 mx-1" />
                      <button
                        onClick={() => handleNavigate(index)}
                        className="hover:text-blue-600"
                      >
                        {folder.name}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {loading && !selectedFolder ? (
                <p className="text-gray-500">폴더를 불러오는 중...</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {files.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handleFolderSelect(file)}
                      className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                        selectedFolder?.id === file.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {file.driveType === 'my-drive' ? (
                        <HardDrive className="w-5 h-5 text-gray-600" />
                      ) : file.driveType === 'shared-drive' ? (
                        <Users className="w-5 h-5 text-green-600" />
                      ) : file.driveType === 'shared-with-me' ? (
                        <Share2 className="w-5 h-5 text-blue-600" />
                      ) : (
                        <FolderOpen className="w-5 h-5 text-gray-600" />
                      )}
                      <span className="flex-1">{file.name}</span>
                      {selectedFolder?.id === file.id && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {selectedFolder ? `"${selectedFolder.name}"의 내용` : '문서 목록'}
              </CardTitle>
              <CardDescription>
                {selectedFolder
                  ? `폴더 ${documents.filter(d => d.isFolder).length}개, 문서 ${documents.filter(d => !d.isFolder).length}개 (선택: ${selectedDocuments.size}개)`
                  : '드라이브를 선택하면 내용이 표시됩니다'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedFolder && (
                <>
                  {loading ? (
                    <p className="text-gray-500">문서를 불러오는 중...</p>
                  ) : (
                    <>
                      {documents.filter(d => !d.isFolder).length > 0 && (
                        <div className="mb-3 pb-3 border-b border-gray-200">
                          <button
                            onClick={toggleSelectAll}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                          >
                            {selectedDocuments.size === documents.filter(d => !d.isFolder).length ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                            모든 문서 선택
                          </button>
                        </div>
                      )}
                      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className={`p-3 rounded-lg border ${
                              doc.isFolder
                                ? 'border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100'
                                : selectedDocuments.has(doc.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            } flex items-center gap-3 ${!doc.isFolder && 'cursor-pointer'}`}
                            onClick={() => doc.isFolder ? handleFolderSelect(doc) : toggleDocumentSelection(doc.id)}
                          >
                            {doc.isFolder ? (
                              <FolderOpen className="w-5 h-5 text-gray-600" />
                            ) : (
                              <div className="flex items-center gap-3">
                                {selectedDocuments.has(doc.id) ? (
                                  <CheckSquare className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <Square className="w-5 h-5 text-gray-400" />
                                )}
                                <FileText className="w-5 h-5 text-gray-600" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-gray-500">
                                {doc.isFolder ? '폴더' : '문서'} • 수정일: {new Date(doc.modifiedTime).toLocaleDateString('ko-KR')}
                              </p>
                              {doc.owners && doc.owners[0] && doc.driveType === 'shared-with-me' && (
                                <p className="text-xs text-gray-500">
                                  소유자: {doc.owners[0].displayName || doc.owners[0].emailAddress}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedDocuments.size > 0 && (
                        <button
                          onClick={handleImportDocuments}
                          disabled={loading}
                          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? '가져오는 중...' : `선택한 ${selectedDocuments.size}개 문서 가져오기`}
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function ImportPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    }>
      <ImportPageContent />
    </Suspense>
  );
}