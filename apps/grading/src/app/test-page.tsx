'use client'

// Test relative imports
import { useStudentGroups } from '../../hooks/useStudentGroups'
import { useNotification } from '../../contexts/NotificationContext'
import { TemplateManager } from '../../components/TemplateManager'
import { AuthLayout } from '../../components/AuthLayout'
import { exportToExcel } from '../../utils/excel-export'

export default function TestPage() {
  return (
    <div>
      <h1>Test Page - All imports work!</h1>
    </div>
  )
}