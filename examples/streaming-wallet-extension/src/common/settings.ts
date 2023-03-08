/**
 * Enable YouTube and Twitch streaming tracking.
 *
 * If you enable this, you will need to add the following to your manifest.json in content_scripts -> matches:
 * [
 *     "https://youtube.com/*",
 *     "https://www.youtube.com/*",
 *     "https://www.twitch.tv/*",
 *     "https://twitch.tv/*",
 * ]
 */
export const ENABLE_YOUTUBE_AND_TWITCH = false;