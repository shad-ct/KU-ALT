import nodemailer from 'nodemailer';
import { Notification, User } from '../../models/index.js';
import { env } from '../../config/env.js';
import { logger } from '../../middleware/logger.middleware.js';
import { parsePagination, formatPaginationMeta } from '../../utils/pagination.js';

// Mail transporter (defaults to local MailHog)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || '127.0.0.1',
  port: parseInt(process.env.SMTP_PORT || '1025', 10),
  secure: false,
  ignoreTLS: true,
});

export class NotificationsService {
  /**
   * Creates an in-app notification row and optionally dispatches an email alert
   */
  static async send({ recipientUserId, type = 'GENERAL', title, body, link = null, sendEmail = false }) {
    const notification = await Notification.create({
      recipient_user_id: recipientUserId,
      type,
      title,
      body,
      link,
    });

    if (sendEmail) {
      try {
        const recipient = await User.findByPk(recipientUserId);
        if (recipient && recipient.email) {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Kannur University R&D Cell" <rdcell@kannuruniversity.ac.in>',
            to: recipient.email,
            subject: `[Kannur University R&D] ${title}`,
            text: `${body}\n\nAccess portal: ${env.CORS_ORIGIN}${link || '/dashboard'}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1C1C1A;">
                <div style="border-bottom: 2px solid #1F3A5F; padding-bottom: 12px; margin-bottom: 20px;">
                  <h2 style="margin: 0; color: #1F3A5F; font-size: 18px;">Kannur University · R&D Cell</h2>
                </div>
                <h3 style="margin-top: 0;">${title}</h3>
                <p style="line-height: 1.5; color: #5E5D58;">${body}</p>
                ${
                  link
                    ? `<div style="margin: 24px 0;">
                         <a href="${env.CORS_ORIGIN}${link}" style="background-color: #1F3A5F; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 14px;">View in Portal</a>
                       </div>`
                    : ''
                }
                <hr style="border: none; border-top: 1px solid #EBEAE5; margin-top: 30px;" />
                <p style="font-size: 12px; color: #8C8A82;">This is an automated notification from the Kannur University R&D Cell Unified System.</p>
              </div>
            `,
          });
        }
      } catch (err) {
        logger.error({ err, recipientUserId }, 'Failed to dispatch email notification:');
      }
    }

    return notification;
  }

  /**
   * Retrieves paginated inbox for a user
   */
  static async getInbox({ userId, query }) {
    const { page, limit, offset } = parsePagination(query, 20);
    const where = { recipient_user_id: userId };

    if (query.unread === 'true') {
      where.read_at = null;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    const unreadCount = await Notification.count({
      where: { recipient_user_id: userId, read_at: null },
    });

    return {
      notifications: rows,
      unreadCount,
      meta: formatPaginationMeta(count, page, limit),
    };
  }

  /**
   * Marks a single notification as read
   */
  static async markAsRead(notificationId, userId) {
    const [updated] = await Notification.update(
      { read_at: new Date() },
      { where: { id: notificationId, recipient_user_id: userId } }
    );
    return updated > 0;
  }

  /**
   * Marks all unread notifications as read for a user
   */
  static async markAllAsRead(userId) {
    const [updated] = await Notification.update(
      { read_at: new Date() },
      { where: { recipient_user_id: userId, read_at: null } }
    );
    return updated;
  }
}

export default NotificationsService;

