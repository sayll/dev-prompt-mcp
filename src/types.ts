export interface PromptArgument {
  name: string
  description?: string
  required?: boolean
}

export interface PromptMessage {
  role: 'user' | 'assistant'
  content: string | { type: string; text: string }
}

export interface Prompt {
  name: string
  title?: string
  description?: string
  arguments?: PromptArgument[]
  messages?: PromptMessage[]
}
