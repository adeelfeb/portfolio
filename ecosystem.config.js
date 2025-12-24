module.exports = {
  apps: [{
    name: 'portfolio',
    script: './node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    node_args: '--max-old-space-size=1024',
    cwd: '/var/www/portfolio_app',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    min_uptime: '15s', // Don't allow rapid-fire restarts
    max_restarts: 5,
    env: {
      NODE_ENV: 'production',
    }
  }]
};