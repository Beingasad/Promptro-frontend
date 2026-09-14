/**
 * Puter.js AI Integration for Promptro AI Style Mixer
 * 
 * Model: openai/gpt-5.4-mini
 * Calling: puter.ai.chat(prompt, { model: "openai/gpt-5.4-mini" })
 * Client-side only with zero backend cost or API keys.
 */

declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (
          prompt: string | Array<{ role: string; content: string }>,
          options?: { model?: string; stream?: boolean }
        ) => Promise<any>;
      };
      auth?: {
        isSignedIn: () => boolean;
        signIn: () => Promise<any>;
      };
    };
  }
}

let puterLoadPromise: Promise<typeof window.puter> | null = null;

export const loadPuterSdk = (): Promise<typeof window.puter> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is undefined'));
  }

  if (window.puter && window.puter.ai) {
    return Promise.resolve(window.puter);
  }

  if (puterLoadPromise) {
    return puterLoadPromise;
  }

  puterLoadPromise = new Promise((resolve, reject) => {
    // Check if script already exists in document
    const existingScript = document.querySelector('script[src*="js.puter.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.puter));
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.onload = () => {
      if (window.puter && window.puter.ai) {
        resolve(window.puter);
      } else {
        // Give it a tick to initialize
        setTimeout(() => {
          if (window.puter) {
            resolve(window.puter);
          } else {
            reject(new Error('Puter SDK loaded but puter object is unavailable.'));
          }
        }, 100);
      }
    };
    script.onerror = () => {
      puterLoadPromise = null;
      reject(new Error('Failed to load Puter.js SDK. Please check your internet connection.'));
    };

    document.head.appendChild(script);
  });

  return puterLoadPromise;
};

/**
 * Checks if the user is already signed into Puter
 * Checks both live SDK status and cached persistent session
 * Never throws.
 */
export const isPuterSignedIn = async (): Promise<boolean> => {
  try {
    if (typeof window !== 'undefined' && window.puter?.auth && typeof window.puter.auth.isSignedIn === 'function') {
      const signedIn = Boolean(window.puter.auth.isSignedIn());
      if (signedIn) {
        localStorage.setItem('promptro_puter_signed_in', 'true');
        return true;
      }
    }
    const puter = await loadPuterSdk();
    if (puter?.auth && typeof puter.auth.isSignedIn === 'function') {
      const signedIn = Boolean(puter.auth.isSignedIn());
      if (signedIn) {
        localStorage.setItem('promptro_puter_signed_in', 'true');
        return true;
      }
    }
    return localStorage.getItem('promptro_puter_signed_in') === 'true';
  } catch {
    return typeof localStorage !== 'undefined' && localStorage.getItem('promptro_puter_signed_in') === 'true';
  }
};

/**
 * Initiates Puter's official authentication modal / popup.
 * Resolves with true if successfully signed in, false if cancelled/closed.
 * Does not expose or store any tokens or passwords.
 */
export const signInWithPuter = async (): Promise<boolean> => {
  try {
    let puter = typeof window !== 'undefined' ? window.puter : undefined;
    if (!puter?.auth) {
      puter = await loadPuterSdk();
    }
    if (!puter?.auth || typeof puter.auth.signIn !== 'function') {
      return false;
    }
    await puter.auth.signIn();
    if (typeof puter.auth.isSignedIn === 'function') {
      const signedIn = Boolean(puter.auth.isSignedIn());
      if (signedIn) {
        localStorage.setItem('promptro_puter_signed_in', 'true');
        return true;
      }
    }
    return localStorage.getItem('promptro_puter_signed_in') === 'true';
  } catch (err: any) {
    console.info('Puter sign in cancelled or closed by user:', err);
    return false;
  }
};

export interface StyleMixerAttributes {
  creationType?: string; // e.g. Portrait, Landscape
  style?: string; // e.g. Cinematic, Cyberpunk
  lighting?: string; // e.g. Golden Hour, Neon
  camera?: string; // e.g. 85mm, 35mm
  mood?: string; // e.g. Dark & Moody, Dreamy
  composition?: string; // e.g. Close-up, Wide Shot
  idea: string; // The core subject or idea
  refinePrompt?: string; // If refining/improving an existing prompt
}

export const generateStyleMixerPrompt = async (
  attributes: StyleMixerAttributes
): Promise<string> => {
  const puter = await loadPuterSdk();
  if (!puter || !puter.ai) {
    throw new Error('Puter AI engine is currently unavailable. Please refresh and try again.');
  }

  const selectedAttributesList: string[] = [];
  if (attributes.style) selectedAttributesList.push(`- Style: ${attributes.style}`);
  if (attributes.lighting) selectedAttributesList.push(`- Lighting: ${attributes.lighting}`);
  if (attributes.camera) selectedAttributesList.push(`- Camera / Lens: ${attributes.camera}`);
  if (attributes.mood) selectedAttributesList.push(`- Mood / Atmosphere: ${attributes.mood}`);
  if (attributes.creationType) selectedAttributesList.push(`- Subject Category: ${attributes.creationType}`);
  if (attributes.composition) selectedAttributesList.push(`- Framing / Composition: ${attributes.composition}`);

  const userIdea = attributes.idea.trim() || 'A captivating artistic scene';

  const systemInstructions = `You are a world-class professional AI image prompt engineer and creative director specializing in Midjourney v6, FLUX.1, DALL-E 3, and Stable Diffusion.

Your goal is to synthesize the user's idea and optional style attributes into one unified, highly vivid, cohesive, and evocative master image-generation prompt.

GUIDELINES:
1. User can provide just an idea with no style options; in that case, craft a rich, cohesive, cinematic image prompt based entirely on their core concept.
2. If style options (Style, Lighting, Camera, Mood) are selected, naturally incorporate them into the prompt.
3. Preserve the user's original idea and creative intent faithfully.
4. Do NOT simply concatenate keywords or comma-separate tags. Write a continuous, vivid, photographic or artistic master prompt with sensory depth, material textures, lighting nuances, and clear composition.
5. Make the prompt ready to use in an AI image generator immediately.
6. STRICT OUTPUT RULE: Output ONLY the final image prompt text. DO NOT include explanations, greetings, headings, quotes ("..."), or conversational commentary. Return pure prompt text only.`;

  let userPrompt = '';
  if (attributes.refinePrompt) {
    userPrompt = `Please improve and elevate this existing AI image prompt to make it even more cinematic, coherent, detailed, and visually striking:
EXISTING PROMPT: "${attributes.refinePrompt}"
${attributes.idea.trim() ? `USER ORIGINAL INTENT: "${attributes.idea.trim()}"` : ''}
${selectedAttributesList.length > 0 ? `STYLE ENHANCEMENTS TO BLEND IN:\n${selectedAttributesList.join('\n')}` : ''}

Output the improved prompt now:`;
  } else {
    userPrompt = `USER IDEA / SUBJECT:
"${userIdea}"

${selectedAttributesList.length > 0 ? `SELECTED STYLE ATTRIBUTES:\n${selectedAttributesList.join('\n')}` : 'NO SPECIFIC STYLE OPTIONS SELECTED (Use artistic intuition to craft a professional, detailed image prompt based on the idea)'}

Produce the master image prompt now:`;
  }

  try {
    const response = await puter.ai.chat(
      [
        { role: 'system', content: systemInstructions },
        { role: 'user', content: userPrompt }
      ],
      { model: 'openai/gpt-5.4-mini' }
    );

    let rawText = '';
    if (typeof response === 'string') {
      rawText = response;
    } else if (response?.message?.content) {
      rawText = response.message.content;
    } else if (response?.text) {
      rawText = response.text;
    } else if (response?.content) {
      rawText = response.content;
    } else {
      rawText = String(response);
    }

    // Sanitize output: remove any surrounding quotes or markdown wrapper
    let cleanPrompt = rawText.trim();
    if (cleanPrompt.startsWith('```') && cleanPrompt.endsWith('```')) {
      cleanPrompt = cleanPrompt.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
    }
    if ((cleanPrompt.startsWith('"') && cleanPrompt.endsWith('"')) || (cleanPrompt.startsWith('“') && cleanPrompt.endsWith('”'))) {
      cleanPrompt = cleanPrompt.slice(1, -1).trim();
    }
    cleanPrompt = cleanPrompt.replace(/^(Here is your prompt:|Prompt:|Image Prompt:)\s*/i, '').trim();

    return cleanPrompt;
  } catch (error: any) {
    console.error('Puter AI chat generation error:', error);
    throw new Error(error?.message || 'Unable to generate prompt at this moment. Please check your network and try again.');
  }
};
