export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          active: boolean
          created_at: string
          html_snippet: string | null
          id: string
          image_url: string | null
          link_url: string | null
          name: string
          slot: Database["public"]["Enums"]["ad_slot"]
          updated_at: string
          weight: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          html_snippet?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          name: string
          slot: Database["public"]["Enums"]["ad_slot"]
          updated_at?: string
          weight?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          html_snippet?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          name?: string
          slot?: Database["public"]["Enums"]["ad_slot"]
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      article_translations: {
        Row: {
          article_id: string
          body: string[]
          body_html: string
          cached_at: string
          canonical_url: string | null
          excerpt: string | null
          focus_keyword: string | null
          id: string
          image_alt: string | null
          image_url: string | null
          keywords: string[]
          locale: string
          meta_description: string | null
          meta_title: string | null
          noindex: boolean
          og_description: string | null
          og_image: string | null
          og_title: string | null
          reading_minutes: number | null
          slug: string | null
          source: string
          status: string
          tags: string[]
          title: string | null
          twitter_description: string | null
          twitter_image: string | null
          twitter_title: string | null
          updated_at: string
        }
        Insert: {
          article_id: string
          body?: string[]
          body_html?: string
          cached_at?: string
          canonical_url?: string | null
          excerpt?: string | null
          focus_keyword?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          keywords?: string[]
          locale: string
          meta_description?: string | null
          meta_title?: string | null
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          reading_minutes?: number | null
          slug?: string | null
          source?: string
          status?: string
          tags?: string[]
          title?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Update: {
          article_id?: string
          body?: string[]
          body_html?: string
          cached_at?: string
          canonical_url?: string | null
          excerpt?: string | null
          focus_keyword?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          keywords?: string[]
          locale?: string
          meta_description?: string | null
          meta_title?: string | null
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          reading_minutes?: number | null
          slug?: string | null
          source?: string
          status?: string
          tags?: string[]
          title?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_translations_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          article_section: string | null
          author: string
          author_id: string | null
          body: string[]
          canonical_url: string | null
          category_id: string
          content_html: string
          created_at: string
          excerpt: string
          faq: Json
          featured: boolean
          focus_keyword: string | null
          geo_city: string | null
          geo_country: string | null
          geo_region: string | null
          id: string
          image_alt: string | null
          image_url: string | null
          locale: string
          noindex: boolean
          og_description: string | null
          og_image: string | null
          og_title: string | null
          published: boolean
          published_at: string | null
          reading_minutes: number
          seo_description: string | null
          seo_keywords: string | null
          seo_score: number
          seo_title: string | null
          slug: string
          tags: string[]
          title: string
          twitter_card: string
          twitter_description: string | null
          twitter_image: string | null
          twitter_title: string | null
          updated_at: string
        }
        Insert: {
          article_section?: string | null
          author?: string
          author_id?: string | null
          body?: string[]
          canonical_url?: string | null
          category_id: string
          content_html?: string
          created_at?: string
          excerpt?: string
          faq?: Json
          featured?: boolean
          focus_keyword?: string | null
          geo_city?: string | null
          geo_country?: string | null
          geo_region?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          locale?: string
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published?: boolean
          published_at?: string | null
          reading_minutes?: number
          seo_description?: string | null
          seo_keywords?: string | null
          seo_score?: number
          seo_title?: string | null
          slug: string
          tags?: string[]
          title: string
          twitter_card?: string
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Update: {
          article_section?: string | null
          author?: string
          author_id?: string | null
          body?: string[]
          canonical_url?: string | null
          category_id?: string
          content_html?: string
          created_at?: string
          excerpt?: string
          faq?: Json
          featured?: boolean
          focus_keyword?: string | null
          geo_city?: string | null
          geo_country?: string | null
          geo_region?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          locale?: string
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published?: boolean
          published_at?: string | null
          reading_minutes?: number
          seo_description?: string | null
          seo_keywords?: string | null
          seo_score?: number
          seo_title?: string | null
          slug?: string
          tags?: string[]
          title?: string
          twitter_card?: string
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          focus_keyword: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          title: string | null
          twitter: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          focus_keyword?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          title?: string | null
          twitter?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          focus_keyword?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          title?: string | null
          twitter?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          blurb: string | null
          created_at: string
          focus_keyword: string | null
          hero_image: string | null
          hex_color: string
          id: string
          name: string
          noindex: boolean
          og_image: string | null
          seo_description: string | null
          seo_keywords: string[]
          seo_title: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          blurb?: string | null
          created_at?: string
          focus_keyword?: string | null
          hero_image?: string | null
          hex_color?: string
          id?: string
          name: string
          noindex?: boolean
          og_image?: string | null
          seo_description?: string | null
          seo_keywords?: string[]
          seo_title?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          blurb?: string | null
          created_at?: string
          focus_keyword?: string | null
          hero_image?: string | null
          hex_color?: string
          id?: string
          name?: string
          noindex?: boolean
          og_image?: string | null
          seo_description?: string | null
          seo_keywords?: string[]
          seo_title?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          article_id: string
          author_email: string | null
          author_name: string
          body: string
          created_at: string
          id: string
          parent_id: string | null
          status: string
        }
        Insert: {
          article_id: string
          author_email?: string | null
          author_name: string
          body: string
          created_at?: string
          id?: string
          parent_id?: string | null
          status?: string
        }
        Update: {
          article_id?: string
          author_email?: string | null
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmed_at: string | null
          created_at: string
          email: string
          id: string
          locale: string
          name: string | null
          source: string
          status: string
          unsubscribed_at: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          email: string
          id?: string
          locale?: string
          name?: string | null
          source?: string
          status?: string
          unsubscribed_at?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          locale?: string
          name?: string | null
          source?: string
          status?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          active: boolean
          badge: string | null
          category_id: string | null
          created_at: string
          cta_label: string
          description: string | null
          id: string
          image_url: string | null
          link_url: string
          locale: string
          price: string | null
          sort_order: number
          title: string
          updated_at: string
          weight: number
        }
        Insert: {
          active?: boolean
          badge?: string | null
          category_id?: string | null
          created_at?: string
          cta_label?: string
          description?: string | null
          id?: string
          image_url?: string | null
          link_url: string
          locale?: string
          price?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          weight?: number
        }
        Update: {
          active?: boolean
          badge?: string | null
          category_id?: string | null
          created_at?: string
          cta_label?: string
          description?: string | null
          id?: string
          image_url?: string | null
          link_url?: string
          locale?: string
          price?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "offers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          article_id: string | null
          country: string | null
          created_at: string
          id: number
          locale: string | null
          path: string
          referrer: string | null
          session_id: string | null
        }
        Insert: {
          article_id?: string | null
          country?: string | null
          created_at?: string
          id?: number
          locale?: string | null
          path: string
          referrer?: string | null
          session_id?: string | null
        }
        Update: {
          article_id?: string | null
          country?: string | null
          created_at?: string
          id?: number
          locale?: string | null
          path?: string
          referrer?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      ad_slot: "leaderboard" | "billboard" | "square" | "inline"
      app_role: "admin" | "editor" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ad_slot: ["leaderboard", "billboard", "square", "inline"],
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
