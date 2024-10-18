module.exports = {
  apps: [
    {
      name: 'video-stream',              // Your application name
      script: 'tsx',                     // The script to execute (in this case, `tsx`)
      args: 'watch --clear-screen=false src/index.ts',  // Arguments to pass to the script
      interpreter: 'none',               // PM2 should not use its own Node interpreter, as `tsx` is already a node-based runner
      exec_mode: 'fork',                 // Run in fork mode, not cluster mode (since it's a dev watcher)
      env: {
        NODE_ENV: 'development',         // Set the environment to development
      },
      out_file: '/dev/null',             // Disable PM2's default output log
      error_file: '/dev/null',           // Disable PM2's default error log
      log_type: 'json',                  // Output JSON logs
      merge_logs: true,                  // Merge logs for both output and error
      autorestart: false,                // Don't restart the app if it crashes (useful in dev watch mode)
      watch: false,                      // PM2's watch is unnecessary because `tsx watch` handles that
      post_exec: "pino-pretty",          // Pipe the output to `pino-pretty`
    }
  ]
};
