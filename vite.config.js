// vite.config.js (打包設定 config)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 將 <REPO_NAME> 改成你的 GitHub 專案名稱
// 若是 <username>.github.io 這種使用者首頁專案，base 改成 '/'
export default defineConfig({
  plugins: [react()],
  base: '/lscoupling.github.io/'
})