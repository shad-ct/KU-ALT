import { NotificationsService } from './notifications.service.js';
import { successResponse } from '../../utils/response.js';

export const getInbox = async (req, res) => {
  const userId = req.user.sub;
  const result = await NotificationsService.getInbox({ userId, query: req.query });

  return successResponse(res, result.notifications, 'Inbox retrieved', 200, {
    unreadCount: result.unreadCount,
    ...result.meta,
  });
};

export const markRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.sub;
  await NotificationsService.markAsRead(id, userId);

  return successResponse(res, null, 'Notification marked as read');
};

export const markAllRead = async (req, res) => {
  const userId = req.user.sub;
  await NotificationsService.markAllAsRead(userId);

  return successResponse(res, null, 'All notifications marked as read');
};

export const sendNotification = async (req, res) => {
  const { recipientUserId, type, title, body, link, sendEmail } = req.body;
  const notification = await NotificationsService.send({
    recipientUserId,
    type,
    title,
    body,
    link,
    sendEmail: sendEmail ?? true,
  });

  return successResponse(res, notification, 'Notification dispatched', 201);
};

