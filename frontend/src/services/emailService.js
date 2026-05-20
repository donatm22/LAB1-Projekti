/**
 * EmailJS Service - Optimized for performance
 * Lazy loads EmailJS, caches config, and handles initialization efficiently
 */

let emailjsInstance = null;
let isInitialized = false;
let initPromise = null;

/**
 * Lazy load and initialize EmailJS
 */
const initEmailJS = async () => {
  if (isInitialized) return emailjsInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Dynamically import EmailJS only when needed
      const emailjs = await import("@emailjs/browser");
      
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      if (publicKey) {
        emailjs.init(publicKey);
      }
      
      emailjsInstance = emailjs;
      isInitialized = true;
      return emailjs;
    } catch (error) {
      console.error("Failed to initialize EmailJS:", error);
      throw error;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
};

/**
 * Validate EmailJS configuration
 */
const validateConfig = () => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    return {
      isValid: false,
      error: "EmailJS is not configured. Add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY.",
    };
  }

  return { isValid: true };
};

/**
 * Send email with timeout and error handling
 */
export const sendEmail = async (templateParams, timeoutMs = 10000) => {
  // Validate configuration first
  const configValidation = validateConfig();
  if (!configValidation.isValid) {
    throw new Error(configValidation.error);
  }

  // Initialize EmailJS
  const emailjs = await initEmailJS();
  
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await Promise.race([
      emailjs.send(serviceId, templateId, templateParams),
      new Promise((_, reject) =>
        controller.signal.addEventListener("abort", () =>
          reject(new Error(`Email sending timeout after ${timeoutMs}ms`))
        )
      ),
    ]);

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Pre-initialize EmailJS in the background
 * Call this on app startup to warm up the service
 */
export const preInitializeEmailJS = async () => {
  try {
    await initEmailJS();
  } catch (error) {
    console.warn("EmailJS pre-initialization failed:", error);
  }
};

export default {
  sendEmail,
  preInitializeEmailJS,
  initEmailJS,
  validateConfig,
};
