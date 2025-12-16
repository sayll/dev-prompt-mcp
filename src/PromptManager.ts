import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import fs from 'fs-extra'
import path from 'path'
import YAML from 'yaml'
import { z } from 'zod'
import { Prompt } from './types.js'

/**
 * Prompt 管理器类
 * 负责加载、存储、管理和注册所有 prompt 模板
 */
export class PromptManager {
  private prompts: Map<string, Prompt> = new Map()
  private promptsDir: string

  constructor(promptsDir: string) {
    this.promptsDir = promptsDir
  }

  /**
   * 加载单个 prompt 文件
   */
  private async loadFile(filename: string): Promise<Prompt | null> {
    try {
      const filePath = path.join(this.promptsDir, filename)
      const content = await fs.readFile(filePath, 'utf8')

      let prompt: Partial<Prompt>
      if (filename.endsWith('.json')) {
        prompt = JSON.parse(content) as Partial<Prompt>
      } else {
        prompt = YAML.parse(content) as Partial<Prompt>
      }

      // 验证必需字段
      if (!prompt.name) {
        console.warn(`Warning: Prompt in ${filename} is missing a name field. Skipping.`)
        return null
      }

      return prompt as Prompt
    } catch (error) {
      console.error(`Error loading prompt file ${filename}:`, error)
      return null
    }
  }

  /**
   * 从目录加载所有 prompt 文件
   */
  async load(): Promise<void> {
    try {
      // 确保目录存在
      await fs.ensureDir(this.promptsDir)

      // 读取目录中的所有文件
      const files = await fs.readdir(this.promptsDir)

      // 过滤出 YAML 和 JSON 文件
      const promptFiles = files.filter(
        file => file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json')
      )

      // 清空现有 prompts
      this.prompts.clear()

      // 加载每个 prompt 文件
      for (const file of promptFiles) {
        const prompt = await this.loadFile(file)
        if (prompt) {
          this.prompts.set(prompt.name, prompt)
        }
      }

      console.error(`Loaded ${this.prompts.size} prompts from ${this.promptsDir}`)
    } catch (error) {
      console.error('Error loading prompts:', error)
    }
  }

  /**
   * 重新加载所有 prompts
   */
  async reload(): Promise<number> {
    await this.load()
    return this.prompts.size
  }

  /**
   * 获取所有 prompt 名称
   */
  getNames(): string[] {
    return Array.from(this.prompts.keys())
  }

  /**
   * 处理 prompt 内容，替换参数
   */
  private processPrompt(prompt: Prompt, args: Record<string, string> = {}) {
    let promptText = ''

    if (prompt.messages && Array.isArray(prompt.messages)) {
      for (const message of prompt.messages) {
        let contentText = ''

        if (typeof message.content === 'string') {
          contentText = message.content
        } else if (message.content && typeof message.content === 'object' && 'text' in message.content) {
          contentText = message.content.text
        }

        if (contentText) {
          // 替换所有 {{arg}} 格式的参数
          for (const [key, value] of Object.entries(args)) {
            if (value) {
              contentText = contentText.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
            }
          }
          promptText += contentText + '\n\n'
        }
      }
    }

    return {
      content: [{ type: 'text' as const, text: promptText.trim() }],
    }
  }

  /**
   * 将所有 prompts 注册为 MCP Tools
   */
  registerTools(server: McpServer): void {
    this.prompts.forEach(prompt => {
      // 构建输入参数 schema
      const inputSchema: Record<string, z.ZodString> = {}

      if (prompt.arguments && Array.isArray(prompt.arguments)) {
        prompt.arguments.forEach(arg => {
          inputSchema[arg.name] = z.string().describe(arg.description || `参数: ${arg.name}`)
        })
      }

      // Tool 处理函数
      const toolHandler = async (args: Record<string, string> = {}) => {
        return this.processPrompt(prompt, args)
      }

      // 注册 Tool
      if (Object.keys(inputSchema).length > 0) {
        server.registerTool(
          prompt.name,
          {
            title: prompt.title || prompt.name,
            description: prompt.description || `Prompt: ${prompt.name}`,
            inputSchema,
          },
          (args: Record<string, string>) => toolHandler(args)
        )
      } else {
        server.registerTool(
          prompt.name,
          {
            title: prompt.title || prompt.name,
            description: prompt.description || `Prompt: ${prompt.name}`,
          },
          () => toolHandler({})
        )
      }
    })
  }

  /**
   * 注册管理工具（reload、get_names 等）
   */
  registerManagementTools(server: McpServer): void {
    // 重新加载 prompts
    server.registerTool(
      'reload_prompts',
      {
        title: '重新加载 Prompts',
        description: '重新加载所有预设的prompts',
      },
      async () => {
        const count = await this.reload()
        return {
          content: [{ type: 'text', text: `成功重新加载了 ${count} 个prompts。` }],
        }
      }
    )

    // 获取 prompt 名称列表
    server.registerTool(
      'get_prompt_names',
      {
        title: '获取 Prompt 列表',
        description: '获取所有可用的prompt名称',
      },
      async () => {
        const names = this.getNames()
        return {
          content: [{ type: 'text' as const, text: `可用的prompts (${names.length}):\n${names.join('\n')}` }],
        }
      }
    )
  }
}
