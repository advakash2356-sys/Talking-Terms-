export const DOCKER_COMPOSE_YML = `# =========================================================
# TALKING TERMS 100% FREE OPEN-SOURCE SELF-HOSTED STACK
# Zero Cloud Dependency • Zero PII • Local AI & TTS Pipeline
# =========================================================
version: '3.8'

services:
  # 1. ANONYMIZED POSTGRESQL + POSTGIS DATABASE
  postgres-db:
    image: postgres:16-alpine
    container_name: talkingterms_db
    environment:
      POSTGRES_DB: talking_terms
      POSTGRES_USER: anon_admin
      POSTGRES_PASSWORD: ZeroKnowledgeSecretPass2026!
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: always

  # 2. LOCAL LLM INFERENCE ENGINE (OLLAMA / LLAMA-3-8B / PHI-3)
  ollama-brain:
    image: ollama/ollama:latest
    container_name: talkingterms_brain
    ports:
      - "11434:11434"
    volumes:
      - ollama_storage:/root/.ollama
    restart: always

  # 3. OPEN-SOURCE TTS ENGINE (KOKORO-82M)
  kokoro-tts:
    image: ghcr.io/hexgrad/kokoro-tts:latest
    container_name: talkingterms_tts
    ports:
      - "8880:8880"
    environment:
      - MODEL_NAME=Kokoro-82M
    restart: always

  # 4. WEBSOCKET REAL-TIME AUDIO & DISPATCH GATEWAY
  talkingterms-gateway:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: talkingterms_gateway
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - DB_URL=postgres://anon_admin:ZeroKnowledgeSecretPass2026!@postgres-db:5432/talking_terms
      - OLLAMA_URL=http://ollama-brain:11434
      - TTS_URL=http://kokoro-tts:8880
    depends_on:
      - postgres-db
      - ollama-brain
      - kokoro-tts
    restart: always

volumes:
  pgdata:
  ollama_storage:
`;

export const INIT_SQL = `-- ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ANONYMOUS USERS (NO PII ALLOWED)
CREATE TABLE IF NOT EXISTS anonymous_users (
    user_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hashed_identity_key TEXT UNIQUE NOT NULL, -- WASM Argon2id Hash
    display_moniker VARCHAR(50) DEFAULT 'Aspirant_Anonymous',
    blind_token_balance INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PERSONA MASTER ROSTER (20 PROFILES)
CREATE TABLE IF NOT EXISTS personas (
    persona_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(20) CHECK (category IN ('male', 'female', 'lgbtq')),
    age INT NOT NULL,
    system_prompt_base TEXT NOT NULL,
    tts_voice_id VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- POPULATE KABIR & SUNITA JI
INSERT INTO personas (persona_id, name, category, age, system_prompt_base, tts_voice_id) VALUES 
('kabir_upsc', 'Kabir', 'male', 24, 'You are Kabir, a 24-year-old UPSC aspirant living in Mukherjee Nagar PG. Speak empathetic Hindi/Hinglish. Listen 80% of the time. Use words like Bhai, mock scores, scene.', 'hm_omega'),
('sunita_homemaker', 'Sunita Ji', 'female', 42, 'You are Sunita Ji, a 42-year-old motherly homemaker. Speak soothing, purely affectionate Hindi. Use words like Beta, khana khaya, shaant ho jao.', 'hf_alpha')
ON CONFLICT (persona_id) DO NOTHING;

-- 3. ANONYMIZED SESSIONS
CREATE TABLE IF NOT EXISTS voice_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_uuid UUID REFERENCES anonymous_users(user_uuid) ON DELETE CASCADE,
    persona_id VARCHAR(50) REFERENCES personas(persona_id),
    session_type VARCHAR(10) CHECK (session_type IN ('ai', 'human')),
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

export const SERVER_INDEX_JS = `import Fastify from 'fastify';
import fastifyWs from '@fastify/websocket';
import fetch from 'node-fetch';

const fastify = Fastify({ logger: true });
fastify.register(fastifyWs);

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const TTS_URL = process.env.TTS_URL || 'http://localhost:8880';

fastify.register(async function (fastify) {
  fastify.get('/ws/voice', { websocket: true }, (connection, req) => {
    connection.socket.on('message', async (message) => {
      try {
        const payload = JSON.parse(message.toString());
        
        // 1. Voice Streaming / LLM Chat Step
        if (payload.type === 'USER_SPEECH_TEXT') {
          const personaPrompt = payload.personaPrompt || "You are an empathetic listener.";
          
          // Query Local Brain (Ollama Llama3 / Qwen2.5)
          const brainRes = await fetch(\`\${OLLAMA_URL}/api/generate\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'llama3:8b',
              prompt: \`\${personaPrompt}\\nUser: \${payload.text}\\nAssistant:\`,
              stream: false
            })
          });
          const brainData = await brainRes.json();
          const replyText = brainData.response;

          // Synthesize Speech with Kokoro Open-Source TTS
          const ttsRes = await fetch(\`\${TTS_URL}/v1/audio/speech\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'kokoro',
              input: replyText,
              voice: payload.voiceId || 'hm_omega'
            })
          });
          
          const audioBuffer = await ttsRes.arrayBuffer();

          // Send back text + PCM Audio Buffer
          connection.socket.send(JSON.stringify({
            type: 'BOT_REPLY',
            text: replyText,
            audioBase64: Buffer.from(audioBuffer).toString('base64')
          }));
        }
      } catch (err) {
        console.error("Pipeline processing error:", err);
      }
    });
  });
});

fastify.listen({ port: 4000, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
  console.log('Talking Terms Audio Gateway listening on port 4000');
});
`;

export const SERVER_DOCKERFILE = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["node", "index.js"]
`;
