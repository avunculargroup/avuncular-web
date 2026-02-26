export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PipelineStage = "lead" | "warm" | "active" | "client" | "dormant";
export type BitcoinLiteracy =
  | "unknown"
  | "none"
  | "basic"
  | "intermediate"
  | "advanced";
export type InteractionType =
  | "call"
  | "email"
  | "meeting"
  | "signal"
  | "linkedin"
  | "note"
  | "other";
export type InteractionDirection = "inbound" | "outbound" | "internal";
export type TaskStatus =
  | "todo"
  | "in_progress"
  | "blocked"
  | "done"
  | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type ProjectStatus = "active" | "on_hold" | "completed" | "archived";
export type ContentStatus =
  | "idea"
  | "draft"
  | "review"
  | "approved"
  | "scheduled"
  | "published"
  | "archived";
export type ContentType =
  | "linkedin"
  | "twitter_x"
  | "newsletter"
  | "blog"
  | "idea";
export type AgentStatus = "pending" | "approved" | "rejected" | "auto";
export type InteractionSource =
  | "manual"
  | "coordinator_agent"
  | "signal"
  | "call_transcript";
export type TaskSource = "manual" | "coordinator_agent" | "signal";
export type ContentSource = "manual" | "coordinator_agent" | "content_agent";

export interface Database {
  public: {
    Tables: {
      team_members: {
        Row: {
          id: string;
          full_name: string;
          role: string;
          signal_number: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: string;
          signal_number?: string | null;
        };
        Update: {
          full_name?: string;
          role?: string;
          signal_number?: string | null;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          industry: string | null;
          size: string | null;
          country: string | null;
          website: string | null;
          linkedin_url: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          industry?: string | null;
          size?: string | null;
          country?: string | null;
          website?: string | null;
          linkedin_url?: string | null;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          industry?: string | null;
          size?: string | null;
          country?: string | null;
          website?: string | null;
          linkedin_url?: string | null;
          notes?: string | null;
        };
      };
      contacts: {
        Row: {
          id: string;
          company_id: string | null;
          first_name: string;
          last_name: string;
          job_title: string | null;
          email: string | null;
          phone: string | null;
          linkedin_url: string | null;
          pipeline_stage: PipelineStage;
          bitcoin_literacy: BitcoinLiteracy;
          owner_id: string | null;
          notes: string | null;
          tags: string[] | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          first_name: string;
          last_name: string;
          job_title?: string | null;
          email?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          pipeline_stage?: PipelineStage;
          bitcoin_literacy?: BitcoinLiteracy;
          owner_id?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          created_by?: string | null;
        };
        Update: {
          company_id?: string | null;
          first_name?: string;
          last_name?: string;
          job_title?: string | null;
          email?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          pipeline_stage?: PipelineStage;
          bitcoin_literacy?: BitcoinLiteracy;
          owner_id?: string | null;
          notes?: string | null;
          tags?: string[] | null;
        };
      };
      interactions: {
        Row: {
          id: string;
          contact_id: string | null;
          company_id: string | null;
          type: InteractionType;
          direction: InteractionDirection | null;
          occurred_at: string;
          raw_content: string | null;
          summary: string | null;
          extracted_data: Json;
          source: InteractionSource;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contact_id?: string | null;
          company_id?: string | null;
          type: InteractionType;
          direction?: InteractionDirection | null;
          occurred_at?: string;
          raw_content?: string | null;
          summary?: string | null;
          extracted_data?: Json;
          source?: InteractionSource;
          created_by?: string | null;
        };
        Update: {
          contact_id?: string | null;
          type?: InteractionType;
          direction?: InteractionDirection | null;
          occurred_at?: string;
          raw_content?: string | null;
          summary?: string | null;
          extracted_data?: Json;
          source?: InteractionSource;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: ProjectStatus;
          related_company_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: ProjectStatus;
          related_company_id?: string | null;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          status?: ProjectStatus;
          related_company_id?: string | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string | null;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          assigned_to: string | null;
          due_date: string | null;
          completed_at: string | null;
          source: TaskSource;
          source_interaction_id: string | null;
          related_contact_id: string | null;
          tags: string[] | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          assigned_to?: string | null;
          due_date?: string | null;
          source?: TaskSource;
          source_interaction_id?: string | null;
          related_contact_id?: string | null;
          tags?: string[] | null;
          created_by?: string | null;
        };
        Update: {
          project_id?: string | null;
          title?: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          assigned_to?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          source?: TaskSource;
          related_contact_id?: string | null;
          tags?: string[] | null;
        };
      };
      content_items: {
        Row: {
          id: string;
          title: string | null;
          body: string | null;
          type: ContentType;
          status: ContentStatus;
          topic_tags: string[] | null;
          scheduled_for: string | null;
          published_at: string | null;
          published_url: string | null;
          source: ContentSource;
          source_interaction_id: string | null;
          assigned_to: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title?: string | null;
          body?: string | null;
          type: ContentType;
          status?: ContentStatus;
          topic_tags?: string[] | null;
          scheduled_for?: string | null;
          published_url?: string | null;
          source?: ContentSource;
          source_interaction_id?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
        };
        Update: {
          title?: string | null;
          body?: string | null;
          type?: ContentType;
          status?: ContentStatus;
          topic_tags?: string[] | null;
          scheduled_for?: string | null;
          published_url?: string | null;
          source?: ContentSource;
          assigned_to?: string | null;
        };
      };
      brand_assets: {
        Row: {
          id: string;
          name: string;
          type: string;
          description: string | null;
          file_url: string | null;
          content: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          description?: string | null;
          file_url?: string | null;
          content?: string | null;
          is_active?: boolean;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          type?: string;
          description?: string | null;
          file_url?: string | null;
          content?: string | null;
          is_active?: boolean;
        };
      };
      forms: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          schema: Json;
          is_published: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          schema?: Json;
          is_published?: boolean;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          schema?: Json;
          is_published?: boolean;
        };
      };
      form_submissions: {
        Row: {
          id: string;
          form_id: string;
          data: Json;
          submitted_at: string;
          ip_address: string | null;
          contact_id: string | null;
        };
        Insert: {
          id?: string;
          form_id: string;
          data?: Json;
          ip_address?: string | null;
          contact_id?: string | null;
        };
        Update: {
          data?: Json;
          contact_id?: string | null;
        };
      };
      agent_activity: {
        Row: {
          id: string;
          agent_name: string;
          action: string;
          status: AgentStatus;
          trigger_type: string | null;
          trigger_ref: string | null;
          workflow_run_id: string | null;
          proposed_actions: Json;
          approved_actions: Json;
          approved_by: string | null;
          approved_at: string | null;
          clarifications: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_name: string;
          action: string;
          status?: AgentStatus;
          trigger_type?: string | null;
          trigger_ref?: string | null;
          workflow_run_id?: string | null;
          proposed_actions?: Json;
          approved_actions?: Json;
          clarifications?: Json;
        };
        Update: {
          status?: AgentStatus;
          approved_by?: string | null;
          approved_at?: string | null;
          approved_actions?: Json;
          clarifications?: Json;
        };
      };
    };
    Views: {
      v_contacts_overview: {
        Row: {
          id: string;
          full_name: string;
          job_title: string | null;
          pipeline_stage: PipelineStage;
          bitcoin_literacy: BitcoinLiteracy;
          tags: string[] | null;
          company_name: string | null;
          industry: string | null;
          owner_name: string | null;
          open_tasks: number;
        };
      };
      v_recent_interactions: {
        Row: {
          id: string;
          type: InteractionType;
          direction: InteractionDirection | null;
          occurred_at: string;
          summary: string | null;
          extracted_data: Json;
          source: InteractionSource;
          contact_name: string;
          pipeline_stage: PipelineStage;
          company_name: string | null;
        };
      };
      v_open_tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          due_date: string | null;
          source: TaskSource;
          assigned_to_name: string | null;
          related_contact_name: string | null;
          project_name: string | null;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
