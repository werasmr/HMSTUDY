module.exports = {
  apps: [
    {
      name: "proto",
      cwd: "/var/www/proto",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "512M",
      autorestart: true,
    },
  ],
};
