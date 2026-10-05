module.exports = {
  apps: [
    {
      name: 'jiale-local-life',
      script: './dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        HOSTNAME: '0.0.0.0',
        // Supabase 配置 - 请替换为你的实际值
        COZE_SUPABASE_URL: 'your_supabase_url',
        COZE_SUPABASE_ANON_KEY: 'your_supabase_anon_key',
        COZE_SUPABASE_SERVICE_ROLE_KEY: 'your_supabase_service_role_key',
        // 管理员密码
        ADMIN_PASSWORD: 'jiale-admin-2026',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
};
