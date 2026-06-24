module.exports = {
  apps: [{
    name: 'proof-server',
    script: './node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    node_args: '--max-old-space-size=1024',
    cwd: '/root/proof',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    min_uptime: '15s',
    max_restarts: 5,
    listen_timeout: 30000,
    kill_timeout: 10000,
    env: {
      NODE_ENV: 'production',
    }
  }]
};
