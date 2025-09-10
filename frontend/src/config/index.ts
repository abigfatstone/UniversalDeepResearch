/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export interface AppConfig {
  // Backend API Configuration
  backend: {
    baseUrl: string;
    port: number;
    apiVersion: 'v1' | 'v2';
  };
  
  // Runtime Configuration
  runtime: {
    dryRun: boolean;
    enableV2Api: boolean;
  };
  
  // Frontend Configuration
  frontend: {
    port: number;
    host: string;
  };
}

// Default configuration
const defaultConfig: AppConfig = {
  backend: {
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost',
    port: parseInt(process.env.NEXT_PUBLIC_BACKEND_PORT || '8000'),
    apiVersion: (process.env.NEXT_PUBLIC_API_VERSION as 'v1' | 'v2') || 'v2',
  },
  runtime: {
    dryRun: process.env.NEXT_PUBLIC_DRY_RUN === 'true',
    enableV2Api: process.env.NEXT_PUBLIC_ENABLE_V2_API !== 'false',
  },
  frontend: {
    port: parseInt(process.env.NEXT_PUBLIC_FRONTEND_PORT || '3000'),
    host: process.env.NEXT_PUBLIC_FRONTEND_HOST || 'localhost',
  },
};

// Helper function to get the full backend URL
export const getBackendUrl = (config: AppConfig = defaultConfig): string => {
  // 在浏览器环境中，动态检测当前主机名
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    // 如果配置的baseUrl是localhost，则使用当前访问的主机名
    if (config.backend.baseUrl.includes('localhost')) {
      return `http://${currentHost}:${config.backend.port}`;
    }
  }
  return `${config.backend.baseUrl}:${config.backend.port}`;
};

// Helper function to get the API endpoint
export const getApiEndpoint = (config: AppConfig = defaultConfig): string => {
  const baseUrl = getBackendUrl(config);
  const endpoint = config.runtime.enableV2Api ? '/api/research2' : '/api/research';
  return `${baseUrl}${endpoint}`;
};

export default defaultConfig; 