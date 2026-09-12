const http = require('http');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);

// ── Global crash handlers ──────────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('exit', (code) => {
  console.log(`Process exiting with code ${code}`);
});

/**
 * Automatically terminate any orphaned process holding the target port on Windows/Unix
 */
function killPortProcess(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf8' });
      const lines = output.trim().split('\n');
      const myPid = String(process.pid);
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== myPid && pid !== '0') {
          console.log(`⚠️ Port ${port} was held by stale PID ${pid}. Auto-releasing port...`);
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          } catch (_) {}
        }
      }
    } else {
      execSync(`fuser -k ${port}/tcp`, { stdio: 'ignore' });
    }
  } catch (_) {
    // Port not found or already released
  }
}

/**
 * Start HTTP server with EADDRINUSE auto-recovery and graceful shutdown
 */
function startServer(port) {
  const server = http.createServer(app);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`\n⚠️ Port ${port} is occupied. Attempting to clear conflicting process...`);
      killPortProcess(port);
      // Close this server instance before retrying
      server.close(() => {
        console.log('Retrying server start in 1 second...');
        setTimeout(() => {
          const retryServer = http.createServer(app);
          retryServer.on('error', (retryErr) => {
            console.error(`\n❌ Port ${port} could not be released after retry:`, retryErr.message);
            process.exit(1);
          });
          bindServer(retryServer, port);
        }, 1000);
      });
    } else {
      console.error('Server error:', err);
    }
  });

  bindServer(server, port);
}

/**
 * Bind a server to a port and set up graceful shutdown
 */
function bindServer(server, port) {
  server.listen(port, '0.0.0.0', () => {
    console.log(`\n================================================================`);
    console.log(`🏦 Fund Circulation & Lending Server listening on port ${port}`);
    console.log(`   Health Check: http://localhost:${port}/health`);
    console.log(`================================================================\n`);
  });

  // Keep the process alive by preventing the server from being garbage collected
  server.ref();

  // Graceful termination handling
  const handleShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Closing HTTP server gracefully...`);
    server.close(() => {
      console.log('✅ Server closed cleanly.');
      process.exit(0);
    });
    // Force exit after 5 seconds if graceful shutdown stalls
    setTimeout(() => {
      console.error('⚠️ Forced shutdown after timeout.');
      process.exit(1);
    }, 5000).unref();
  };

  process.removeAllListeners('SIGINT');
  process.removeAllListeners('SIGTERM');
  process.once('SIGINT', () => handleShutdown('SIGINT'));
  process.once('SIGTERM', () => handleShutdown('SIGTERM'));
}

startServer(PORT);
