export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          title: string
          content: string
          image: string | null
          author_id: string
          created_at: string
          categories: string[]
        }
        Insert: {
          id?: string
          title: string
          content: string
          image?: string | null
          author_id: string
          created_at?: string
          categories?: string[]
        }
        Update: {
          id?: string
          title?: string
          content?: string
          image?: string | null
          author_id?: string
          created_at?: string
          categories?: string[]
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
      }
    }
  }
} 