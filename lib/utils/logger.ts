type LogLevel = "info" | "warn" | "error" | "debug"

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development"

  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString()
    const logData = {
      timestamp,
      level,
      message,
      ...(data && { data }),
    }

    if (this.isDevelopment) {
      console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
        `[${timestamp}] [${level.toUpperCase()}] ${message}`,
        data || "",
      )
    } else {
      // In production, send to logging service
      console.log(JSON.stringify(logData))
    }
  }

  info(message: string, data?: any) {
    this.log("info", message, data)
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data)
  }

  error(message: string, error?: any) {
    this.log("error", message, {
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    })
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      this.log("debug", message, data)
    }
  }
}

export const logger = new Logger()