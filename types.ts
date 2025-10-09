export interface GroundingSource {
  uri: string;
  title: string;
}

export interface FiqhResponse {
  text: string;
  sources: GroundingSource[];
}

// This is an illustrative type for the raw chunk from Gemini API.
// It's used internally in the service for mapping.
export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  }
}

// Add new type for streaming chunks
export interface FiqhStreamChunk {
  textChunk?: string;
  sources?: GroundingSource[];
}