import axios from 'axios'

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const BASE_URL = 'https://www.googleapis.com/youtube/v3'

export interface YouTubeVideo {
  id: string
  title: string
  channelTitle: string
  thumbnail: string
  description: string
}

export async function searchExerciseVideos(query: string): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'your_youtube_api_key') {
    console.warn('[FitForge] YouTube API key not set.')
    return []
  }

  const response = await axios.get(`${BASE_URL}/search`, {
    params: {
      part: 'snippet',
      q: `${query} exercise tutorial form`,
      type: 'video',
      maxResults: 3,
      videoDuration: 'medium',
      key: YOUTUBE_API_KEY,
    },
  })

  return response.data.items.map((item: {
    id: { videoId: string }
    snippet: {
      title: string
      channelTitle: string
      thumbnails: { medium: { url: string } }
      description: string
    }
  }) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium.url,
    description: item.snippet.description,
  }))
}
