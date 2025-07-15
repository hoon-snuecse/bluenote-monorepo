import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function migrateData() {
  console.log('Starting data migration...');

  try {
    // 1. Migrate Assignments
    console.log('\n1. Migrating assignments...');
    const assignmentsDir = path.join(process.cwd(), 'data', 'assignments');
    try {
      const assignmentFiles = await fs.readdir(assignmentsDir);
      
      for (const file of assignmentFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(assignmentsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const assignment = JSON.parse(content);
          
          // Check if already exists
          const existing = await prisma.assignment.findUnique({
            where: { id: assignment.id }
          });
          
          if (!existing) {
            await prisma.assignment.create({
              data: {
                id: assignment.id,
                title: assignment.title,
                schoolName: assignment.schoolName,
                gradeLevel: assignment.gradeLevel,
                writingType: assignment.writingType,
                evaluationDomains: JSON.stringify(assignment.evaluationDomains),
                evaluationLevels: JSON.stringify(assignment.evaluationLevels),
                levelCount: assignment.levelCount,
                gradingCriteria: assignment.gradingCriteria,
                createdAt: new Date(assignment.createdAt),
                updatedAt: new Date(assignment.updatedAt || assignment.createdAt)
              }
            });
            console.log(`  ✓ Migrated assignment: ${assignment.title}`);
          } else {
            console.log(`  - Skipped existing assignment: ${assignment.title}`);
          }
        }
      }
    } catch (error) {
      console.log('  No assignments directory found or error reading files');
    }

    // 2. Migrate Submissions
    console.log('\n2. Migrating submissions...');
    const submissionsDir = path.join(process.cwd(), 'data', 'submissions');
    try {
      const submissionFiles = await fs.readdir(submissionsDir);
      
      for (const file of submissionFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(submissionsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const submission = JSON.parse(content);
          
          // Check if already exists
          const existing = await prisma.submission.findUnique({
            where: { id: submission.id }
          });
          
          if (!existing) {
            await prisma.submission.create({
              data: {
                id: submission.id,
                assignmentId: submission.assignmentId,
                studentName: submission.studentName,
                studentId: submission.studentId,
                content: submission.content,
                submittedAt: new Date(submission.submittedAt),
                status: submission.status || 'submitted'
              }
            });
            console.log(`  ✓ Migrated submission: ${submission.studentName}`);
          } else {
            console.log(`  - Skipped existing submission: ${submission.studentName}`);
          }
        }
      }
    } catch (error) {
      console.log('  No submissions directory found or error reading files');
    }

    // 3. Migrate Evaluations
    console.log('\n3. Migrating evaluations...');
    const evaluationsDir = path.join(process.cwd(), 'data', 'evaluations');
    try {
      const evaluationFiles = await fs.readdir(evaluationsDir);
      
      for (const file of evaluationFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(evaluationsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const evaluation = JSON.parse(content);
          
          // Check if already exists
          const existing = await prisma.evaluation.findUnique({
            where: { id: evaluation.id }
          });
          
          if (!existing) {
            await prisma.evaluation.create({
              data: {
                id: evaluation.id,
                submissionId: evaluation.submissionId,
                assignmentId: evaluation.assignmentId,
                studentId: evaluation.studentId || '',
                domainEvaluations: evaluation.domainEvaluations,
                overallLevel: evaluation.overallLevel,
                overallFeedback: evaluation.overallFeedback,
                improvementSuggestions: JSON.stringify(evaluation.improvementSuggestions || []),
                strengths: JSON.stringify(evaluation.strengths || []),
                evaluatedAt: new Date(evaluation.evaluatedAt),
                evaluatedBy: evaluation.evaluatedBy || 'mock'
              }
            });
            console.log(`  ✓ Migrated evaluation: ${evaluation.id}`);
          } else {
            console.log(`  - Skipped existing evaluation: ${evaluation.id}`);
          }
        }
      }
    } catch (error) {
      console.log('  No evaluations directory found or error reading files');
    }

    // 4. Migrate Templates
    console.log('\n4. Migrating templates...');
    const templatesDir = path.join(process.cwd(), 'data', 'templates');
    try {
      const templateFiles = await fs.readdir(templatesDir);
      
      for (const file of templateFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(templatesDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const template = JSON.parse(content);
          
          // Check if already exists
          const existing = await prisma.evaluationTemplate.findUnique({
            where: { id: template.id }
          });
          
          if (!existing) {
            await prisma.evaluationTemplate.create({
              data: {
                id: template.id,
                name: template.name,
                description: template.description || '',
                writingType: template.writingType,
                evaluationDomains: JSON.stringify(template.evaluationDomains),
                evaluationLevels: JSON.stringify(template.evaluationLevels),
                levelCount: template.levelCount,
                gradingCriteria: template.gradingCriteria,
                createdAt: new Date(template.createdAt),
                updatedAt: new Date(template.updatedAt || template.createdAt)
              }
            });
            console.log(`  ✓ Migrated template: ${template.name}`);
          } else {
            console.log(`  - Skipped existing template: ${template.name}`);
          }
        }
      }
    } catch (error) {
      console.log('  No templates directory found or error reading files');
    }

    // 5. Migrate Settings
    console.log('\n5. Migrating settings...');
    const settingsFile = path.join(process.cwd(), 'data', 'settings.json');
    try {
      const content = await fs.readFile(settingsFile, 'utf-8');
      const settings = JSON.parse(content);
      
      // Migrate apiKeys
      if (settings.apiKeys) {
        const existing = await prisma.systemSettings.findUnique({
          where: { key: 'apiKeys' }
        });
        
        if (!existing) {
          await prisma.systemSettings.create({
            data: {
              key: 'apiKeys',
              value: settings.apiKeys
            }
          });
          console.log('  ✓ Migrated API keys settings');
        } else {
          console.log('  - Skipped existing API keys settings');
        }
      }
      
      // Migrate schoolInfo
      if (settings.schoolInfo) {
        const existing = await prisma.systemSettings.findUnique({
          where: { key: 'schoolInfo' }
        });
        
        if (!existing) {
          await prisma.systemSettings.create({
            data: {
              key: 'schoolInfo',
              value: settings.schoolInfo
            }
          });
          console.log('  ✓ Migrated school info settings');
        } else {
          console.log('  - Skipped existing school info settings');
        }
      }
      
      // Migrate evaluationDefaults
      if (settings.evaluationDefaults) {
        const existing = await prisma.systemSettings.findUnique({
          where: { key: 'evaluationDefaults' }
        });
        
        if (!existing) {
          await prisma.systemSettings.create({
            data: {
              key: 'evaluationDefaults',
              value: settings.evaluationDefaults
            }
          });
          console.log('  ✓ Migrated evaluation defaults settings');
        } else {
          console.log('  - Skipped existing evaluation defaults settings');
        }
      }
    } catch (error) {
      console.log('  No settings file found');
    }

    // 6. Migrate Access Tokens
    console.log('\n6. Migrating access tokens...');
    const tokensDir = path.join(process.cwd(), 'data', 'access-tokens');
    try {
      const tokenFiles = await fs.readdir(tokensDir);
      
      for (const file of tokenFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(tokensDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const token = JSON.parse(content);
          
          // Check if already exists
          const existing = await prisma.accessToken.findUnique({
            where: { token: token.token }
          });
          
          if (!existing) {
            await prisma.accessToken.create({
              data: {
                id: token.id,
                token: token.token,
                evaluationId: token.evaluationId,
                studentId: token.studentId,
                expiresAt: new Date(token.expiresAt),
                used: token.used || false,
                createdAt: new Date(token.createdAt)
              }
            });
            console.log(`  ✓ Migrated access token: ${token.id}`);
          } else {
            console.log(`  - Skipped existing access token: ${token.id}`);
          }
        }
      }
    } catch (error) {
      console.log('  No access tokens directory found or error reading files');
    }

    console.log('\nData migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateData().catch(console.error);