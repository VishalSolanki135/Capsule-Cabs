export class ApiResponse {
  static success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      message,
      data,
      statusCode
    };
  }

  static error(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) {
    return {
      success: false,
      message,
      errorCode,
      details,
      statusCode
    };
  }

  static paginated(data, page, limit, total, message = 'Success') {
    return {
      success: true,
      message,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
} 