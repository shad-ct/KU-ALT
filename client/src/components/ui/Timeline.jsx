import React from 'react';

/**
 * Format date consistently as "12 Nov 2026, 14:30"
 */
const formatTimelineDate = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Timeline Component
 * Specification:
 * - Vertical layout, 24px dot column, 1px connector line, 16px between events
 * - Each event: title 500, "by Dr. X, Research Centre Head" small muted, date right-aligned small
 * - Remarks in a surface-sub box radius-md padding 12
 * - Future steps muted with hollow dots
 * - Current step accent dot + "Current"
 */
export const Timeline = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return (
      <div className="py-6 text-[14px] text-text-muted">
        No workflow history recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, idx) => {
        const isDone =
          event.status === 'DONE' ||
          ['APPROVED', 'SUBMITTED', 'FORWARDED', 'VERIFIED'].includes(event.actionTaken);
        const isCurrent = event.status === 'ACTIVE' || event.actionTaken === 'PENDING';
        const isFuture =
          event.status === 'WAITING' || event.status === 'PENDING' || event.actionTaken === 'FUTURE';
        const isReturned = event.actionTaken === 'RETURNED';
        const isRejected = event.actionTaken === 'REJECTED';

        const isLast = idx === events.length - 1;

        return (
          <div key={event.id || idx} className="flex gap-4">
            {/* 24px Dot Column with 1px Connector Line */}
            <div className="w-[24px] flex flex-col items-center flex-shrink-0">
              {/* Dot */}
              <div className="flex items-center justify-center w-6 h-6">
                {isRejected || isReturned ? (
                  <div className="w-3 h-3 rounded-full bg-danger-text" />
                ) : isDone ? (
                  <div className="w-3 h-3 rounded-full bg-success-text" />
                ) : isCurrent ? (
                  <div className="w-3 h-3 rounded-full bg-accent-600 ring-4 ring-accent-50" />
                ) : (
                  /* Future: hollow dot */
                  <div className="w-3 h-3 rounded-full border-2 border-border-strong bg-surface" />
                )}
              </div>

              {/* 1px Connector line */}
              {!isLast && (
                <div className="w-[1px] flex-1 bg-border my-1" />
              )}
            </div>

            {/* Event Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[15px] font-medium ${
                      isFuture ? 'text-text-muted' : 'text-text'
                    }`}
                  >
                    {event.stepName || event.actionTaken || 'Review step'}
                  </span>
                  {isCurrent && (
                    <span className="h-5 px-1.5 rounded-sm text-[12px] font-medium bg-accent-100 text-accent-700">
                      Current
                    </span>
                  )}
                </div>

                {event.timestamp && (
                  <span className="text-[13px] text-text-muted tabular-nums flex-shrink-0">
                    {formatTimelineDate(event.timestamp)}
                  </span>
                )}
              </div>

              {/* Actor note */}
              {(event.actorName || event.actorRole) && (
                <p className="text-[13px] text-text-muted mt-0.5">
                  by {event.actorName || 'Officer'}
                  {event.actorRole && ` (${event.actorRole.replace(/_/g, ' ')})`}
                </p>
              )}

              {/* Remarks Box */}
              {event.remarks && (
                <div className="mt-2.5 p-3 rounded-md bg-surface-sub text-[14px] text-text leading-[20px] border border-border">
                  {event.remarks}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
