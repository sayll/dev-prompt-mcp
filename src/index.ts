#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { PromptManager } from './PromptManager.js'

// 获取当前文件的目录路径
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 预设prompts的目录路径
const PROMPTS_DIR = path.join(__dirname, 'prompts')

// 创建 PromptManager 实例
const promptManager = new PromptManager(PROMPTS_DIR)

/**
 * 启动MCP服务器
 */
async function startServer(): Promise<void> {
  const server = new McpServer({
    name: 'dev-prompt-mcp',
    version: '1.0.0',
  })

  // 加载所有预设的prompts
  await promptManager.load()

  // 注册所有 prompt 为 MCP Tools
  promptManager.registerTools(server)

  // 注册管理工具
  promptManager.registerManagementTools(server)

  // 创建stdio传输层并连接
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

// 启动服务器
startServer().catch((error: Error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
