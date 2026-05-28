import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      // In a real app, grab token from auth state or cookies
      headers.set('Authorization', 'Bearer YOUR_TOKEN_HERE');
      return headers;
    },
  }),
  tagTypes: ['Stats', 'Settings', 'Keys', 'Rules', 'Anomalies', 'Projects', 'Users', 'Audit', 'Knowledge', 'Prompts', 'Leads', 'Workflows'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/dashboard/stats',
      providesTags: ['Stats'],
    }),
    getSettings: builder.query({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation({
      query: (body) => ({
        url: '/settings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
    getKeys: builder.query({
      query: () => '/keys',
      providesTags: ['Keys'],
    }),
    getRules: builder.query({
      query: () => '/rules',
      providesTags: ['Rules'],
    }),
    createRule: builder.mutation({
      query: (body) => ({
        url: '/rules',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Rules'],
    }),
    updateRule: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/rules/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Rules'],
    }),
    deleteRule: builder.mutation({
      query: (id) => ({
        url: `/rules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Rules'],
    }),
    getAnomalies: builder.query({
      query: () => '/anomalies',
      providesTags: ['Anomalies'],
    }),
    createKey: builder.mutation({
      query: (body) => ({
        url: '/keys',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Keys'],
    }),
    deleteKey: builder.mutation({
      query: (id) => ({
        url: `/keys/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Keys'],
    }),
    createProject: builder.mutation({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
    getProjects: builder.query({
      query: () => '/projects',
      providesTags: ['Projects'],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Projects'],
    }),
    createUser: builder.mutation({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['Users'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    getAuditLogs: builder.query({
      query: () => '/audit',
      providesTags: ['Audit'],
    }),
    getKnowledgeFiles: builder.query({
      query: () => '/knowledge',
      providesTags: ['Knowledge'],
    }),
    uploadKnowledge: builder.mutation({
      query: (body) => ({
        url: '/knowledge',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Knowledge'],
    }),
    deleteKnowledge: builder.mutation({
      query: (id) => ({
        url: `/knowledge/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Knowledge'],
    }),
    getPrompts: builder.query({
      query: () => '/prompts',
      providesTags: ['Prompts'],
    }),
    createPrompt: builder.mutation({
      query: (body) => ({
        url: '/prompts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Prompts'],
    }),
    updatePrompt: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/prompts/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Prompts'],
    }),
    deletePrompt: builder.mutation({
      query: (id) => ({
        url: `/prompts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Prompts'],
    }),
    sendMessage: builder.mutation({
      query: (body) => ({
        url: '/chat/completions',
        method: 'POST',
        body,
      }),
    }),
    getLeads: builder.query({
      query: () => '/leads',
      providesTags: ['Leads'],
    }),
    createLead: builder.mutation({
      query: (body) => ({
        url: '/leads',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads'],
    }),
    updateLead: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/leads/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Leads'],
    }),
    deleteLead: builder.mutation({
      query: (id) => ({
        url: `/leads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Leads'],
    }),
    getWorkflows: builder.query({
      query: () => '/workflows',
      providesTags: ['Workflows'],
    }),
    saveWorkflow: builder.mutation({
      query: (body) => ({
        url: '/workflows',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Workflows'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetKeysQuery,
  useGetRulesQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
  useGetAnomaliesQuery,
  useCreateKeyMutation,
  useDeleteKeyMutation,
  useCreateProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useCreateUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetAuditLogsQuery,
  useGetKnowledgeFilesQuery,
  useUploadKnowledgeMutation,
  useDeleteKnowledgeMutation,
  useGetPromptsQuery,
  useCreatePromptMutation,
  useUpdatePromptMutation,
  useDeletePromptMutation,
  useSendMessageMutation,
  useGetLeadsQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useGetWorkflowsQuery,
  useSaveWorkflowMutation,
} = apiSlice;
