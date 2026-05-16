module.exports = {
  apps: [{
    name: "mrdelivery",
    script: "/usr/bin/serve",
    args: "-s dist -l 3005",
    cwd: "/root/mrdelivery",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "500M",
    env: { NODE_ENV: "production" }
  }]
}
