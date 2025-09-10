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

'use client';

import { useState, useEffect } from 'react';
import { ModelsResponse, ModelInfo } from '@/types/Models';
import { getBackendUrl } from '@/config';
import styles from './ModelSelector.module.css';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({ selectedModel, onModelChange, disabled = false }: ModelSelectorProps) {
  const [models, setModels] = useState<ModelsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/models`);
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }
        const data: ModelsResponse = await response.json();
        setModels(data);
        
        // 如果没有选择模型，使用默认模型
        if (!selectedModel && data.default_model) {
          onModelChange(data.default_model);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [selectedModel, onModelChange]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading models...</div>
      </div>
    );
  }

  if (error || !models) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Failed to load models</div>
      </div>
    );
  }

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case 'openai': return 'OpenAI';
      case 'gemini': return 'Google Gemini';
      case 'nvdev': return 'NVIDIA';
      default: return provider;
    }
  };

  const getModelDisplayName = (model: ModelInfo) => {
    return model.name.replace(/^(gpt-|gemini-|llama-)/, '').toUpperCase();
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>AI Model:</label>
      <select
        className={styles.select}
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        disabled={disabled}
      >
        {Object.entries(models.models).map(([provider, providerModels]) => (
          <optgroup key={provider} label={getProviderDisplayName(provider)}>
            {providerModels.map((model) => (
              <option key={model.id} value={model.id}>
                {getModelDisplayName(model)} ({model.max_tokens} tokens)
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
