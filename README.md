# dev-prompt-mcp

一个基于 MCP (Model Context Protocol) 的 Prompt 管理服务器，将常用的 Prompt 模板注册为 MCP 工具，通过自然语言对话即可调用。

[![npm version](https://badge.fury.io/js/dev-prompt-mcp.svg)](https://www.npmjs.com/package/dev-prompt-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特性

- 🚀 **TypeScript 开发** - 完整的类型支持，代码更健壮
- 📦 **Prompt 即工具** - 所有 Prompt 自动注册为 MCP 工具，支持参数化调用
- 🔄 **热加载** - 支持命令式动态加载 Prompt，无需重启服务
- 🧩 **易于扩展** - 添加 YAML/JSON 文件即可扩展新 Prompt
- 🛠️ **开发友好** - 支持开发模式、Inspector 调试

## 📦 安装

### 方式 1：NPM 全局安装

```bash
npm install -g dev-prompt-mcp
```

### 方式 2：NPX 直接运行（推荐）

无需安装，直接在 MCP 配置中使用 `npx`。

### 方式 3：从源码安装

```bash
git clone https://github.com/sayll/dev-prompt-mcp.git
cd dev-prompt-mcp
pnpm install
pnpm run build
```

## 🔧 MCP 配置

### 方式 1：使用 npx（推荐）

适用于 Cursor / Windsurf / Augment / Trae 等，编辑对应的 `mcp_config.json`：

```json
{
  "mcpServers": {
    "dev-prompt": {
      "command": "npx",
      "args": ["dev-prompt-mcp"]
    }
  }
}
```

### 方式 2：全局安装后使用

```json
{
  "mcpServers": {
    "dev-prompt": {
      "command": "dev-prompt-mcp"
    }
  }
}
```

### 方式 3：从源码运行

```json
{
  "mcpServers": {
    "dev-prompt": {
      "command": "node",
      "args": ["/your/path/to/dev-prompt-mcp/dist/index.js"]
    }
  }
}
```

### Raycast

1. 搜索 `install server (MCP)`
2. Name: `dev-prompt`
3. Command: `npx`
4. Arguments: `dev-prompt-mcp`

## 📁 项目结构

```
dev-prompt-mcp/
├── src/
│   ├── index.ts              # 服务器入口
│   ├── PromptManager.ts      # Prompt 管理器（加载、注册、监听）
│   ├── types.ts              # TypeScript 类型定义
│   └── prompts/              # Prompt 模板目录
│       ├── gen_summarize.yaml
│       ├── gen_apifox_api_service.yaml
│       ├── i18n_chinese_transform.yaml
│       ├── code_review.yaml
│       └── code_refactoring.yaml
├── dist/                     # 编译输出目录
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ 开发

### 安装依赖

```bash
pnpm install
```

### 可用脚本

| 命令                     | 说明                            |
| ------------------------ | ------------------------------- |
| `pnpm run dev`           | 开发模式（tsx watch，自动重启） |
| `pnpm run dev:inspector` | 使用 MCP Inspector 调试         |
| `pnpm run build`         | 编译 TypeScript                 |
| `pnpm run build:watch`   | 监听模式编译                    |
| `pnpm run start`         | 运行编译后的代码                |

## 📝 内置 Prompt

| Prompt                   | 说明                                        |
| ------------------------ | ------------------------------------------- |
| `gen_summarize`          | 生成内容摘要                                |
| `gen_apifox_api_service` | 通过 Apifox MCP 获取接口并生成 API 服务代码 |
| `i18n_chinese_transform` | 将页面中文通过 i18n 转义，管理多语言文件    |
| `code_review`            | 代码审查                                    |
| `code_refactoring`       | 代码重构                                    |

## 🛠️ 管理工具

| 工具               | 说明                              |
| ------------------ | --------------------------------- |
| `reload_prompts`   | 重新加载所有 Prompt（支持热更新） |
| `get_prompt_names` | 获取当前所有可用 Prompt 名称      |

## 📄 扩展 Prompt

在 `src/prompts/` 目录下创建 YAML 或 JSON 文件：

```yaml
name: my_custom_prompt
description: 这个 Prompt 的用途说明
arguments:
  - name: input
    description: 输入参数说明
    required: false
messages:
  - role: user
    content:
      type: text
      text: |
        你的 Prompt 内容
        支持参数占位符：{{input}}
```

## 🏗️ 技术栈

- **Runtime**: Node.js (ESM)
- **Language**: TypeScript
- **MCP SDK**: @modelcontextprotocol/sdk
- **配置解析**: yaml, zod
- **文件操作**: fs-extra

## 📦 依赖

**生产依赖：**

- `@modelcontextprotocol/sdk` - MCP 服务器核心 SDK
- `fs-extra` - 增强的文件操作
- `yaml` - YAML 解析
- `zod` - Schema 验证

**开发依赖：**

- `typescript` - TypeScript 编译器
- `tsx` - 开发模式运行 TS
- `@types/node`, `@types/fs-extra` - 类型定义

## 📄 License

MIT
