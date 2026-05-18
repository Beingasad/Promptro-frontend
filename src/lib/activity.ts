import axios from 'axios';
import { API_BASE_URL } from '../config';
import type { User } from 'firebase/auth';
import type { Prompt } from '../components/ImageCard';

const savedKey = 'promptro:saved-prompts';
const likedKey = 'promptro:liked-prompts';
const recentKey = 'promptro:recent-prompts';
const activityEvent = 'promptro:activity-updated';

export interface UserActivity {
  savedPrompts: Prompt[];
  likedPrompts: string[];
  recentPrompts: Prompt[];
}

export function readLocalActivity(): UserActivity {
  return {
    savedPrompts: readJson<Prompt[]>(savedKey, []),
    likedPrompts: readJson<string[]>(likedKey, []),
    recentPrompts: readJson<Prompt[]>(recentKey, []),
  };
}

export function writeLocalActivity(activity: UserActivity) {
  localStorage.setItem(savedKey, JSON.stringify(activity.savedPrompts));
  localStorage.setItem(likedKey, JSON.stringify(activity.likedPrompts));
  localStorage.setItem(recentKey, JSON.stringify(activity.recentPrompts));
  window.dispatchEvent(new Event(activityEvent));
}

export function clearLocalActivity() {
  writeLocalActivity({ savedPrompts: [], likedPrompts: [], recentPrompts: [] });
}

export function onActivityUpdated(callback: () => void) {
  window.addEventListener(activityEvent, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(activityEvent, callback);
    window.removeEventListener('storage', callback);
  };
}

export async function syncUserActivity(user: User) {
  try {
    const localActivity = readLocalActivity();
    const response = await axios.get(`${API_BASE_URL}/api/users/${user.uid}/activity`);
    const cloudActivity = response.data ? normalizeActivity(response.data) : emptyActivity();
    const mergedActivity = mergeActivity(cloudActivity, localActivity);

    writeLocalActivity(mergedActivity);
    await saveUserActivity(user, mergedActivity);
  } catch (error) {
    console.error('Error syncing user activity from backend database:', error);
  }
}

export async function saveUserActivity(user: User | null | undefined, activity = readLocalActivity()) {
  if (!user) return;

  try {
    await axios.post(`${API_BASE_URL}/api/users/${user.uid}/activity`, {
      saved_prompts: activity.savedPrompts,
      liked_prompts: activity.likedPrompts,
      recent_prompts: activity.recentPrompts,
    });
  } catch (error) {
    console.error('Error saving user activity to backend database:', error);
  }
}

export function setSavedPrompt(prompt: Prompt, saved: boolean) {
  const activity = readLocalActivity();
  const nextSaved = saved
    ? [prompt, ...activity.savedPrompts.filter((item) => item.id !== prompt.id)]
    : activity.savedPrompts.filter((item) => item.id !== prompt.id);

  writeLocalActivity({ ...activity, savedPrompts: nextSaved });
}

export function setLikedPrompt(promptId: string, liked: boolean) {
  const activity = readLocalActivity();
  const nextLiked = liked
    ? [promptId, ...activity.likedPrompts.filter((id) => id !== promptId)]
    : activity.likedPrompts.filter((id) => id !== promptId);

  writeLocalActivity({ ...activity, likedPrompts: nextLiked });
}

export function addRecentPrompt(prompt: Prompt) {
  const activity = readLocalActivity();
  const nextRecent = [prompt, ...activity.recentPrompts.filter((item) => item.id !== prompt.id)].slice(0, 12);

  writeLocalActivity({ ...activity, recentPrompts: nextRecent });
}

function emptyActivity(): UserActivity {
  return { savedPrompts: [], likedPrompts: [], recentPrompts: [] };
}

function readJson<T>(key: string, fallback: T) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '');
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function normalizeActivity(data: Record<string, unknown>): UserActivity {
  return {
    savedPrompts: Array.isArray(data.savedPrompts) ? (data.savedPrompts as Prompt[]) : 
                  (Array.isArray(data.saved_prompts) ? (data.saved_prompts as Prompt[]) : []),
    likedPrompts: Array.isArray(data.likedPrompts) ? (data.likedPrompts as string[]) : 
                  (Array.isArray(data.liked_prompts) ? (data.liked_prompts as string[]) : []),
    recentPrompts: Array.isArray(data.recentPrompts) ? (data.recentPrompts as Prompt[]) : 
                  (Array.isArray(data.recent_prompts) ? (data.recent_prompts as Prompt[]) : []),
  };
}

function mergeActivity(cloud: UserActivity, local: UserActivity): UserActivity {
  return {
    savedPrompts: mergePrompts(local.savedPrompts, cloud.savedPrompts),
    likedPrompts: Array.from(new Set([...local.likedPrompts, ...cloud.likedPrompts])),
    recentPrompts: mergePrompts(local.recentPrompts, cloud.recentPrompts).slice(0, 12),
  };
}

function mergePrompts(primary: Prompt[], secondary: Prompt[]) {
  const seen = new Set<string>();

  return [...primary, ...secondary].filter((prompt) => {
    if (!prompt?.id || seen.has(prompt.id)) return false;
    seen.add(prompt.id);
    return true;
  });
}
