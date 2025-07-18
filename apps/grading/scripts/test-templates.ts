#!/usr/bin/env node
import fetch from 'node-fetch'

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3002'

async function testTemplates() {
  console.log('🧪 Testing Template Management API...\n')

  try {
    // 1. Create a template
    console.log('1️⃣ Creating a new template...')
    const createResponse = await fetch(`${baseUrl}/api/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '고등학교 논설문 평가 템플릿',
        description: '고등학교 1-3학년 논설문 평가를 위한 표준 템플릿',
        writingType: '논설문',
        gradeLevel: '고1',
        evaluationDomains: ['주장의 명확성', '근거의 타당성', '논리적 구조', '설득력 있는 표현'],
        evaluationLevels: ['매우 우수', '우수', '보통', '미흡'],
        levelCount: 4,
        gradingCriteria: '논설문 평가 기준: 주장과 근거의 논리적 연결, 설득력 있는 표현',
        isPublic: true
      })
    })

    if (createResponse.ok) {
      const { template } = await createResponse.json()
      console.log('✅ Template created:', template.id)
      console.log('   Name:', template.name)
      console.log('   Public:', template.isPublic)

      // 2. Get all templates
      console.log('\n2️⃣ Fetching all templates...')
      const listResponse = await fetch(`${baseUrl}/api/templates`)
      
      if (listResponse.ok) {
        const { templates } = await listResponse.json()
        console.log('✅ Found', templates.length, 'templates')
        
        if (templates.length > 0) {
          console.log('   First template:', templates[0].name)
        }
      } else {
        console.log('❌ Failed to fetch templates:', listResponse.status)
      }

      // 3. Get specific template
      console.log('\n3️⃣ Fetching specific template...')
      const getResponse = await fetch(`${baseUrl}/api/templates/${template.id}`)
      
      if (getResponse.ok) {
        const { template: fetchedTemplate } = await getResponse.json()
        console.log('✅ Template fetched successfully')
        console.log('   Domains:', fetchedTemplate.evaluationDomains.join(', '))
        console.log('   Levels:', fetchedTemplate.evaluationLevels.join(', '))
      } else {
        console.log('❌ Failed to fetch template:', getResponse.status)
      }

      // 4. Update template
      console.log('\n4️⃣ Updating template...')
      const updateResponse = await fetch(`${baseUrl}/api/templates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: template.id,
          name: '고등학교 논설문 평가 템플릿 (수정됨)',
          description: '수정된 설명'
        })
      })

      if (updateResponse.ok) {
        console.log('✅ Template updated successfully')
      } else {
        console.log('❌ Failed to update template:', updateResponse.status)
      }

      // 5. Delete template
      console.log('\n5️⃣ Deleting template...')
      const deleteResponse = await fetch(`${baseUrl}/api/templates?id=${template.id}`, {
        method: 'DELETE'
      })

      if (deleteResponse.ok) {
        console.log('✅ Template deleted successfully')
      } else {
        console.log('❌ Failed to delete template:', deleteResponse.status)
      }

    } else {
      console.log('❌ Failed to create template:', createResponse.status)
      const error = await createResponse.text()
      console.log('   Error:', error)
    }

    console.log('\n✅ Template API tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testTemplates()