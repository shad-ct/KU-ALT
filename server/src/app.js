import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { httpLogger } from './middleware/logger.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { globalRateLimiter } from './middleware/rateLimit.middleware.js';
import { ApiError } from './utils/ApiError.js';

import healthRoutes from './modules/health/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import publicRoutes from './modules/public/public.routes.js';
import masterdataRoutes from './modules/masterdata/masterdata.routes.js';
import filesRoutes from './modules/files/files.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import workflowRoutes from './modules/workflow/workflow.routes.js';
import registrationRoutes from './modules/registration/registration.routes.js';
import peopleRoutes from './modules/people/people.routes.js';
import certificatesRoutes from './modules/certificates/certificates.routes.js';
import equipmentRoutes from './modules/equipment/equipment.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// Global Rate Limiter (300/min/IP)
app.use(globalRateLimiter);

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-request-id'],
  })
);

// Parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// HTTP Request Logger (Pino)
if (env.NODE_ENV !== 'test') {
  app.use(httpLogger);
}

// Routes
const API_PREFIX = '/api/v1';

// Health endpoints
app.use(`${API_PREFIX}/health`, healthRoutes);
app.use('/health', healthRoutes);

// Auth endpoints
app.use(`${API_PREFIX}/auth`, authRoutes);

// Public lookup endpoints
app.use(`${API_PREFIX}/public`, publicRoutes);

// Master Data endpoints
app.use(`${API_PREFIX}/master`, masterdataRoutes);

// File asset pipeline
app.use(`${API_PREFIX}/files`, filesRoutes);

// Notifications inbox & dispatch
app.use(`${API_PREFIX}/notifications`, notificationsRoutes);

// Workflow Engine, Approvals & Applications
app.use(`${API_PREFIX}`, workflowRoutes);

// Registration status & resubmission
app.use(`${API_PREFIX}/registration`, registrationRoutes);

// People, Profiles & Dashboards
app.use(`${API_PREFIX}`, peopleRoutes);

// Certificates & Templates
app.use(`${API_PREFIX}`, certificatesRoutes);

// Equipment Module
app.use(`${API_PREFIX}`, equipmentRoutes);

// Reports & Audited Exports
app.use(`${API_PREFIX}`, reportsRoutes);

// Admin Control Panel
app.use(`${API_PREFIX}/admin`, adminRoutes);

// Catch-all 404 handler for undefined API routes
app.use((req, res, next) => {
  next(ApiError.notFound(`Endpoint ${req.method} ${req.originalUrl} does not exist.`));
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
