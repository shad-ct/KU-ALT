import { reportsService } from './reports.service.js';
import { sendResponse } from '../../utils/response.js';
import { ApiError } from '../../utils/ApiError.js';

export class ReportsController {
  /**
   * GET /reports/:reportKey
   */
  async getReport(req, res) {
    const { reportKey } = req.params;
    const user = req.user;
    const filters = req.query;

    const data = await reportsService.generateReport(reportKey, user, filters);

    return sendResponse(res, {
      message: `Report ${reportKey} generated successfully`,
      data,
      meta: { totalRecords: data.length },
    });
  }

  /**
   * GET /reports/:reportKey/export?format=csv|json
   */
  async exportReport(req, res) {
    const { reportKey } = req.params;
    const { format = 'csv' } = req.query;
    const user = req.user;
    const filters = req.query;

    const data = await reportsService.generateReport(reportKey, user, filters);

    // Audit the export action
    await reportsService.logExport(user, reportKey, format, data.length);

    if (format === 'csv') {
      const csv = reportsService.convertToCsv(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportKey}-${Date.now()}.csv"`);
      return res.send(csv);
    }

    return sendResponse(res, {
      message: `Report ${reportKey} exported`,
      data,
    });
  }
}

export const reportsController = new ReportsController();
export default reportsController;
