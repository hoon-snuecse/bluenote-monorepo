'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bluenote/ui'
import { Button } from '@bluenote/ui'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@bluenote/ui'
import { Input } from '@bluenote/ui'
import { Label } from '@bluenote/ui'
import { Textarea } from '@bluenote/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@bluenote/ui'
import { Badge } from '@bluenote/ui'
import { Switch } from '@/components/ui/Switch'
import { Trash2, Edit, Plus, Save, X } from 'lucide-react'
import { useTemplates, EvaluationTemplate } from '@/hooks/useTemplates'

interface TemplateManagerProps {
  onSelectTemplate?: (template: EvaluationTemplate) => void
  mode?: 'manage' | 'select'
}

export function TemplateManager({ onSelectTemplate, mode = 'manage' }: TemplateManagerProps) {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useTemplates()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EvaluationTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    writingType: '',
    gradeLevel: '',
    evaluationDomains: [''],
    evaluationLevels: [''],
    levelCount: 3,
    gradingCriteria: '',
    isPublic: false
  })

  const handleSubmit = async () => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData)
      } else {
        await createTemplate(formData)
      }
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('정말로 이 템플릿을 삭제하시겠습니까?')) {
      await deleteTemplate(id)
    }
  }

  const handleEdit = (template: EvaluationTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || '',
      writingType: template.writingType || '',
      gradeLevel: template.gradeLevel || '',
      evaluationDomains: template.evaluationDomains,
      evaluationLevels: template.evaluationLevels,
      levelCount: template.levelCount,
      gradingCriteria: template.gradingCriteria,
      isPublic: template.isPublic
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingTemplate(null)
    setFormData({
      name: '',
      description: '',
      writingType: '',
      gradeLevel: '',
      evaluationDomains: [''],
      evaluationLevels: [''],
      levelCount: 3,
      gradingCriteria: '',
      isPublic: false
    })
  }

  const addDomain = () => {
    setFormData(prev => ({
      ...prev,
      evaluationDomains: [...prev.evaluationDomains, '']
    }))
  }

  const removeDomain = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evaluationDomains: prev.evaluationDomains.filter((_, i) => i !== index)
    }))
  }

  const updateDomain = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      evaluationDomains: prev.evaluationDomains.map((d, i) => i === index ? value : d)
    }))
  }

  const addLevel = () => {
    setFormData(prev => ({
      ...prev,
      evaluationLevels: [...prev.evaluationLevels, '']
    }))
  }

  const removeLevel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evaluationLevels: prev.evaluationLevels.filter((_, i) => i !== index)
    }))
  }

  const updateLevel = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      evaluationLevels: prev.evaluationLevels.map((l, i) => i === index ? value : l)
    }))
  }

  if (loading) {
    return <div className="animate-pulse">템플릿을 불러오는 중...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">평가 기준 템플릿</h2>
        {mode === 'manage' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                새 템플릿
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? '템플릿 수정' : '새 템플릿 만들기'}
                </DialogTitle>
                <DialogDescription>
                  자주 사용하는 평가 기준을 템플릿으로 저장하여 재사용할 수 있습니다.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">템플릿 이름 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="예: 고등학교 논설문 평가"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="템플릿에 대한 간단한 설명"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="writingType">글 유형</Label>
                    <Select
                      value={formData.writingType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, writingType: value }))}
                    >
                      <SelectTrigger id="writingType">
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="논설문">논설문</SelectItem>
                        <SelectItem value="설명문">설명문</SelectItem>
                        <SelectItem value="서사문">서사문</SelectItem>
                        <SelectItem value="창작문">창작문</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="gradeLevel">학년</Label>
                    <Select
                      value={formData.gradeLevel}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gradeLevel: value }))}
                    >
                      <SelectTrigger id="gradeLevel">
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="초1-2">초1-2</SelectItem>
                        <SelectItem value="초3-4">초3-4</SelectItem>
                        <SelectItem value="초5-6">초5-6</SelectItem>
                        <SelectItem value="중1">중1</SelectItem>
                        <SelectItem value="중2">중2</SelectItem>
                        <SelectItem value="중3">중3</SelectItem>
                        <SelectItem value="고1">고1</SelectItem>
                        <SelectItem value="고2">고2</SelectItem>
                        <SelectItem value="고3">고3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>평가 영역 *</Label>
                  <div className="space-y-2">
                    {formData.evaluationDomains.map((domain, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={domain}
                          onChange={(e) => updateDomain(index, e.target.value)}
                          placeholder={`영역 ${index + 1}`}
                        />
                        {formData.evaluationDomains.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeDomain(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addDomain}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      영역 추가
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>평가 수준 *</Label>
                  <div className="space-y-2">
                    {formData.evaluationLevels.map((level, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={level}
                          onChange={(e) => updateLevel(index, e.target.value)}
                          placeholder={`수준 ${index + 1}`}
                        />
                        {formData.evaluationLevels.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeLevel(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addLevel}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      수준 추가
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="gradingCriteria">평가 기준 상세 *</Label>
                  <Textarea
                    id="gradingCriteria"
                    value={formData.gradingCriteria}
                    onChange={(e) => setFormData(prev => ({ ...prev, gradingCriteria: e.target.value }))}
                    placeholder="각 영역별 평가 기준을 상세히 작성하세요"
                    rows={6}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                  />
                  <Label htmlFor="isPublic">
                    다른 사용자도 이 템플릿을 사용할 수 있도록 공개
                  </Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleSubmit}>
                  <Save className="mr-2 h-4 w-4" />
                  {editingTemplate ? '수정' : '저장'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {templates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">저장된 템플릿이 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          templates.map(template => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {template.description && (
                      <CardDescription>{template.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {template.isPublic && (
                      <Badge variant="secondary">공개</Badge>
                    )}
                    {mode === 'select' ? (
                      <Button
                        size="sm"
                        onClick={() => onSelectTemplate?.(template)}
                      >
                        선택
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  {template.writingType && (
                    <div>
                      <span className="font-medium">글 유형:</span> {template.writingType}
                    </div>
                  )}
                  {template.gradeLevel && (
                    <div>
                      <span className="font-medium">학년:</span> {template.gradeLevel}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">평가 영역:</span> {template.evaluationDomains.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">평가 수준:</span> {template.evaluationLevels.join(', ')}
                  </div>
                  {template.creator && (
                    <div className="text-muted-foreground">
                      작성자: {template.creator.name || template.creator.email}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}