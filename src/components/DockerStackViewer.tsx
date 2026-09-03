import React, { useState } from 'react';
import { Server, Copy, Check, Download, Terminal, Database, Cpu, HardDrive } from 'lucide-react';
import {
  DOCKER_COMPOSE_YML,
  INIT_SQL,
  SERVER_INDEX_JS,
  SERVER_DOCKERFILE
} from '../data/dockerFiles';

export const DockerStackViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'docker' | 'sql' | 'server' | 'dockerfile'>('docker');
  const [copied, setCopied] = useState(false);

  const getActiveContent = () => {
    switch (activeFile) {
      case 'docker':
        return { filename: 'docker-compose.yml', code: DOCKER_COMPOSE_YML };
      case 'sql':
        return { filename: 'init.sql', code: INIT_SQL };
      case 'server':
        return { filename: 'server/index.js', code: SERVER_INDEX_JS };
      case 'dockerfile':
        return { filename: 'server/Dockerfile', code: SERVER_DOCKERFILE };
    }
  };

  const current = getActiveContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([current.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = current.filename.split('/').pop() || 'file.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-950/40 via-gray-900 to-gray-900 border border-blue-500/30 rounded-3xl p-6 sm:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-400 text-xs font-bold font-mono uppercase tracking-wider">
              <Server className="w-4 h-4" /> 100% Free Open-Source Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Self-Hosted Talking Terms Batch Stack
            </h2>
            <p className="text-sm text-gray-300 mt-2 max-w-2xl leading-relaxed">
              Replaces all proprietary APIs entirely using Fastify WebSockets, Client-Side WASM Argon2id, PostgreSQL + PostGIS, Whisper.cpp ASR, Ollama (Llama-3/Qwen), and Kokoro-82M TTS.
            </p>
          </div>

          <div className="bg-gray-950 border border-blue-500/30 p-4 rounded-2xl flex items-center gap-3 shrink-0">
            <Terminal className="w-8 h-8 text-blue-400 shrink-0" />
            <div className="text-xs font-mono">
              <p className="font-bold text-white">One Command Deploy</p>
              <p className="text-emerald-400 font-bold">$ docker compose up -d</p>
            </div>
          </div>
        </div>

        {/* ARCHITECTURE SUMMARY BADGES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-800">
          <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <div className="text-xs">
              <span className="block font-bold text-white">Postgres 16</span>
              <span className="text-[10px] text-gray-400">Anonymized Store</span>
            </div>
          </div>

          <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            <div className="text-xs">
              <span className="block font-bold text-white">Ollama Brain</span>
              <span className="text-[10px] text-gray-400">Llama-3-8B Local</span>
            </div>
          </div>

          <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-purple-400" />
            <div className="text-xs">
              <span className="block font-bold text-white">Kokoro-82M</span>
              <span className="text-[10px] text-gray-400">Ultra-Fast TTS</span>
            </div>
          </div>

          <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            <div className="text-xs">
              <span className="block font-bold text-white">Fastify WS</span>
              <span className="text-[10px] text-gray-400">PCM Audio Stream</span>
            </div>
          </div>
        </div>
      </div>

      {/* CODE VIEWER BOX */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* FILE SELECTOR TABS */}
        <div className="flex flex-wrap items-center justify-between bg-gray-950 px-4 py-3 border-b border-gray-800 gap-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveFile('docker')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeFile === 'docker'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              docker-compose.yml
            </button>

            <button
              onClick={() => setActiveFile('sql')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeFile === 'sql'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              init.sql
            </button>

            <button
              onClick={() => setActiveFile('server')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeFile === 'server'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              server/index.js
            </button>

            <button
              onClick={() => setActiveFile('dockerfile')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeFile === 'dockerfile'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              server/Dockerfile
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* CODE CONTENT CONTAINER */}
        <div className="p-4 sm:p-6 overflow-x-auto bg-[#070A10]">
          <pre className="text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre font-normal">
            <code>{current.code}</code>
          </pre>
        </div>

        {/* FOOTER INSTRUCTIONS */}
        <div className="p-4 bg-gray-950 border-t border-gray-800 text-xs text-gray-400 font-mono flex items-center justify-between">
          <span>File: {current.filename}</span>
          <span>Execute: <code className="text-amber-400">docker compose up -d</code></span>
        </div>
      </div>
    </section>
  );
};
