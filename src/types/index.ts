// src/types/index.ts — Domain types for AI Mentor-Friend

export type MemoryCategory =
  | 'identity'
  | 'episodic'
  | 'behavioural'
  | 'commitment'
  | 'relationship'

export type Sensitivity = 'low' | 'medium' | 'high'

export interface MemoryRecord {
  id: string
  category: MemoryCategory
  content: string
  sourceConversationId: string | null
  createdAt: number
  updatedAt: number
  lastAccessedAt: number | null
  confidence: number // 0..1
  importance: number // 0..1
  sensitivity: Sensitivity
  reviewAt: number | null
  expiryAt: number | null
  corrected: boolean
  deleted: boolean
}

export type ConversationStatus = 'active' | 'archived' | 'deleted'

export interface Conversation {
  id: string
  title: string
  status: ConversationStatus
  summaryRef: string | null
  createdAt: number
  updatedAt: number
  lastActivityAt: number
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: number
  metadata: Record<string, unknown> | null
}

export interface Goal {
  id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'abandoned' | 'archived'
  progress: number
  targetDate: number | null
  milestones: Milestone[]
  createdAt: number
  updatedAt: number
}

export interface Milestone {
  id: string
  title: string
  done: boolean
  dueAt: number | null
}

export interface Commitment {
  id: string
  goalId: string | null
  description: string
  dueAt: number | null
  status: 'pending' | 'done' | 'missed' | 'cancelled'
  missedReason: string | null
  createdAt: number
}

export interface JournalEntry {
  id: string
  kind: 'freeform' | 'daily' | 'guided' | 'weekly'
  content: string
  tags: string[]
  mood: string | null
  createdAt: number
  updatedAt: number
}

export interface UserProfile {
  id: string
  preferredLanguage: string
  communicationStyle: 'listening' | 'supportive' | 'mentor' | 'challenge' | 'accountability'
  goals: string[]
  onboardingComplete: boolean
  createdAt: number
  updatedAt: number
}
