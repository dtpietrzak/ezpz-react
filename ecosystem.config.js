module.exports = {
  apps: [{
    name: "ez-spend",
    script: "./start.sh",
    exec_mode: "fork",
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: "production",
    },
  }],
};