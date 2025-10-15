'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/contexts/LanguageContext'

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <Select value={language} onValueChange={(value: 'english' | 'hindi') => setLanguage(value)}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="english">English</SelectItem>
        <SelectItem value="hindi">हिंदी</SelectItem>
      </SelectContent>
    </Select>
  )
}