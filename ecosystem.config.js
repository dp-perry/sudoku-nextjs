module.exports = {
  apps: [
    {
      name: 'wingu-sudoku',
      cwd: '/home/wingu/sudoku',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        HOSTNAME: '127.0.0.1',
        PORT: 4009,
      },
    },
  ],
};