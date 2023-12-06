module.exports = {
  apps: [{
    name: "ez-spend",
    script: "npm",
    args: "run prod",
    exec_mode: "fork", 
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: "production",
    },
  }],
};