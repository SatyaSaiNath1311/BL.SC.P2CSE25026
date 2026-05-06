const LOG_URL = "/api-proxy/evaluation-service/logs";

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
type LogPackage = "api" | "component" | "hook" | "page" | "state" | "style" | "utils" | "middleware" | "auth" | "config";

export const Log = async (stack: "frontend" | "backend", level: LogLevel, pkg: LogPackage, message: string) => {
  const token = import.meta.env.VITE_AUTH_TOKEN;
  
  if (!token) {
    console.warn("[logger] No AUTH_TOKEN set, skipping remote log");
    return;
  }

  try {
    const response = await fetch(LOG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        stack: stack,
        level: level,
        package: pkg,
        message: message,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[logger] sent (${level}) -> logID: ${data.logID}`);
    } else {
      console.error(`[logger] failed to send log: ${response.statusText}`);
    }
  } catch (err) {
    console.error("[logger] unexpected error:", err);
  }
};
