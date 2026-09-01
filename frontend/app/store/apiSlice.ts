import { BaseQueryFn } from '@reduxjs/toolkit/query';
import { createApi } from '@reduxjs/toolkit/query/react';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig['method'];
      data?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
      headers?: AxiosRequestConfig['headers'];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await axios({
        url: API_URL + url,
        method,
        data,
        params,
        headers,
        withCredentials: true,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export interface TimelineItem {
  date: string;
  started: number;
  completed: number;
  screened_out: number;
  quota_full: number;
  fraud: number;
  terminate: number;
  security_term: number;
}

export interface SurveyCount {
  total_entries: number;
  complete_entries: number;
  terminate_entries: number;
  quota_full_entries: number;
  security_term_entries: number;
  started_entries: number;
  screened_out_entries: number;
  fraud_entries: number;
  timeline?: TimelineItem[];
}

export interface EligibilityRule {
  question: string;
  options: string[];
  acceptedAnswers: string[];
}

export interface Survey {
  _id: string;
  serial?: number;
  uid?: string;
  pid?: string;
  name?: string;
  projectId?: string;
  supplierId?: any;
  baseSupplierUrl?: string;
  eligibilityRules?: EligibilityRule[];
  vendorLinks?: any[];
  status: string;
  ipFiltering?: boolean;
  allowedCountries?: string[];
  ipAddress?: string;
  country?: string;
  countryCode?: string;
  createdAt: string;
}

export interface Supplier {
  _id: string;
  name: string;
  isActive?: boolean;
}

export interface Vendor {
  _id: string;
  name: string;
  completeUrl?: string;
  terminateUrl?: string;
  quotaFullUrl?: string;
  securityTermUrl?: string;
  isActive?: boolean;
}

export interface Transaction {
  _id: string;
  serial?: number;
  transactionToken: string;
  surveyId: { _id: string; name: string; projectId: string };
  vendorId: { _id: string; name: string };
  respondentId: string;
  vendorRid: string;
  ipAddress?: string;
  status: string;
  startedAt: string;
  completedAt?: string;
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Surveys', 'Counts', 'Suppliers', 'Vendors', 'Transactions', 'AdminSurveys', 'AdminUsers'],
  endpoints: (builder) => ({
    getCounts: builder.query<SurveyCount, { startDate?: string; endDate?: string }>({
      query: (params) => {
        let formattedStartDate = params.startDate;
        let formattedEndDate = params.endDate;
        if (params.startDate) {
          const localStart = new Date(params.startDate + "T00:00:00");
          if (!isNaN(localStart.getTime())) {
            formattedStartDate = localStart.toISOString();
          }
        }
        if (params.endDate) {
          const localEnd = new Date(params.endDate + "T23:59:59.999");
          if (!isNaN(localEnd.getTime())) {
            formattedEndDate = localEnd.toISOString();
          }
        }
        return {
          url: '/api/dashboard/getcount',
          method: 'GET',
          params: {
            ...(formattedStartDate && { startDate: formattedStartDate }),
            ...(formattedEndDate && { endDate: formattedEndDate }),
          },
        };
      },
      providesTags: ['Counts'],
    }),
    getSurveys: builder.query<Survey[], { category: string; page: number; limit: number; startDate?: string; endDate?: string }>({
      query: ({ category, page, limit, startDate, endDate }) => {
        let formattedStartDate = startDate;
        let formattedEndDate = endDate;
        if (startDate) {
          const localStart = new Date(startDate + "T00:00:00");
          if (!isNaN(localStart.getTime())) {
            formattedStartDate = localStart.toISOString();
          }
        }
        if (endDate) {
          const localEnd = new Date(endDate + "T23:59:59.999");
          if (!isNaN(localEnd.getTime())) {
            formattedEndDate = localEnd.toISOString();
          }
        }
        return {
          url: '/api/dashboard/getRecentSurveys',
          method: 'GET',
          params: {
            page,
            limit,
            status: category,
            ...(formattedStartDate && { startDate: formattedStartDate }),
            ...(formattedEndDate && { endDate: formattedEndDate }),
          },
        };
      },
      providesTags: ['Surveys'],
    }),
    deleteSurvey: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/dashboard/remove/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Surveys', 'Counts'],
    }),
    updateSurveyStatus: builder.mutation<{ success: boolean }, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/api/dashboard/update/${id}`,
        method: 'PUT',
        data: { status },
      }),
      invalidatesTags: ['Surveys', 'Counts'],
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/api/user/logout',
        method: 'POST',
      }),
    }),
    getAdminSurveys: builder.query<Survey[], void>({
      query: () => ({ url: '/api/admin/surveys', method: 'GET' }),
      providesTags: ['AdminSurveys'],
    }),
    getAdminSurveyById: builder.query<Survey, string>({
      query: (id) => ({ url: `/api/admin/surveys/${id}`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'AdminSurveys', id }],
    }),
    createAdminSurvey: builder.mutation<Survey, any>({
      query: (data) => ({ url: '/api/admin/surveys', method: 'POST', data }),
      invalidatesTags: ['AdminSurveys'],
    }),
    updateAdminSurvey: builder.mutation<Survey, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/api/admin/surveys/${id}`, method: 'PUT', data }),
      invalidatesTags: (result, error, { id }) => [{ type: 'AdminSurveys', id }, 'AdminSurveys'],
    }),
    deleteAdminSurvey: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/api/admin/surveys/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminSurveys'],
    }),
    getSuppliers: builder.query<Supplier[], void>({
      query: () => ({ url: '/api/admin/surveys/suppliers', method: 'GET' }),
      providesTags: ['Suppliers'],
    }),
    createSupplier: builder.mutation<Supplier, { name: string; isActive?: boolean }>({
      query: (data) => ({ url: '/api/admin/surveys/suppliers', method: 'POST', data }),
      invalidatesTags: ['Suppliers'],
    }),
    deleteSupplier: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/api/admin/surveys/suppliers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Suppliers', 'AdminSurveys', 'Surveys'],
    }),
    getVendors: builder.query<Vendor[], void>({
      query: () => ({ url: '/api/admin/surveys/vendors', method: 'GET' }),
      providesTags: ['Vendors'],
    }),
    createVendor: builder.mutation<Vendor, { name: string; completeUrl?: string; terminateUrl?: string; quotaFullUrl?: string; securityTermUrl?: string; isActive?: boolean }>({
      query: (data) => ({ url: '/api/admin/surveys/vendors', method: 'POST', data }),
      invalidatesTags: ['Vendors'],
    }),
    deleteVendor: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/api/admin/surveys/vendors/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Vendors', 'AdminSurveys', 'Surveys'],
    }),
    getTransactions: builder.query<Transaction[], void>({
      query: () => ({ url: '/api/admin/surveys/transactions?limit=100', method: 'GET' }),
      providesTags: ['Transactions'],
    }),
    deleteTransaction: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/api/admin/surveys/transactions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Transactions'],
    }),
    getMe: builder.query<{ _id: string; email: string; name: string; surveyAdmin: boolean }, void>({
      query: () => ({ url: '/api/user/me', method: 'GET' }),
    }),
    getAdminUsers: builder.query<{ _id: string; email: string; name: string; surveyAdmin: boolean; createdAt: string }[], void>({
      query: () => ({ url: '/api/user/admin/users', method: 'GET' }),
      providesTags: ['AdminUsers'] as any,
    }),
    toggleUserAdminStatus: builder.mutation<{ message: string; user: any }, string>({
      query: (id) => ({ url: `/api/user/admin/users/${id}/toggle-admin`, method: 'PUT' }),
      invalidatesTags: ['AdminUsers'] as any,
    }),
    createAdminUser: builder.mutation<{ message: string; user: any }, { name: string; email: string }>({
      query: (data) => ({ url: '/api/user/admin/users', method: 'POST', data }),
      invalidatesTags: ['AdminUsers'] as any,
    }),
    deleteAdminUser: builder.mutation<{ message: string; user: any }, string>({
      query: (id) => ({ url: `/api/user/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminUsers'] as any,
    }),
  }),
});

export const {
  useGetCountsQuery,
  useGetSurveysQuery,
  useDeleteSurveyMutation,
  useUpdateSurveyStatusMutation,
  useLogoutMutation,
  useGetAdminSurveysQuery,
  useGetAdminSurveyByIdQuery,
  useCreateAdminSurveyMutation,
  useUpdateAdminSurveyMutation,
  useDeleteAdminSurveyMutation,
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useGetVendorsQuery,
  useCreateVendorMutation,
  useDeleteVendorMutation,
  useGetTransactionsQuery,
  useDeleteTransactionMutation,
  useGetMeQuery,
  useGetAdminUsersQuery,
  useToggleUserAdminStatusMutation,
  useCreateAdminUserMutation,
  useDeleteAdminUserMutation,
} = apiSlice;
