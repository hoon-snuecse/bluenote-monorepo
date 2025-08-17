// Removed next-auth import
import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client';

export async function POST(request) {
  try {
    // Check authentication
    const supabase = createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const session = user ? { user } : null;
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!session.user.isAdmin) {
      return Response.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { content, metadata, category, subcategory } = await request.json();

    if (!content || !metadata) {
      return Response.json({ error: '콘텐츠와 메타데이터가 필요합니다.' }, { status: 400 });
    }

    // GitHub API 설정 (환경변수 필요)
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER || 'hoon-snuecse';
    const GITHUB_REPO = process.env.GITHUB_REPO || 'my-claude-app';

    if (!GITHUB_TOKEN) {
      return Response.json({ 
        error: 'GitHub 토큰이 설정되지 않았습니다. Vercel 환경변수에 GITHUB_TOKEN을 추가해주세요.' 
      }, { status: 500 });
    }

    // 파일명 생성
    const date = new Date().toISOString().split('T')[0];
    const title = metadata.title.replace(/[^a-zA-Z0-9가-힣]/g, '-').substring(0, 50);
    const filename = `${date}-${title}.md`;
    const filePath = `posts/${filename}`;

    // 마크다운 콘텐츠 생성
    const markdownContent = `---
title: "${metadata.title}"
date: "${new Date().toISOString()}"
category: "${category}"
subcategory: "${subcategory || ''}"
tags: [${metadata.tags.map(tag => `"${tag}"`).join(', ')}]
readingTime: "${metadata.readingTime}"
difficulty: "${metadata.difficulty}"
summary: "${metadata.summary}"
---

${content}
`;

    // Base64 인코딩
    const encodedContent = Buffer.from(markdownContent, 'utf-8').toString('base64');

    // GitHub API로 파일 생성
    const githubResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'my-claude-app'
        },
        body: JSON.stringify({
          message: `📝 Add new post: ${metadata.title}`,
          content: encodedContent,
          branch: 'main'
        })
      }
    );

    if (!githubResponse.ok) {
      const errorData = await githubResponse.json();
      throw new Error(`GitHub API 오류: ${errorData.message}`);
    }

    const githubData = await githubResponse.json();

    // posts-list.json 업데이트도 GitHub API로
    await updatePostsListOnGitHub(filename, metadata, category, subcategory, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO);

    return Response.json({ 
      success: true, 
      filename,
      path: `/posts/${filename}`,
      githubUrl: githubData.content.html_url,
      message: '콘텐츠가 GitHub에 성공적으로 저장되었습니다!'
    });

  } catch (error) {
    console.error('콘텐츠 저장 오류:', error);
    return Response.json({ 
      error: `저장 중 오류가 발생했습니다: ${error.message}` 
    }, { status: 500 });
  }
}

// GitHub API로 posts-list.json 업데이트
async function updatePostsListOnGitHub(filename, metadata, category, subcategory, token, owner, repo) {
  try {
    // 기존 posts-list.json 가져오기
    let existingList = [];
    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/posts/posts-list.json`,
        {
          headers: {
            'Authorization': `token ${token}`,
            'User-Agent': 'my-claude-app'
          }
        }
      );
      
      if (getResponse.ok) {
        const existingData = await getResponse.json();
        const decodedContent = Buffer.from(existingData.content, 'base64').toString('utf-8');
        existingList = JSON.parse(decodedContent);
      }
    } catch (error) {
      // 파일이 없으면 빈 배열로 시작
    }

    // 새 포스트 추가
    const newPost = {
      id: filename.replace('.md', ''),
      filename,
      title: metadata.title,
      summary: metadata.summary,
      category,
      subcategory,
      tags: metadata.tags,
      readingTime: metadata.readingTime,
      difficulty: metadata.difficulty,
      createdAt: new Date().toISOString(),
      slug: filename.replace('.md', '')
    };

    existingList.unshift(newPost);

    // GitHub에 업데이트
    const updatedContent = Buffer.from(JSON.stringify(existingList, null, 2), 'utf-8').toString('base64');
    
    // 기존 파일의 SHA 가져오기 (파일이 이미 존재하는 경우)
    let sha = null;
    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/posts/posts-list.json`,
        {
          headers: {
            'Authorization': `token ${token}`,
            'User-Agent': 'my-claude-app'
          }
        }
      );
      if (getResponse.ok) {
        const existingFileData = await getResponse.json();
        sha = existingFileData.sha;
      }
    } catch (error) {
      // 파일이 없으면 SHA 없이 생성
    }
    
    const updateBody = {
      message: `📋 Update posts list: Add ${metadata.title}`,
      content: updatedContent,
      branch: 'main'
    };
    
    if (sha) {
      updateBody.sha = sha;
    }
    
    await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/posts/posts-list.json`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'my-claude-app'
        },
        body: JSON.stringify(updateBody)
      }
    );

  } catch (error) {
    console.error('Posts list 업데이트 오류:', error);
  }
}

// GET 요청: 저장된 게시글 목록 조회 (GitHub에서)
export async function GET() {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER || 'hoon-snuecse';
    const GITHUB_REPO = process.env.GITHUB_REPO || 'my-claude-app';

    if (!GITHUB_TOKEN) {
      return Response.json({ posts: [], error: 'GitHub 토큰이 설정되지 않았습니다.' });
    }

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/posts/posts-list.json`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'User-Agent': 'my-claude-app'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const decodedContent = Buffer.from(data.content, 'base64').toString('utf-8');
      const postsList = JSON.parse(decodedContent);
      return Response.json({ posts: postsList });
    } else {
      return Response.json({ posts: [] });
    }
  } catch (error) {
    return Response.json({ posts: [], error: error.message });
  }
}